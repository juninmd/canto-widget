use tauri::{Emitter, LogicalPosition, Manager, WebviewWindow};

use crate::calendar::AgendaItem;

const MARGIN: f64 = 16.0;

pub fn anchor_bottom_right(win: &WebviewWindow) -> tauri::Result<()> {
    if let Some((x, y)) = anchored_position(win)? {
        win.set_position(LogicalPosition::new(x, y))?;
    }
    Ok(())
}

/// Where the window sits when anchored to the current monitor's corner, in logical pixels.
pub fn anchored_position(win: &WebviewWindow) -> tauri::Result<Option<(f64, f64)>> {
    let Some(monitor) = win.current_monitor()?.or(win.primary_monitor()?) else {
        return Ok(None);
    };
    let scale = monitor.scale_factor();
    let size = win.outer_size()?.to_logical::<f64>(scale);
    let area = monitor.work_area();
    let origin = area.position.to_logical::<f64>(scale);
    let bounds = area.size.to_logical::<f64>(scale);

    let x = origin.x + bounds.width - size.width - MARGIN;
    let y = origin.y + bounds.height - size.height - MARGIN;
    Ok(Some((x, y)))
}

pub fn toggle(app: &tauri::AppHandle) -> tauri::Result<()> {
    let Some(win) = app.get_webview_window("main") else {
        return Ok(());
    };
    if win.is_visible()? {
        win.hide()?;
        return Ok(());
    }
    show(app)
}

pub fn show(app: &tauri::AppHandle) -> tauri::Result<()> {
    let Some(win) = app.get_webview_window("main") else {
        return Ok(());
    };
    crate::window_state::place(&win)?;
    win.show()?;
    win.set_focus()?;
    Ok(())
}

pub const ALERT_EVENT: &str = "canto://alert";

/// An overlay on the window itself avoids depending on creating a webview at runtime, which behaves differently on each platform.
pub fn open_alert(app: &tauri::AppHandle, event: AgendaItem) -> tauri::Result<()> {
    crate::notification::send(app, &event);
    if let Some(state) = app.try_state::<crate::vault::AppState>() {
        *state.alert.lock().unwrap() = Some(event);
    }
    if let Some(win) = app.get_webview_window("main") {
        crate::window_state::place(&win)?;
        win.show()?;
        win.set_focus()?;
    }
    app.emit(ALERT_EVENT, ())?;
    Ok(())
}

pub fn close_alert(app: &tauri::AppHandle) -> tauri::Result<()> {
    if let Some(state) = app.try_state::<crate::vault::AppState>() {
        *state.alert.lock().unwrap() = None;
    }
    Ok(())
}
