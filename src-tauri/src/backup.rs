use serde::Serialize;
use std::path::{Path, PathBuf};

use crate::error::{AppError, Result};
use crate::model::now_ms;
use crate::store::{self, SealedBlob};
use crate::vault::AppState;

pub const EXTENSION: &str = "canto";
/// A tasks-and-notes vault runs a few KB; the cap only stops a wrong file picked in the dialog from being read whole into RAM.
pub const MAX_BYTES: u64 = 32 * 1024 * 1024;
/// Each kind of copy has its own budget: a burst of sync imports must never push the daily copies out.
pub const KEEP_DAILY: usize = 10;
pub const KEEP_IMPORT: usize = 10;
/// Automatic (sync) imports closer together than this share the copy taken at the start of the burst.
const IMPORT_COPY_GAP_MS: i64 = 10 * 60 * 1000;

#[derive(Debug, Serialize, PartialEq)]
pub struct ImportSummary {
    pub tasks: usize,
    pub notes: usize,
}

pub fn backups_dir(dir: &Path) -> PathBuf {
    dir.join("backups")
}

/// The on-disk envelope is already encrypted and reflects every mutation: exporting is copying.
/// Returns the bytes written, so a caller that needs their hash doesn't read the destination back: a sync client
/// may have replaced it with another machine's version in between.
pub fn export(dir: &Path, destination: &Path) -> Result<Vec<u8>> {
    let bytes = read_local_envelope(dir)?.ok_or(AppError::NotFound)?;
    store::write_bytes_atomic(destination, &bytes)?;
    Ok(bytes)
}

/// Last-write-wins with tombstones, so reimporting the same file changes nothing; the prior state is kept in `backups/`.
pub fn import(state: &AppState, source: &Path) -> Result<ImportSummary> {
    let bytes = store::read_capped(source, MAX_BYTES, TOO_BIG)?;
    import_bytes(state, &bytes, false)
}

const TOO_BIG: &str = "arquivo grande demais para ser um backup do Canto";

/// The bytes already read, so what a caller hashed is exactly what gets merged. `automatic` is the sync poll:
/// it skips the safety copy when nothing would change and coalesces bursts into one copy.
pub fn import_bytes(state: &AppState, bytes: &[u8], automatic: bool) -> Result<ImportSummary> {
    let blob: SealedBlob =
        serde_json::from_slice(bytes).map_err(|_| AppError::Format("o arquivo não é um backup do Canto".into()))?;
    let incoming = state.open_envelope(&blob)?;
    let now = now_ms();
    let summary =
        |local: &crate::model::VaultData| ImportSummary { tasks: local.tasks.len(), notes: local.notes.len() };
    if automatic {
        // Merging is idempotent: when the folder holds nothing new there is nothing to protect nor to write.
        let (unchanged, current) =
            state.read(|local| (local.clone().merge(incoming.clone()) == *local, summary(local)))?;
        if unchanged {
            return Ok(current);
        }
        if !recent_import_copy(&state.dir, now) {
            save(&state.dir, &import_name(now))?;
        }
    } else {
        // Only after opening: a wrong password leaves no useless copy behind.
        save(&state.dir, &import_name(now))?;
    }
    state.mutate(|local| {
        *local = std::mem::take(local).merge(incoming);
        summary(local)
    })
}

fn import_name(now: i64) -> String {
    format!("{}T{now}-import", today_utc())
}

/// True when the newest `-import` copy is younger than the burst window.
fn recent_import_copy(dir: &Path, now: i64) -> bool {
    let Ok(entries) = std::fs::read_dir(backups_dir(dir)) else { return false };
    entries
        .filter_map(|e| e.ok()?.file_name().into_string().ok())
        .filter_map(|n| import_stamp(&n))
        .max()
        .is_some_and(|at| now - at < IMPORT_COPY_GAP_MS)
}

/// `YYYY-MM-DDT<ms>-import.canto` -> `<ms>`.
fn import_stamp(name: &str) -> Option<i64> {
    let stem = name.strip_suffix(&format!("-import.{EXTENSION}"))?;
    stem.split_once('T')?.1.parse().ok()
}

/// One copy per day (UTC), without needing the key. Returns `true` if it wrote.
pub fn daily(dir: &Path, day: &str) -> Result<bool> {
    if backups_dir(dir).join(format!("{day}.{EXTENSION}")).exists() {
        return Ok(false);
    }
    save(dir, day)
}

pub fn today_utc() -> String {
    let d = time::OffsetDateTime::now_utc().date();
    format!("{:04}-{:02}-{:02}", d.year(), u8::from(d.month()), d.day())
}

fn read_local_envelope(dir: &Path) -> Result<Option<Vec<u8>>> {
    match std::fs::read(store::vault_path(dir)) {
        Ok(b) => Ok(Some(b)),
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(None),
        Err(e) => Err(e.into()),
    }
}

fn save(dir: &Path, name: &str) -> Result<bool> {
    let Some(bytes) = read_local_envelope(dir)? else {
        return Ok(false);
    };
    let folder = backups_dir(dir);
    store::write_bytes_atomic(&folder.join(format!("{name}.{EXTENSION}")), &bytes)?;
    prune(&folder)?;
    Ok(true)
}

/// One saved copy as the restore list shows it, newest first.
#[derive(Debug, Serialize, PartialEq)]
pub struct BackupCopy {
    /// The file name, which is also the id `restore` takes.
    pub name: String,
    /// "daily" or "import" (taken just before an import).
    pub kind: &'static str,
    /// `YYYY-MM-DD`.
    pub day: String,
    /// When an import copy was taken (ms); dailies carry only the day.
    pub at: Option<i64>,
}

pub fn list(dir: &Path) -> Vec<BackupCopy> {
    let Ok(entries) = std::fs::read_dir(backups_dir(dir)) else { return Vec::new() };
    let mut copies: Vec<BackupCopy> = entries
        .filter_map(|e| e.ok()?.file_name().into_string().ok())
        .filter_map(|name| {
            let kind = if is_daily(&name) {
                "daily"
            } else if is_import(&name) {
                "import"
            } else {
                return None;
            };
            Some(BackupCopy { day: name[..10].to_string(), at: import_stamp(&name), kind, name })
        })
        .collect();
    copies.sort_by(|a, b| b.name.cmp(&a.name));
    copies
}

/// Puts the vault back as it was in a saved copy (not a merge: the point is to undo a bad merge or edit). The
/// current state is kept first as an `-import` copy, so the restore itself can be undone from the same list.
pub fn restore(state: &AppState, name: &str) -> Result<ImportSummary> {
    // Only names `list` would show: no path separators, no `..`, nothing outside the two kinds.
    if !(is_daily(name) || is_import(name)) {
        return Err(AppError::NotFound);
    }
    let path = backups_dir(&state.dir).join(name);
    let bytes = store::read_capped(&path, MAX_BYTES, TOO_BIG)?;
    let blob: SealedBlob =
        serde_json::from_slice(&bytes).map_err(|_| AppError::Format("o arquivo não é um backup do Canto".into()))?;
    let restored = state.open_envelope(&blob)?;
    save(&state.dir, &import_name(now_ms()))?;
    state.mutate(|local| {
        *local = restored;
        ImportSummary { tasks: local.tasks.len(), notes: local.notes.len() }
    })
}

/// `YYYY-MM-DD.canto`
fn is_daily(name: &str) -> bool {
    let Some(day) = name.strip_suffix(&format!(".{EXTENSION}")) else { return false };
    day.len() == 10
        && day.bytes().enumerate().all(|(i, b)| if i == 4 || i == 7 { b == b'-' } else { b.is_ascii_digit() })
}

fn is_import(name: &str) -> bool {
    name.ends_with(&format!("-import.{EXTENSION}")) && import_stamp(name).is_some()
}

/// What to delete: the oldest copies beyond each kind's own budget. Names start with the ISO date, so
/// alphabetical order is chronological; anything that isn't one of the two kinds (a file the user dropped
/// there, a `.tmp`) is never listed.
pub fn plan_prune(names: &[String], keep_daily: usize, keep_import: usize) -> Vec<String> {
    let mut doomed = Vec::new();
    for (belongs, keep) in [(is_daily as fn(&str) -> bool, keep_daily), (is_import, keep_import)] {
        let mut kind: Vec<&String> = names.iter().filter(|n| belongs(n)).collect();
        kind.sort();
        let excess = kind.len().saturating_sub(keep);
        doomed.extend(kind[..excess].iter().map(|n| (*n).clone()));
    }
    doomed
}

fn prune(folder: &Path) -> Result<()> {
    let names: Vec<String> =
        std::fs::read_dir(folder)?.filter_map(|e| e.ok()?.file_name().into_string().ok()).collect();
    for old in plan_prune(&names, KEEP_DAILY, KEEP_IMPORT) {
        std::fs::remove_file(folder.join(old))?;
    }
    Ok(())
}

#[cfg(test)]
#[path = "backup_tests.rs"]
mod tests;
