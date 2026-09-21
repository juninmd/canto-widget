use super::*;
use std::sync::Arc;

fn state(name: &str) -> AppState {
    let dir = std::env::temp_dir().join(format!(
        "canto-vault-{name}-{}-{}",
        std::process::id(),
        now_ms()
    ));
    let _ = std::fs::remove_dir_all(&dir);
    AppState::new(dir)
}

#[test]
fn short_password_does_not_create_vault() {
    let st = state("curta");
    assert!(st.create("abc").is_err(), "accepted a password below the floor");
    assert!(!st.vault_exists());
    let _ = std::fs::remove_dir_all(&st.dir);
}

#[test]
fn password_at_exact_floor_is_accepted() {
    let st = state("piso");
    let password: String = "a".repeat(MIN_PASSWORD_LEN);
    st.create(&password).unwrap();
    assert!(st.is_unlocked());
    let _ = std::fs::remove_dir_all(&st.dir);
}

#[test]
fn floor_counts_chars_not_bytes() {
    let st = state("unicode");
    // 4 chars, 16 bytes in UTF-8: must pass.
    assert!(st.create("🔐🔐🔐🔐").is_ok());
    let _ = std::fs::remove_dir_all(&st.dir);
}

#[test]
fn created_vault_unlocks_with_same_password_and_rejects_another() {
    let st = state("abre");
    st.create("senha-mestra").unwrap();
    st.lock();
    assert!(matches!(st.unlock("outra-senha"), Err(AppError::WrongPassword)));
    st.unlock("senha-mestra").unwrap();
    assert!(st.is_unlocked());
    let _ = std::fs::remove_dir_all(&st.dir);
}

#[test]
fn auto_lock_fires_once_past_the_limit() {
    let st = state("idle");
    st.create("senha-mestra").unwrap();
    assert!(!st.lock_if_idle(60_000), "locked a just-used vault");
    *st.last_active.lock().unwrap() = now_ms() - 61_000;
    assert!(st.lock_if_idle(60_000), "did not lock past the limit");
    assert!(!st.is_unlocked());
    assert!(!st.lock_if_idle(60_000), "reported the same lock twice");
    let _ = std::fs::remove_dir_all(&st.dir);
}

#[test]
fn using_the_vault_postpones_auto_lock() {
    let st = state("adia");
    st.create("senha-mestra").unwrap();
    *st.last_active.lock().unwrap() = now_ms() - 61_000;
    st.read(|d| d.tasks.len()).unwrap();
    assert!(!st.lock_if_idle(60_000), "user read did not postpone the timer");
    let _ = std::fs::remove_dir_all(&st.dir);
}

#[test]
fn reminder_watcher_does_not_postpone_auto_lock_nor_persist_without_change() {
    let st = state("em-fundo");
    st.create("senha-mestra").unwrap();
    let before = std::fs::metadata(store::vault_path(&st.dir)).unwrap().modified().unwrap();
    *st.last_active.lock().unwrap() = now_ms() - 61_000;
    std::thread::sleep(std::time::Duration::from_millis(20));
    st.in_background(|d| (d.tasks.len(), false)).unwrap();
    let after = std::fs::metadata(store::vault_path(&st.dir)).unwrap().modified().unwrap();
    assert_eq!(before, after, "rewrote the vault with nothing changed");
    assert!(st.lock_if_idle(60_000), "the background watcher held the vault open");
    assert!(matches!(st.in_background(|_| ((), true)), Err(AppError::Locked)));
    let _ = std::fs::remove_dir_all(&st.dir);
}

#[test]
fn background_clipboard_does_not_postpone_auto_lock() {
    let st = state("fundo");
    st.create("senha-mestra").unwrap();
    *st.last_active.lock().unwrap() = now_ms() - 61_000;
    // Background poll: reads and writes history without going through read/mutate.
    let history = st.clip_load().unwrap();
    st.clip_save(&history).unwrap();
    assert!(st.lock_if_idle(60_000), "the clipboard watcher held the vault open");
    let _ = std::fs::remove_dir_all(&st.dir);
}

#[test]
fn drive_config_deserializes_legacy_portuguese_keys() {
    let legacy = r#"{"client_id":"id","client_secret":"secret","cliente_proprio":true,"nome":"Ana","email":"a@b.com"}"#;
    let cfg: DriveConfig = serde_json::from_str(legacy).unwrap();
    assert!(cfg.owned_client);
    assert_eq!(cfg.name, "Ana");
    assert_eq!(cfg.email, "a@b.com");
}

/// Regression for ecff1f4: a `mutate` whose synced-folder export is slow must release the
/// session lock before running it, so a concurrent `read()` never waits on that export.
#[test]
fn mutate_releases_the_session_lock_before_the_slow_synced_folder_write() {
    let st = Arc::new(state("libera-lock"));
    st.create("senha-mestra").unwrap();
    let pasta = std::env::temp_dir().join(format!(
        "canto-vault-sync-lenta-{}-{}",
        std::process::id(),
        now_ms()
    ));
    let _ = std::fs::remove_dir_all(&pasta);
    std::fs::create_dir_all(&pasta).unwrap();
    crate::sync::set_folder(&st, pasta.clone()).unwrap();

    let _delay = test_hooks::slow_sync(200);
    let worker = {
        let st = st.clone();
        std::thread::spawn(move || st.mutate(|d| d.tasks.len()))
    };
    // Long enough for the worker to have finished persist() and entered the delayed sync.
    std::thread::sleep(std::time::Duration::from_millis(50));

    let started = std::time::Instant::now();
    st.read(|d| d.tasks.len()).unwrap();
    let elapsed = started.elapsed();
    worker.join().unwrap().unwrap();

    assert!(
        elapsed < std::time::Duration::from_millis(150),
        "read() waited {elapsed:?} for the session lock: the synced-folder export is still \
         holding it during the write (ecff1f4 regression)"
    );
    let _ = std::fs::remove_dir_all(&st.dir);
    let _ = std::fs::remove_dir_all(&pasta);
}
