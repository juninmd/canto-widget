//! A summary of the day, once each morning: how many meetings and open tasks, review requests waiting and unread
//! mentions. Off by default; rings from Rust (a hidden webview sleeps) inside a window after the chosen hour, so a
//! widget opened at 4 pm does not announce the morning.
use crate::resilient::LockExt;
use std::sync::Mutex;
use std::time::Duration;

use chrono::{Datelike, Local, NaiveDate, NaiveDateTime, NaiveTime, TimeZone, Weekday};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, State};

use crate::calendar::AgendaItem;
use crate::error::Result;
use crate::notification::DIGEST_PREFIX;
use crate::vault::AppState;
use crate::{cmd_extras, cmd_forges, mentions_state::MentionsUnread, routine, window};

const FILE: &str = "resumo_manha.json";
const TICK: Duration = Duration::from_secs(60);
/// After this many hours past the chosen one the day's summary is skipped.
pub const WINDOW_HOURS: u32 = 4;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Config {
    #[serde(default)]
    pub enabled: bool,
    /// Local hour, 0..=23.
    #[serde(default = "default_hour")]
    pub hour: u32,
    #[serde(default = "yes")]
    pub weekdays_only: bool,
}

fn default_hour() -> u32 {
    9
}

fn yes() -> bool {
    true
}

impl Default for Config {
    fn default() -> Self {
        Self { enabled: false, hour: default_hour(), weekdays_only: true }
    }
}

#[derive(Default, Serialize, Deserialize)]
struct Saved {
    #[serde(flatten)]
    config: Config,
    /// Local day ("YYYY-MM-DD") the summary last rang for, so a restart never repeats it.
    #[serde(default)]
    last_day: String,
}

/// Settings persisted next to the vault; not secret, a switch, an hour and a date.
pub struct MorningDigest {
    path: std::path::PathBuf,
    saved: Mutex<Saved>,
}

impl MorningDigest {
    pub fn load(dir: &std::path::Path) -> Self {
        let path = dir.join(FILE);
        let saved: Option<Saved> = crate::store::read_json(&path).ok().flatten();
        Self { path, saved: Mutex::new(saved.unwrap_or_default()) }
    }

    pub fn get(&self) -> Config {
        self.saved.lock_safe().config.clone()
    }

    fn set(&self, mut config: Config) -> Result<Config> {
        config.hour = config.hour.min(23);
        let mut saved = self.saved.lock_safe();
        saved.config = config.clone();
        crate::store::write_json_atomic(&self.path, &*saved)?;
        Ok(config)
    }

    fn last_day(&self) -> String {
        self.saved.lock_safe().last_day.clone()
    }

    fn rang(&self, day: &str) -> Result<()> {
        let mut saved = self.saved.lock_safe();
        saved.last_day = day.to_string();
        crate::store::write_json_atomic(&self.path, &*saved)
    }
}

#[tauri::command]
pub fn morning_digest_get(digest: State<'_, MorningDigest>) -> Config {
    digest.get()
}

#[tauri::command(async)]
pub fn morning_digest_set(digest: State<'_, MorningDigest>, config: Config) -> Result<Config> {
    digest.set(config)
}

/// Time to ring: switched on, a day the user wants it, not yet rung today, and inside the window.
pub fn due(now: NaiveDateTime, cfg: &Config, last_day: &str) -> bool {
    if !cfg.enabled || last_day == day_key(now.date()) {
        return false;
    }
    if cfg.weekdays_only && matches!(now.weekday(), Weekday::Sat | Weekday::Sun) {
        return false;
    }
    let from = NaiveTime::from_hms_opt(cfg.hour.min(23), 0, 0).unwrap_or_default();
    let (start, end) =
        (now.date().and_time(from), now.date().and_time(from) + chrono::Duration::hours(WINDOW_HOURS.into()));
    now >= start && now < end
}

pub fn day_key(d: NaiveDate) -> String {
    d.format("%Y-%m-%d").to_string()
}

#[derive(Debug, Default, Clone, PartialEq)]
pub struct Counts {
    pub meetings: usize,
    /// "HH:MM", local, of the first one still to come.
    pub first_meeting: Option<String>,
    pub tasks: usize,
    pub reviews: u64,
    pub mentions: u32,
}

impl Counts {
    pub fn is_empty(&self) -> bool {
        self.meetings == 0 && self.tasks == 0 && self.reviews == 0 && self.mentions == 0
    }
}

fn plural(n: u64, one: &str, many: &str) -> String {
    format!("{n} {}", if n == 1 { one } else { many })
}

/// One line per thing that has something to say; what is zero stays out.
pub fn lines(c: &Counts, en: bool) -> Vec<String> {
    let (m, t, r, u) = (c.meetings as u64, c.tasks as u64, c.reviews, u64::from(c.mentions));
    let mut out = Vec::new();
    if m > 0 {
        let first = c.first_meeting.as_deref().map(|h| {
            if en {
                format!(", first at {h}")
            } else {
                format!(", a primeira às {h}")
            }
        });
        let head = if en { plural(m, "meeting", "meetings") } else { plural(m, "reunião", "reuniões") };
        out.push(format!("{head}{}", first.unwrap_or_default()));
    }
    if t > 0 {
        out.push(if en { plural(t, "open task", "open tasks") } else { plural(t, "tarefa aberta", "tarefas abertas") });
    }
    if r > 0 {
        out.push(if en {
            plural(r, "review requested", "reviews requested")
        } else {
            plural(r, "revisão pedida", "revisões pedidas")
        });
    }
    if u > 0 {
        out.push(if en {
            plural(u, "unread mention", "unread mentions")
        } else {
            plural(u, "menção não lida", "menções não lidas")
        });
    }
    out
}

/// `None` when there is nothing to say: an empty day does not need an alert.
pub fn event(day: &str, c: &Counts, en: bool) -> Option<AgendaItem> {
    if c.is_empty() {
        return None;
    }
    Some(AgendaItem {
        id: format!("{DIGEST_PREFIX}morning:{day}"),
        title: if en { "Day summary".into() } else { "Resumo do dia".into() },
        description: lines(c, en).join("\n"),
        tag: "digest".into(),
        ..Default::default()
    })
}

/// Meetings of the local day that are not all-day or declined, and the first one not yet over.
pub fn meetings(items: &[AgendaItem], now_ms: i64) -> (usize, Option<String>) {
    let mut starts: Vec<(i64, i64)> = items
        .iter()
        .filter(|e| !e.all_day && e.response != "declined")
        .filter_map(|e| Some((crate::meeting_alert::start_ms(e)?, end_ms(e))))
        .collect();
    starts.sort_unstable();
    let first = starts.iter().find(|(s, e)| *e > now_ms || (*e == 0 && *s >= now_ms)).and_then(|(s, _)| {
        chrono::DateTime::from_timestamp_millis(*s).map(|t| t.with_timezone(&Local).format("%H:%M").to_string())
    });
    (starts.len(), first)
}

fn end_ms(e: &AgendaItem) -> i64 {
    chrono::DateTime::parse_from_rfc3339(&e.end).map_or(0, |t| t.timestamp_millis())
}

fn day_bounds(day: NaiveDate) -> Option<(String, String)> {
    let local = |d: NaiveDate| Local.from_local_datetime(&d.and_hms_opt(0, 0, 0)?).earliest();
    let (a, b) = (local(day)?, local(day.succ_opt()?)?);
    Some((a.to_utc().to_rfc3339(), b.to_utc().to_rfc3339()))
}

fn gather(app: &AppHandle, state: &AppState, day: NaiveDate, now_ms: i64) -> Counts {
    let key = day_key(day);
    let (meetings, first_meeting) = day_bounds(day)
        .and_then(|(from, to)| cmd_extras::agenda(state, &from, &to, 50).ok())
        .map_or((0, None), |items| meetings(&items, now_ms));
    Counts {
        meetings,
        first_meeting,
        tasks: routine::open_count(state, &key).unwrap_or(0),
        reviews: cmd_forges::review_requested_total(app),
        mentions: app.state::<MentionsUnread>().count(),
    }
}

pub fn watch(app: AppHandle) {
    crate::resilient::supervise("morning-digest", move || loop {
        std::thread::sleep(TICK);
        let state = app.state::<AppState>();
        let digest = app.state::<MorningDigest>();
        let now = Local::now().naive_local();
        if !state.is_unlocked() || !due(now, &digest.get(), &digest.last_day()) {
            continue;
        }
        // Not marked as rung: do-not-disturb ending inside the window still gets the summary.
        if crate::do_not_disturb::quiet(&app) {
            continue;
        }
        // Marked first: a failed ring must not be retried every minute for the rest of the window.
        if digest.rang(&day_key(now.date())).is_err() {
            continue;
        }
        let counts = gather(&app, &state, now.date(), crate::model::now_ms());
        if let Some(e) = event(&day_key(now.date()), &counts, crate::lang::english()) {
            let _ = window::open_alert(&app, e);
        }
    });
}

#[cfg(test)]
#[path = "morning_digest_tests.rs"]
mod tests;
