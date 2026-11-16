//! Focus mode: do not disturb that switches itself on, by a daily schedule or while a meeting is under way, and
//! the summary of what it held back. The manual do-not-disturb (`do_not_disturb.rs`) keeps working as before; this
//! module only adds more reasons for `do_not_disturb::quiet` to say yes.
//! Rust can't trust its own timezone (see AGENTS.md), so the UI pushes the UTC offset along with the schedule.
//! What was held back stays in memory only: meeting and PR titles are as sensitive as the agenda.
use crate::resilient::LockExt;
use std::path::{Path, PathBuf};
use std::sync::Mutex;

use serde::{Deserialize, Serialize};
use tauri::{Emitter, Manager, State};
use time::format_description::well_known::Rfc3339;
use time::{OffsetDateTime, Weekday};

use crate::calendar::AgendaItem;
use crate::error::{AppError, Result};
use crate::model::now_ms;

const FILE: &str = "modo_foco.json";
pub const SUMMARY_EVENT: &str = "canto://focus-summary";
/// A day of held alerts is a few dozen; the bound only protects a long-running widget.
pub const MAX_HELD: usize = 50;
const MINUTES_PER_DAY: u16 = 24 * 60;
/// Real offsets run from UTC-12 to UTC+14.
const MAX_OFFSET_MIN: i32 = 14 * 60;

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(default)]
pub struct Config {
    /// Silence by the daily schedule below.
    pub schedule: bool,
    /// Minutes after local midnight; an end before the start means the window crosses midnight.
    pub start_min: u16,
    pub end_min: u16,
    pub weekdays_only: bool,
    /// Silence while a calendar event with a video-call link is under way.
    pub in_meeting: bool,
    /// Minutes east of UTC, as the UI last saw them.
    pub offset_min: i32,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            schedule: false,
            start_min: 9 * 60,
            end_min: 12 * 60,
            weekdays_only: true,
            in_meeting: false,
            offset_min: 0,
        }
    }
}

impl Config {
    pub fn validate(self) -> Result<Self> {
        if self.start_min >= MINUTES_PER_DAY || self.end_min >= MINUTES_PER_DAY || self.start_min == self.end_min {
            return Err(AppError::Config("horário do modo foco inválido".into()));
        }
        if self.offset_min.abs() > MAX_OFFSET_MIN {
            return Err(AppError::Config("fuso horário inválido".into()));
        }
        Ok(self)
    }
}

fn is_workday(day: Weekday) -> bool {
    !matches!(day, Weekday::Saturday | Weekday::Sunday)
}

/// Whether the schedule covers `now_ms`. After midnight, a window that started yesterday follows yesterday's weekday.
pub fn schedule_active(cfg: &Config, now_ms: i64) -> bool {
    if !cfg.schedule {
        return false;
    }
    let local_secs = now_ms.div_euclid(1000) + i64::from(cfg.offset_min) * 60;
    let Ok(local) = OffsetDateTime::from_unix_timestamp(local_secs) else { return false };
    let minute = u16::from(local.hour()) * 60 + u16::from(local.minute());
    let (start, end) = (cfg.start_min, cfg.end_min);
    let (inside, started_yesterday) = if start < end {
        (minute >= start && minute < end, false)
    } else {
        (minute >= start || minute < end, minute < end)
    };
    if !inside {
        return false;
    }
    let day = if started_yesterday { local.weekday().previous() } else { local.weekday() };
    !cfg.weekdays_only || is_workday(day)
}

fn ms_of(rfc3339: &str) -> Option<i64> {
    OffsetDateTime::parse(rfc3339, &Rfc3339).ok().map(|t| t.unix_timestamp() * 1000)
}

/// A timed event with a call link whose start has passed and whose end has not.
pub fn meeting_under_way(items: &[AgendaItem], now_ms: i64) -> bool {
    items.iter().any(|e| {
        !e.all_day
            && !e.meet.is_empty()
            && matches!((ms_of(&e.start), ms_of(&e.end)), (Some(s), Some(end)) if s <= now_ms && now_ms < end)
    })
}

#[derive(Clone, Debug, PartialEq, Serialize)]
pub struct Held {
    pub title: String,
    /// Unix milliseconds.
    pub at: i64,
}

pub struct FocusMode {
    path: PathBuf,
    config: Mutex<Config>,
    held: Mutex<Vec<Held>>,
}

impl FocusMode {
    pub fn load(dir: &Path) -> Self {
        let path = dir.join(FILE);
        let config = crate::store::read_json::<Config>(&path).ok().flatten().and_then(|c| c.validate().ok());
        Self { path, config: Mutex::new(config.unwrap_or_default()), held: Mutex::new(Vec::new()) }
    }

    pub fn config(&self) -> Config {
        *self.config.lock_safe()
    }

    pub fn set(&self, config: Config) -> Result<Config> {
        let config = config.validate()?;
        crate::store::write_json_atomic(&self.path, &config)?;
        *self.config.lock_safe() = config;
        Ok(config)
    }

    /// Only the offset changes (the UI re-reads it at every start: daylight saving time moves it).
    pub fn set_offset(&self, offset_min: i32) -> Result<Config> {
        let mut config = self.config();
        if config.offset_min == offset_min {
            return Ok(config);
        }
        config.offset_min = offset_min;
        self.set(config)
    }

    pub fn hold(&self, title: &str, at: i64) {
        let mut held = self.held.lock_safe();
        held.push(Held { title: title.to_string(), at });
        let extra = held.len().saturating_sub(MAX_HELD);
        held.drain(..extra);
    }

    /// What was held back since the last call; asking empties it, so a summary is shown once.
    pub fn take_held(&self) -> Vec<Held> {
        std::mem::take(&mut *self.held.lock_safe())
    }

    pub fn rule_active(&self, items: &[AgendaItem], now_ms: i64) -> bool {
        let cfg = self.config();
        schedule_active(&cfg, now_ms) || (cfg.in_meeting && meeting_under_way(items, now_ms))
    }
}

/// True when the schedule or a running meeting asks for silence right now.
pub fn rule_active(app: &tauri::AppHandle) -> bool {
    let Some(focus) = app.try_state::<FocusMode>() else { return false };
    let items = app.try_state::<crate::meeting_cache::Upcoming>().map(|u| u.items()).unwrap_or_default();
    focus.rule_active(&items, now_ms())
}

/// Remembers an alert the gate turned away, for the summary.
pub fn hold(app: &tauri::AppHandle, title: &str) {
    if let Some(focus) = app.try_state::<FocusMode>() {
        focus.hold(title, now_ms());
    }
}

/// Called by the watcher when silence ends: the summary goes to the webview, which shows it once.
pub fn announce_end(app: &tauri::AppHandle) {
    let Some(focus) = app.try_state::<FocusMode>() else { return };
    let held = focus.take_held();
    if !held.is_empty() {
        let _ = app.emit(SUMMARY_EVENT, held);
    }
}

#[tauri::command(async)]
pub fn focus_get(focus: State<'_, FocusMode>) -> Config {
    focus.config()
}

#[tauri::command(async)]
pub fn focus_set(focus: State<'_, FocusMode>, config: Config) -> Result<Config> {
    focus.set(config)
}

#[tauri::command(async)]
pub fn focus_offset(focus: State<'_, FocusMode>, offset_min: i32) -> Result<Config> {
    focus.set_offset(offset_min)
}

/// What was held back, for a webview that was asleep when the end was announced.
#[tauri::command(async)]
pub fn focus_summary(focus: State<'_, FocusMode>) -> Vec<Held> {
    focus.take_held()
}

#[cfg(test)]
#[path = "focus_mode_tests.rs"]
mod tests;
