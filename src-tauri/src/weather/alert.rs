//! Opt-in weather alerts for the saved city: each kind rings at most once a day (again only if it turns severe),
//! and only the severe ones ring at night. Public data and no vault: the choice and what rang live next to the
//! vault like the Status API alerts, and the forecast is the Clima tab's own 30-minute cache.
use crate::resilient::LockExt;
use std::collections::BTreeMap;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use std::time::Duration;

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, State};

use crate::calendar::AgendaItem;
use crate::error::{AppError, Result};
use crate::notification::WEATHER_PREFIX;
use crate::weather::hints::{hints, local_date, local_hour, Hint, KINDS};
use crate::weather::state::WeatherState;

const FILE: &str = "clima_alertas.json";
/// Half the forecast cache: a new reading is looked at soon after it lands.
const TICK: Duration = Duration::from_secs(15 * 60);
/// Local hours (of the city) when only severe hints may ring.
const NIGHT_FROM: u32 = 22;
const NIGHT_TO: u32 = 7;

#[derive(Default, Clone, Serialize, Deserialize)]
struct Saved {
    #[serde(default)]
    kinds: Vec<String>,
    /// Kind → (city's local date, rang as severe). Kept on disk so a restart doesn't ring the same thing twice.
    #[serde(default)]
    rang: BTreeMap<String, (String, bool)>,
}

pub struct WeatherAlerts {
    path: PathBuf,
    saved: Mutex<Saved>,
}

fn known(kinds: Vec<String>) -> Vec<String> {
    KINDS.iter().filter(|k| kinds.iter().any(|x| x == *k)).map(|k| k.to_string()).collect()
}

impl WeatherAlerts {
    pub fn load(dir: &Path) -> Self {
        let path = dir.join(FILE);
        let mut saved: Saved = crate::store::read_json(&path).ok().flatten().unwrap_or_default();
        saved.kinds = known(saved.kinds);
        Self { path, saved: Mutex::new(saved) }
    }

    pub fn kinds(&self) -> Vec<String> {
        self.saved.lock_safe().kinds.clone()
    }

    fn set_kinds(&self, kinds: Vec<String>) -> Result<Vec<String>> {
        let mut saved = self.saved.lock_safe();
        saved.kinds = known(kinds);
        crate::store::write_json_atomic(&self.path, &*saved)?;
        Ok(saved.kinds.clone())
    }

    /// The hints that should ring now, marked as rung (and saved) in the same step.
    fn take(&self, all: Vec<Hint>, date: &str, hour: u32) -> Vec<Hint> {
        let mut saved = self.saved.lock_safe();
        let due = due(&saved, all, date, hour);
        if due.is_empty() {
            return due;
        }
        saved.rang.retain(|_, (day, _)| day == date);
        for h in &due {
            saved.rang.insert(h.kind.to_string(), (date.to_string(), h.severe));
        }
        let _ = crate::store::write_json_atomic(&self.path, &*saved);
        due
    }
}

fn night(hour: u32) -> bool {
    !(NIGHT_TO..NIGHT_FROM).contains(&hour)
}

/// A switched-on kind rings once per local day, again the same day only when it turns severe; at night only severe.
fn due(saved: &Saved, all: Vec<Hint>, date: &str, hour: u32) -> Vec<Hint> {
    all.into_iter()
        .filter(|h| saved.kinds.iter().any(|k| k == h.kind))
        .filter(|h| h.severe || !night(hour))
        .filter(|h| match saved.rang.get(h.kind) {
            Some((day, severe)) if day == date => h.severe && !severe,
            _ => true,
        })
        .collect()
}

pub fn alert_event(hint: &Hint) -> AgendaItem {
    AgendaItem {
        id: format!("{WEATHER_PREFIX}{}", hint.kind),
        title: hint.title.clone(),
        description: hint.body.clone(),
        // The pop-up shows it big under the icon; weather alerts have no organizer of their own.
        organizer: hint.value.clone(),
        start: chrono::Utc::now().to_rfc3339(),
        tag: if hint.severe { "severe".into() } else { String::new() },
        ..Default::default()
    }
}

#[tauri::command]
pub fn weather_alerts_get(alerts: State<'_, WeatherAlerts>) -> Vec<String> {
    alerts.kinds()
}

#[tauri::command(async)]
pub fn weather_alerts_set(alerts: State<'_, WeatherAlerts>, kinds: Vec<String>) -> Result<Vec<String>> {
    if let Some(bad) = kinds.iter().find(|k| !KINDS.contains(&k.as_str())) {
        return Err(AppError::Config(format!("alerta de clima desconhecido: {bad}")));
    }
    alerts.set_kinds(kinds)
}

pub fn watch(app: AppHandle) {
    crate::resilient::supervise("weather-alert", move || loop {
        let alerts = app.state::<WeatherAlerts>();
        let weather = app.state::<WeatherState>();
        if !alerts.kinds().is_empty() && weather.place().is_some() {
            // A failed reading rings nothing; the next tick tries again through the same cache as the tab.
            if let Ok(forecast) = weather.forecast(false, crate::model::now_ms(), crate::weather::forecast) {
                for hint in alerts.take(hints(&forecast), &local_date(&forecast), local_hour(&forecast)) {
                    let _ = crate::window::open_alert(&app, alert_event(&hint));
                }
            }
        }
        std::thread::sleep(TICK);
    });
}

#[cfg(test)]
mod tests {
    use super::*;

    fn hint(kind: &'static str, severe: bool) -> Hint {
        Hint { kind, severe, title: "t".into(), body: "b".into(), value: "41°".into() }
    }

    fn saved(kinds: &[&str]) -> Saved {
        Saved { kinds: kinds.iter().map(|k| k.to_string()).collect(), rang: BTreeMap::new() }
    }

    #[test]
    fn only_switched_on_kinds_ring() {
        let s = saved(&["rain"]);
        let due = due(&s, vec![hint("rain", false), hint("heat", false)], "2026-11-01", 9);
        assert_eq!(due.iter().map(|h| h.kind).collect::<Vec<_>>(), ["rain"]);
    }

    #[test]
    fn once_a_day_unless_it_turns_severe() {
        let mut s = saved(&["heat"]);
        s.rang.insert("heat".into(), ("2026-11-01".into(), false));
        assert!(due(&s, vec![hint("heat", false)], "2026-11-01", 10).is_empty(), "already rang today");
        assert_eq!(due(&s, vec![hint("heat", true)], "2026-11-01", 10).len(), 1, "got worse");
        assert_eq!(due(&s, vec![hint("heat", false)], "2026-11-02", 10).len(), 1, "a new day");
        s.rang.insert("heat".into(), ("2026-11-01".into(), true));
        assert!(due(&s, vec![hint("heat", true)], "2026-11-01", 10).is_empty());
    }

    #[test]
    fn at_night_only_severe_hints_ring() {
        let s = saved(&["rain", "storm"]);
        let due = due(&s, vec![hint("rain", false), hint("storm", true)], "2026-11-01", 23);
        assert_eq!(due.iter().map(|h| h.kind).collect::<Vec<_>>(), ["storm"]);
        assert!(night(6) && night(22) && !night(7) && !night(21));
    }

    #[test]
    fn the_choice_and_what_rang_survive_a_restart() {
        let dir = std::env::temp_dir().join(format!("canto-weather-alerts-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        std::fs::write(dir.join(FILE), r#"{"kinds":["rain","nope","heat"]}"#).unwrap();
        let alerts = WeatherAlerts::load(&dir);
        assert_eq!(alerts.kinds(), ["rain", "heat"]);
        assert_eq!(alerts.take(vec![hint("rain", false)], "2026-11-01", 9).len(), 1);
        let again = WeatherAlerts::load(&dir);
        assert!(again.take(vec![hint("rain", false)], "2026-11-01", 9).is_empty());
        assert_eq!(again.set_kinds(vec!["uv".into()]).unwrap(), ["uv"]);
        std::fs::remove_dir_all(&dir).unwrap();
    }

    #[test]
    fn a_hint_becomes_a_window_alert() {
        let event = alert_event(&hint("storm", true));
        assert_eq!(event.id, "weather:storm");
        assert_eq!(event.tag, "severe");
        assert_eq!(event.organizer, "41°");
        assert_eq!(crate::notification::content(&event).1, "t: b");
    }
}
