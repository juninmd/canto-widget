//! Opt-in OS notifications when the AI models top 10 changes. Rung from Rust so a hidden webview still gets
//! them; needs the vault unlocked (the config is sealed). Off by default.
use std::time::{Duration, Instant};

use tauri::{AppHandle, Manager};

use crate::cmd_models::{refresh_and_save, ModelsLock};
use crate::model::now_ms;
use crate::models_rank::{self, Change};
use crate::models_state::ModelsConfig;
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

pub fn notify(app: &AppHandle, changes: &[Change]) {
    for (title, body) in models_rank::messages(changes, crate::lang::english()) {
        crate::notification::notify_os(app, &title, &body);
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
}
