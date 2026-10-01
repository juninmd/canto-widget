//! Opt-in OS notifications when a Status API service goes down or degrades. Only services with a current
//! state (Statuspage's endpoint or a per-component state log) can be watched; plain history can't say "now".
//! Public data and no vault access: keeps working while the vault is locked.
use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use std::time::Duration;

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, State};

use crate::calendar::AgendaItem;
use crate::error::{AppError, Result};
use crate::notification::STATUS_PREFIX;
use crate::status_feed::{Source, SOURCES};
use crate::status_live::{self, Live};

const TICK: Duration = Duration::from_secs(3 * 60);
const FILE: &str = "status_alertas.json";

#[derive(Default, Serialize, Deserialize)]
struct Saved {
    ids: Vec<String>,
}

/// Watched service ids, persisted next to the vault (not secret: which public status pages to poll).
pub struct StatusAlerts {
    path: PathBuf,
    ids: Mutex<HashSet<String>>,
}

impl StatusAlerts {
    pub fn load(dir: &Path) -> Self {
        let path = dir.join(FILE);
        let saved: Saved = crate::store::read_json(&path).ok().flatten().unwrap_or_default();
        let ids = saved.ids.into_iter().filter(|id| watchable(id)).collect();
        Self { path, ids: Mutex::new(ids) }
    }

    fn snapshot(&self) -> Vec<String> {
        let mut ids: Vec<String> = self.ids.lock().unwrap().iter().cloned().collect();
        ids.sort();
        ids
    }
}

pub fn watchable(id: &str) -> bool {
    SOURCES
        .iter()
        .any(|s| s.id == id && (status_live::url_for(s.url).is_some() || crate::status_derived::derives(s.id)))
}

fn severity(indicator: &str) -> u8 {
    match indicator {
        "minor" => 1,
        "major" => 2,
        "critical" => 3,
        _ => 0,
    }
}

/// Notify when a service gets worse into a degraded or down state, including the first reading after the
/// watch starts; staying the same, improving or going into maintenance stays quiet.
pub fn worsened(previous: Option<&str>, current: &str) -> bool {
    severity(current) > previous.map_or(0, severity)
}

#[tauri::command]
pub fn status_alerts_get(alerts: State<'_, StatusAlerts>) -> Vec<String> {
    alerts.snapshot()
}

#[tauri::command(async)]
pub fn status_alerts_set(alerts: State<'_, StatusAlerts>, ids: Vec<String>) -> Result<Vec<String>> {
    if let Some(bad) = ids.iter().find(|id| !watchable(id)) {
        return Err(AppError::Config(format!("serviço sem status ao vivo: {bad}")));
    }
    *alerts.ids.lock().unwrap() = ids.into_iter().collect();
    let saved = Saved { ids: alerts.snapshot() };
    crate::store::write_json_atomic(&alerts.path, &saved)?;
    Ok(saved.ids)
}

pub fn watch(app: AppHandle) {
    std::thread::spawn(move || {
        let mut last: HashMap<String, String> = HashMap::new();
        loop {
            let ids = app.state::<StatusAlerts>().snapshot();
            last.retain(|id, _| ids.contains(id));
            if !ids.is_empty() {
                if let Ok(client) =
                    crate::net::client_builder().user_agent("canto-widget").timeout(Duration::from_secs(10)).build()
                {
                    for source in SOURCES.iter().filter(|s| ids.iter().any(|id| id == s.id)) {
                        // A failed call keeps the last reading: no alert storm when the network drops.
                        let Some(live) = crate::status_feed::current(&client, source) else { continue };
                        if worsened(last.get(source.id).map(String::as_str), &live.indicator) {
                            let _ = crate::window::open_alert(&app, alert_event(source, &live));
                        }
                        last.insert(source.id.to_string(), live.indicator);
                    }
                }
            }
            std::thread::sleep(TICK);
        }
    });
}

/// Goes through the window alert, not only the OS: a notification swallowed by focus mode left no trace at all.
pub fn alert_event(source: &Source, live: &Live) -> AgendaItem {
    AgendaItem {
        id: format!("{STATUS_PREFIX}{}", source.id),
        title: source.label.to_string(),
        description: live.description.clone(),
        // When it was seen worse, so the overlay can say for how long; `tag` is Statuspage's indicator.
        start: chrono::Utc::now().to_rfc3339(),
        tag: live.indicator.clone(),
        link: page_url(source.url),
        ..Default::default()
    }
}

/// The status page itself: the feed's scheme and host.
fn page_url(feed_url: &str) -> String {
    let host_end = feed_url.find("://").map_or(0, |i| i + 3);
    let end = feed_url[host_end..].find('/').map_or(feed_url.len(), |i| host_end + i);
    feed_url[..end].to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn notifies_only_when_a_service_gets_worse() {
        assert!(worsened(None, "minor"), "already degraded when the watch starts");
        assert!(worsened(Some("none"), "major"));
        assert!(worsened(Some("minor"), "critical"));
        assert!(!worsened(Some("minor"), "minor"), "still degraded: no repeat");
        assert!(!worsened(Some("major"), "minor"), "improving");
        assert!(!worsened(None, "none"));
        assert!(!worsened(Some("none"), "maintenance"), "planned maintenance is not an outage");
    }

    #[test]
    fn a_worse_service_becomes_a_window_alert_linking_its_page() {
        let github = SOURCES.iter().find(|s| s.id == "github").unwrap();
        let live = Live { indicator: "major".into(), description: "Partial System Outage".into() };
        let event = alert_event(github, &live);
        assert_eq!(event.id, "status:github");
        assert_eq!(event.title, "GitHub");
        assert_eq!(event.description, "Partial System Outage");
        assert_eq!(event.link, "https://www.githubstatus.com");
        assert_eq!(crate::notification::content(&event).0, "Serviço com problema");
    }

    #[test]
    fn only_services_with_a_current_state_can_be_watched() {
        assert!(watchable("github") && watchable("azion"));
        assert!(watchable("magalu"), "state derived from its per-component feed");
        assert!(!watchable("aws") && !watchable("gcp"), "history only");
        assert!(!watchable("nope"));
    }

    #[test]
    fn the_choice_survives_a_restart_and_drops_unknown_ids() {
        let dir = std::env::temp_dir().join(format!("canto-status-alerts-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        std::fs::write(dir.join(FILE), r#"{"ids":["github","aws","nope"]}"#).unwrap();
        let alerts = StatusAlerts::load(&dir);
        assert_eq!(alerts.snapshot(), ["github"]);
        *alerts.ids.lock().unwrap() = ["azion".to_string(), "github".to_string()].into();
        crate::store::write_json_atomic(&alerts.path, &Saved { ids: alerts.snapshot() }).unwrap();
        assert_eq!(StatusAlerts::load(&dir).snapshot(), ["azion", "github"]);
        std::fs::remove_dir_all(&dir).unwrap();
    }
}
