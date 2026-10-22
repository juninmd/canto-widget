//! What the native file dialogs hand back. On the desktop it is a path; on a phone it is a content URI (Android)
//! or a security-scoped URL (iOS), which only the fs plugin can open.
use tauri_plugin_dialog::FilePath;

use crate::error::{AppError, Result};

fn io(e: impl ToString) -> AppError {
    AppError::Io(e.to_string())
}

/// A real path, for the code that works on files by path; a phone's picker never gives one.
#[cfg(desktop)]
pub fn path(picked: FilePath) -> Result<std::path::PathBuf> {
    picked.into_path().map_err(io)
}

/// What to tell the person: the full path on the desktop, the file name on a phone, where the URI is noise.
pub fn label(picked: &FilePath) -> String {
    match picked {
        FilePath::Path(p) => p.display().to_string(),
        FilePath::Url(u) => {
            let name = u.path_segments().and_then(|mut s| s.next_back()).map(file_name).unwrap_or_default();
            if name.is_empty() {
                u.to_string()
            } else {
                name
            }
        }
    }
}

/// Document providers percent-encode the whole `primary:Download/name` id into one segment.
fn file_name(segment: &str) -> String {
    let bytes = segment.as_bytes();
    let mut plain = Vec::with_capacity(bytes.len());
    let mut at = 0;
    while at < bytes.len() {
        let hex = bytes
            .get(at + 1..at + 3)
            .and_then(|h| std::str::from_utf8(h).ok())
            .and_then(|h| u8::from_str_radix(h, 16).ok());
        match (bytes[at], hex) {
            (b'%', Some(byte)) => {
                plain.push(byte);
                at += 3;
            }
            (byte, _) => {
                plain.push(byte);
                at += 1;
            }
        }
    }
    let plain = String::from_utf8_lossy(&plain).into_owned();
    plain.rsplit(['/', ':']).next().unwrap_or_default().to_string()
}

#[cfg(mobile)]
pub fn read(app: &tauri::AppHandle, picked: FilePath) -> Result<Vec<u8>> {
    use tauri_plugin_fs::FsExt;
    app.fs().read(picked).map_err(io)
}

#[cfg(mobile)]
pub fn write(app: &tauri::AppHandle, picked: FilePath, bytes: &[u8]) -> Result<()> {
    use std::io::Write;
    use tauri_plugin_fs::{FsExt, OpenOptions};
    let mut options = OpenOptions::new();
    options.write(true).truncate(true).create(true);
    app.fs().open(picked, options).and_then(|mut file| file.write_all(bytes)).map_err(io)
}

#[cfg(test)]
mod tests {
    use std::path::PathBuf;

    use super::*;

    #[test]
    fn a_path_is_shown_whole() {
        assert_eq!(label(&FilePath::Path(PathBuf::from("/tmp/canto-2026-01-01.canto"))), "/tmp/canto-2026-01-01.canto");
    }

    #[test]
    fn a_content_uri_is_shown_as_the_file_name() {
        let uri =
            "content://com.android.externalstorage.documents/document/primary%3ADownload%2Fcanto-2026-01-01.canto";
        let shown = label(&FilePath::Url(uri.parse().unwrap()));
        assert_eq!(shown, "canto-2026-01-01.canto");
    }

    #[test]
    fn a_uri_without_a_readable_name_is_shown_as_is() {
        let uri: url::Url = "content://provider".parse().unwrap();
        assert_eq!(label(&FilePath::Url(uri.clone())), uri.to_string());
    }
}
