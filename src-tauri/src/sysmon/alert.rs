//! Opt-in alerts about the machine itself, rung through the same pop-up as the weather ones. Each kind waits its own
//! cooldown before ringing again (sooner only if it turns severe); the choice and what rang live next to the vault.
use std::collections::{BTreeMap, VecDeque};
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use std::time::Duration;

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, State};

use crate::calendar::AgendaItem;
use crate::error::{AppError, Result};
use crate::notification::SYSTEM_PREFIX;
use crate::resilient::LockExt;
use crate::sysmon::hints::{hints, Hint, CPU_MINUTES, KINDS};
use crate::sysmon::SystemMonitor;

const FILE: &str = "sistema_alertas.json";
const TICK: Duration = Duration::from_secs(60);
const MINUTE: i64 = 60_000;

/// A full disk or a worn battery doesn't change by the hour; a dying battery does.
fn cooldown(kind: &str) -> i64 {
    match kind {
        "battery_low" => 30 * MINUTE,
        "disk" => 6 * 60 * MINUTE,
        "battery_health" => 7 * 24 * 60 * MINUTE,
        _ => 60 * MINUTE,
    }
}

#[derive(Default, Clone, Serialize, Deserialize)]
struct Saved {
    #[serde(default)]
    kinds: Vec<String>,
    /// Kind → (when it rang, in ms; rang as severe).
    #[serde(default)]
    rang: BTreeMap<String, (i64, bool)>,
}

pub struct SystemAlerts {
    path: PathBuf,
    saved: Mutex<Saved>,
}

fn known(kinds: Vec<String>) -> Vec<String> {
    KINDS.iter().filter(|k| kinds.iter().any(|x| x == *k)).map(|k| k.to_string()).collect()
}

/// A switched-on kind rings when it hasn't within its cooldown, or when it got worse since.
fn due(saved: &Saved, all: Vec<Hint>, now: i64) -> Vec<Hint> {
    all.into_iter()
        .filter(|h| saved.kinds.iter().any(|k| k == h.kind))
        .filter(|h| match saved.rang.get(h.kind) {
            Some((at, severe)) => now - at >= cooldown(h.kind) || (h.severe && !severe),
            None => true,
        })
        .collect()
}

impl SystemAlerts {
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

    fn take(&self, all: Vec<Hint>, now: i64) -> Vec<Hint> {
        let mut saved = self.saved.lock_safe();
        let due = due(&saved, all, now);
        if due.is_empty() {
            return due;
        }
        for h in &due {
            saved.rang.insert(h.kind.to_string(), (now, h.severe));
        }
        let _ = crate::store::write_json_atomic(&self.path, &*saved);
        due
    }
}

pub fn alert_event(hint: &Hint) -> AgendaItem {
    AgendaItem {
        id: format!("{SYSTEM_PREFIX}{}", hint.kind),
        title: hint.title.clone(),
        description: hint.body.clone(),
        organizer: hint.value.clone(),
        start: chrono::Utc::now().to_rfc3339(),
        tag: if hint.severe { "severe".into() } else { String::new() },
        ..Default::default()
    }
}

#[tauri::command]
pub fn system_alerts_get(alerts: State<'_, SystemAlerts>) -> Vec<String> {
    alerts.kinds()
}

#[tauri::command(async)]
pub fn system_alerts_set(alerts: State<'_, SystemAlerts>, kinds: Vec<String>) -> Result<Vec<String>> {
    if let Some(bad) = kinds.iter().find(|k| !KINDS.contains(&k.as_str())) {
        return Err(AppError::Config(format!("alerta de sistema desconhecido: {bad}")));
    }
    alerts.set_kinds(kinds)
}

pub fn watch(app: AppHandle) {
    crate::resilient::supervise("system-alert", move || {
        let mut cpu: VecDeque<f32> = VecDeque::with_capacity(CPU_MINUTES + 1);
        loop {
            let alerts = app.state::<SystemAlerts>();
            if alerts.kinds().is_empty() {
                cpu.clear();
            } else {
                let snap = app.state::<SystemMonitor>().read();
                if cpu.len() == CPU_MINUTES {
                    cpu.pop_front();
                }
                cpu.push_back(snap.cpu.usage);
                let window: Vec<f32> = cpu.iter().copied().collect();
                for hint in alerts.take(hints(&snap, &window), crate::model::now_ms()) {
                    let _ = crate::window::open_alert(&app, alert_event(&hint));
                }
            }
            std::thread::sleep(TICK);
        }
    });
}

#[cfg(test)]
mod tests {
    use super::*;

    fn hint(kind: &'static str, severe: bool) -> Hint {
        Hint { kind, severe, title: "t".into(), body: "b".into(), value: "93%".into() }
    }

    fn saved(kinds: &[&str]) -> Saved {
        Saved { kinds: kinds.iter().map(|k| k.to_string()).collect(), rang: BTreeMap::new() }
    }

    #[test]
    fn only_switched_on_kinds_ring() {
        let due = due(&saved(&["disk"]), vec![hint("disk", false), hint("memory", false)], 0);
        assert_eq!(due.iter().map(|h| h.kind).collect::<Vec<_>>(), ["disk"]);
    }

    #[test]
    fn each_kind_waits_its_cooldown_unless_it_gets_worse() {
        let mut s = saved(&["memory", "battery_health"]);
        s.rang.insert("memory".into(), (0, false));
        s.rang.insert("battery_health".into(), (0, false));
        assert!(due(&s, vec![hint("memory", false)], 59 * MINUTE).is_empty());
        assert_eq!(due(&s, vec![hint("memory", true)], 59 * MINUTE).len(), 1, "turned severe");
        assert_eq!(due(&s, vec![hint("memory", false)], 60 * MINUTE).len(), 1);
        assert!(due(&s, vec![hint("battery_health", false)], 6 * 24 * 60 * MINUTE).is_empty(), "a week apart");
    }

    #[test]
    fn the_choice_and_what_rang_survive_a_restart() {
        let dir = std::env::temp_dir().join(format!("canto-system-alerts-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        std::fs::write(dir.join(FILE), r#"{"kinds":["disk","nope","memory"]}"#).unwrap();
        let alerts = SystemAlerts::load(&dir);
        assert_eq!(alerts.kinds(), ["memory", "disk"], "known kinds, in the switches' order");
        assert_eq!(alerts.take(vec![hint("disk", false)], 1000).len(), 1);
        let again = SystemAlerts::load(&dir);
        assert!(again.take(vec![hint("disk", false)], 2000).is_empty());
        assert_eq!(again.set_kinds(vec!["cpu".into()]).unwrap(), ["cpu"]);
        std::fs::remove_dir_all(&dir).unwrap();
    }

    #[test]
    fn a_hint_becomes_a_window_alert() {
        let event = alert_event(&hint("disk", true));
        assert_eq!(event.id, "system:disk");
        assert_eq!(event.tag, "severe");
        assert_eq!(event.organizer, "93%");
        assert_eq!(crate::notification::content(&event).1, "t: b");
    }
}
