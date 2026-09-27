//! OS notification when someone asks for the user's review on GitHub. Polls the same cached
//! "revisão pedida a mim" list the tab and the tray badge use; the first reading only seeds.
//! On by default: it only runs with GitHub connected, and it announces what the badge already counts.
use std::collections::HashSet;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::{Duration, Instant};

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, State};

use crate::cmd_github::{valid_token, GithubState};
use crate::cmd_github_lists::Github;
use crate::error::Result;
use crate::forge::{self, ForgeItem, ForgeList};
use crate::forge_filter::{ForgeFilter, Section};
use crate::lang::tr;
use crate::model::now_ms;
use crate::vault::AppState;

const FILE: &str = "revisao_alertas.json";
/// Short, so the seed happens right after an unlock; the list itself is read every `INTERVAL`.
const POLL: Duration = Duration::from_secs(30);
const INTERVAL: Duration = Duration::from_secs(5 * 60);
/// More new requests than this at once become one summary instead of a stack of banners.
const MAX_EACH: usize = 3;
const MAX_SEEN: usize = 1000;

#[derive(Serialize, Deserialize)]
struct Saved {
    #[serde(default = "on")]
    enabled: bool,
}

fn on() -> bool {
    true
}

/// On/off persisted next to the vault; not secret, it holds a single flag.
pub struct ReviewAlerts {
    path: PathBuf,
    enabled: AtomicBool,
}

impl ReviewAlerts {
    pub fn load(dir: &Path) -> Self {
        let path = dir.join(FILE);
        let saved: Option<Saved> = crate::store::read_json(&path).ok().flatten();
        Self { path, enabled: AtomicBool::new(saved.is_none_or(|s| s.enabled)) }
    }

    pub fn enabled(&self) -> bool {
        self.enabled.load(Ordering::Relaxed)
    }

    fn set(&self, enabled: bool) -> Result<()> {
        crate::store::write_json_atomic(&self.path, &Saved { enabled })?;
        self.enabled.store(enabled, Ordering::Relaxed);
        Ok(())
    }
}

#[tauri::command]
pub fn review_alerts_get(alerts: State<'_, ReviewAlerts>) -> bool {
    alerts.enabled()
}

#[tauri::command(async)]
pub fn review_alerts_set(alerts: State<'_, ReviewAlerts>, enabled: bool) -> Result<bool> {
    alerts.set(enabled)?;
    Ok(enabled)
}

/// What to announce and what to remember. `None` (first reading) only seeds. A complete list replaces the
/// memory, so a request made again after a review rings again; a partial page only adds, so an old item
/// sliding up from page two doesn't pass for new.
pub fn advance<'a>(seen: Option<&HashSet<String>>, list: &'a ForgeList) -> (Vec<&'a ForgeItem>, HashSet<String>) {
    let now: HashSet<String> = list.items.iter().map(|i| i.url.clone()).collect();
    let Some(seen) = seen else { return (Vec::new(), now) };
    let fresh = list.items.iter().filter(|i| !seen.contains(&i.url)).collect();
    let complete = list.total as usize <= list.items.len();
    let next = if complete || seen.len() >= MAX_SEEN { now } else { seen.union(&now).cloned().collect() };
    (fresh, next)
}

/// One banner per request, or a single summary when many arrive at once.
pub fn messages(fresh: &[&ForgeItem]) -> Vec<(&'static str, String)> {
    let title = tr("Revisão pedida", "Review requested");
    if fresh.len() > MAX_EACH {
        return vec![(
            title,
            format!("{} {}", fresh.len(), tr("PRs aguardam sua revisão", "PRs awaiting your review")),
        )];
    }
    fresh.iter().map(|i| (title, format!("{} {}", i.reference, i.title))).collect()
}

struct Seen {
    login: String,
    urls: HashSet<String>,
}

pub fn watch(app: AppHandle) {
    std::thread::spawn(move || {
        let mut seen: Option<Seen> = None;
        let mut last: Option<Instant> = None;
        loop {
            std::thread::sleep(POLL);
            if !app.state::<ReviewAlerts>().enabled() {
                seen = None;
                continue;
            }
            let state = app.state::<AppState>();
            // Locked: keep what was seen, so requests made meanwhile still ring after the unlock.
            if !state.is_unlocked() {
                continue;
            }
            let login = match state.github_config() {
                Ok(Some(cfg)) if !cfg.tokens.access_token.is_empty() => cfg.login,
                Ok(_) => {
                    seen = None;
                    continue;
                }
                Err(_) => continue,
            };
            seen = seen.filter(|s| s.login == login);
            if seen.is_some() && last.is_some_and(|t| t.elapsed() < INTERVAL) {
                continue;
            }
            last = Some(Instant::now());
            // No `touch()` here: a background read must not keep the vault from auto-locking.
            let Ok(list) = valid_token(&state, &app.state::<GithubState>(), now_ms()).and_then(|cred| {
                let f = ForgeFilter::default();
                forge::list_page::<Github>(&state.forges, &cred, Section::ReviewRequested, 1, &f, false)
            }) else {
                continue;
            };
            let (fresh, urls) = advance(seen.as_ref().map(|s| &s.urls), &list);
            for (title, body) in messages(&fresh) {
                crate::notification::notify_os(&app, title, &body);
            }
            seen = Some(Seen { login, urls });
        }
    });
}

#[cfg(test)]
#[path = "review_alert_tests.rs"]
mod tests;
