//! Mini mode: the window shrinks into a dock on the screen's right edge that lists only pending alerts.
use tauri::{Emitter, LogicalPosition, LogicalSize, Manager, State, WebviewWindow};

use crate::error::{AppError, Result};
use crate::window_state::{Area, WindowState};

pub const MODE_EVENT: &str = "canto://window-mode";

/// Same as `minWidth`/`minHeight` of the main window in `tauri.conf.json` (a test keeps them equal).
const NORMAL_MIN: (f64, f64) = (360.0, 440.0);
/// Collapsed dock: the colored bars plus a hit area; the UI asks for more room on hover.
pub const MINI_DEFAULT: (f64, f64) = (24.0, 64.0);
const MINI_MIN: (f64, f64) = (16.0, 32.0);
const MINI_MAX: (f64, f64) = (360.0, 640.0);

/// The webview picks the size (it knows how many alerts it lists); a bad value must not make a giant or invisible window.
pub fn clamp_mini(size: (f64, f64)) -> (f64, f64) {
    let one = |v: f64, lo: f64, hi: f64, default: f64| if v.is_finite() { v.clamp(lo, hi) } else { default };
    (one(size.0, MINI_MIN.0, MINI_MAX.0, MINI_DEFAULT.0), one(size.1, MINI_MIN.1, MINI_MAX.1, MINI_DEFAULT.1))
}

/// Flush with the right edge of the work area, vertically centered, so growing keeps the dock in place.
pub fn dock_position(area: Area, size: (f64, f64)) -> (f64, f64) {
    let (x, y, w, h) = area;
    (x + w - size.0, y + (h - size.1) / 2.0)
}

fn work_area(win: &WebviewWindow) -> tauri::Result<Option<Area>> {
    let Some(monitor) = win.current_monitor()?.or(win.primary_monitor()?) else {
        return Ok(None);
    };
    let scale = monitor.scale_factor();
    let area = monitor.work_area();
    let (p, s) = (area.position.to_logical::<f64>(scale), area.size.to_logical::<f64>(scale));
    Ok(Some((p.x, p.y, s.width, s.height)))
}

/// Idempotent: boot and every resize go through here, so the mini window never keeps the normal limits.
pub fn place_mini(win: &WebviewWindow, size: (f64, f64)) -> tauri::Result<()> {
    let size = clamp_mini(size);
    win.set_resizable(false)?;
    win.set_min_size(None::<LogicalSize<f64>>)?;
    win.set_size(LogicalSize::new(size.0, size.1))?;
    if let Some(area) = work_area(win)? {
        let (x, y) = dock_position(area, size);
        win.set_position(LogicalPosition::new(x, y))?;
    }
    Ok(())
}

pub fn restore_limits(win: &WebviewWindow) -> tauri::Result<()> {
    win.set_resizable(true)?;
    win.set_min_size(Some(LogicalSize::new(NORMAL_MIN.0, NORMAL_MIN.1)))
}

/// Mini only counts while the widget is on screen; a hidden one keeps ringing in its pop-up window.
pub fn mini_active(app: &tauri::AppHandle) -> bool {
    let on_screen = app.get_webview_window("main").is_some_and(|w| w.is_visible().unwrap_or(false));
    on_screen && app.try_state::<WindowState>().is_some_and(|s| s.cfg().mini)
}

pub fn set_mini(app: &tauri::AppHandle, enabled: bool) -> tauri::Result<()> {
    let (Some(win), Some(state)) = (app.get_webview_window("main"), app.try_state::<WindowState>()) else {
        return Ok(());
    };
    if state.cfg().mini == enabled {
        return Ok(());
    }
    // Flag first: the resize events below must not overwrite the normal geometry the user saved.
    state.change(|c| c.mini = enabled);
    if enabled {
        if win.is_fullscreen()? {
            win.set_fullscreen(false)?;
        }
        place_mini(&win, MINI_DEFAULT)?;
    } else {
        restore_limits(&win)?;
        crate::window_state::place(&win)?;
    }
    app.emit(MODE_EVENT, enabled)
}

/// From the tray: flips the mode and brings the widget up if it was hidden, since a dock nobody sees is useless.
pub fn toggle_mini(app: &tauri::AppHandle) -> tauri::Result<()> {
    let enabled = app.try_state::<WindowState>().is_some_and(|s| s.cfg().mini);
    set_mini(app, !enabled)?;
    if app.get_webview_window("main").is_some_and(|w| !w.is_visible().unwrap_or(true)) {
        crate::window::show(app)?;
    }
    Ok(())
}

#[tauri::command]
pub fn window_mini_set(app: tauri::AppHandle, enabled: bool) -> Result<()> {
    set_mini(&app, enabled).map_err(|e| AppError::Io(e.to_string()))
}

#[tauri::command]
pub fn window_mini_resize(
    app: tauri::AppHandle,
    window_state: State<'_, WindowState>,
    width: f64,
    height: f64,
) -> Result<()> {
    if !window_state.cfg().mini {
        return Ok(());
    }
    let Some(win) = app.get_webview_window("main") else { return Ok(()) };
    place_mini(&win, (width, height)).map_err(|e| AppError::Io(e.to_string()))
}

#[cfg(test)]
#[path = "window_mode_tests.rs"]
mod tests;
