use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Mutex;
use tauri::{LogicalPosition, LogicalSize, Manager, State, WebviewWindow};

use crate::error::{AppError, Result};
use crate::store;

pub const DEFAULT_WIDTH: f64 = 420.0;
pub const DEFAULT_HEIGHT: f64 = 580.0;
/// Tolerance to recognize the position the app itself anchored, not a drag.
const SLACK_PX: f64 = 4.0;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct WindowConfig {
    /// Top-left corner in logical pixels; `None` = anchored to the monitor's corner.
    #[serde(default, alias = "posicao")]
    pub position: Option<(f64, f64)>,
    #[serde(default, alias = "tamanho")]
    pub size: Option<(f64, f64)>,
    #[serde(default = "yes", alias = "sempre_no_topo")]
    pub always_on_top: bool,
}

fn yes() -> bool {
    true
}

impl Default for WindowConfig {
    fn default() -> Self {
        Self { position: None, size: None, always_on_top: true }
    }
}

pub type Area = (f64, f64, f64, f64);

/// A disconnected monitor or smaller resolution must not leave the widget stranded off-screen.
pub fn fits(pos: (f64, f64), size: (f64, f64), areas: &[Area]) -> bool {
    areas.iter().any(|&(x, y, w, h)| {
        pos.0 >= x - SLACK_PX && pos.1 >= y - SLACK_PX && pos.0 + size.0 <= x + w + SLACK_PX && pos.1 + size.1 <= y + h + SLACK_PX
    })
}

pub fn close_to(a: (f64, f64), b: (f64, f64)) -> bool {
    (a.0 - b.0).abs() <= SLACK_PX && (a.1 - b.1).abs() <= SLACK_PX
}

#[derive(Default)]
pub struct WindowState {
    cfg: Mutex<WindowConfig>,
    dirty: AtomicBool,
}

fn path(dir: &Path) -> PathBuf {
    dir.join("janela.json")
}

impl WindowState {
    pub fn load(dir: &Path) -> Self {
        // A corrupted file doesn't stop the widget from opening: it falls back to the corner.
        let cfg = store::read_json(&path(dir)).ok().flatten().unwrap_or_default();
        Self { cfg: Mutex::new(cfg), dirty: AtomicBool::new(false) }
    }

    pub fn cfg(&self) -> WindowConfig {
        self.cfg.lock().unwrap().clone()
    }

    pub fn change(&self, f: impl FnOnce(&mut WindowConfig)) {
        let mut cfg = self.cfg.lock().unwrap();
        let before = cfg.clone();
        f(&mut cfg);
        if *cfg != before {
            self.dirty.store(true, Ordering::Relaxed);
        }
    }

    /// Persists only if changed; dragging fires dozens of events per second.
    pub fn save_if_dirty(&self, dir: &Path) -> Result<()> {
        if self.dirty.swap(false, Ordering::Relaxed) {
            store::write_json_atomic(&path(dir), &self.cfg())?;
        }
        Ok(())
    }
}

fn areas(win: &WebviewWindow) -> Vec<Area> {
    win.available_monitors()
        .unwrap_or_default()
        .iter()
        .map(|m| {
            let s = m.scale_factor();
            let (p, t) = (m.work_area().position.to_logical::<f64>(s), m.work_area().size.to_logical::<f64>(s));
            (p.x, p.y, t.width, t.height)
        })
        .collect()
}

pub fn place(win: &WebviewWindow) -> tauri::Result<()> {
    // In fullscreen the OS owns the rectangle; touching it would kick the window out of that mode.
    if win.is_fullscreen()? {
        return Ok(());
    }
    let Some(window_state) = win.try_state::<WindowState>() else {
        return crate::window::anchor_bottom_right(win);
    };
    let cfg = window_state.cfg();
    let size = cfg.size.unwrap_or((DEFAULT_WIDTH, DEFAULT_HEIGHT));
    win.set_size(LogicalSize::new(size.0, size.1))?;
    match cfg.position.filter(|&p| fits(p, size, &areas(win))) {
        Some((x, y)) => win.set_position(LogicalPosition::new(x, y)),
        None => crate::window::anchor_bottom_right(win),
    }
}

pub fn record(win: &tauri::Window) {
    let (Some(window_state), Ok(scale)) = (win.try_state::<WindowState>(), win.scale_factor()) else {
        return;
    };
    // Fullscreen size isn't a user preference: saving it would make the widget reopen giant.
    if win.is_fullscreen().unwrap_or(false) {
        return;
    }
    let (Ok(pos), Ok(size)) = (win.outer_position(), win.inner_size()) else {
        return;
    };
    let pos = pos.to_logical::<f64>(scale);
    let size = size.to_logical::<f64>(scale);
    let anchored = win
        .app_handle()
        .get_webview_window("main")
        .and_then(|w| crate::window::anchored_position(&w).ok().flatten())
        .is_some_and(|a| close_to(a, (pos.x, pos.y)));
    window_state.change(|c| {
        c.position = (!anchored).then_some((pos.x, pos.y));
        let default_size = close_to((size.width, size.height), (DEFAULT_WIDTH, DEFAULT_HEIGHT));
        c.size = (!default_size).then_some((size.width, size.height));
    });
}

#[tauri::command]
pub fn window_config(window_state: State<'_, WindowState>) -> WindowConfig {
    window_state.cfg()
}

#[tauri::command]
pub fn window_set_always_on_top(app: tauri::AppHandle, window_state: State<'_, WindowState>, enabled: bool) -> Result<()> {
    if let Some(win) = app.get_webview_window("main") {
        win.set_always_on_top(enabled).map_err(|e| AppError::Io(e.to_string()))?;
    }
    window_state.change(|c| c.always_on_top = enabled);
    Ok(())
}

#[tauri::command]
pub fn window_reset(app: tauri::AppHandle, window_state: State<'_, WindowState>) -> Result<()> {
    window_state.change(|c| {
        c.position = None;
        c.size = None;
    });
    if let Some(win) = app.get_webview_window("main") {
        place(&win).map_err(|e| AppError::Io(e.to_string()))?;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    const SCREEN: Area = (0.0, 0.0, 1920.0, 1040.0);
    const SECOND: Area = (1920.0, 0.0, 1280.0, 1000.0);

    #[test]
    fn position_inside_any_monitor_is_valid() {
        assert!(fits((100.0, 100.0), (420.0, 580.0), &[SCREEN]));
        assert!(fits((2000.0, 300.0), (420.0, 580.0), &[SCREEN, SECOND]));
    }

    #[test]
    fn disconnected_monitor_or_leaking_window_falls_back_to_the_corner() {
        assert!(!fits((2000.0, 300.0), (420.0, 580.0), &[SCREEN]), "window would land off-screen");
        assert!(!fits((1700.0, 100.0), (420.0, 580.0), &[SCREEN]), "half the window is off-screen");
        assert!(!fits((100.0, 100.0), (420.0, 580.0), &[]), "no monitor at all");
    }

    #[test]
    fn old_or_empty_config_stays_always_on_top() {
        let cfg: WindowConfig = serde_json::from_str("{}").unwrap();
        assert_eq!(cfg, WindowConfig::default());
        assert!(cfg.always_on_top);
    }

    #[test]
    fn legacy_config_deserializes_portuguese_keys() {
        let legacy = r#"{"posicao":[10.0,20.0],"tamanho":[300.0,400.0],"sempre_no_topo":false}"#;
        let cfg: WindowConfig = serde_json::from_str(legacy).unwrap();
        assert_eq!(cfg.position, Some((10.0, 20.0)));
        assert_eq!(cfg.size, Some((300.0, 400.0)));
        assert!(!cfg.always_on_top);
    }

    #[test]
    fn only_persists_when_something_changed() {
        let dir = std::env::temp_dir().join(format!("canto-janela-{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&dir);
        let j = WindowState::load(&dir);
        j.change(|c| c.always_on_top = true);
        j.save_if_dirty(&dir).unwrap();
        assert!(!path(&dir).exists(), "persisted without any change");
        j.change(|c| c.position = Some((10.0, 20.0)));
        j.save_if_dirty(&dir).unwrap();
        assert_eq!(WindowState::load(&dir).cfg().position, Some((10.0, 20.0)));
        let _ = std::fs::remove_dir_all(&dir);
    }
}
