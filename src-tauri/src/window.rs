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

pub const ALERT_WINDOW: &str = "alert";

/// Rings in its own window (declared in `tauri.conf.json`, so no webview is created at runtime): the widget
/// stays minimized or locked while the pop-up shows.
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
    // A full-screen app in front (a game) must keep the foreground: the pop-up rings when it leaves.
    if crate::fullscreen_guard::hold(app) {
        return app.emit(ALERT_EVENT, ());
    }
    present_pending(app)
}

/// Brings the pending alerts to the user: in mini mode the dock lists them (a pop-up would cover the edge strip
/// the user chose to live with), otherwise the pop-up window shows.
pub fn present_pending(app: &tauri::AppHandle) -> tauri::Result<()> {
    if crate::window_mode::mini_active(app) {
        return app.emit(ALERT_EVENT, ());
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
    let removed = {
        let mut current = state.alert.lock().unwrap();
        let queue = queue(app);
        let mut pending = queue.0.lock().unwrap();
        let removed = alert_queue::remove(&mut current, &mut pending, id);
        (removed, current.is_none())
    };
    if removed.1 {
        if let Some(win) = app.get_webview_window(ALERT_WINDOW) {
            let _ = win.hide();
        }
    }
    removed.0
}

/// Managed on first use so the queue needs no setup in `lib.rs`; a second `manage` is a no-op.
fn queue(app: &tauri::AppHandle) -> tauri::State<'_, alert_queue::AlertQueue> {
    app.manage(alert_queue::AlertQueue::default());
    app.state()
}

fn present_alert(app: &tauri::AppHandle) -> tauri::Result<()> {
    if let Some(win) = app.get_webview_window(ALERT_WINDOW) {
        if !win.is_visible()? {
            anchor_bottom_right(&win)?;
            win.show()?;
        }
    }
    app.emit(ALERT_EVENT, ())?;
    Ok(())
}

#[cfg(test)]
mod tests {
    #[test]
    fn alert_rings_in_its_own_window_and_never_shows_the_widget() {
        let src = include_str!("window.rs");
        let body = &src[src.find("fn present_alert(").unwrap()..src.find("#[cfg(test)]").unwrap()];
        assert!(body.contains("ALERT_WINDOW"));
        assert!(!body.contains("\"main\""), "a pop-up must not open the minimized or locked widget");
    }

    #[test]
    fn alert_never_steals_focus_from_a_fullscreen_game() {
        let src = include_str!("window.rs");
        let body = &src[src.find("fn present_alert(").unwrap()..src.find("#[cfg(test)]").unwrap()];
        assert!(!body.contains("set_focus"), "a pop-up must not take focus from the app in use");
        let conf: serde_json::Value = serde_json::from_str(include_str!("../tauri.conf.json")).unwrap();
        let alert = conf["app"]["windows"].as_array().unwrap().iter().find(|w| w["label"] == super::ALERT_WINDOW);
        assert_eq!(alert.unwrap()["focusable"], false, "the pop-up window must not be activated when shown");
    }

    #[test]
    fn alert_window_is_declared_and_allowed() {
        let conf: serde_json::Value = serde_json::from_str(include_str!("../tauri.conf.json")).unwrap();
        let windows = conf["app"]["windows"].as_array().unwrap();
        let alert =
            windows.iter().find(|w| w["label"] == super::ALERT_WINDOW).expect("alert window in tauri.conf.json");
        assert_eq!(alert["visible"], false, "hidden until an alert rings");
        let caps = include_str!("../capabilities/default.json");
        assert!(caps.contains("\"alert\""), "the pop-up needs the IPC permissions");
    }
}
