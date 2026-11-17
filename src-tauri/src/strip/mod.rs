//! Mini-dashboard: a small always-visible pill on the top or bottom edge (CPU, weather, next event, reviews, notices)
//! in its own window. Only preferences live on disk; the numbers come from caches the app already keeps.
pub mod cmd;
pub mod config;
pub mod place;
pub mod readings;
pub mod snapshot;

pub use config::{known, Align, Density, Edge, StripConfig, Surface, ITEMS};

use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU32, Ordering};
use std::sync::Mutex;
use std::time::Duration;

use tauri::{AppHandle, Emitter, Manager};

use crate::error::Result;
use crate::resilient::LockExt;

/// Declared in `tauri.conf.json` (hidden, never created at runtime).
pub const WINDOW: &str = "strip";
const FILE: &str = "minipainel.json";
const TICK: Duration = Duration::from_secs(2);
const HOVER_TICK: Duration = Duration::from_millis(80);
/// Every sixth reading (about half a second) repeats the answer.
const HOVER_REPEAT: u32 = 6;
/// The window tells its page whether the cursor is over it.
pub const HOVER_EVENT: &str = "strip-hover";
/// Every window hears a saved config, so Ajustes follows "Ocultar" and the tray switch.
pub const CONFIG_EVENT: &str = "strip-config";
pub struct StripState {
    path: PathBuf,
    cfg: Mutex<StripConfig>,
    /// Fed by the tray's tick, which already asks the forges: the pill never goes to the network itself.
    reviews: AtomicU32,
}

impl StripState {
    pub fn load(dir: &Path) -> Self {
        let path = dir.join(FILE);
        let cfg: StripConfig = crate::store::read_json(&path).ok().flatten().unwrap_or_default();
        Self { path, cfg: Mutex::new(cfg.sanitized()), reviews: AtomicU32::new(0) }
    }

    pub fn cfg(&self) -> StripConfig {
        self.cfg.lock_safe().clone()
    }

    pub fn set(&self, cfg: StripConfig) -> Result<StripConfig> {
        let cfg = cfg.sanitized();
        crate::store::write_json_atomic(&self.path, &cfg)?;
        *self.cfg.lock_safe() = cfg.clone();
        Ok(cfg)
    }

    /// A drag in flight: the new position is used at once, and written to disk only on the drop.
    pub fn set_live(&self, cfg: StripConfig, persist: bool) -> Result<StripConfig> {
        if persist {
            return self.set(cfg);
        }
        let cfg = cfg.sanitized();
        *self.cfg.lock_safe() = cfg.clone();
        Ok(cfg)
    }

    pub fn reviews(&self) -> u32 {
        self.reviews.load(Ordering::Relaxed)
    }

    pub fn set_reviews(&self, count: u32) {
        self.reviews.store(count, Ordering::Relaxed);
    }
}

/// Called by the tray's tick; a no-op until the state exists.
pub fn feed_reviews(app: &AppHandle, count: u64) {
    if let Some(state) = app.try_state::<StripState>() {
        state.set_reviews(count.min(u64::from(u32::MAX)) as u32);
    }
}

/// The tray's switch: flips the option and shows or hides the pill at once.
pub fn toggle(app: &AppHandle) {
    let Some(state) = app.try_state::<StripState>() else { return };
    let mut cfg = state.cfg();
    cfg.enabled = !cfg.enabled;
    if let Ok(saved) = state.set(cfg) {
        place::sync(app);
        let _ = app.emit(CONFIG_EVENT, saved);
    }
}

pub fn watch(app: AppHandle) {
    crate::resilient::supervise("strip", {
        let app = app.clone();
        move || loop {
            place::sync(&app);
            std::thread::sleep(TICK);
        }
    });
    // An inactive window on macOS gets no mouse enter/leave from the webview, so the cursor is read from here.
    if cfg!(target_os = "macos") {
        crate::resilient::supervise("strip-hover", move || {
            let (mut last, mut ticks) = (false, 0u32);
            loop {
                let now = place::cursor_inside(&app);
                ticks = ticks.wrapping_add(1);
                // Said again now and then: a page that was not listening yet, or was asleep, catches up.
                if now != last || ticks % HOVER_REPEAT == 0 {
                    last = now;
                    place::emit_hover(&app, now);
                }
                std::thread::sleep(HOVER_TICK);
            }
        });
    }
}

#[cfg(test)]
#[path = "tests.rs"]
mod tests;
