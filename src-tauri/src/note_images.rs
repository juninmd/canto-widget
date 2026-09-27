//! Images attached to notes: each one sealed in its own file, so a paste never re-seals the whole vault.
use base64::{engine::general_purpose::STANDARD as B64, Engine};
use std::collections::HashSet;
use std::path::{Path, PathBuf};
use std::time::{Duration, SystemTime};
use tauri::State;
use zeroize::Zeroizing;

use crate::commands::new_id;
use crate::error::{AppError, Result};
use crate::model::now_ms;
use crate::store::{self, SealedBlob};
use crate::vault::AppState;

/// Frozen like every other AAD: changing it makes every stored image unreadable.
pub const NOTE_IMAGE_AAD: &[u8] = b"canto.note-image.v1";
pub const SCHEME: &str = "canto-img:";
pub const MAX_BYTES: usize = 2 * 1024 * 1024;
const MAX_ID_LEN: usize = 64;
/// An image pasted into a draft isn't referenced by any saved note yet; the grace keeps it alive until the save.
pub const ORPHAN_GRACE: Duration = Duration::from_secs(24 * 60 * 60);

/// Frozen folder name, next to `vault.json`.
pub fn images_dir(dir: &Path) -> PathBuf {
    dir.join("note-images")
}

/// Ids come from `new_id` (lowercase hex); anything else could smuggle a path separator or `..`.
pub fn valid_id(id: &str) -> bool {
    !id.is_empty() && id.len() <= MAX_ID_LEN && id.bytes().all(|b| b.is_ascii_digit() || (b'a'..=b'f').contains(&b))
}

pub fn image_path(dir: &Path, id: &str) -> Result<PathBuf> {
    if !valid_id(id) {
        return Err(AppError::Config("imagem inválida".into()));
    }
    Ok(images_dir(dir).join(format!("{id}.json")))
}

/// The declared type is ignored: only the file's own magic bytes decide, so a renamed file can't pass as an image.
pub fn sniff(bytes: &[u8]) -> Option<&'static str> {
    if bytes.starts_with(b"\x89PNG\r\n\x1a\n") {
        Some("image/png")
    } else if bytes.starts_with(&[0xFF, 0xD8, 0xFF]) {
        Some("image/jpeg")
    } else if bytes.starts_with(b"GIF87a") || bytes.starts_with(b"GIF89a") {
        Some("image/gif")
    } else if bytes.len() >= 12 && &bytes[..4] == b"RIFF" && &bytes[8..12] == b"WEBP" {
        Some("image/webp")
    } else {
        None
    }
}

/// Checks the encoded length before decoding, so an oversized payload is never expanded in RAM.
pub fn decode_upload(data: &str) -> Result<Vec<u8>> {
    let too_big = || AppError::Config("imagem grande demais: máximo de 2 MB".into());
    if data.len() > MAX_BYTES.div_ceil(3) * 4 {
        return Err(too_big());
    }
    let bytes = B64.decode(data.trim()).map_err(|_| AppError::Config("imagem inválida".into()))?;
    if bytes.len() > MAX_BYTES {
        return Err(too_big());
    }
    if sniff(&bytes).is_none() {
        return Err(AppError::Config("formato de imagem não suportado: use PNG, JPEG, GIF ou WebP".into()));
    }
    Ok(bytes)
}

/// Sealed image files on disk; staged (`.next`) and temp copies are left out.
pub fn files(dir: &Path) -> Vec<PathBuf> {
    let Ok(entries) = std::fs::read_dir(images_dir(dir)) else {
        return Vec::new();
    };
    entries
        .filter_map(|e| e.ok().map(|e| e.path()))
        .filter(|p| p.extension().is_some_and(|x| x == "json") && file_id(p).is_some())
        .collect()
}

fn file_id(path: &Path) -> Option<&str> {
    path.file_stem().and_then(|s| s.to_str()).filter(|s| valid_id(s))
}

/// Every `canto-img:<id>` mentioned in the given note bodies.
pub fn referenced<'a>(bodies: impl IntoIterator<Item = &'a str>) -> HashSet<String> {
    let mut out = HashSet::new();
    for body in bodies {
        for (at, _) in body.match_indices(SCHEME) {
            let id: String = body[at + SCHEME.len()..].chars().take_while(|c| c.is_ascii_hexdigit()).collect();
            if valid_id(&id) {
                out.insert(id);
            }
        }
    }
    out
}

/// Deletes images no note references and that are older than `grace`. Returns how many went.
pub fn collect_orphans(dir: &Path, keep: &HashSet<String>, grace: Duration) -> Result<usize> {
    let now = SystemTime::now();
    let mut removed = 0;
    for path in files(dir) {
        let Some(id) = file_id(&path) else { continue };
        if keep.contains(id) {
            continue;
        }
        let age = std::fs::metadata(&path)?.modified().ok().and_then(|m| now.duration_since(m).ok());
        if age.is_some_and(|a| a >= grace) {
            std::fs::remove_file(&path)?;
            removed += 1;
        }
    }
    Ok(removed)
}

impl AppState {
    pub fn note_image_save(&self, bytes: &[u8]) -> Result<String> {
        let guard = self.session.lock().unwrap();
        let session = guard.as_ref().ok_or(AppError::Locked)?;
        let id = new_id();
        let blob = SealedBlob::seal(session.key(), session.salt(), bytes, NOTE_IMAGE_AAD, now_ms())?;
        store::write_json_atomic(&image_path(&self.dir, &id)?, &blob)?;
        Ok(id)
    }

    /// A `data:` URL, the only image source the CSP accepts; missing or unreadable means "unavailable" in the UI.
    pub fn note_image_data_url(&self, id: &str) -> Result<String> {
        let path = image_path(&self.dir, id)?;
        let guard = self.session.lock().unwrap();
        let session = guard.as_ref().ok_or(AppError::Locked)?;
        let blob: SealedBlob = store::read_json(&path)?.ok_or_else(unavailable)?;
        let plain = Zeroizing::new(blob.open(session.key(), NOTE_IMAGE_AAD).map_err(|_| unavailable())?);
        let mime = sniff(&plain).ok_or_else(unavailable)?;
        Ok(format!("data:{mime};base64,{}", B64.encode(&*plain)))
    }

    /// Notes waiting in the trash still count as references, so undoing a delete brings its images back.
    pub fn note_images_gc(&self, grace: Duration) -> Result<usize> {
        let guard = self.session.lock().unwrap();
        let session = guard.as_ref().ok_or(AppError::Locked)?;
        let trashed = self.trash.note_bodies();
        let bodies = session.data.notes.iter().map(|n| n.body.as_str()).chain(trashed.iter().map(String::as_str));
        collect_orphans(&self.dir, &referenced(bodies), grace)
    }
}

fn unavailable() -> AppError {
    AppError::Config("imagem indisponível".into())
}

#[tauri::command(async)]
pub fn note_image_save(state: State<'_, AppState>, data: String) -> Result<String> {
    let bytes = Zeroizing::new(decode_upload(&data)?);
    state.note_image_save(&bytes)
}

#[tauri::command(async)]
pub fn note_image_get(state: State<'_, AppState>, id: String) -> Result<String> {
    state.note_image_data_url(&id)
}

#[cfg(test)]
#[path = "note_images_tests.rs"]
mod tests;
