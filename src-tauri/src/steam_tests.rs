use super::*;
use crate::model::now_ms;
use crate::store;

const T0: i64 = 1_790_000_000_000;

fn cfg(steamid: &str, api_key: &str, name: &str) -> SteamConfig {
    SteamConfig { steamid: steamid.into(), api_key: api_key.into(), name: name.into(), region: String::new() }
}

#[test]
fn a_steamid64_a_profile_link_and_a_vanity_name_are_told_apart() {
    let id = "76561190000000000";
    assert!(matches!(classify(id), Some(SteamId::Id(v)) if v == id));
    assert!(matches!(classify(&format!("https://steamcommunity.com/profiles/{id}/")), Some(SteamId::Id(v)) if v == id));
    assert!(matches!(classify(&format!("steamcommunity.com/profiles/{id}")), Some(SteamId::Id(v)) if v == id));
    assert!(matches!(classify("www.steamcommunity.com/id/gabe/"), Some(SteamId::Vanity(v)) if v == "gabe"));
    assert!(matches!(classify("gabe"), Some(SteamId::Vanity(v)) if v == "gabe"));
}

#[test]
fn a_typed_value_that_is_not_a_profile_is_refused() {
    assert!(classify("   ").is_none());
    assert!(classify("7656119").is_none(), "too short");
    assert!(classify("12345678901234567").is_none(), "not a 7656119 prefix");
    assert!(classify("nome com espaço").is_none());
    assert!(classify("https://steamcommunity.com/app/620").is_none());
    assert!(classify(&"a".repeat(65)).is_none(), "vanity names stop at 64");
}

#[test]
fn the_status_says_whether_a_key_came_with_the_account() {
    let none = status(None);
    assert!(!none.configured && !none.has_key && none.steamid.is_empty());
    let full = status(Some(&cfg("76561190000000000", "chave", "Ana")));
    assert!(full.configured && full.has_key && full.name == "Ana");
    assert!(!status(Some(&cfg("76561190000000000", "", ""))).has_key);
}

#[test]
fn the_status_names_the_storefront_the_lists_are_reading() {
    // The interface runs in pt-BR under test, and an empty choice falls back to it.
    assert_eq!(status(Some(&cfg("76561190000000000", "", ""))).region, "br");
    let chosen = SteamConfig { region: "us".into(), ..cfg("76561190000000000", "", "") };
    assert_eq!(status(Some(&chosen)).region, "us", "the stored choice wins over the language");
    let dropped = SteamConfig { region: "atlantis".into(), ..cfg("76561190000000000", "", "") };
    assert_eq!(status(Some(&dropped)).region, "br", "a region we no longer ship falls back");
}

/// A counting fetch: each call hands `get_or` a fresh closure over the shared counter.
fn count(calls: &std::cell::Cell<u32>) -> impl FnMut() -> Result<SteamList> + '_ {
    || {
        calls.set(calls.get() + 1);
        Ok(SteamList { items: Vec::new(), has_more: false, currency: String::new() })
    }
}

#[test]
fn a_fresh_entry_is_answered_from_memory_and_force_skips_it() {
    let cache = SteamCache::default();
    let calls = std::cell::Cell::new(0);
    cache.get_or("trending", false, T0, count(&calls)).unwrap();
    cache.get_or("trending", false, T0 + TTL_MS - 1, count(&calls)).unwrap();
    assert_eq!(calls.get(), 1, "still warm");
    cache.get_or("trending", true, T0 + 1, count(&calls)).unwrap();
    assert_eq!(calls.get(), 2, "the refresh button always goes out");
    cache.get_or("trending", false, T0 + 2, count(&calls)).unwrap();
    assert_eq!(calls.get(), 2, "the forced answer is the one kept");
    cache.get_or("trending", false, T0 + 1 + TTL_MS, count(&calls)).unwrap();
    assert_eq!(calls.get(), 3, "expired");
    cache.clear();
    cache.get_or("trending", false, T0, count(&calls)).unwrap();
    assert_eq!(calls.get(), 4, "cleared on lock");
}

#[test]
fn a_failed_fetch_is_not_cached() {
    let cache = SteamCache::default();
    let calls = std::cell::Cell::new(0);
    let failed = cache.get_or::<SteamList>("trending", false, T0, || {
        calls.set(calls.get() + 1);
        Err(crate::error::AppError::Steam("HTTP 500".into()))
    });
    assert!(failed.is_err());
    cache
        .get_or("trending", false, T0, || {
            calls.set(calls.get() + 1);
            Ok(SteamList { items: Vec::new(), has_more: false, currency: String::new() })
        })
        .unwrap();
    assert_eq!(calls.get(), 2, "the next try goes back to the network");
}

#[test]
fn the_cache_drops_the_oldest_entry_instead_of_growing_forever() {
    let cache = SteamCache::default();
    let calls = std::cell::Cell::new(0);
    for i in 0..=MAX_ENTRIES as i64 {
        cache.get_or(&format!("k{i}"), false, T0 + i, count(&calls)).unwrap();
    }
    assert_eq!(calls.get() as usize, MAX_ENTRIES + 1);
    let newest = format!("k{MAX_ENTRIES}");
    cache.get_or(&newest, false, T0 + MAX_ENTRIES as i64 + 1, count(&calls)).unwrap();
    assert_eq!(calls.get() as usize, MAX_ENTRIES + 1, "the newest is still in memory");
    cache.get_or("k0", false, T0 + MAX_ENTRIES as i64 + 1, count(&calls)).unwrap();
    assert_eq!(calls.get() as usize, MAX_ENTRIES + 2, "the oldest was dropped");
}

#[test]
fn the_connection_is_sealed_on_disk_and_survives_a_password_change() {
    let dir = std::env::temp_dir().join(format!("canto-steam-{}-{}", std::process::id(), now_ms()));
    let st = AppState::new(dir);
    st.create("senha-velha").unwrap();
    st.save_steam(&cfg("76561190000000000", "chave-ficticia", "Ana")).unwrap();
    let raw = std::fs::read_to_string(store::steam_path(&st.dir)).unwrap();
    assert!(!raw.contains("76561190000000000") && !raw.contains("chave-ficticia"), "nothing in clear on disk");
    st.change_password("senha-velha", "senha-nova").unwrap();
    st.lock();
    st.unlock("senha-nova").unwrap();
    let back = st.steam_config().unwrap().unwrap();
    assert_eq!(back.steamid, "76561190000000000");
    assert_eq!(back.api_key, "chave-ficticia");
    let _ = std::fs::remove_dir_all(&st.dir);
}

#[test]
fn an_older_file_without_the_key_field_still_loads() {
    let older: SteamConfig = serde_json::from_str(r#"{"steamid":"76561190000000000"}"#).unwrap();
    assert_eq!(older.steamid, "76561190000000000");
    assert!(older.api_key.is_empty() && older.name.is_empty() && older.region.is_empty());
}
