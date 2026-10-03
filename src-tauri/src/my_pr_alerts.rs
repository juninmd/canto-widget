//! Pop-up alerts about the user's own open GitHub PRs: CI that just turned red, and PRs nobody reviewed for
//! too long. Polls the same cached lists the tab uses, only with GitHub connected and the vault open.
use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use std::time::{Duration, Instant};

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, State};
use zeroize::Zeroizing;

use crate::cmd_github::{valid_token, GithubState};
use crate::cmd_github_lists::Github;
use crate::error::Result;
use crate::forge::{self, ChecksStatus};
use crate::forge_filter::{ForgeFilter, Kind, Order, Section, Sort};
use crate::github_checks::{self, GithubChecks, PrRef};
use crate::github_failures;
use crate::model::now_ms;
use crate::my_pr_events::{advance_stalled, ci_event, newly_failing, remember, stalled, stalled_events};
use crate::vault::AppState;

const FILE: &str = "meus_prs_alertas.json";
const POLL: Duration = Duration::from_secs(30);
const INTERVAL: Duration = Duration::from_secs(5 * 60);
const MAX_HOURS: u32 = 14 * 24;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Config {
    #[serde(default = "on")]
    pub ci: bool,
    #[serde(default = "on")]
    pub stalled: bool,
    #[serde(default = "default_hours")]
    pub stalled_hours: u32,
    /// Pop-up when someone @-mentions the user on GitHub or GitLab (`mention_alerts.rs` reads it).
    #[serde(default = "on")]
    pub mentions: bool,
}

fn on() -> bool {
    true
}

fn default_hours() -> u32 {
    48
}

impl Default for Config {
    fn default() -> Self {
        Self { ci: true, stalled: true, stalled_hours: default_hours(), mentions: true }
    }
}

/// Settings persisted next to the vault; not secret, just two switches and a number.
pub struct MyPrAlerts {
    path: PathBuf,
    cfg: Mutex<Config>,
}

impl MyPrAlerts {
    pub fn load(dir: &Path) -> Self {
        let path = dir.join(FILE);
        let saved: Option<Config> = crate::store::read_json(&path).ok().flatten();
        Self { path, cfg: Mutex::new(saved.unwrap_or_default()) }
    }

    pub fn get(&self) -> Config {
        self.cfg.lock().unwrap().clone()
    }

    fn set(&self, mut cfg: Config) -> Result<Config> {
        cfg.stalled_hours = cfg.stalled_hours.clamp(1, MAX_HOURS);
        crate::store::write_json_atomic(&self.path, &cfg)?;
        *self.cfg.lock().unwrap() = cfg.clone();
        Ok(cfg)
    }
}

#[tauri::command]
pub fn my_pr_alerts_get(alerts: State<'_, MyPrAlerts>) -> Config {
    alerts.get()
}

#[tauri::command(async)]
pub fn my_pr_alerts_set(alerts: State<'_, MyPrAlerts>, config: Config) -> Result<Config> {
    alerts.set(config)
}

/// Everything remembered between readings; dropped on a lock-free account change so one account's PRs never
/// seed another's.
#[derive(Default)]
struct Memory {
    login: String,
    ci: Option<HashMap<String, ChecksStatus>>,
    stalled: Option<HashSet<String>>,
}

fn mine(kind: Kind, text: &str, sort: Sort, order: Order) -> ForgeFilter {
    ForgeFilter { text: text.into(), kind, sort, order }
}

fn check_ci(app: &AppHandle, state: &AppState, cred: &Zeroizing<String>, mem: &mut Memory) {
    let filter = mine(Kind::Pr, "", Sort::Updated, Order::Desc);
    let Ok(list) = forge::list_page::<Github>(&state.forges, cred, Section::MyPrs, 1, &filter, false) else {
        return;
    };
    let refs: Vec<PrRef> = list.items.iter().map(|i| PrRef { repo: i.repo.clone(), number: i.number }).collect();
    let Ok(api) = GithubChecks::new(cred.as_str()) else { return };
    let found = github_checks::statuses(&state.forges.checks, &api, &github_checks::pick(refs), now_ms());
    let now: HashMap<String, ChecksStatus> =
        found.into_iter().map(|c| (format!("{}#{}", c.repo, c.number), c.status)).collect();
    let failing = newly_failing(mem.ci.as_ref(), &now);
    for item in list.items.iter().filter(|i| failing.contains(&i.reference)) {
        let jobs = github_failures::fetch(cred, &item.repo, item.number).unwrap_or_default();
        let _ = crate::window::open_alert(app, ci_event(item, &jobs, crate::lang::english()));
    }
    let listed: HashSet<&str> = list.items.iter().map(|i| i.reference.as_str()).collect();
    mem.ci = Some(remember(mem.ci.as_ref(), now, &listed));
}

fn check_stalled(app: &AppHandle, state: &AppState, cred: &Zeroizing<String>, hours: u32, mem: &mut Memory) {
    // `review:none` and `draft:false` are search qualifiers, so GitHub does the narrowing; oldest first.
    let filter = mine(Kind::Pr, "review:none draft:false", Sort::Created, Order::Asc);
    let Ok(list) = forge::list_page::<Github>(&state.forges, cred, Section::MyPrs, 1, &filter, false) else {
        return;
    };
    let now = now_ms();
    let waiting = stalled(&list.items, now, hours);
    let (fresh, seen) = advance_stalled(mem.stalled.as_ref().unwrap_or(&HashSet::new()), &waiting);
    for event in stalled_events(&fresh, now, crate::lang::english()) {
        let _ = crate::window::open_alert(app, event);
    }
    mem.stalled = Some(seen);
}

pub fn watch(app: AppHandle) {
    std::thread::spawn(move || {
        let mut mem = Memory::default();
        let mut last: Option<Instant> = None;
        loop {
            std::thread::sleep(POLL);
            let cfg = app.state::<MyPrAlerts>().get();
            if !cfg.ci {
                mem.ci = None;
            }
            if !cfg.stalled {
                mem.stalled = None;
            }
            let state = app.state::<AppState>();
            if (!cfg.ci && !cfg.stalled) || !state.is_unlocked() {
                continue;
            }
            let login = match state.github_config() {
                Ok(Some(c)) if !c.tokens.access_token.is_empty() => c.login,
                Ok(_) => {
                    mem = Memory::default();
                    continue;
                }
                Err(_) => continue,
            };
            if mem.login != login {
                mem = Memory { login, ..Default::default() };
            }
            if last.is_some_and(|t| t.elapsed() < INTERVAL) {
                continue;
            }
            last = Some(Instant::now());
            // No `touch()`: a background read must not keep the vault from auto-locking.
            let Ok(cred) = valid_token(&state, &app.state::<GithubState>(), now_ms()) else { continue };
            if cfg.ci {
                check_ci(&app, &state, &cred, &mut mem);
            }
            if cfg.stalled {
                check_stalled(&app, &state, &cred, cfg.stalled_hours, &mut mem);
            }
        }
    });
}

#[cfg(test)]
#[path = "my_pr_alerts_tests.rs"]
mod tests;
