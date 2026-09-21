use std::path::PathBuf;
use std::sync::Mutex;
use zeroize::Zeroizing;

use crate::crypto::VaultKey;
use crate::error::{AppError, Result};
use crate::model::{now_ms, VaultData};
use crate::store::{self, SealedBlob, VAULT_AAD};

/// Kept short deliberately: the envelope leaves the machine in backups and is attackable offline with no attempt limit, so only Argon2id cost protects it.
pub const MIN_PASSWORD_LEN: usize = 4;

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
        self.sync_after_persist();
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
        store::write_json_atomic(&store::vault_path(&self.dir), &blob)
    }

    /// Best-effort, and deliberately called after the session lock is released: `export_now` only
    /// reads the vault file `persist` already wrote, but a synced folder that's momentarily
    /// unreachable (unmounted drive, offline cloud client materializing a placeholder) must never
    /// hold the mutex every other command needs, just because this one save also touches it.
    fn sync_after_persist(&self) {
        #[cfg(test)]
        test_hooks::delay_before_sync();
        let _ = crate::sync::export_now(&self.dir);
    }

    /// Single seam for the lock -> mutate -> persist-if-changed -> unlock -> sync-if-changed
    /// skeleton: `mutate`, `mutate_if` and `in_background` used to hand-copy this sequencing,
    /// which is what let two of them (ecff1f4, b2ee9f4) drift out of sync with the "release the
    /// lock before syncing" invariant. `f` reports whether it actually changed the data, since
    /// `in_background` and `mutate_if` must skip persist/sync entirely when nothing did.
    fn with_session<T>(&self, f: impl FnOnce(&mut VaultData) -> (T, bool)) -> Result<T> {
        let mut guard = self.session.lock().unwrap();
        let session = guard.as_mut().ok_or(AppError::Locked)?;
        let (out, changed) = f(&mut session.data);
        if changed {
            self.persist(session)?;
        }
        drop(guard);
        if changed {
            self.sync_after_persist();
        }
        Ok(out)
    }

    /// Applies a mutation to the unlocked vault and persists it in the same step.
    pub fn mutate<T>(&self, f: impl FnOnce(&mut VaultData) -> T) -> Result<T> {
        self.touch();
        self.with_session(|data| (f(data), true))
    }

    /// For background watchers: doesn't count as use and only persists when the closure says something changed.
    pub fn in_background<T>(&self, f: impl FnOnce(&mut VaultData) -> (T, bool)) -> Result<T> {
        self.with_session(f)
    }

    /// User mutation that might change nothing: persists only if `f` returns `true`.
    pub fn mutate_if(&self, f: impl FnOnce(&mut VaultData) -> bool) -> Result<()> {
        self.touch();
        self.with_session(|data| ((), f(data)))
    }

    pub fn read<T>(&self, f: impl FnOnce(&VaultData) -> T) -> Result<T> {
        self.touch();
        let guard = self.session.lock().unwrap();
        let session = guard.as_ref().ok_or(AppError::Locked)?;
        Ok(f(&session.data))
    }

    /// Reads a sealed JSON file at `path`, decrypted with the session key. `None` when the file
    /// doesn't exist yet (a config never saved). Shared by drive/GitHub/GitLab config, which used
    /// to hand-copy this same open-and-decode shape three times.
    pub fn sealed<T: serde::de::DeserializeOwned>(&self, path: &std::path::Path, aad: &[u8]) -> Result<Option<T>> {
        let guard = self.session.lock().unwrap();
        let session = guard.as_ref().ok_or(AppError::Locked)?;
        match store::read_json::<SealedBlob>(path)? {
            None => Ok(None),
            Some(blob) => {
                let plain = Zeroizing::new(blob.open(&session.key, aad)?);
                Ok(Some(serde_json::from_slice(&plain)?))
            }
        }
    }

    /// Seals `value` with the session key and writes it atomically to `path`.
    pub fn save_sealed<T: serde::Serialize>(&self, path: &std::path::Path, aad: &[u8], value: &T) -> Result<()> {
        let guard = self.session.lock().unwrap();
        let session = guard.as_ref().ok_or(AppError::Locked)?;
        let plain = Zeroizing::new(serde_json::to_vec(value)?);
        let blob = SealedBlob::seal(&session.key, &session.salt, &plain, aad, now_ms())?;
        store::write_json_atomic(path, &blob)
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

/// Test-only seam: lets a concurrency test force `sync_after_persist` to run slowly and
/// deterministically, instead of depending on real (and flaky) filesystem latency to expose a
/// lock-held-too-long regression.
#[cfg(test)]
mod test_hooks {
    use std::sync::atomic::{AtomicU64, Ordering};

    static DELAY_MS: AtomicU64 = AtomicU64::new(0);

    pub(super) struct SlowSync;

    impl Drop for SlowSync {
        fn drop(&mut self) {
            DELAY_MS.store(0, Ordering::SeqCst);
        }
    }

    pub(super) fn slow_sync(ms: u64) -> SlowSync {
        DELAY_MS.store(ms, Ordering::SeqCst);
        SlowSync
    }

    pub(super) fn delay_before_sync() {
        let ms = DELAY_MS.load(Ordering::SeqCst);
        if ms > 0 {
            std::thread::sleep(std::time::Duration::from_millis(ms));
        }
    }
}

#[cfg(test)]
#[path = "vault_tests.rs"]
mod tests;
