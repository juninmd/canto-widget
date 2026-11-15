//! Sidebar mode: the widget docks to the right edge of the work area at full height and tucks away (a thin strip
//! stays on screen) when the mouse leaves it; touching the edge slides it back. It is a flag apart from mini and
//! fullscreen, which win over it while they are on.
use std::time::{Duration, Instant};

use tauri::{Emitter, Manager, WebviewWindow};

use crate::error::{AppError, Result};
use crate::window::state::{Area, WindowState};

/// How often the cursor is sampled; there is no portable "mouse left the window" event for a borderless window.
const TICK: Duration = Duration::from_millis(80);
/// The mouse has to stay away this long, so a quick overshoot while resizing or reaching a popup doesn't hide it.
pub const LEAVE_DELAY: Duration = Duration::from_millis(500);
/// Logical width of the strip that stays visible while tucked, and of the hot zone that brings the widget back.
pub const EDGE: f64 = 2.0;

/// Wayland compositors disallow global pointer polling (`cursor_position` returns `(0, 0)`), which would strand a tucked sidebar off-screen.
pub fn wayland_session(xdg: Option<&str>, wayland: Option<&str>, gdk: Option<&str>) -> bool {
    if gdk.is_some_and(|v| v.eq_ignore_ascii_case("x11")) {
        return false;
    }
    xdg.is_some_and(|v| v.eq_ignore_ascii_case("wayland")) || wayland.is_some_and(|v| !v.is_empty())
}

fn is_wayland() -> bool {
    #[cfg(all(unix, not(target_os = "macos")))]
    {
        wayland_session(
            std::env::var("XDG_SESSION_TYPE").ok().as_deref(),
            std::env::var("WAYLAND_DISPLAY").ok().as_deref(),
            std::env::var("GDK_BACKEND").ok().as_deref(),
        )
    }
    #[cfg(not(all(unix, not(target_os = "macos"))))]
    false
}

/// What the watcher does with the window on one sample.
#[derive(Debug, PartialEq, Eq)]
pub enum Step {
    Reveal,
    Tuck,
    Stay,
}

/// Docked rectangle: flush right, full height of the work area (physical on Windows/X11, logical points on macOS).
pub fn docked(area: Area, width: f64) -> Area {
    let (x, y, w, h) = area;
    let width = width.min(w);
    (x + w - width, y, width, h)
}

/// Left edge of the window while tucked: only `edge` remains inside the work area.
pub fn tucked_x(area: Area, edge: f64) -> f64 {
    area.0 + area.2 - edge
}

pub fn contains(rect: Area, p: (f64, f64)) -> bool {
    p.0 >= rect.0 && p.0 < rect.0 + rect.2 && p.1 >= rect.1 && p.1 < rect.1 + rect.3
}

/// `window` is where the window is right now (it may have been dragged), `outside` how long the mouse has been
/// away from it.
pub fn decide(peeking: bool, cursor: (f64, f64), area: Area, window: Area, edge: f64, outside: Duration) -> Step {
    if peeking {
        // The hot zone is the tucked strip itself, over the full height of the work area.
        let hot = (area.0 + area.2 - edge, area.1, edge, area.3);
        return if contains(hot, cursor) { Step::Reveal } else { Step::Stay };
    }
    if contains(window, cursor) || outside < LEAVE_DELAY {
        Step::Stay
    } else {
        Step::Tuck
    }
}

fn work_area(win: &WebviewWindow) -> tauri::Result<Option<(Area, f64)>> {
    let Some(monitor) = win.current_monitor()?.or(win.primary_monitor()?) else {
        return Ok(None);
    };
    let scale = monitor.scale_factor();
    let work = monitor.work_area();
    #[cfg(target_os = "macos")]
    let area = {
        let (p, s) = (work.position.to_logical::<f64>(scale), work.size.to_logical::<f64>(scale));
        (p.x, p.y, s.width, s.height)
    };
    #[cfg(not(target_os = "macos"))]
    let area = (
        f64::from(work.position.x),
        f64::from(work.position.y),
        f64::from(work.size.width),
        f64::from(work.size.height),
    );
    Ok(Some((area, scale)))
}

fn edge_for(scale: f64) -> f64 {
    if cfg!(target_os = "macos") {
        EDGE
    } else {
        (EDGE * scale).round().max(EDGE)
    }
}

fn width_for(saved: Option<(f64, f64)>, scale: f64) -> f64 {
    let logical = crate::window::state::usable_size(saved).0;
    if cfg!(target_os = "macos") {
        logical
    } else {
        logical * scale
    }
}

fn set_window_rect(win: &WebviewWindow, area: Area) -> tauri::Result<()> {
    #[cfg(target_os = "macos")]
    {
        win.set_size(tauri::LogicalSize::new(area.2, area.3))?;
        win.set_position(tauri::LogicalPosition::new(area.0, area.1))
    }
    #[cfg(not(target_os = "macos"))]
    {
        win.set_size(tauri::PhysicalSize::new(area.2.round() as u32, area.3.round() as u32))?;
        win.set_position(tauri::PhysicalPosition::new(area.0.round() as i32, area.1.round() as i32))
    }
}

fn set_window_pos(win: &WebviewWindow, x: f64, y: f64) -> tauri::Result<()> {
    #[cfg(target_os = "macos")]
    return win.set_position(tauri::LogicalPosition::new(x, y));
    #[cfg(not(target_os = "macos"))]
    win.set_position(tauri::PhysicalPosition::new(x.round() as i32, y.round() as i32))
}

/// Docks the window (revealed) on the right edge. Idempotent; used by boot, show and the mode switch.
pub fn place(win: &WebviewWindow, state: &WindowState, saved: Option<(f64, f64)>) -> tauri::Result<()> {
    // A tucked window reports the monitor on its right, so the cached area and scale win while it is tucked.
    let cached = state.dock_area().filter(|_| state.is_peeking());
    let Some((area, scale)) = (match cached {
        Some(pair) => Some(pair),
        None => work_area(win)?,
    }) else {
        return Ok(());
    };
    state.set_dock_area(Some((area, scale)));
    state.set_peeking(false);
    let rect = docked(area, width_for(saved, scale));
    crate::window::mode::strip_chrome(win)?;
    win.set_resizable(false)?;
    win.set_min_size(None::<tauri::LogicalSize<f64>>)?;
    set_window_rect(win, rect)
}

fn window_rect(win: &WebviewWindow) -> Option<Area> {
    let (p, s) = (win.outer_position().ok()?, win.outer_size().ok()?);
    #[cfg(target_os = "macos")]
    {
        let scale = win.scale_factor().ok()?;
        let (p, s) = (p.to_logical::<f64>(scale), s.to_logical::<f64>(scale));
        Some((p.x, p.y, s.width, s.height))
    }
    #[cfg(not(target_os = "macos"))]
    Some((f64::from(p.x), f64::from(p.y), f64::from(s.width), f64::from(s.height)))
}

fn cursor_point(app: &tauri::AppHandle, pos: tauri::PhysicalPosition<f64>) -> (f64, f64) {
    #[cfg(target_os = "macos")]
    {
        let scale = app.primary_monitor().ok().flatten().map_or(1.0, |m| m.scale_factor());
        let p = pos.to_logical::<f64>(scale);
        (p.x, p.y)
    }
    #[cfg(not(target_os = "macos"))]
    {
        let _ = app;
        (pos.x, pos.y)
    }
}

fn tick(app: &tauri::AppHandle, outside_since: &mut Option<Instant>) {
    let (Some(win), Some(state)) = (app.get_webview_window("main"), app.try_state::<WindowState>()) else {
        return;
    };
    let cfg = state.cfg();
    if !cfg.sidebar || cfg.mini || crate::window::mode::is_max(&win) {
        // Another mode took over: whatever strip was left must not stay hidden behind it.
        *outside_since = None;
        state.set_peeking(false);
        return;
    }
    if !win.is_visible().unwrap_or(false) || win.is_minimized().unwrap_or(false) {
        *outside_since = None;
        return;
    }
    if is_wayland() {
        *outside_since = None;
        if state.is_peeking() {
            let _ = place(&win, &state, cfg.size);
            let _ = win.emit_to(win.label(), crate::window::SHOWN_EVENT, true);
        }
        return;
    }
    let (Ok(raw_cursor), Some(rect)) = (app.cursor_position(), window_rect(&win)) else {
        return;
    };
    let Some((area, scale)) = state.dock_area().or_else(|| work_area(&win).ok().flatten()) else {
        return;
    };
    let cursor = cursor_point(app, raw_cursor);
    let edge = edge_for(scale);
    let peeking = state.is_peeking();
    if contains(rect, cursor) && !peeking {
        *outside_since = None;
    }
    let away = *outside_since.get_or_insert_with(Instant::now);
    match decide(peeking, cursor, area, rect, edge, away.elapsed()) {
        Step::Reveal => {
            *outside_since = None;
            let _ = place(&win, &state, cfg.size);
            let _ = win.emit_to(win.label(), crate::window::SHOWN_EVENT, true);
        }
        Step::Tuck => {
            state.set_peeking(true);
            let _ = set_window_pos(&win, tucked_x(area, edge), area.1);
            let _ = win.emit_to(win.label(), crate::window::SHOWN_EVENT, false);
        }
        Step::Stay => {}
    }
}

pub fn watch(app: tauri::AppHandle) {
    crate::resilient::supervise("sidebar", move || {
        let mut outside_since = None;
        loop {
            std::thread::sleep(TICK);
            tick(&app, &mut outside_since);
        }
    });
}

pub fn set_sidebar(app: &tauri::AppHandle, enabled: bool) -> tauri::Result<()> {
    let (Some(win), Some(state)) = (app.get_webview_window("main"), app.try_state::<WindowState>()) else {
        return Ok(());
    };
    if state.cfg().sidebar == enabled {
        return Ok(());
    }
    // Flag first: the resize events below must not overwrite the normal geometry the user saved.
    state.change(|c| c.sidebar = enabled);
    state.set_peeking(false);
    state.set_dock_area(None);
    if enabled && crate::window::mode::is_max(&win) {
        crate::window::mode::set_max(&win, false)?;
    }
    if !enabled {
        crate::window::mode::restore_limits(&win)?;
    }
    crate::window::state::place(&win)?;
    app.emit(crate::window::mode::MODE_EVENT, state.cfg().mini)
}

#[tauri::command]
pub fn window_sidebar_set(app: tauri::AppHandle, enabled: bool) -> Result<()> {
    set_sidebar(&app, enabled).map_err(|e| AppError::Io(e.to_string()))
}

#[cfg(test)]
#[path = "sidebar_tests.rs"]
mod tests;
