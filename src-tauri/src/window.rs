use tauri::{Emitter, LogicalPosition, LogicalSize, Manager, WebviewWindow};

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
        return hide(&win);
    }
    show(app)
}

/// Frozen event name: `src/lib/windowShown.ts` pauses the UI-only polls on it (WebView2 keeps the page "visible").
pub const SHOWN_EVENT: &str = "canto://window-shown";

/// Hides the main window and tells its webview, which may not notice on its own.
pub fn hide<R: tauri::Runtime>(win: &tauri::WebviewWindow<R>) -> tauri::Result<()> {
    win.hide()?;
    win.emit_to(win.label(), SHOWN_EVENT, false)
}

pub fn show(app: &tauri::AppHandle) -> tauri::Result<()> {
    let Some(win) = app.get_webview_window("main") else {
        return Ok(());
    };
    #[cfg(desktop)]
    crate::window_state::place(&win)?;
    win.show()?;
    win.emit_to(win.label(), SHOWN_EVENT, true)?;
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
    #[cfg(desktop)]
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
        // Hidden under the lock: an alert ringing in between must not be hidden right after it showed.
        if current.is_none() {
            hide_alert_window(app);
        }
        removed
    };
    // Closed from the widget, the overlay still lists it; next time it shows, the stale card must be gone.
    let _ = app.emit(ALERT_EVENT, ());
    removed
}

/// Drops every pending alert at once — the overlay's "fechar todos" — and hides the window.
pub fn take_all_alerts(app: &tauri::AppHandle) -> Vec<AgendaItem> {
    let Some(state) = app.try_state::<crate::vault::AppState>() else { return Vec::new() };
    let drained = {
        let mut current = state.alert.lock().unwrap();
        let queue = queue(app);
        let mut pending = queue.0.lock().unwrap();
        hide_alert_window(app);
        alert_queue::drain(&mut current, &mut pending)
    };
    let _ = app.emit(ALERT_EVENT, ());
    drained
}

/// The overlay found nothing to show: a transparent, always-on-top window with no card would swallow the clicks
/// meant for whatever is under the corner, so it hides unless Rust still holds an alert (then the list returns).
pub fn settle_alert(app: &tauri::AppHandle) -> Vec<AgendaItem> {
    let Some(state) = app.try_state::<crate::vault::AppState>() else {
        hide_alert_window(app);
        return Vec::new();
    };
    let current = state.alert.lock().unwrap();
    let list = alert_queue::all(&current, &queue(app).0.lock().unwrap());
    if list.is_empty() {
        hide_alert_window(app);
    }
    list
}

/// The pop-up's width in `tauri.conf.json`; only its height follows the card.
const ALERT_WIDTH: f64 = 420.0;
/// A one-line alert still fits; a meeting with its agenda and guests can grow until here, then its boxes scroll.
pub const ALERT_HEIGHT: (f64, f64) = (96.0, 640.0);

/// The webview measures its card; a bad value must not leave a giant or invisible window over the corner.
pub fn clamp_alert_height(height: f64) -> f64 {
    if height.is_finite() {
        height.clamp(ALERT_HEIGHT.0, ALERT_HEIGHT.1)
    } else {
        ALERT_HEIGHT.1
    }
}

/// The window hugs the card so the rest of the corner stays clickable; it grows upward from the same corner.
pub fn resize_alert(app: &tauri::AppHandle, height: f64) -> tauri::Result<()> {
    if let Some(win) = app.get_webview_window(ALERT_WINDOW) {
        win.set_size(LogicalSize::new(ALERT_WIDTH, clamp_alert_height(height)))?;
        anchor_bottom_right(&win)?;
    }
    Ok(())
}

fn hide_alert_window(app: &tauri::AppHandle) {
    if let Some(win) = app.get_webview_window(ALERT_WINDOW) {
        let _ = win.hide();
    }
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
    fn the_alert_window_hides_while_the_queue_is_still_locked() {
        // A Windows checkout has CRLF line ends.
        let src = include_str!("window.rs").replace('\r', "");
        for f in ["fn take_alert(", "fn take_all_alerts(", "fn settle_alert("] {
            let body = &src[src.find(f).unwrap()..];
            let body = &body[..body.find("\n}\n").unwrap()];
            let locked = &body[body.find("alert.lock()").unwrap()..];
            assert!(
                locked.contains("hide_alert_window("),
                "{f} must hide under the lock, or an alert ringing in between ends up hidden"
            );
        }
        let caps = include_str!("lib.rs");
        assert!(caps.contains("cmd_alerts::alert_settle"), "the empty overlay needs a way to hide its window");
    }

    #[test]
    fn the_alert_window_height_stays_within_bounds() {
        use super::{clamp_alert_height, ALERT_HEIGHT};
        assert_eq!(clamp_alert_height(148.0), 148.0);
        assert_eq!(clamp_alert_height(0.0), ALERT_HEIGHT.0);
        assert_eq!(clamp_alert_height(5000.0), ALERT_HEIGHT.1);
        assert_eq!(clamp_alert_height(f64::NAN), ALERT_HEIGHT.1);
        let conf: serde_json::Value = serde_json::from_str(include_str!("../tauri.conf.json")).unwrap();
        let alert = conf["app"]["windows"].as_array().unwrap().iter().find(|w| w["label"] == super::ALERT_WINDOW);
        assert_eq!(alert.unwrap()["width"], super::ALERT_WIDTH);
    }

    #[test]
    fn every_rust_hide_of_the_widget_tells_the_webview_so_its_polls_sleep() {
        let src = include_str!("window.rs");
        let toggle = &src[src.find("pub fn toggle(").unwrap()..src.find("pub const SHOWN_EVENT").unwrap()];
        assert!(toggle.contains("return hide(&win)") && !toggle.contains("win.hide()"));
        let lib = include_str!("lib.rs");
        let close = &lib[lib.find("CloseRequested").unwrap()..];
        assert!(close[..300].contains("SHOWN_EVENT"), "closing hides the widget: the UI must hear it");
        let ui = include_str!("../../src/lib/windowShown.ts");
        assert!(ui.contains(&format!("\"{}\"", super::SHOWN_EVENT)), "the UI listens for the same literal");
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
