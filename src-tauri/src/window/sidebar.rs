//! Sidebar mode: the widget docks to the right edge of the work area at full height and tucks away (a thin strip
//! stays on screen) when the mouse leaves it; touching the edge slides it back. It is a flag apart from mini and
//! fullscreen, which win over it while they are on.
use std::time::{Duration, Instant};

use tauri::{Emitter, Manager, PhysicalPosition, PhysicalSize, WebviewWindow};

use crate::error::{AppError, Result};
use crate::window::state::{Area, WindowState};

/// How often the cursor is sampled; there is no portable "mouse left the window" event for a borderless window.
const TICK: Duration = Duration::from_millis(80);
/// The mouse has to stay away this long, so a quick overshoot while resizing or reaching a popup doesn't hide it.
pub const LEAVE_DELAY: Duration = Duration::from_millis(500);
/// Logical width of the strip that stays visible while tucked, and of the hot zone that brings the widget back.
pub const EDGE: f64 = 2.0;

/// What the watcher does with the window on one sample.
#[derive(Debug, PartialEq, Eq)]
pub enum Step {
    Reveal,
    Tuck,
    Stay,
}

/// Docked rectangle in physical pixels: flush right, full height of the work area.
pub fn docked(area: Area, width: f64) -> Area {
    let (x, y, w, h) = area;
    let width = width.min(w);
    (x + w - width, y, width, h)
}

/// Left edge of the window while tucked: only `edge` pixels remain inside the work area.
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

fn physical_area(win: &WebviewWindow) -> tauri::Result<Option<(Area, f64)>> {
    let Some(monitor) = win.current_monitor()?.or(win.primary_monitor()?) else {
        return Ok(None);
    };
    let work = monitor.work_area();
    let (p, s) = (work.position, work.size);
    Ok(Some(((f64::from(p.x), f64::from(p.y), f64::from(s.width), f64::from(s.height)), monitor.scale_factor())))
}

fn edge_px(scale: f64) -> f64 {
    (EDGE * scale).round().max(EDGE)
}

/// Docks the window (revealed) on the right edge. Idempotent; used by boot, show and the mode switch.
pub fn place(win: &WebviewWindow, state: &WindowState, saved: Option<(f64, f64)>) -> tauri::Result<()> {
    // A tucked window reports the monitor on its right, so the cached area wins while it is tucked.
    let cached = state.dock_area().filter(|_| state.is_peeking());
    let Some((area, scale)) = (match cached {
        Some(area) => Some((area, win.scale_factor()?)),
        None => physical_area(win)?,
    }) else {
        return Ok(());
    };
    state.set_dock_area(Some(area));
    state.set_peeking(false);
    let width = crate::window::state::usable_size(saved).0 * scale;
    let (x, y, w, h) = docked(area, width);
    crate::window::mode::strip_chrome(win)?;
    win.set_resizable(false)?;
    win.set_min_size(None::<tauri::LogicalSize<f64>>)?;
    win.set_size(PhysicalSize::new(w.round() as u32, h.round() as u32))?;
    win.set_position(PhysicalPosition::new(x.round() as i32, y.round() as i32))
}

fn window_rect(win: &WebviewWindow) -> Option<Area> {
    let (p, s) = (win.outer_position().ok()?, win.outer_size().ok()?);
    Some((f64::from(p.x), f64::from(p.y), f64::from(s.width), f64::from(s.height)))
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
    let (Ok(cursor), Some(rect)) = (app.cursor_position(), window_rect(&win)) else {
        return;
    };
    let Some(area) = state.dock_area().or_else(|| physical_area(&win).ok().flatten().map(|(a, _)| a)) else {
        return;
    };
    let scale = win.scale_factor().unwrap_or(1.0);
    let cursor = (cursor.x, cursor.y);
    let peeking = state.is_peeking();
    if contains(rect, cursor) && !peeking {
        *outside_since = None;
    }
    let away = *outside_since.get_or_insert_with(Instant::now);
    match decide(peeking, cursor, area, rect, edge_px(scale), away.elapsed()) {
        Step::Reveal => {
            *outside_since = None;
            let _ = place(&win, &state, cfg.size);
            let _ = win.emit_to(win.label(), crate::window::SHOWN_EVENT, true);
        }
        Step::Tuck => {
            state.set_peeking(true);
            let x = tucked_x(area, edge_px(scale)).round() as i32;
            let _ = win.set_position(PhysicalPosition::new(x, area.1.round() as i32));
            let _ = win.emit_to(win.label(), crate::window::SHOWN_EVENT, false);
        }
        Step::Stay => {}
    }
}

pub fn watch(app: tauri::AppHandle) {
    let _ = std::thread::Builder::new().name("sidebar".into()).spawn(move || {
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
