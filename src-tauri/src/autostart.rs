use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use tauri::Manager;
use tauri_plugin_autostart::ManagerExt;

use crate::error::{AppError, Result};
use crate::store;
use crate::vault::AppState;

/// Lets the app know the user didn't open it, so it comes up quietly in the tray instead of popping up.
pub const ARG_AUTOSTART: &str = "--autostart";

#[derive(Debug, Default, Serialize, Deserialize)]
struct AutostartPrefs {
    // Written before touching the OS, so a failed change never re-enables what the user turned off.
    #[serde(alias = "decidido")]
    decided: bool,
}

fn prefs_path(dir: &Path) -> PathBuf {
    dir.join("autostart.json")
}

/// First run enables autostart; after that the user's choice rules.
pub fn ensure_default(app: &tauri::AppHandle) -> Result<()> {
    let dir = app
        .try_state::<AppState>()
        .ok_or_else(|| AppError::Config("estado nao inicializado".into()))?
        .dir
        .clone();
    let path = prefs_path(&dir);
    let prefs: AutostartPrefs = store::read_json(&path)?.unwrap_or_default();
    if prefs.decided {
        return Ok(());
    }
    // Marks only after actually enabling, so the default isn't repeated over a recorded user choice on the next boot.
    set(app, true)?;
    mark_decided(&dir)
}

fn mark_decided(dir: &Path) -> Result<()> {
    store::write_json_atomic(&prefs_path(dir), &AutostartPrefs { decided: true })
}

fn set(app: &tauri::AppHandle, enabled: bool) -> Result<()> {
    let manager = app.autolaunch();
    let r = if enabled {
        manager.enable()
    } else {
        manager.disable()
    };
    r.map_err(|e| AppError::Io(e.to_string()))
}

#[tauri::command]
pub fn autostart_status(app: tauri::AppHandle) -> Result<bool> {
    app.autolaunch()
        .is_enabled()
        .map_err(|e| AppError::Io(e.to_string()))
}

#[tauri::command]
pub fn autostart_set(app: tauri::AppHandle, enabled: bool) -> Result<()> {
    // Recorded before the change so a failure writing the marker aborts the toggle instead of letting the default revert it on boot.
    if let Some(state) = app.try_state::<AppState>() {
        mark_decided(&state.dir)?;
    }
    set(&app, enabled)
}

/// Opened by the system on boot: stays quiet in the tray.
pub fn started_by_system() -> bool {
    std::env::args().any(|a| a == ARG_AUTOSTART)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn tmpdir(name: &str) -> PathBuf {
        let d = std::env::temp_dir().join(format!("canto-autostart-{name}-{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&d);
        d
    }

    fn decided(dir: &Path) -> bool {
        store::read_json::<AutostartPrefs>(&prefs_path(dir))
            .unwrap()
            .unwrap_or_default()
            .decided
    }

    #[test]
    fn first_run_has_not_decided_yet() {
        let dir = tmpdir("fresh");
        assert!(!decided(&dir), "without the file the default must be allowed to turn on");
    }

    #[test]
    fn user_choice_survives_the_next_boot() {
        let dir = tmpdir("decided");
        mark_decided(&dir).unwrap();
        assert!(decided(&dir), "the default would re-enable what was turned off");
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn legacy_marker_still_counts_as_decided() {
        let dir = tmpdir("legacy");
        std::fs::create_dir_all(&dir).unwrap();
        std::fs::write(prefs_path(&dir), br#"{"decidido":true}"#).unwrap();
        assert!(decided(&dir), "upgrading would re-enable autostart the user turned off");
        let _ = std::fs::remove_dir_all(&dir);
    }
}
