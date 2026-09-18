use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};

use crate::error::{AppError, Result};

const EXTENSIONS: [&str; 4] = ["txt", "md", "vtt", "srt"];
const PREVIEW_CHARS: usize = 400;
const MAX_FILES: usize = 50;
const MAX_BYTES: u64 = 5 * 1024 * 1024;
/// Opening the tab must not cost reading 50 whole files, so the preview only needs the beginning; search reads everything.
const PREVIEW_BYTES: u64 = 64 * 1024;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct TranscriptSettings {
    #[serde(default)]
    pub dir: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct TranscriptMeta {
    pub name: String,
    pub modified_at: i64,
    pub size: u64,
    pub preview: String,
}

pub fn default_dir() -> PathBuf {
    documents_dir().join("Transcricoes")
}

fn documents_dir() -> PathBuf {
    #[cfg(target_os = "windows")]
    let base = std::env::var_os("USERPROFILE").map(PathBuf::from);
    #[cfg(not(target_os = "windows"))]
    let base = std::env::var_os("HOME").map(PathBuf::from);
    base.unwrap_or_else(|| PathBuf::from(".")).join("Documents")
}

/// Rejects any path that escapes `dir`: the name comes from the frontend and must never become an arbitrary path.
fn resolve_within(dir: &Path, name: &str) -> Result<PathBuf> {
    if name.contains('/') || name.contains(char::from(92)) || name.contains("..") {
        return Err(AppError::Config("nome de arquivo invalido".into()));
    }
    let base = dir
        .canonicalize()
        .map_err(|_| AppError::NotFound)?;
    let target = base.join(name).canonicalize().map_err(|_| AppError::NotFound)?;
    if !target.starts_with(&base) {
        return Err(AppError::Config("caminho fora da pasta de transcricoes".into()));
    }
    Ok(target)
}

fn is_transcript(p: &Path) -> bool {
    p.extension()
        .and_then(|e| e.to_str())
        .map(|e| EXTENSIONS.contains(&e.to_lowercase().as_str()))
        .unwrap_or(false)
}

fn mtime_ms(meta: &std::fs::Metadata) -> i64 {
    meta.modified()
        .ok()
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0)
}

/// Subtitles become running text: numbering, timestamps and the WEBVTT header are stripped.
pub fn clean_subtitles(raw: &str) -> String {
    let mut lines = Vec::new();
    for line in raw.lines() {
        let t = line.trim();
        if t.is_empty()
            || t == "WEBVTT"
            || t.contains("-->")
            || (t.chars().all(|c| c.is_ascii_digit()) && t.len() <= 5)
        {
            continue;
        }
        if lines.last().map(|l: &String| l == t).unwrap_or(false) {
            continue;
        }
        lines.push(t.to_string());
    }
    lines.join(" ")
}

/// Reads at most `cap` bytes and discards a possible UTF-8 character cut in half.
fn read_prefix(path: &Path, cap: u64) -> String {
    use std::io::Read;
    let Ok(f) = std::fs::File::open(path) else {
        return String::new();
    };
    let mut buf = Vec::new();
    if f.take(cap).read_to_end(&mut buf).is_err() {
        return String::new();
    }
    match String::from_utf8(buf) {
        Ok(s) => s,
        Err(e) => {
            let ok = e.utf8_error().valid_up_to();
            String::from_utf8_lossy(&e.into_bytes()[..ok]).into_owned()
        }
    }
}

pub fn list(dir: &Path, query: &str) -> Result<Vec<TranscriptMeta>> {
    let Ok(entries) = std::fs::read_dir(dir) else {
        return Ok(vec![]);
    };
    let q = query.trim().to_lowercase();
    let mut out = Vec::new();
    for entry in entries.flatten() {
        let path = entry.path();
        if !path.is_file() || !is_transcript(&path) {
            continue;
        }
        let Ok(meta) = entry.metadata() else { continue };
        let cap = if q.is_empty() { PREVIEW_BYTES } else { MAX_BYTES };
        let content = if meta.len() > MAX_BYTES && !q.is_empty() {
            String::from("(arquivo grande demais para pre-visualizar)")
        } else {
            clean_subtitles(&read_prefix(&path, cap))
        };
        let name = entry.file_name().to_string_lossy().to_string();
        if !q.is_empty() && !name.to_lowercase().contains(&q) && !content.to_lowercase().contains(&q) {
            continue;
        }
        out.push(TranscriptMeta {
            name,
            modified_at: mtime_ms(&meta),
            size: meta.len(),
            preview: content.chars().take(PREVIEW_CHARS).collect(),
        });
    }
    out.sort_by_key(|b| std::cmp::Reverse(b.modified_at));
    out.truncate(MAX_FILES);
    Ok(out)
}

pub fn read(dir: &Path, name: &str) -> Result<String> {
    let path = resolve_within(dir, name)?;
    let meta = std::fs::metadata(&path)?;
    if meta.len() > MAX_BYTES {
        return Err(AppError::Config("transcricao maior que 5 MB".into()));
    }
    Ok(clean_subtitles(&std::fs::read_to_string(path)?))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn cleans_vtt_leaving_only_the_speech() {
        let vtt = "WEBVTT\n\n1\n00:00:01.000 --> 00:00:04.000\nBom dia pessoal\n\n2\n00:00:04.000 --> 00:00:06.000\nvamos comecar";
        assert_eq!(clean_subtitles(vtt), "Bom dia pessoal vamos comecar");
    }

    #[test]
    fn removes_consecutive_repetition_in_subtitles() {
        let srt = "1\n00:00:01,000 --> 00:00:02,000\nteste\n\n2\n00:00:02,000 --> 00:00:03,000\nteste";
        assert_eq!(clean_subtitles(srt), "teste");
    }

    #[test]
    fn rejects_a_name_that_escapes_the_folder() {
        let dir = std::env::temp_dir();
        for malicious in ["../segredo.txt", "sub/dir.txt", "..", "a\\b.txt"] {
            assert!(resolve_within(&dir, malicious).is_err(), "aceitou {malicious}");
        }
    }

    #[test]
    fn listing_without_a_query_does_not_read_the_whole_file() {
        let dir = std::env::temp_dir().join(format!("canto-transc-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        let big = dir.join("longa.txt");
        // Needle after the preview cap: only search should reach it.
        let mut content = "a".repeat(PREVIEW_BYTES as usize + 10);
        content.push_str(" agulha-no-fim");
        std::fs::write(&big, &content).unwrap();

        let without_query = list(&dir, "").unwrap();
        assert_eq!(without_query.len(), 1);
        assert!(!without_query[0].preview.contains("agulha-no-fim"));

        assert_eq!(list(&dir, "agulha-no-fim").unwrap().len(), 1);
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn prefix_does_not_break_a_multibyte_character() {
        let dir = std::env::temp_dir().join(format!("canto-utf8-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        let file = dir.join("acento.txt");
        std::fs::write(&file, "ção").unwrap();
        // 3 bytes: whole "ç" (2 bytes), the half-cut "ã" is dropped.
        assert_eq!(read_prefix(&file, 3), "ç");
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn only_accepts_transcript_extensions() {
        assert!(is_transcript(Path::new("reuniao.vtt")));
        assert!(is_transcript(Path::new("REUNIAO.TXT")));
        assert!(!is_transcript(Path::new("segredo.env")));
        assert!(!is_transcript(Path::new("chave.pem")));
    }
}
