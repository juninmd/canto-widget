//! Points the encrypted vault file at a folder synced by another tool (Dropbox, OneDrive, Syncthing,
//! ...): every save copies it there under a fixed name, and whatever shows up from another machine
//! merges in on its own. A local file, like `autolock.json` — nothing here is secret.
use crate::resilient::LockExt;
use base64::{engine::general_purpose::STANDARD as B64, Engine};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use std::time::Duration;

use crate::backup::{self, ImportSummary};
use crate::error::{AppError, Result};
use crate::model::now_ms;
use crate::store;
use crate::vault::AppState;

/// Fixed name inside the folder: the sync tool sees one file being edited, not a new one each save.
const FILE_NAME: &str = "canto.canto";

/// Serializes `export_now`'s read-modify-write of `sincronizacao.json` against itself: two
/// concurrent saves (a UI mutation racing the ~5 min background poll, say) could otherwise lose
/// one machine's `ultimo_hash` update to the other's. Not the session mutex on purpose: a
/// `poll_and_merge` that finds a change calls back into `AppState::mutate`, which calls
/// `export_now` again — reusing the session lock here would deadlock on that reentry.
static EXPORT_LOCK: Mutex<()> = Mutex::new(());

/// What the last export and the last merge did, for the Settings screen. Messages come from
/// `AppError::text` and never carry anything read from the synced file.
#[derive(Debug, Clone, Default, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct SyncStatus {
    pub last_export_ok_at: Option<i64>,
    pub last_export_error: Option<String>,
    pub last_merge_ok_at: Option<i64>,
    pub last_merge_error: Option<String>,
    pub consecutive_failures: u32,
}

/// In-memory sync state held by `AppState` (per instance, so tests don't see each other's).
#[derive(Default)]
pub struct SyncTracker {
    status: Mutex<SyncStatus>,
    /// Hash of a folder file that could not be opened (another master password, bad format):
    /// not tried again until the file changes, so the Argon2id derivation isn't repeated for nothing.
    failed_hash: Mutex<Option<String>>,
}

impl SyncTracker {
    pub fn status(&self) -> SyncStatus {
        self.status.lock_safe().clone()
    }

    fn record(&self, export: bool, err: Option<&AppError>) {
        let mut s = self.status.lock_safe();
        match err {
            None => {
                if export {
                    s.last_export_ok_at = Some(now_ms());
                    s.last_export_error = None;
                } else {
                    s.last_merge_ok_at = Some(now_ms());
                    s.last_merge_error = None;
                }
                if s.last_export_error.is_none() && s.last_merge_error.is_none() {
                    s.consecutive_failures = 0;
                }
            }
            Some(e) => {
                let text = e.text(crate::lang::current());
                if export {
                    s.last_export_error = Some(text);
                } else {
                    s.last_merge_error = Some(text);
                }
                s.consecutive_failures = s.consecutive_failures.saturating_add(1);
            }
        }
    }

    /// "Sync now": the next automatic attempt is back to the base interval and a file that failed gets another try.
    pub fn reset_backoff(&self) {
        self.status.lock_safe().consecutive_failures = 0;
        *self.failed_hash.lock_safe() = None;
    }
}

const BASE_POLL: Duration = Duration::from_secs(5 * 60);

/// Wait before the next automatic poll: 5 min up to 2 failures, then 15 (3-4), 30 (5-6) and 60 min (7+).
pub fn poll_interval(failures: u32) -> Duration {
    match failures {
        0..=2 => BASE_POLL,
        3..=4 => Duration::from_secs(15 * 60),
        5..=6 => Duration::from_secs(30 * 60),
        _ => Duration::from_secs(60 * 60),
    }
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
struct Prefs {
    #[serde(default)]
    pasta: Option<String>,
    /// Hash of the bytes this machine itself last wrote to the folder; tells "someone else changed
    /// it" apart from "that's just our own last export" without needing deterministic encryption.
    #[serde(default)]
    ultimo_hash: Option<String>,
}

fn path(dir: &Path) -> PathBuf {
    dir.join("sincronizacao.json")
}

fn load(dir: &Path) -> Prefs {
    store::read_json(&path(dir)).ok().flatten().unwrap_or_default()
}

fn target(folder: &Path) -> PathBuf {
    folder.join(FILE_NAME)
}

fn hash(bytes: &[u8]) -> String {
    B64.encode(Sha256::digest(bytes))
}

pub fn folder(dir: &Path) -> Option<PathBuf> {
    load(dir).pasta.map(PathBuf::from)
}

/// Points sync at `folder`, pulling in whatever is already there (so a folder shared from another
/// machine isn't silently overwritten by this one's possibly-empty vault) before pushing out.
pub fn set_folder(state: &AppState, folder: PathBuf) -> Result<()> {
    store::write_json_atomic(
        &path(&state.dir),
        &Prefs { pasta: Some(folder.display().to_string()), ultimo_hash: None },
    )?;
    poll_and_merge(state)?;
    export_tracked(state)
}

pub fn clear_folder(dir: &Path) -> Result<()> {
    store::write_json_atomic(&path(dir), &Prefs::default())
}

/// Copies the current encrypted vault into the synced folder, if one is configured, and remembers
/// what was written so the next poll can tell it apart from someone else's change.
pub fn export_now(dir: &Path) -> Result<()> {
    let Some(folder) = folder(dir) else { return Ok(()) };
    let _guard = EXPORT_LOCK.lock_safe();
    let dest = target(&folder);
    backup::export(dir, &dest)?;
    let bytes = std::fs::read(&dest)?;
    let mut prefs = load(dir);
    prefs.ultimo_hash = Some(hash(&bytes));
    store::write_json_atomic(&path(dir), &prefs)
}

/// `export_now` plus the result in the status; used wherever an `AppState` is at hand.
pub fn export_tracked(state: &AppState) -> Result<()> {
    if folder(&state.dir).is_none() {
        return Ok(());
    }
    let r = export_now(&state.dir);
    state.sync.record(true, r.as_ref().err());
    r
}

/// Merges in the folder's content only if it's not just this machine's own last export. A no-op
/// without a configured folder, an unlocked vault, or anything new to see.
pub fn poll_and_merge(state: &AppState) -> Result<Option<ImportSummary>> {
    if !state.is_unlocked() {
        return Ok(None);
    }
    let prefs = load(&state.dir);
    let Some(folder) = prefs.pasta.as_deref().map(PathBuf::from) else { return Ok(None) };
    // Anyone with write access to the synced folder controls this file: an oversized one is skipped, not loaded.
    let bytes = match store::read_capped(&target(&folder), backup::MAX_BYTES, "") {
        Ok(b) => b,
        // No file yet (or too big) is not a failure of ours; an unreachable folder is, and shows in the status.
        Err(e) if !folder.exists() => {
            state.sync.record(false, Some(&e));
            return Ok(None);
        }
        Err(_) => return Ok(None),
    };
    let h = hash(&bytes);
    if prefs.ultimo_hash.as_deref() == Some(h.as_str()) {
        state.sync.record(false, None);
        return Ok(None);
    }
    if state.sync.failed_hash.lock_safe().as_deref() == Some(h.as_str()) {
        return Ok(None); // already known not to open; the error stays on the status
    }
    let result = backup::import(state, &target(&folder));
    match &result {
        Ok(_) => {
            *state.sync.failed_hash.lock_safe() = None;
            state.sync.record(false, None);
        }
        Err(e) => {
            if matches!(e, AppError::Config(_) | AppError::Format(_)) {
                *state.sync.failed_hash.lock_safe() = Some(h);
            }
            state.sync.record(false, Some(e));
        }
    }
    result.map(Some)
}

#[cfg(test)]
#[path = "sync_tests.rs"]
mod tests;
