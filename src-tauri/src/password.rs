//! Master password change: everything the old key protects is re-encrypted with the new one.
use std::path::{Path, PathBuf};
use tauri::State;
use zeroize::Zeroizing;

use crate::backup::{backups_dir, EXTENSION};
use crate::clipboard::CLIP_AAD;
use crate::crypto::VaultKey;
use crate::error::{AppError, Result};
use crate::model::now_ms;
use crate::store::{self, SealedBlob, DRIVE_AAD, GITHUB_AAD, GITLAB_AAD, VAULT_AAD};
use crate::vault::{AppState, MIN_PASSWORD_LEN};

/// Envelope read with the old key and already sealed with the new one, ready to write.
struct Reencrypted {
    path: PathBuf,
    blob: SealedBlob,
}

impl AppState {
    /// Nothing hits disk before every envelope opens with the old key, so a wrong password leaves the vault unchanged; returns `true` if biometrics was disabled.
    pub fn change_password(&self, current_password: &str, new_password: &str) -> Result<bool> {
        if new_password.chars().count() < MIN_PASSWORD_LEN {
            return Err(AppError::Config(format!("a senha mestra precisa de ao menos {MIN_PASSWORD_LEN} caracteres")));
        }
        if new_password == current_password {
            return Err(AppError::Config("a nova senha é igual à atual".into()));
        }
        // Held start to finish: no watcher writes with the old key mid-change.
        let mut guard = self.session.lock().unwrap();
        let session = guard.as_mut().ok_or(AppError::Locked)?;
        let vault: SealedBlob = store::read_json(&store::vault_path(&self.dir))?.ok_or(AppError::NotFound)?;
        VaultKey::derive(current_password, &session.salt)
            .and_then(|k| vault.open(&k, VAULT_AAD))
            .map_err(|_| AppError::Config("a senha atual não confere".into()))?;

        let salt = store::new_salt();
        let key = VaultKey::derive(new_password, &salt)?;
        let (mut batch, mut discard) = (Vec::new(), Vec::new());
        for (path, aad, disposable) in [
            (store::drive_path(&self.dir), DRIVE_AAD, false),
            (store::github_path(&self.dir), GITHUB_AAD, false),
            (store::gitlab_path(&self.dir), GITLAB_AAD, false),
            (store::clip_path(&self.dir), CLIP_AAD, true),
        ] {
            match reencrypt(&path, aad, &session.key, &key, &salt) {
                Ok(Some(r)) => batch.push(r),
                Ok(None) => {}
                // Discard only unreadable clipboard content; a disk error (antivirus, permission) must not wipe history.
                Err(e) if disposable && !matches!(e, AppError::Io(_)) => discard.push(path),
                Err(e) => return Err(e),
            }
        }
        batch.extend(reencrypted_backups(&self.dir, &session.key, &key, &salt));
        // Staged, not in place: until the vault is written, the old password must still open everything.
        for r in &batch {
            store::write_json_atomic(&staged(&r.path), &r.blob)?;
        }
        for path in discard {
            std::fs::remove_file(path)?;
        }
        // Still under the lock, so no crash leaves biometrics holding a password that opens nothing.
        let biometric = crate::biometric::enabled(&self.dir);
        if biometric {
            crate::biometric::disable(&self.dir)?;
        }
        let plain = Zeroizing::new(serde_json::to_vec(&session.data)?);
        let blob = SealedBlob::seal(&key, &salt, &plain, VAULT_AAD, now_ms())?;
        store::write_json_atomic(&store::vault_path(&self.dir), &blob)?;
        let swapped = finish_interrupted(&self.dir, &salt);
        session.key = key;
        session.salt = salt;
        session.password = Zeroizing::new(new_password.to_string());
        drop(guard);
        self.touch();
        swapped?;
        Ok(biometric)
    }
}

/// Settles staged copies left by a change: same salt as the vault means it was written, so swap; anything else is stale.
pub(crate) fn finish_interrupted(dir: &Path, vault_salt: &[u8]) -> Result<()> {
    let peripherals = [store::drive_path(dir), store::github_path(dir), store::gitlab_path(dir), store::clip_path(dir)];
    for path in peripherals.into_iter().chain(backup_files(dir)) {
        let next = staged(&path);
        match store::read_json::<SealedBlob>(&next) {
            Ok(None) => {}
            Ok(Some(b)) if b.salt_bytes().ok().as_deref() == Some(vault_salt) => std::fs::rename(&next, &path)?,
            _ => std::fs::remove_file(&next)?,
        }
    }
    Ok(())
}

fn backup_files(dir: &Path) -> Vec<PathBuf> {
    let Ok(entries) = std::fs::read_dir(backups_dir(dir)) else {
        return Vec::new();
    };
    entries.filter_map(|e| e.ok().map(|e| e.path())).filter(|p| p.extension().is_some_and(|x| x == EXTENSION)).collect()
}

/// Where the re-sealed copy waits until the vault itself is written.
pub(crate) fn staged(path: &Path) -> PathBuf {
    let mut name = path.file_name().unwrap_or_default().to_os_string();
    name.push(".next");
    path.with_file_name(name)
}

fn reencrypt(path: &Path, aad: &[u8], old: &VaultKey, new: &VaultKey, salt: &[u8]) -> Result<Option<Reencrypted>> {
    let Some(blob) = store::read_json::<SealedBlob>(path)? else {
        return Ok(None);
    };
    let plain = Zeroizing::new(blob.open(old, aad)?);
    let blob = SealedBlob::seal(new, salt, &plain, aad, blob.updated_at)?;
    Ok(Some(Reencrypted { path: path.to_path_buf(), blob }))
}

/// Backups follow the password change, otherwise none of them would import afterward; one already unreadable with the old key is left as-is.
fn reencrypted_backups(dir: &Path, old: &VaultKey, new: &VaultKey, salt: &[u8]) -> Vec<Reencrypted> {
    backup_files(dir).into_iter().filter_map(|p| reencrypt(&p, VAULT_AAD, old, new, salt).ok().flatten()).collect()
}

#[tauri::command(async)]
pub fn vault_change_password(
    state: State<'_, AppState>,
    current_password: String,
    new_password: String,
) -> Result<bool> {
    let (current_password, new_password) = (Zeroizing::new(current_password), Zeroizing::new(new_password));
    let biometric = state.change_password(&current_password, &new_password)?;
    if biometric {
        crate::cmd_biometric::delete_credential();
    }
    Ok(biometric)
}

#[cfg(test)]
#[path = "password_tests.rs"]
mod tests;
