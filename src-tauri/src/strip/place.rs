//! Where the pill sits and when it shows: centered on the work area's top or bottom edge, hidden while a full-screen
//! app (a game, a video) is in front or the option is off.
use tauri::{Emitter, LogicalSize, Manager, WebviewWindow};

use crate::strip::{Align, Edge, StripConfig, StripState, WINDOW};
use crate::window::state::Area;

/// Pill only; the UI asks for more room while the details are open.
pub const DEFAULT: (f64, f64) = (240.0, 32.0);
const MIN: (f64, f64) = (48.0, 20.0);
const MAX: (f64, f64) = (560.0, 1100.0);

/// The webview picks the size (it measures its content); a bad value must not make a giant or invisible window.
pub fn clamp(size: (f64, f64)) -> (f64, f64) {
    let one = |v: f64, lo: f64, hi: f64, default: f64| if v.is_finite() { v.clamp(lo, hi) } else { default };
    (one(size.0, MIN.0, MAX.0, DEFAULT.0), one(size.1, MIN.1, MAX.1, DEFAULT.1))
}

/// Centered on the edge, flush with it, so growing for the details keeps the pill where it was.
pub fn origin(area: Area, size: (f64, f64), edge: Edge) -> (f64, f64) {
    origin_at(area, size, edge, Align::Center, 0.0)
}

/// Same, with the side along the edge and a gap (in the area's own unit) from the edge and the corner.
pub fn origin_at(area: Area, size: (f64, f64), edge: Edge, align: Align, gap: f64) -> (f64, f64) {
    let (x, y, w, h) = area;
    let top = match edge {
        Edge::Top => y + gap,
        Edge::Bottom => y + h - size.1 - gap,
    };
    let left = match align {
        Align::Start => x + gap,
        Align::Center => x + (w - size.0) / 2.0,
        Align::End => x + w - size.0 - gap,
    };
    (left, top)
}

/// Off wins over everything; a full-screen app keeps the screen to itself.
pub fn wanted(enabled: bool, fullscreen_app: bool) -> bool {
    enabled && !fullscreen_app
}

#[cfg(target_os = "macos")]
fn area_of(win: &WebviewWindow, scale_to_logical: bool) -> tauri::Result<Option<(Area, f64)>> {
    let Some(monitor) = target_monitor(win)? else { return Ok(None) };
    let scale = monitor.scale_factor();
    let a = monitor.work_area();
    let (p, s) = (a.position.to_logical::<f64>(scale), a.size.to_logical::<f64>(scale));
    let _ = scale_to_logical;
    Ok(Some(((p.x, p.y, s.width, s.height), 1.0)))
}

#[cfg(not(target_os = "macos"))]
fn area_of(win: &WebviewWindow, _logical: bool) -> tauri::Result<Option<(Area, f64)>> {
    let Some(monitor) = target_monitor(win)? else { return Ok(None) };
    let a = monitor.work_area();
    let area = (f64::from(a.position.x), f64::from(a.position.y), f64::from(a.size.width), f64::from(a.size.height));
    Ok(Some((area, monitor.scale_factor())))
}

/// Monitors are told apart by name; an unnamed one gets its position in the list.
pub fn monitor_label(index: usize, name: Option<&str>) -> String {
    name.filter(|n| !n.is_empty()).map_or_else(|| format!("Monitor {}", index + 1), str::to_string)
}

/// Index of the wanted monitor, or `None` (not asked, or unplugged since) so the caller falls back.
pub fn pick(labels: &[String], wanted: Option<&str>) -> Option<usize> {
    let wanted = wanted.filter(|w| !w.is_empty())?;
    labels.iter().position(|l| l == wanted)
}

pub fn monitor_names(app: &tauri::AppHandle) -> Vec<String> {
    let list = app.available_monitors().unwrap_or_default();
    list.iter().enumerate().map(|(i, m)| monitor_label(i, m.name().map(String::as_str))).collect()
}

/// The chosen monitor, else the one the widget lives on, else the primary one.
fn target_monitor(win: &WebviewWindow) -> tauri::Result<Option<tauri::Monitor>> {
    let wanted = win.app_handle().try_state::<StripState>().and_then(|s| s.cfg().monitor);
    let list = win.available_monitors()?;
    let labels: Vec<String> =
        list.iter().enumerate().map(|(i, m)| monitor_label(i, m.name().map(String::as_str))).collect();
    if let Some(m) = pick(&labels, wanted.as_deref()).and_then(|i| list.into_iter().nth(i)) {
        return Ok(Some(m));
    }
    let from_main = win.app_handle().get_webview_window("main").and_then(|m| m.current_monitor().ok().flatten());
    Ok(from_main.or(win.primary_monitor()?))
}

pub fn place(win: &WebviewWindow, size: (f64, f64), cfg: &StripConfig) -> tauri::Result<()> {
    let size = clamp(size);
    let Some((area, scale)) = area_of(win, true)? else {
        return win.set_size(LogicalSize::new(size.0, size.1));
    };
    let scaled = ((size.0 * scale).round(), (size.1 * scale).round());
    let (x, y) = origin_at(area, scaled, cfg.edge, cfg.align, (f64::from(cfg.gap) * scale).round());
    #[cfg(target_os = "macos")]
    {
        win.set_size(LogicalSize::new(size.0, size.1))?;
        win.set_position(tauri::LogicalPosition::new(x, y))
    }
    #[cfg(not(target_os = "macos"))]
    {
        win.set_size(tauri::PhysicalSize::new(scaled.0 as u32, scaled.1 as u32))?;
        win.set_position(tauri::PhysicalPosition::new(x.round() as i32, y.round() as i32))
    }
}

/// Whether the cursor is over the visible pill window; the webview cannot tell while another app is active.
pub fn cursor_inside(app: &tauri::AppHandle) -> bool {
    let Some(win) = app.get_webview_window(WINDOW).filter(|w| w.is_visible().unwrap_or(false)) else { return false };
    let (Ok(cursor), Ok(pos), Ok(size)) = (app.cursor_position(), win.outer_position(), win.outer_size()) else {
        return false;
    };
    inside((cursor.x, cursor.y), (f64::from(pos.x), f64::from(pos.y)), (f64::from(size.width), f64::from(size.height)))
}

pub fn inside(cursor: (f64, f64), origin: (f64, f64), size: (f64, f64)) -> bool {
    cursor.0 >= origin.0 && cursor.0 < origin.0 + size.0 && cursor.1 >= origin.1 && cursor.1 < origin.1 + size.1
}

pub fn emit_hover(app: &tauri::AppHandle, on: bool) {
    if let Some(win) = app.get_webview_window(WINDOW) {
        let _ = win.emit_to(win.label(), crate::strip::HOVER_EVENT, on);
    }
}

/// Idempotent: the config command and the watcher both call it, so the window follows the option and the screen.
pub fn sync(app: &tauri::AppHandle) {
    let (Some(win), Some(state)) = (app.get_webview_window(WINDOW), app.try_state::<StripState>()) else { return };
    let cfg = state.cfg();
    let show = wanted(cfg.enabled, cfg.hide_fullscreen && crate::fullscreen_guard::holding(app));
    let visible = win.is_visible().unwrap_or(false);
    if show && !visible {
        let _ = place(&win, DEFAULT, &cfg);
        if win.show().is_ok() {
            let _ = win.emit_to(win.label(), crate::window::SHOWN_EVENT, true);
        }
    } else if !show && visible {
        let _ = win.hide();
        // WebView2 keeps animating a hidden page; the UI listens for this to stop polling.
        let _ = win.emit_to(win.label(), crate::window::SHOWN_EVENT, false);
    }
}
