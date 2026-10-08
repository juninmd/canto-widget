//! The user's endpoints, their readings and the timer that takes them. Endpoints are sealed on disk (hosts can be
//! internal); readings stay in memory. Nothing runs while the vault is locked, because the list is sealed.
use std::collections::{HashMap, HashSet, VecDeque};
use std::sync::Mutex;
use std::time::Duration;

use serde::Serialize;
use tauri::{AppHandle, Manager};

use crate::calendar::AgendaItem;
use crate::error::Result;
use crate::health::{self, Alert, AlertKind, Endpoint, Health, Sample, Tracker};
use crate::notification::STATUS_PREFIX;
use crate::store;
use crate::vault::AppState;

const TICK: Duration = Duration::from_secs(5);

#[derive(Default)]
struct Inner {
    loaded: bool,
    endpoints: Vec<Endpoint>,
    history: HashMap<String, VecDeque<Sample>>,
    trackers: HashMap<String, Tracker>,
    running: HashSet<String>,
}

#[derive(Default)]
pub struct HealthState(Mutex<Inner>);

/// What the UI draws for one endpoint.
#[derive(Serialize)]
pub struct View {
    pub endpoint: Endpoint,
    pub health: Health,
    pub samples: Vec<Sample>,
}

impl HealthState {
    pub fn ensure_loaded(&self, state: &AppState) -> Result<()> {
        let mut inner = self.0.lock().unwrap();
        if !inner.loaded {
            inner.endpoints = state.sealed(&store::health_path(&state.dir), health::AAD)?.unwrap_or_default();
            inner.loaded = true;
        }
        Ok(())
    }

    /// Forgets everything held in memory so the next unlock reads the file again.
    pub fn reset(&self) {
        *self.0.lock().unwrap() = Inner::default();
    }

    pub fn views(&self) -> Vec<View> {
        let inner = self.0.lock().unwrap();
        inner
            .endpoints
            .iter()
            .map(|ep| {
                let history = inner.history.get(&ep.id).cloned().unwrap_or_default();
                View { endpoint: ep.clone(), health: health::health(ep, &history), samples: history.into() }
            })
            .collect()
    }

    pub fn find(&self, id: &str) -> Option<Endpoint> {
        self.0.lock().unwrap().endpoints.iter().find(|e| e.id == id).cloned()
    }

    /// Adds or replaces (by id) and persists; an edited target starts a fresh history.
    pub fn save(&self, state: &AppState, mut ep: Endpoint) -> Result<()> {
        ep = health::validate(ep)?;
        let mut inner = self.0.lock().unwrap();
        match inner.endpoints.iter().position(|e| e.id == ep.id && !ep.id.is_empty()) {
            Some(i) => {
                if inner.endpoints[i].target != ep.target {
                    inner.history.remove(&ep.id);
                    inner.trackers.remove(&ep.id);
                }
                inner.endpoints[i] = ep;
            }
            None => {
                if inner.endpoints.len() >= health::MAX_ENDPOINTS {
                    return Err(crate::error::AppError::Config(format!(
                        "no máximo {} endpoints",
                        health::MAX_ENDPOINTS
                    )));
                }
                ep.id = crate::commands::new_id();
                inner.endpoints.push(ep);
            }
        }
        state.save_sealed(&store::health_path(&state.dir), health::AAD, &inner.endpoints)
    }

    pub fn remove(&self, state: &AppState, id: &str) -> Result<()> {
        let mut inner = self.0.lock().unwrap();
        inner.endpoints.retain(|e| e.id != id);
        inner.history.remove(id);
        inner.trackers.remove(id);
        state.save_sealed(&store::health_path(&state.dir), health::AAD, &inner.endpoints)
    }

    /// Endpoints whose last reading is older than their interval and that no probe is already taking.
    fn due(&self, now_ms: i64) -> Vec<Endpoint> {
        let mut inner = self.0.lock().unwrap();
        let due: Vec<Endpoint> = inner
            .endpoints
            .iter()
            .filter(|e| !inner.running.contains(&e.id))
            .filter(|e| {
                inner
                    .history
                    .get(&e.id)
                    .and_then(|h| h.back())
                    .is_none_or(|s| now_ms - s.at >= e.every_secs as i64 * 1000)
            })
            .cloned()
            .collect();
        inner.running.extend(due.iter().map(|e| e.id.clone()));
        due
    }

    /// Stores a reading and returns the alerts it triggers; a reading for a removed endpoint is dropped.
    pub fn record(&self, ep: &Endpoint, sample: Sample) -> Vec<Alert> {
        let mut inner = self.0.lock().unwrap();
        inner.running.remove(&ep.id);
        let Some(current) = inner.endpoints.iter().find(|e| e.id == ep.id).cloned() else { return Vec::new() };
        let history = inner.history.entry(ep.id.clone()).or_default();
        health::push(history, sample);
        let history = history.clone();
        inner.trackers.entry(ep.id.clone()).or_default().observe(&current, &history)
    }
}

/// Goes through the window alert like the Status API's: a notification swallowed by focus mode must leave a trace.
pub fn alert_event(ep: &Endpoint, alert: &Alert) -> AgendaItem {
    let (tag, description) = match alert.kind {
        AlertKind::Down => ("major", format!("{} {}", crate::lang::tr("fora do ar:", "down:"), alert.reason)),
        AlertKind::Slow => {
            ("minor", format!("{} {}", crate::lang::tr("latência alta:", "high latency:"), alert.reason))
        }
        AlertKind::Cert => {
            let days: i64 = alert.reason.parse().unwrap_or(0);
            let text = if days < 0 {
                crate::lang::tr("certificado expirado", "certificate expired").to_string()
            } else {
                format!(
                    "{} {days} {}",
                    crate::lang::tr("certificado vence em", "certificate expires in"),
                    crate::lang::tr("dias", "days")
                )
            };
            ("minor", text)
        }
    };
    AgendaItem {
        id: format!("{STATUS_PREFIX}health-{}", ep.id),
        title: ep.name.clone(),
        description,
        start: chrono::Utc::now().to_rfc3339(),
        tag: tag.into(),
        ..Default::default()
    }
}

pub fn watch(app: AppHandle) {
    std::thread::spawn(move || loop {
        std::thread::sleep(TICK);
        let (Some(state), Some(health)) = (app.try_state::<AppState>(), app.try_state::<HealthState>()) else {
            continue;
        };
        if !state.is_unlocked() {
            health.reset();
            continue;
        }
        if health.ensure_loaded(&state).is_err() {
            continue;
        }
        for ep in health.due(crate::model::now_ms()) {
            let app = app.clone();
            std::thread::spawn(move || {
                let sample = crate::health_probe::probe(&ep, crate::model::now_ms());
                let Some(health) = app.try_state::<HealthState>() else { return };
                for alert in health.record(&ep, sample) {
                    let _ = crate::window::open_alert(&app, alert_event(&ep, &alert));
                }
            });
        }
    });
}

#[cfg(test)]
#[path = "health_watch_tests.rs"]
mod tests;
