use tauri::{AppHandle, Emitter, Manager, State};

use crate::error::{AppError, Result};
use crate::strip::snapshot::{self, Snapshot};
use crate::strip::{place, StripConfig, StripState, WINDOW};

#[tauri::command]
pub fn strip_config_get(state: State<'_, StripState>) -> StripConfig {
    state.cfg()
}

#[tauri::command]
pub fn strip_config_set(app: AppHandle, state: State<'_, StripState>, config: StripConfig) -> Result<StripConfig> {
    let saved = state.set(config)?;
    place::sync(&app);
    let _ = app.emit(crate::strip::CONFIG_EVENT, &saved);
    // An edge change on a window already up must move it now, not at the next show.
    if let Some(win) = app.get_webview_window(WINDOW).filter(|w| w.is_visible().unwrap_or(false)) {
        let size = win.inner_size().ok().zip(win.scale_factor().ok());
        let size = size.map_or(place::DEFAULT, |(s, f)| (f64::from(s.width) / f, f64::from(s.height) / f));
        place::place(&win, size, &saved).map_err(|e| AppError::Io(e.to_string()))?;
    }
    Ok(saved)
}

#[tauri::command(async)]
pub fn strip_snapshot(app: AppHandle, state: State<'_, StripState>) -> Snapshot {
    snapshot::build(&app, &state.cfg())
}

/// The pill's measured size: the window takes it, so no empty, click-eating space stays on the screen edge.
#[tauri::command]
pub fn strip_resize(app: AppHandle, state: State<'_, StripState>, width: f64, height: f64) -> Result<()> {
    let Some(win) = app.get_webview_window(WINDOW) else { return Ok(()) };
    place::place(&win, (width, height), &state.cfg()).map_err(|e| AppError::Io(e.to_string()))
}

/// Same action as the tray's "entrar" item and its shortcut.
#[tauri::command]
pub fn strip_join(app: AppHandle) {
    crate::tray_live::join_next_meeting(&app);
}

/// Names for the Ajustes picker; the pill moves to the chosen one at the next placement.
#[tauri::command]
pub fn strip_monitors(app: AppHandle) -> Vec<String> {
    place::monitor_names(&app)
}

/// The window never takes focus on its own; a click that pins it asks for it, so the arrow keys have somewhere to land.
#[tauri::command]
pub fn strip_focus(app: AppHandle, on: bool) {
    let Some(win) = app.get_webview_window(WINDOW) else { return };
    let _ = win.set_focusable(on);
    if on {
        let _ = win.set_focus();
    }
}

/// The pill is being dragged along the edge: it follows the cursor, and the drop (`commit`) saves the place.
#[tauri::command]
pub fn strip_drag(app: AppHandle, grab: f64, commit: bool) -> Result<()> {
    let grab = if grab.is_finite() { grab.clamp(-2000.0, 2000.0) } else { 0.0 };
    place::drag(&app, grab, commit)?;
    if commit {
        if let Some(state) = app.try_state::<StripState>() {
            let _ = app.emit(crate::strip::CONFIG_EVENT, state.cfg());
        }
    }
    Ok(())
}
