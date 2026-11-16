//! What the pill shows, read from what the app already keeps in RAM: nothing here asks a network or the disk.
use serde::Serialize;
use tauri::{AppHandle, Manager};
use time::format_description::well_known::Rfc3339;

use crate::calendar::AgendaItem;
use crate::resilient::LockExt;
use crate::strip::{StripConfig, StripState};

#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct NextEvent {
    pub title: String,
    /// Minutes until it starts; 0 while it is under way.
    pub in_min: i64,
    pub meet: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct Weather {
    pub temp: f64,
    pub condition: crate::weather::Condition,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize)]
pub struct Snapshot {
    pub cpu: f32,
    pub memory: f32,
    pub weather: Option<Weather>,
    pub event: Option<NextEvent>,
    pub reviews: u32,
    /// Battery percent and whether it is on the charger; `None` on a desktop without one.
    pub battery: Option<(f32, bool)>,
    /// Tasks still open, as the Tarefas tab last counted them.
    pub tasks: u32,
    /// Alerts waiting plus unread mentions.
    pub notices: u32,
}

fn ms(iso: &str) -> Option<i64> {
    time::OffsetDateTime::parse(iso, &Rfc3339).ok().map(|t| t.unix_timestamp() * 1000)
}

/// First timed event that hasn't ended, in the API's own order; an all-day one is not "next".
pub fn next_event(items: &[AgendaItem], now_ms: i64) -> Option<NextEvent> {
    items.iter().filter(|e| !e.all_day).find_map(|e| {
        let (start, end) = (ms(&e.start)?, ms(&e.end)?);
        (end > now_ms).then(|| NextEvent {
            title: e.title.clone(),
            in_min: ((start - now_ms).max(0) + 59_999) / 60_000,
            meet: !e.meet.is_empty(),
        })
    })
}

/// Only what the user switched on is read: the CPU probe costs a refresh, so a pill without it never pays for one.
pub fn build(app: &AppHandle, cfg: &StripConfig) -> Snapshot {
    let on = |k: &str| cfg.items.iter().any(|i| i == k);
    let mut snap = Snapshot::default();
    if on("cpu") || on("memory") || on("battery") {
        let s = app.state::<crate::sysmon::SystemMonitor>().read();
        snap.cpu = s.cpu.usage;
        snap.memory = crate::sysmon::percent(s.memory.used, s.memory.total);
        snap.battery = s.battery.as_ref().map(|b| (b.percent, matches!(b.state.as_str(), "charging" | "full")));
    }
    if on("tasks") {
        snap.tasks = *app.state::<crate::vault::AppState>().badge_tasks.lock_safe();
    }
    if on("weather") {
        snap.weather = app.state::<crate::weather::state::WeatherState>().cached_now();
    }
    if on("event") {
        let items = app.state::<crate::meeting_cache::Upcoming>().items();
        snap.event = next_event(&items, crate::model::now_ms());
    }
    if on("reviews") {
        snap.reviews = app.state::<StripState>().reviews();
    }
    if on("notices") {
        let alerts = crate::window::alert_list(app).len() as u32;
        snap.notices = alerts + app.state::<crate::mentions::state::MentionsUnread>().count();
    }
    snap
}
