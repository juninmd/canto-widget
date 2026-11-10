use super::*;

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
