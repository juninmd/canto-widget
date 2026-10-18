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
fn a_locked_vault_answers_no_and_drops_what_was_in_ram() {
    let dir = std::env::temp_dir().join(format!("canto-steam-forget-{}-{}", std::process::id(), now_ms()));
    let st = AppState::new(dir);
    st.create("senha").unwrap();
    let alerts = SteamAlerts::default();
    alerts.set_watching(&st, true).unwrap();
    assert!(alerts.watching(&st));

    // Asking while locked must not answer from the copy the open vault left behind.
    st.lock();
    assert!(!alerts.watching(&st), "a locked vault answers no");
    // And that same copy was dropped, so the file is what gets read again after the unlock.
    st.unlock("senha").unwrap();
    assert!(alerts.watching(&st), "the file was there all along");
    let _ = std::fs::remove_dir_all(&st.dir);
}
