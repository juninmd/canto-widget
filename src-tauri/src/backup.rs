use serde::Serialize;
use std::path::{Path, PathBuf};

use crate::error::{AppError, Result};
use crate::model::now_ms;
use crate::store::{self, SealedBlob};
use crate::vault::AppState;

pub const EXTENSION: &str = "canto";
/// A tasks-and-notes vault runs a few KB; the cap only stops a wrong file picked in the dialog from being read whole into RAM.
const MAX_BYTES: u64 = 32 * 1024 * 1024;
/// Daily and pre-import copies combined.
pub const KEEP: usize = 10;

#[derive(Debug, Serialize, PartialEq)]
pub struct ImportSummary {
    pub tasks: usize,
    pub notes: usize,
}

pub fn backups_dir(dir: &Path) -> PathBuf {
    dir.join("backups")
}

/// The on-disk envelope is already encrypted and reflects every mutation: exporting is copying.
pub fn export(dir: &Path, destination: &Path) -> Result<()> {
    let bytes = read_local_envelope(dir)?.ok_or(AppError::NotFound)?;
    store::write_bytes_atomic(destination, &bytes)
}

/// Last-write-wins with tombstones, so reimporting the same file changes nothing; the prior state is kept in `backups/`.
pub fn import(state: &AppState, source: &Path) -> Result<ImportSummary> {
    let size = std::fs::metadata(source)?.len();
    if size > MAX_BYTES {
        return Err(AppError::Config("arquivo grande demais para ser um backup do Canto".into()));
    }
    let blob: SealedBlob = serde_json::from_slice(&std::fs::read(source)?)
        .map_err(|_| AppError::Format("o arquivo não é um backup do Canto".into()))?;
    let incoming = state.open_envelope(&blob)?;
    // Only after opening: a wrong password leaves no useless copy behind.
    save(&state.dir, &format!("{}T{}-import", today_utc(), now_ms()))?;
    state.mutate(|local| {
        *local = std::mem::take(local).merge(incoming);
        ImportSummary { tasks: local.tasks.len(), notes: local.notes.len() }
    })
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
    prune(&folder, KEEP)?;
    Ok(true)
}

/// Names start with the ISO date: alphabetical order is chronological order.
fn prune(folder: &Path, keep: usize) -> Result<()> {
    let mut names: Vec<PathBuf> = std::fs::read_dir(folder)?
        .filter_map(|e| e.ok().map(|e| e.path()))
        .filter(|p| p.extension().is_some_and(|x| x == EXTENSION))
        .collect();
    names.sort();
    let excess = names.len().saturating_sub(keep);
    for old in &names[..excess] {
        std::fs::remove_file(old)?;
    }
    Ok(())
}
