//! The next events in the OS bar, off by default: macOS shows the first one as text in the menu bar, Linux as the
//! label beside the tray icon (AppIndicator: GNOME, KDE), and every system lists them in the tray tooltip. Windows 11
//! cannot write on the taskbar, so a small pill over it carries the text (`float.rs`). Reads the agenda the meeting
//! watcher already fetched, so it sends no request of its own.
#![cfg(desktop)]
#[cfg(any(windows, test))]
pub mod float;
pub mod text;

use std::path::{Path, PathBuf};
use std::sync::Mutex;
use std::time::Duration;

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, State};

use crate::error::Result;
use crate::resilient::LockExt;

const FILE: &str = "barra_agenda.json";
/// The agenda cache moves every 3 minutes, but "em 12 min" has to count down.
const TICK: Duration = Duration::from_secs(15);
const TRAY: &str = "canto-tray";
pub const EVENT: &str = "bar-agenda";
const MAX_COUNT: u8 = 3;

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct BarConfig {
    #[serde(default)]
    pub enabled: bool,
    /// How many events the tooltip lists; the title or pill shows the first plus "+N".
    #[serde(default = "one")]
    pub count: u8,
}

fn one() -> u8 {
    1
}

impl Default for BarConfig {
    fn default() -> Self {
        Self { enabled: false, count: 1 }
    }
}

impl BarConfig {
    fn sanitized(mut self) -> Self {
        self.count = self.count.clamp(1, MAX_COUNT);
        self
    }
}

pub struct BarAgenda {
    path: PathBuf,
    cfg: Mutex<BarConfig>,
    /// What the bar says now; `None` when nothing is shown.
    shown: Mutex<Option<String>>,
}

impl BarAgenda {
    pub fn load(dir: &Path) -> Self {
        let path = dir.join(FILE);
        let cfg: BarConfig = crate::store::read_json(&path).ok().flatten().unwrap_or_default();
        Self { path, cfg: Mutex::new(cfg.sanitized()), shown: Mutex::new(None) }
    }

    fn cfg(&self) -> BarConfig {
        self.cfg.lock_safe().clone()
    }

    fn set(&self, cfg: BarConfig) -> Result<BarConfig> {
        let cfg = cfg.sanitized();
        crate::store::write_json_atomic(&self.path, &cfg)?;
        *self.cfg.lock_safe() = cfg.clone();
        Ok(cfg)
    }
}

/// Idempotent: the option command and the ticker both call it. `force` repaints even when nothing changed.
pub fn refresh(app: &AppHandle, force: bool) {
    let Some(state) = app.try_state::<BarAgenda>() else { return };
    let cfg = state.cfg();
    let unlocked = app.state::<crate::vault::AppState>().is_unlocked();
    let lines = if cfg.enabled && unlocked {
        let items = app.state::<crate::meeting_cache::Upcoming>().items();
        text::upcoming(&items, crate::model::now_ms(), cfg.count as usize)
    } else {
        Vec::new()
    };
    let headline = text::headline(&lines);
    // The title is the sensitive part, so it is held in memory only and cleared with the lock like the agenda cache.
    if !force && *state.shown.lock_safe() == headline {
        return;
    }
    *state.shown.lock_safe() = headline.clone();
    if let Some(tray) = app.tray_by_id(TRAY) {
        // Only macOS and Linux draw a tray title; elsewhere this is a no-op.
        let _ = tray.set_title(headline.as_deref());
        let _ = tray.set_tooltip(Some(text::tooltip(&lines)));
    }
    #[cfg(windows)]
    float::sync(app, headline.as_deref());
}

pub fn watch(app: AppHandle) {
    crate::resilient::supervise("bar-agenda", move || loop {
        refresh(&app, false);
        std::thread::sleep(TICK);
    });
}

#[tauri::command]
pub fn bar_agenda_get(state: State<'_, BarAgenda>) -> BarConfig {
    state.cfg()
}

#[tauri::command]
pub fn bar_agenda_set(app: AppHandle, state: State<'_, BarAgenda>, config: BarConfig) -> Result<BarConfig> {
    let saved = state.set(config)?;
    refresh(&app, true);
    Ok(saved)
}

/// For the pill's page, which may open after the last event was sent.
#[tauri::command]
pub fn bar_agenda_text(state: State<'_, BarAgenda>) -> Option<String> {
    state.shown.lock_safe().clone()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_is_off_by_default_and_the_count_stays_in_range() {
        assert!(!BarConfig::default().enabled);
        assert!(!serde_json::from_str::<BarConfig>("{}").unwrap().enabled);
        assert_eq!(BarConfig { enabled: true, count: 0 }.sanitized().count, 1);
        assert_eq!(BarConfig { enabled: true, count: 9 }.sanitized().count, MAX_COUNT);
    }

    #[test]
    fn the_choice_survives_a_restart() {
        let dir = std::env::temp_dir().join(format!("canto-bar-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        let bar = BarAgenda::load(&dir);
        bar.set(BarConfig { enabled: true, count: 2 }).unwrap();
        assert_eq!(BarAgenda::load(&dir).cfg(), BarConfig { enabled: true, count: 2 });
        let _ = std::fs::remove_dir_all(&dir);
    }
}
