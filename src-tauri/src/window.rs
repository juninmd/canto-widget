use tauri::{Emitter, LogicalPosition, Manager, WebviewWindow};

use crate::calendar::AgendaItem;

#[path = "alert_queue.rs"]
mod alert_queue;

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
    if crate::do_not_disturb::quiet(app) {
        return Ok(());
    }
    crate::notification::send(app, &event);
    let Some(state) = app.try_state::<crate::vault::AppState>() else { return Ok(()) };
    {
        let mut current = state.alert.lock().unwrap();
        alert_queue::push(&mut current, &mut queue(app).0.lock().unwrap(), event);
    }
    // Also for an alert that waits: the overlay lists every pending one and needs to learn about it.
    present_alert(app)
}

/// Every pending alert, for the overlay to list.
pub fn alert_list(app: &tauri::AppHandle) -> Vec<AgendaItem> {
    let Some(state) = app.try_state::<crate::vault::AppState>() else { return Vec::new() };
    let current = state.alert.lock().unwrap();
    alert_queue::all(&current, &queue(app).0.lock().unwrap())
}

/// Dismissing, snoozing or completing an alert drops just that one; the others stay on the overlay.
pub fn take_alert(app: &tauri::AppHandle, id: &str) -> Option<AgendaItem> {
    let state = app.try_state::<crate::vault::AppState>()?;
    let mut current = state.alert.lock().unwrap();
    alert_queue::remove(&mut current, &mut queue(app).0.lock().unwrap(), id)
}

/// Managed on first use so the queue needs no setup in `lib.rs`; a second `manage` is a no-op.
fn queue(app: &tauri::AppHandle) -> tauri::State<'_, alert_queue::AlertQueue> {
    app.manage(alert_queue::AlertQueue::default());
    app.state()
}

fn present_alert(app: &tauri::AppHandle) -> tauri::Result<()> {
    if let Some(win) = app.get_webview_window("main") {
        crate::window_state::place(&win)?;
        win.show()?;
        win.set_focus()?;
    }
    app.emit(ALERT_EVENT, ())?;
    Ok(())
}
