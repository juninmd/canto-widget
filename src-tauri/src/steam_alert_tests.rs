use super::*;

#[test]
fn the_switch_is_sealed_and_survives_a_restart_and_a_password_change() {
    let dir = std::env::temp_dir().join(format!("canto-steam-alert-{}-{}", std::process::id(), now_ms()));
    let st = AppState::new(dir);
    st.create("senha-velha").unwrap();

    let alerts = SteamAlerts::default();
    assert!(!alerts.watching(&st), "off by default");
    alerts.set_watching(&st, true).unwrap();
    // Another process reads the sealed file back.
    assert!(SteamAlerts::default().watching(&st));
    let raw = std::fs::read_to_string(store::steam_deals_path(&st.dir)).unwrap();
    assert!(!raw.contains("watching") && !raw.contains("prices"), "nothing in clear on disk");

    st.change_password("senha-velha", "senha-nova").unwrap();
    st.lock();
    st.unlock("senha-nova").unwrap();
    assert!(SteamAlerts::default().watching(&st), "the file was re-sealed with the rest");

    let alerts = SteamAlerts::default();
    alerts.set_watching(&st, false).unwrap();
    assert!(!SteamAlerts::default().watching(&st));
    let _ = std::fs::remove_dir_all(&st.dir);
}

#[test]
fn nothing_is_kept_in_ram_while_the_vault_is_locked() {
    let dir = std::env::temp_dir().join(format!("canto-steam-forget-{}-{}", std::process::id(), now_ms()));
    let st = AppState::new(dir);
    st.create("senha").unwrap();
    let alerts = SteamAlerts::default();
    alerts.set_watching(&st, true).unwrap();
    assert!(alerts.watching(&st));

    // What the watcher does on every tick with the vault locked.
    alerts.forget();
    st.lock();
    assert!(!alerts.watching(&st), "a locked vault answers for the default, not for the file");

    st.unlock("senha").unwrap();
    assert!(SteamAlerts::default().watching(&st), "the file was there all along");
    let _ = std::fs::remove_dir_all(&st.dir);
}
