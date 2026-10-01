//! Opt-in OS notifications when the AI models top 10 changes. Rung from Rust so a hidden webview still gets
//! them; needs the vault unlocked (the config is sealed). Off by default.
use std::time::{Duration, Instant};

use tauri::{AppHandle, Manager};

use crate::calendar::AgendaItem;
use crate::cmd_models::{refresh_and_save, ModelsLock};
use crate::model::now_ms;
use crate::models_rank::{self, Change};
use crate::models_state::ModelsConfig;
use crate::notification::MODEL_PREFIX;
use crate::vault::AppState;

/// Short, so a check happens soon after an unlock; the API itself is read every `CHECK_MS` at most.
const POLL: Duration = Duration::from_secs(60);
pub const CHECK_MS: i64 = 6 * 3_600_000;
/// After a failure with no answer (offline), so the watcher doesn't retry every minute.
const RETRY: Duration = Duration::from_secs(15 * 60);

/// Counted from the last answer the API gave, so a fetch by the tab also pushes the next check back.
pub fn watch_due(cfg: &ModelsConfig, now: i64) -> bool {
    cfg.alerts && (cfg.tried_at == 0 || now - cfg.tried_at >= CHECK_MS || now < cfg.tried_at)
}

/// Rings through the alert window like meetings and outages: a toast swallowed by focus mode left no trace.
pub fn notify(app: &AppHandle, changes: &[Change]) {
    for event in events(changes, crate::lang::english()) {
        let _ = crate::window::open_alert(app, event);
    }
}

/// `en` is a parameter, not `lang::english()`, so tests don't race on a process-wide flag.
pub fn events(changes: &[Change], en: bool) -> Vec<AgendaItem> {
    if changes.len() > models_rank::MAX_EACH {
        let (title, body) = models_rank::messages(changes, en).remove(0);
        return vec![AgendaItem {
            id: format!("{MODEL_PREFIX}summary"),
            title,
            description: body,
            tag: if en { "AI top 10" } else { "Top 10 de IA" }.into(),
            ..Default::default()
        }];
    }
    changes.iter().map(|c| event(c, en)).collect()
}

fn event(change: &Change, en: bool) -> AgendaItem {
    let (_, detail) = models_rank::message(change, en);
    let (name, creator, tag) = match change {
        Change::Entered { name, creator, rank, .. } => (
            name,
            creator.clone(),
            if en { format!("New in the top 10 · #{rank}") } else { format!("Novo no top 10 · #{rank}") },
        ),
        Change::Climbed { name, rank, .. } => {
            (name, String::new(), if en { format!("Rose to #{rank}") } else { format!("Subiu para #{rank}") })
        }
    };
    AgendaItem {
        id: format!("{MODEL_PREFIX}{}", change.id()),
        title: name.clone(),
        organizer: creator,
        description: detail,
        tag,
        ..Default::default()
    }
}

pub fn watch(app: AppHandle) {
    std::thread::spawn(move || {
        let mut failed: Option<Instant> = None;
        loop {
            std::thread::sleep(POLL);
            if !app.state::<AppState>().is_unlocked() || failed.is_some_and(|t| t.elapsed() < RETRY) {
                continue;
            }
            let lock = app.state::<ModelsLock>();
            let _guard = lock.0.lock().unwrap();
            // No `touch()`: a background read must not keep the vault from auto-locking.
            let Ok(Some(cfg)) = app.state::<AppState>().models_config() else { continue };
            if !watch_due(&cfg, now_ms()) {
                continue;
            }
            let tried = cfg.tried_at;
            failed = match refresh_and_save(&app, cfg, false) {
                Ok((cfg, _)) if cfg.tried_at != tried => None,
                _ => Some(Instant::now()),
            };
        }
    });
}

#[cfg(test)]
mod tests {
    use super::*;

    fn cfg(alerts: bool, tried_at: i64) -> ModelsConfig {
        ModelsConfig { alerts, tried_at, ..Default::default() }
    }

    #[test]
    fn checks_every_6_hours_only_with_alerts_on() {
        let t0 = 1_790_000_000_000;
        assert!(!watch_due(&cfg(false, 0), t0), "alerts off by default");
        assert!(watch_due(&cfg(true, 0), t0), "first run seeds right away");
        assert!(!watch_due(&cfg(true, t0), t0 + CHECK_MS - 1));
        assert!(watch_due(&cfg(true, t0), t0 + CHECK_MS));
    }

    #[test]
    fn a_launch_becomes_an_alert_naming_the_model_its_maker_and_rank() {
        let change =
            Change::Entered { id: "m1".into(), name: "Acme-7".into(), creator: "Acme AI".into(), rank: 2, score: 92.5 };
        let [e] = &events(&[change], false)[..] else { panic!("one alert per change") };
        assert_eq!((e.id.as_str(), e.title.as_str(), e.organizer.as_str()), ("model:m1", "Acme-7", "Acme AI"));
        assert_eq!(e.tag, "Novo no top 10 · #2");
        assert!(e.description.contains("92,5"));
    }

    #[test]
    fn a_burst_of_changes_is_one_summary_alert() {
        let many: Vec<Change> = (1..=4)
            .map(|i| Change::Climbed { id: format!("m{i}"), name: format!("M{i}"), rank: i, old: i + 1 })
            .collect();
        let out = events(&many, true);
        assert_eq!(out.len(), 1);
        assert_eq!(out[0].id, "model:summary");
    }
}
