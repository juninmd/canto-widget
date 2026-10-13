//! Quick capture: a global shortcut opens a small window to jot a task or a note without showing the widget.
//! Declared in `tauri.conf.json` and hidden until used, like the alert pop-up.
use tauri::{Emitter, Manager};

pub const CAPTURE_WINDOW: &str = "capture";
pub const CAPTURE_EVENT: &str = "canto://capture";

/// A locked vault can't save, so the shortcut brings the widget up on its lock screen instead.
pub fn should_capture(unlocked: bool) -> bool {
    unlocked
}

pub fn open(app: &tauri::AppHandle) -> tauri::Result<()> {
    let unlocked = app.try_state::<crate::vault::AppState>().is_some_and(|s| s.is_unlocked());
    if !should_capture(unlocked) {
        return crate::window::show(app);
    }
    let Some(win) = app.get_webview_window(CAPTURE_WINDOW) else {
        return Ok(());
    };
    win.center()?;
    win.show()?;
    win.set_focus()?;
    app.emit(CAPTURE_EVENT, ())
}

#[tauri::command]
pub fn capture_close(app: tauri::AppHandle) {
    if let Some(win) = app.get_webview_window(CAPTURE_WINDOW) {
        let _ = win.hide();
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn capture_needs_an_unlocked_vault() {
        assert!(should_capture(true));
        assert!(!should_capture(false));
    }

    #[test]
    fn capture_window_is_declared_hidden_and_allowed() {
        let conf: serde_json::Value = serde_json::from_str(include_str!("../tauri.conf.json")).unwrap();
        let windows = conf["app"]["windows"].as_array().unwrap();
        let capture = windows.iter().find(|w| w["label"] == CAPTURE_WINDOW).expect("capture window in tauri.conf.json");
        assert_eq!(capture["visible"], false, "hidden until the shortcut opens it");
        assert_eq!(capture["url"], "index.html?capture");
        let caps = include_str!("../capabilities/default.json");
        assert!(caps.contains("\"capture\""), "the capture window needs the IPC permissions");
    }
}
