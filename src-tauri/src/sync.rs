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
    store::write_json_atomic(&path(&state.dir), &Prefs { pasta: Some(folder.display().to_string()), ultimo_hash: None })?;
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
mod tests {
    use super::*;
    use crate::model::{now_ms, Task};

    fn machine(name: &str, password: &str) -> AppState {
        let dir = std::env::temp_dir().join(format!("canto-sync-{name}-{}-{}", std::process::id(), now_ms()));
        let _ = std::fs::remove_dir_all(&dir);
        let st = AppState::new(dir);
        st.create(password).unwrap();
        st
    }

    fn with_task(st: &AppState, id: &str) {
        st.mutate(|d| {
            d.tasks.push(Task { id: id.into(), title: "regar planta".into(), day: "2026-09-14".into(), updated_at: now_ms(), ..Default::default() })
        })
        .unwrap();
    }

    fn folder_dir(name: &str) -> PathBuf {
        let d = std::env::temp_dir().join(format!("canto-sync-pasta-{name}-{}", now_ms()));
        let _ = std::fs::remove_dir_all(&d);
        std::fs::create_dir_all(&d).unwrap();
        d
    }

    #[test]
    fn without_a_folder_nothing_happens() {
        let st = machine("sem-pasta", "1234");
        export_now(&st.dir).unwrap();
        assert_eq!(poll_and_merge(&st).unwrap(), None);
    }

    #[test]
    fn every_save_exports_to_the_folder_once_configured() {
        let st = machine("auto-exporta", "1234");
        let pasta = folder_dir("auto-exporta");
        set_folder(&st, pasta.clone()).unwrap();
        assert!(pasta.join("canto.canto").exists(), "set_folder should seed the file right away");

        with_task(&st, "t1");
        let bytes_first = std::fs::read(pasta.join("canto.canto")).unwrap();
        with_task(&st, "t2");
        let bytes_second = std::fs::read(pasta.join("canto.canto")).unwrap();
        assert_ne!(bytes_first, bytes_second, "the second task's save never reached the synced folder");
    }

    #[test]
    fn a_change_from_another_machine_merges_in_on_poll() {
        let pasta = folder_dir("compartilhada");
        let a = machine("origem-a", "1234");
        set_folder(&a, pasta.clone()).unwrap();
        with_task(&a, "da-a");

        let b = machine("origem-b", "1234");
        set_folder(&b, pasta).unwrap();

        assert!(b.read(|d| d.tasks.iter().any(|t| t.id == "da-a")).unwrap(), "b did not pick up a's task on set_folder");
    }

    #[test]
    fn polling_twice_in_a_row_without_a_new_change_merges_only_once() {
        let pasta = folder_dir("sem-novidade");
        let a = machine("parado-a", "1234");
        set_folder(&a, pasta.clone()).unwrap();
        let b = machine("parado-b", "1234");
        set_folder(&b, pasta).unwrap();
        with_task(&a, "t1");

        assert!(poll_and_merge(&b).unwrap().is_some(), "first poll should see a's new task");
        assert_eq!(poll_and_merge(&b).unwrap(), None, "nothing changed since: should be a no-op");
    }

    #[test]
    fn a_locked_vault_never_reads_or_merges_the_folder() {
        let pasta = folder_dir("trancada");
        let st = machine("trancada-a", "1234");
        set_folder(&st, pasta).unwrap();
        st.lock();
        assert_eq!(poll_and_merge(&st).unwrap(), None);
    }

    #[test]
    fn clearing_the_folder_stops_future_exports() {
        let st = machine("limpa", "1234");
        let pasta = folder_dir("limpa");
        set_folder(&st, pasta.clone()).unwrap();
        clear_folder(&st.dir).unwrap();
        assert_eq!(folder(&st.dir), None);

        with_task(&st, "t1");
        // set_folder already wrote once; nothing new should land after clearing.
        let count = std::fs::read_dir(&pasta).unwrap().count();
        assert_eq!(count, 1);
    }
}
