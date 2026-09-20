use std::path::PathBuf;
use std::sync::Mutex;
use zeroize::Zeroizing;

use crate::crypto::VaultKey;
use crate::drive::DriveTokens;
use crate::error::{AppError, Result};
use crate::model::{now_ms, VaultData};
use crate::store::{self, SealedBlob, DRIVE_AAD, VAULT_AAD};

/// Kept short deliberately: the envelope leaves the machine in backups and is attackable offline with no attempt limit, so only Argon2id cost protects it.
pub const MIN_PASSWORD_LEN: usize = 4;

#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize)]
pub struct DriveConfig {
    #[serde(default)]
    pub client_id: String,
    #[serde(default)]
    pub client_secret: String,
    /// Saved by the user in Settings. A pre-embedded-client credential doesn't count.
    #[serde(default, alias = "cliente_proprio")]
    pub owned_client: bool,
    #[serde(default)]
    pub tokens: Option<DriveTokens>,
    #[serde(default)]
    pub email: String,
    #[serde(default, alias = "nome")]
    pub name: String,
    /// Account photo as a `data:` URL; empty when absent or it failed validation.
    #[serde(default)]
    pub avatar: String,
}

pub struct Session {
    pub(crate) key: VaultKey,
    /// Needed to derive the key for an imported backup, which has its own salt.
    pub(crate) password: Zeroizing<String>,
    pub(crate) salt: Vec<u8>,
    pub data: VaultData,
}

impl Session {
    pub fn key(&self) -> &VaultKey {
        &self.key
    }
    pub fn salt(&self) -> &[u8] {
        &self.salt
    }
}

pub struct AppState {
    pub dir: PathBuf,
    pub session: Mutex<Option<Session>>,
    /// Last event that triggered the pop-up, read by the alert window.
    pub alert: Mutex<Option<crate::calendar::AgendaItem>>,
    pub trash: crate::trash::Trash,
    /// GitHub/GitLab lists; dropped on lock like the rest of the plaintext.
    pub forges: crate::forge_cache::ForgeCache,
    /// Soonest upcoming event with a Meet link, refreshed by `tray_live::watch`; read by the tray and the join shortcut.
    pub next_meeting: Mutex<Option<crate::calendar::AgendaItem>>,
    /// Tasks still open "today" as the UI computes it (Rust can't: AGENTS.md timezone trap); folded into the badge count.
    pub badge_tasks: Mutex<u32>,
    /// Auto-lock baseline; background polls (clipboard, agenda) deliberately don't touch this.
    last_active: Mutex<i64>,
}

impl AppState {
    pub fn new(dir: PathBuf) -> Self {
        Self {
            dir,
            session: Mutex::new(None),
            alert: Mutex::new(None),
            trash: Default::default(),
            forges: Default::default(),
            next_meeting: Mutex::new(None),
            badge_tasks: Mutex::new(0),
            last_active: Mutex::new(now_ms()),
        }
    }

    pub fn touch(&self) {
        *self.last_active.lock().unwrap() = now_ms();
    }

    pub fn idle_ms(&self) -> i64 {
        now_ms() - *self.last_active.lock().unwrap()
    }

    /// Returns `true` only on the lock transition, so the watchdog notifies the UI once per lock.
    pub fn lock_if_idle(&self, limit_ms: i64) -> bool {
        if !self.is_unlocked() || self.idle_ms() < limit_ms {
            return false;
        }
        self.lock();
        true
    }

    pub fn vault_exists(&self) -> bool {
        store::vault_path(&self.dir).exists()
    }

    pub fn create(&self, password: &str) -> Result<()> {
        if self.vault_exists() {
            return Err(AppError::AlreadyExists);
        }
        if password.chars().count() < MIN_PASSWORD_LEN {
            return Err(AppError::Config(format!(
                "a senha mestra precisa de ao menos {MIN_PASSWORD_LEN} caracteres"
            )));
        }
        let salt = store::new_salt();
        let key = VaultKey::derive(password, &salt)?;
        let session = Session {
            key,
            password: Zeroizing::new(password.to_string()),
            salt,
            data: VaultData::default(),
        };
        self.persist(&session)?;
        *self.session.lock().unwrap() = Some(session);
        self.touch();
        Ok(())
    }

    pub fn unlock(&self, password: &str) -> Result<()> {
        let blob: SealedBlob = store::read_json(&store::vault_path(&self.dir))?
            .ok_or(AppError::NotFound)?;
        let salt = blob.salt_bytes()?;
        let key = VaultKey::derive(password, &salt)?;
        let plain = blob.open(&key, VAULT_AAD)?;
        let data: VaultData = serde_json::from_slice(&plain)?;
        crate::password::finish_interrupted(&self.dir, &salt)?;
        *self.session.lock().unwrap() = Some(Session {
            key,
            password: Zeroizing::new(password.to_string()),
            salt,
            data,
        });
        self.touch();
        // Best-effort: whatever showed up in a synced folder merges in right away.
        let _ = crate::sync::poll_and_merge(self);
        Ok(())
    }

    /// Copy of the session password, to encrypt it with biometrics. Never leaves the process.
    pub(crate) fn session_password(&self) -> Result<Zeroizing<String>> {
        let guard = self.session.lock().unwrap();
        let session = guard.as_ref().ok_or(AppError::Locked)?;
        Ok(session.password.clone())
    }

    pub fn lock(&self) {
        *self.session.lock().unwrap() = None;
        self.trash.clear();
        self.forges.clear();
        *self.next_meeting.lock().unwrap() = None;
        *self.badge_tasks.lock().unwrap() = 0;
    }

    pub fn is_unlocked(&self) -> bool {
        self.session.lock().unwrap().is_some()
    }

    fn persist(&self, session: &Session) -> Result<()> {
        let plain = serde_json::to_vec(&session.data)?;
        let blob = SealedBlob::seal(&session.key, &session.salt, &plain, VAULT_AAD, now_ms())?;
        store::write_json_atomic(&store::vault_path(&self.dir), &blob)?;
        // Best-effort: a synced folder that's momentarily unreachable (unmounted drive, offline
        // cloud client) must never fail the save that triggered it.
        let _ = crate::sync::export_now(&self.dir);
        Ok(())
    }

    /// Applies a mutation to the unlocked vault and persists it in the same step.
    pub fn mutate<T>(&self, f: impl FnOnce(&mut VaultData) -> T) -> Result<T> {
        self.touch();
        let mut guard = self.session.lock().unwrap();
        let session = guard.as_mut().ok_or(AppError::Locked)?;
        let out = f(&mut session.data);
        self.persist(session)?;
        Ok(out)
    }

    /// For background watchers: doesn't count as use and only persists when the closure says something changed.
    pub fn in_background<T>(&self, f: impl FnOnce(&mut VaultData) -> (T, bool)) -> Result<T> {
        let mut guard = self.session.lock().unwrap();
        let session = guard.as_mut().ok_or(AppError::Locked)?;
        let (out, changed) = f(&mut session.data);
        if changed {
            self.persist(session)?;
        }
        Ok(out)
    }

    /// User mutation that might change nothing: persists only if `f` returns `true`.
    pub fn mutate_if(&self, f: impl FnOnce(&mut VaultData) -> bool) -> Result<()> {
        self.touch();
        let mut guard = self.session.lock().unwrap();
        let session = guard.as_mut().ok_or(AppError::Locked)?;
        if f(&mut session.data) {
            self.persist(session)?;
        }
        Ok(())
    }

    pub fn read<T>(&self, f: impl FnOnce(&VaultData) -> T) -> Result<T> {
        self.touch();
        let guard = self.session.lock().unwrap();
        let session = guard.as_ref().ok_or(AppError::Locked)?;
        Ok(f(&session.data))
    }

    pub fn drive_config(&self) -> Result<DriveConfig> {
        let guard = self.session.lock().unwrap();
        let session = guard.as_ref().ok_or(AppError::Locked)?;
        match store::read_json::<SealedBlob>(&store::drive_path(&self.dir))? {
            None => Ok(DriveConfig::default()),
            Some(blob) => Ok(serde_json::from_slice(&blob.open(&session.key, DRIVE_AAD)?)?),
        }
    }

    pub fn save_drive_config(&self, cfg: &DriveConfig) -> Result<()> {
        let guard = self.session.lock().unwrap();
        let session = guard.as_ref().ok_or(AppError::Locked)?;
        let plain = serde_json::to_vec(cfg)?;
        let blob = SealedBlob::seal(&session.key, &session.salt, &plain, DRIVE_AAD, now_ms())?;
        store::write_json_atomic(&store::drive_path(&self.dir), &blob)
    }

    /// Uses the envelope's own salt, not the session's: a backup made on another machine has its own salt.
    pub fn open_envelope(&self, blob: &SealedBlob) -> Result<VaultData> {
        let guard = self.session.lock().unwrap();
        let session = guard.as_ref().ok_or(AppError::Locked)?;
        let key = VaultKey::derive(&session.password, &blob.salt_bytes()?)?;
        let plain = blob.open(&key, VAULT_AAD).map_err(|e| match e {
            AppError::WrongPassword => {
                AppError::Config("o backup foi criado com outra senha mestra".into())
            }
            other => other,
        })?;
        Ok(serde_json::from_slice(&plain)?)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

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
}
