//! What the pill shows, read from what the app already keeps in RAM: nothing here asks a network or the disk.
use serde::Serialize;
use tauri::{AppHandle, Manager};
use time::format_description::well_known::Rfc3339;

use crate::calendar::AgendaItem;
use crate::resilient::LockExt;
use crate::strip::{readings, StripConfig, StripState};

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
pub struct Curves {
    pub cpu: Vec<f32>,
    pub memory: Vec<f32>,
    pub net_down: Vec<u64>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize)]
pub struct Snapshot {
    pub cpu: f32,
    pub memory: f32,
    pub weather: Option<Weather>,
    pub event: Option<NextEvent>,
    pub reviews: u32,
    /// Used % of the system disk.
    pub disk: Option<f32>,
    /// Network bytes per second, down and up.
    pub network: (u64, u64),
    pub gpu: Option<f32>,
    /// CPU temperature in °C; often missing on Windows without elevation.
    pub temp: Option<f32>,
    pub market: Option<readings::Ticker>,
    pub health: readings::Endpoints,
    /// Last minute of CPU, memory and download, only when the charts are on.
    pub history: Option<Curves>,
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

/// Items that need the system probe; one refresh serves them all.
const SYSTEM: [&str; 7] = ["cpu", "memory", "gpu", "temp", "disk", "network", "battery"];

/// Only what the user switched on is read: the CPU probe costs a refresh, so a pill without it never pays for one.
pub fn build(app: &AppHandle, cfg: &StripConfig) -> Snapshot {
    let on = |k: &str| cfg.items.iter().any(|i| i == k);
    let mut snap = Snapshot::default();
    if SYSTEM.iter().any(|k| on(k)) {
        let s = app.state::<crate::sysmon::SystemMonitor>().read();
        snap.cpu = s.cpu.usage;
        snap.memory = crate::sysmon::percent(s.memory.used, s.memory.total);
        snap.battery = s.battery.as_ref().map(|b| (b.percent, matches!(b.state.as_str(), "charging" | "full")));
        snap.disk = readings::system_disk(&s.disks);
        snap.network = (s.network.down_bps, s.network.up_bps);
        snap.gpu = readings::gpu(&s);
        snap.temp = s.cpu.temp_c;
        if cfg.charts {
            let h = s.history;
            snap.history = Some(Curves { cpu: h.cpu, memory: h.memory, net_down: h.net_down });
        }
    }
    if on("market") {
        snap.market = readings::ticker(&app.state::<crate::market::cmd::MarketState>().last_quotes());
    }
    if on("health") {
        let views = app.state::<crate::health::watch::HealthState>().views();
        snap.health = readings::endpoints(views.into_iter().map(|v| v.health));
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
