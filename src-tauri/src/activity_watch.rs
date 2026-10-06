//! The sampler thread and the commands around it. Off by default: nothing is recorded until the user opts in,
//! and nothing at all while the vault is locked (the log is sealed, so it could not be saved anyway).
use std::path::Path;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Mutex;
use std::time::Duration;

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, State};

use crate::activity::{summarize, Log, Summary, ACTIVITY_AAD, INTERVAL_SECS};
use crate::activity_os;
use crate::error::{AppError, Result};
use crate::fullscreen_guard;
use crate::model::now_ms;
use crate::store;
use crate::vault::AppState;

const PREFS_FILE: &str = "atividade_config.json";
/// No input for this long counts as away, so the span stops growing.
const IDLE_LIMIT_SECS: u64 = 120;
const FLUSH_SECS: i64 = 60;
/// A window can span a week of workdays, never more than the log keeps.
const MAX_WINDOW_MS: i64 = 36 * 24 * 3600 * 1000;

#[derive(Serialize, Deserialize)]
struct Prefs {
    #[serde(default)]
    enabled: bool,
}

/// What the sampler holds between ticks; `None` while locked or disabled, so nothing lingers in RAM.
pub struct ActivityState {
    enabled: AtomicBool,
    log: Mutex<Option<Log>>,
}

impl ActivityState {
    pub fn load(dir: &Path) -> Self {
        let on = store::read_json::<Prefs>(&dir.join(PREFS_FILE)).ok().flatten().is_some_and(|p| p.enabled);
        Self { enabled: AtomicBool::new(on), log: Mutex::new(None) }
    }

    fn enabled(&self) -> bool {
        self.enabled.load(Ordering::Relaxed)
    }

    fn drop_log(&self) {
        *self.log.lock().unwrap() = None;
    }

    /// Runs `f` on the log, reading it from disk the first time after an unlock.
    fn with_log<T>(&self, state: &AppState, f: impl FnOnce(&mut Log) -> T) -> Result<T> {
        let mut guard = self.log.lock().unwrap();
        if guard.is_none() {
            let path = store::activity_path(&state.dir);
            // An unreadable file is a lost log, not a reason to stop sampling.
            *guard = Some(state.sealed::<Log>(&path, ACTIVITY_AAD).ok().flatten().unwrap_or_default());
        }
        Ok(f(guard.as_mut().expect("just loaded")))
    }

    /// Adds focus time to the log when the user opted into the activity log; otherwise the time stays only on the task.
    pub fn record_focus(&self, state: &AppState, task: &str, secs: u32, now: i64) {
        if self.enabled() {
            let _ = self.with_log(state, |log| log.record_focus(task, secs, now));
        }
    }

    fn flush(&self, state: &AppState) -> Result<()> {
        let guard = self.log.lock().unwrap();
        match guard.as_ref() {
            Some(log) => state.save_sealed(&store::activity_path(&state.dir), ACTIVITY_AAD, log),
            None => Ok(()),
        }
    }
}

/// What one tick saw.
#[derive(Debug, PartialEq)]
pub enum Sample {
    App(String),
    Idle,
    Unknown,
}

/// One tick: what to record given the OS answers. Pure so the idle rule has a test.
pub fn sample(foreground: impl FnOnce() -> Option<String>, idle_secs: Option<u64>) -> Sample {
    if idle_secs.is_some_and(|s| s >= IDLE_LIMIT_SECS) {
        return Sample::Idle;
    }
    foreground().map_or(Sample::Unknown, Sample::App)
}

/// What a full-screen app is recorded as when its process cannot be named at all (some anti-cheat drivers).
pub const FULLSCREEN_APP: &str = "fullscreen";

/// An unnamed foreground app that Windows says is running full screen still counts, under a generic name.
pub fn or_fullscreen(name: Option<String>, notification_state: Option<i32>) -> Option<String> {
    name.or_else(|| fullscreen_guard::busy(notification_state).then(|| FULLSCREEN_APP.to_string()))
}

pub fn watch(app: AppHandle) {
    std::thread::spawn(move || {
        let mut last_flush = 0;
        loop {
            std::thread::sleep(Duration::from_secs(INTERVAL_SECS as u64));
            let (Some(state), Some(act)) = (app.try_state::<AppState>(), app.try_state::<ActivityState>()) else {
                continue;
            };
            if !act.enabled() || !state.is_unlocked() {
                act.drop_log();
                continue;
            }
            let now = now_ms() / 1000;
            let foreground =
                || or_fullscreen(activity_os::foreground_app(), fullscreen_guard::user_notification_state());
            let seen = sample(foreground, activity_os::idle_secs());
            let recorded = act.with_log(&state, |log| match seen {
                Sample::App(name) => log.record(Some(&name), now),
                Sample::Idle => log.record_idle(now),
                Sample::Unknown => {}
            });
            if recorded.is_ok() && now - last_flush >= FLUSH_SECS {
                last_flush = now;
                if let Err(e) = act.flush(&state) {
                    eprintln!("atividade nao gravou: {e}");
                }
            }
        }
    });
}

#[derive(Serialize)]
pub struct ActivityStatus {
    /// The OS gave an answer to "which app has focus"; Wayland, for one, does not.
    pub supported: bool,
    pub enabled: bool,
}

#[tauri::command(async)]
pub fn activity_status(act: State<'_, ActivityState>) -> ActivityStatus {
    ActivityStatus {
        supported: cfg!(any(windows, target_os = "macos")) || activity_os::foreground_app().is_some(),
        enabled: act.enabled(),
    }
}

#[tauri::command(async)]
pub fn activity_set_enabled(state: State<'_, AppState>, act: State<'_, ActivityState>, enabled: bool) -> Result<()> {
    if !state.is_unlocked() {
        return Err(AppError::Locked);
    }
    store::write_json_atomic(&state.dir.join(PREFS_FILE), &Prefs { enabled })?;
    act.enabled.store(enabled, Ordering::Relaxed);
    if !enabled {
        act.flush(&state)?;
        act.drop_log();
    }
    Ok(())
}

pub fn valid_window(from_ms: i64, to_ms: i64) -> Result<()> {
    if from_ms < to_ms && to_ms - from_ms <= MAX_WINDOW_MS {
        Ok(())
    } else {
        Err(AppError::Config("período inválido".into()))
    }
}

#[tauri::command(async)]
pub fn activity_summary(
    state: State<'_, AppState>,
    act: State<'_, ActivityState>,
    from_ms: i64,
    to_ms: i64,
) -> Result<Summary> {
    valid_window(from_ms, to_ms)?;
    state.touch();
    // Reads what the sampler has, or the file when it has not run yet since the unlock.
    let (from, to) = (from_ms.div_euclid(1000), to_ms.div_euclid(1000));
    let mut summary = act.with_log(&state, |log| summarize(log, from, to))?;
    if !summary.focus.is_empty() {
        state.read(|d| {
            for f in &mut summary.focus {
                f.title = d.tasks.iter().find(|t| t.id == f.task).map(|t| t.title.clone());
            }
        })?;
    }
    Ok(summary)
}

/// Deletes every recorded span, in RAM and on disk; sampling continues if it is still on.
#[tauri::command(async)]
pub fn activity_clear(state: State<'_, AppState>, act: State<'_, ActivityState>) -> Result<()> {
    if !state.is_unlocked() {
        return Err(AppError::Locked);
    }
    state.touch();
    act.with_log(&state, Log::clear)?;
    match std::fs::remove_file(store::activity_path(&state.dir)) {
        Err(e) if e.kind() != std::io::ErrorKind::NotFound => Err(e.into()),
        _ => Ok(()),
    }
}

#[cfg(test)]
#[path = "activity_watch_tests.rs"]
mod tests;
