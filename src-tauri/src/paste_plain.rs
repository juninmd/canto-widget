//! Global shortcut that strips rich formatting from the OS clipboard in place. Deliberately
//! doesn't simulate a paste into the focused app: Canto never synthesizes input for other
//! processes, only reads/writes the clipboard it already touches for the history feature.
use tauri::AppHandle;
use tauri_plugin_clipboard_manager::ClipboardExt;

/// Round-tripping through `write_text` drops every format but plain text (HTML, RTF, ...),
/// so a manual Ctrl+V right after this pastes unformatted. Silently does nothing on an
/// unreadable or non-text clipboard (an image, for instance).
pub fn strip_formatting(app: &AppHandle) {
    if let Ok(text) = app.clipboard().read_text() {
        let _ = app.clipboard().write_text(text);
    }
}
