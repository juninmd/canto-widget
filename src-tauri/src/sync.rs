//! Points the encrypted vault file at a folder synced by another tool (Dropbox, OneDrive, Syncthing,
//! ...): every save copies it there under a fixed name, and whatever shows up from another machine
//! merges in on its own. A local file, like `autolock.json` — nothing here is secret.
use base64::{engine::general_purpose::STANDARD as B64, Engine};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::path::{Path, PathBuf};
use std::sync::Mutex;

use crate::backup::{self, ImportSummary};
use crate::error::Result;
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
    export_now(&state.dir)
}

pub fn clear_folder(dir: &Path) -> Result<()> {
    store::write_json_atomic(&path(dir), &Prefs::default())
}

/// Copies the current encrypted vault into the synced folder, if one is configured, and remembers
/// what was written so the next poll can tell it apart from someone else's change.
pub fn export_now(dir: &Path) -> Result<()> {
    let Some(folder) = folder(dir) else { return Ok(()) };
    let _guard = EXPORT_LOCK.lock().unwrap();
    let dest = target(&folder);
    backup::export(dir, &dest)?;
    let bytes = std::fs::read(&dest)?;
    let mut prefs = load(dir);
    prefs.ultimo_hash = Some(hash(&bytes));
    store::write_json_atomic(&path(dir), &prefs)
}

/// Merges in the folder's content only if it's not just this machine's own last export. A no-op
/// without a configured folder, an unlocked vault, or anything new to see.
pub fn poll_and_merge(state: &AppState) -> Result<Option<ImportSummary>> {
    if !state.is_unlocked() {
        return Ok(None);
    }
    let prefs = load(&state.dir);
    let Some(folder) = prefs.pasta.as_deref().map(PathBuf::from) else { return Ok(None) };
    let Ok(bytes) = std::fs::read(target(&folder)) else { return Ok(None) };
    if prefs.ultimo_hash.as_deref() == Some(hash(&bytes).as_str()) {
        return Ok(None);
    }
    backup::import(state, &target(&folder)).map(Some)
}

#[cfg(test)]
#[path = "sync_tests.rs"]
mod tests;
