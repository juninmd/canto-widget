use super::*;
use crate::clipboard::ClipHistory;
use crate::vault::DriveConfig;

fn state(name: &str) -> AppState {
    let dir = std::env::temp_dir().join(format!("canto-password-{name}-{}-{}", std::process::id(), now_ms()));
    let _ = std::fs::remove_dir_all(&dir);
    let st = AppState::new(dir);
    st.create("senha-velha").unwrap();
    st
}

fn cleanup(st: &AppState) {
    let _ = std::fs::remove_dir_all(&st.dir);
}

#[test]
fn after_change_only_the_new_password_opens_the_vault() {
    let st = state("abre");
    st.mutate(|d| d.tasks.push(Default::default())).unwrap();
    st.change_password("senha-velha", "senha-nova").unwrap();
    st.lock();
    assert!(matches!(st.unlock("senha-velha"), Err(AppError::WrongPassword)));
    st.unlock("senha-nova").unwrap();
    assert_eq!(st.read(|d| d.tasks.len()).unwrap(), 1, "task lost during the change");
    cleanup(&st);
}

#[test]
fn wrong_current_password_touches_nothing() {
    let st = state("errada");
    let before = std::fs::read(store::vault_path(&st.dir)).unwrap();
    let err = st.change_password("chute", "senha-nova").unwrap_err();
    assert!(err.to_string().contains("senha atual"), "{err}");
    assert_eq!(std::fs::read(store::vault_path(&st.dir)).unwrap(), before);
    st.lock();
    st.unlock("senha-velha").unwrap();
    cleanup(&st);
}

#[test]
fn short_or_identical_new_password_is_rejected() {
    let st = state("curta");
    assert!(st.change_password("senha-velha", "abc").is_err());
    assert!(st.change_password("senha-velha", "senha-velha").is_err());
    st.lock();
    st.unlock("senha-velha").unwrap();
    cleanup(&st);
}

#[test]
fn locked_vault_does_not_change_password() {
    let st = state("trancado");
    st.lock();
    assert!(matches!(st.change_password("senha-velha", "senha-nova"), Err(AppError::Locked)));
    cleanup(&st);
}

#[test]
fn google_account_and_clipboard_stay_readable() {
    let st = state("extras");
    st.save_drive_config(&DriveConfig { email: "voce@exemplo.com".into(), ..Default::default() }).unwrap();
    let mut hist = ClipHistory::default();
    hist.push("copiado", "c1".into());
    st.clip_save(&hist).unwrap();

    st.change_password("senha-velha", "senha-nova").unwrap();
    st.lock();
    st.unlock("senha-nova").unwrap();
    assert_eq!(st.drive_config().unwrap().email, "voce@exemplo.com");
    assert_eq!(st.clip_load().unwrap().items.len(), 1, "clipboard history was lost");
    cleanup(&st);
}

#[test]
fn local_backups_import_with_the_new_password() {
    let st = state("backup");
    crate::backup::daily(&st.dir, "2026-09-01").unwrap();
    st.change_password("senha-velha", "senha-nova").unwrap();
    let copy = backups_dir(&st.dir).join(format!("2026-09-01.{EXTENSION}"));
    crate::backup::import(&st, &copy).expect("old backup stayed stuck on the old password");
    cleanup(&st);
}

#[test]
fn unreadable_clipboard_is_discarded_without_blocking_the_change() {
    let st = state("clip-ruim");
    std::fs::write(store::clip_path(&st.dir), b"{\"lixo\":1}").unwrap();
    st.change_password("senha-velha", "senha-nova").unwrap();
    assert!(!store::clip_path(&st.dir).exists());
    cleanup(&st);
}

#[test]
fn enabled_biometric_is_disabled_on_change_and_the_return_value_says_so() {
    let st = state("bio");
    std::fs::write(crate::biometric::path(&st.dir), b"{}").unwrap();
    assert!(st.change_password("senha-velha", "senha-nova").unwrap());
    assert!(!crate::biometric::enabled(&st.dir), "biometric stayed enabled with the old password");
    assert!(!st.change_password("senha-nova", "senha-outra").unwrap());
    cleanup(&st);
}

#[test]
fn wrong_password_does_not_disable_biometric() {
    let st = state("bio-errada");
    std::fs::write(crate::biometric::path(&st.dir), b"{}").unwrap();
    assert!(st.change_password("chute", "senha-nova").is_err());
    assert!(crate::biometric::enabled(&st.dir));
    cleanup(&st);
}

#[test]
fn a_change_cut_short_before_the_vault_write_keeps_everything_on_the_old_password() {
    let st = state("interrompida");
    st.save_drive_config(&DriveConfig { email: "voce@exemplo.com".into(), ..Default::default() }).unwrap();
    let mut hist = ClipHistory::default();
    hist.push("copiado", "c1".into());
    st.clip_save(&hist).unwrap();
    // A directory where the vault's temp file goes: the vault write fails after the others, like a crash there.
    let blocker = st.dir.join("vault.json.tmp");
    std::fs::create_dir_all(&blocker).unwrap();
    assert!(st.change_password("senha-velha", "senha-nova").is_err());
    std::fs::remove_dir_all(&blocker).unwrap();

    st.lock();
    st.unlock("senha-velha").unwrap();
    assert_eq!(st.drive_config().unwrap().email, "voce@exemplo.com", "Google account sealed with a key nobody has");
    assert_eq!(st.clip_load().unwrap().items.len(), 1, "clipboard sealed with a key nobody has");
    cleanup(&st);
}

#[test]
fn a_change_cut_short_after_the_vault_write_finishes_on_the_next_unlock() {
    let st = state("retomada");
    st.save_drive_config(&DriveConfig { email: "voce@exemplo.com".into(), ..Default::default() }).unwrap();
    st.change_password("senha-velha", "senha-nova").unwrap();
    // Rewind to the moment between the vault write and the swap: staged file present, old one still in place.
    let drive = store::drive_path(&st.dir);
    std::fs::copy(&drive, staged(&drive)).unwrap();
    std::fs::write(&drive, b"{\"lixo\":1}").unwrap();

    st.lock();
    st.unlock("senha-nova").unwrap();
    assert_eq!(st.drive_config().unwrap().email, "voce@exemplo.com");
    assert!(!staged(&drive).exists());
    cleanup(&st);
}
