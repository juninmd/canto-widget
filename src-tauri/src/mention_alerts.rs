//! Pop-up when someone @-mentions the user on GitHub or GitLab. GitHub: the search for open threads that mention
//! the user (a direct @username; team mentions don't match). GitLab: the user's pending "mentioned" to-dos. Both
//! only with the account connected and the vault open; the first reading of each only seeds.
use std::collections::HashSet;
use std::time::{Duration, Instant};

use tauri::{AppHandle, Manager};

use crate::calendar::AgendaItem;
use crate::cmd_github::{valid_token, GithubState};
use crate::cmd_github_lists::Github;
use crate::cmd_gitlab::to_account;
use crate::forge::{self, ForgeItem};
use crate::forge_filter::{ForgeFilter, Kind, Order, Section, Sort};
use crate::gitlab::{self, Mention};
use crate::model::now_ms;
use crate::my_pr_alerts::MyPrAlerts;
use crate::notification::MENTION_PREFIX;
use crate::review_alert;
use crate::vault::AppState;

const POLL: Duration = Duration::from_secs(30);
const INTERVAL: Duration = Duration::from_secs(5 * 60);
/// More new mentions than this at once become one summary instead of a stack of pop-ups.
pub const MAX_EACH: usize = 3;
const BODY_CHARS: usize = 280;

/// A GitLab to-do id seen before; ids are never reused.
pub fn advance_gitlab<'a>(seen: Option<&HashSet<u64>>, now: &'a [Mention]) -> (Vec<&'a Mention>, HashSet<u64>) {
    let ids: HashSet<u64> = now.iter().map(|m| m.id).collect();
    let Some(seen) = seen else { return (Vec::new(), ids) };
    (now.iter().filter(|m| !seen.contains(&m.id)).collect(), ids)
}

fn summary(forge: &str, count: usize, lines: Vec<String>, en: bool) -> AgendaItem {
    let title = if en { format!("{count} new mentions") } else { format!("{count} menções novas") };
    AgendaItem {
        id: format!("{MENTION_PREFIX}{forge}:summary"),
        title,
        description: lines.into_iter().take(8).collect::<Vec<_>>().join("\n"),
        tag: forge.into(),
        ..Default::default()
    }
}

pub fn github_events(fresh: &[&ForgeItem], en: bool) -> Vec<AgendaItem> {
    if fresh.len() > MAX_EACH {
        let lines = fresh.iter().map(|i| format!("{} {}", i.reference, i.title)).collect();
        return vec![summary("github", fresh.len(), lines, en)];
    }
    fresh
        .iter()
        .map(|i| AgendaItem {
            id: format!("{MENTION_PREFIX}github:{}", i.reference),
            title: i.title.clone(),
            organizer: i.reference.clone(),
            description: if en {
                format!("You were mentioned in {}.", i.reference)
            } else {
                format!("Você foi mencionado em {}.", i.reference)
            },
            link: i.url.clone(),
            tag: "github".into(),
            ..Default::default()
        })
        .collect()
}

pub fn gitlab_events(fresh: &[&Mention], en: bool) -> Vec<AgendaItem> {
    if fresh.len() > MAX_EACH {
        let lines = fresh.iter().map(|m| format!("{} {}", m.project, m.title)).collect();
        return vec![summary("gitlab", fresh.len(), lines, en)];
    }
    fresh
        .iter()
        .map(|m| {
            let body: String =
                m.body.split_whitespace().collect::<Vec<_>>().join(" ").chars().take(BODY_CHARS).collect();
            AgendaItem {
                id: format!("{MENTION_PREFIX}gitlab:{}", m.id),
                title: m.title.clone(),
                organizer: m.project.clone(),
                description: match (m.author.as_str(), body.as_str()) {
                    ("", b) => b.to_string(),
                    (a, "") => format!("@{a}"),
                    (a, b) => format!("@{a}: {b}"),
                },
                link: m.url.clone(),
                tag: "gitlab".into(),
                ..Default::default()
            }
        })
        .collect()
}

#[derive(Default)]
struct Memory {
    github: Option<(String, HashSet<String>)>,
    gitlab: Option<(String, HashSet<u64>)>,
}

fn check_github(app: &AppHandle, state: &AppState, mem: &mut Memory) {
    let login = match state.github_config() {
        Ok(Some(c)) if !c.tokens.access_token.is_empty() => c.login,
        Ok(_) => return mem.github = None,
        Err(_) => return,
    };
    // No `touch()`: a background read must not keep the vault from auto-locking.
    let Ok(cred) = valid_token(state, &app.state::<GithubState>(), now_ms()) else { return };
    let filter = ForgeFilter { text: String::new(), kind: Kind::All, sort: Sort::Updated, order: Order::Desc };
    let Ok(list) = forge::list_page::<Github>(&state.forges, &cred, Section::Mentioned, 1, &filter, false) else {
        return;
    };
    let seen = mem.github.as_ref().filter(|(l, _)| *l == login).map(|(_, s)| s);
    let (fresh, next) = review_alert::advance(seen, &list);
    for event in github_events(&fresh, crate::lang::english()) {
        let _ = crate::window::open_alert(app, event);
    }
    mem.github = Some((login, next));
}

fn check_gitlab(app: &AppHandle, state: &AppState, mem: &mut Memory) {
    let cfg = match state.gitlab_config() {
        Ok(Some(c)) if !c.token.is_empty() => c,
        Ok(_) => return mem.gitlab = None,
        Err(_) => return,
    };
    let who = format!("{}|{}", cfg.base_url, cfg.username);
    let Ok(mentions) = gitlab::mentions(&to_account(&cfg)) else { return };
    let seen = mem.gitlab.as_ref().filter(|(w, _)| *w == who).map(|(_, s)| s);
    let (fresh, next) = advance_gitlab(seen, &mentions);
    for event in gitlab_events(&fresh, crate::lang::english()) {
        let _ = crate::window::open_alert(app, event);
    }
    mem.gitlab = Some((who, next));
}

pub fn watch(app: AppHandle) {
    std::thread::spawn(move || {
        let mut mem = Memory::default();
        let mut last: Option<Instant> = None;
        loop {
            std::thread::sleep(POLL);
            let state = app.state::<AppState>();
            if !app.state::<MyPrAlerts>().get().mentions {
                mem = Memory::default();
                continue;
            }
            // Locked: keep what was seen, so mentions made meanwhile still ring after the unlock.
            if !state.is_unlocked() || last.is_some_and(|t| t.elapsed() < INTERVAL) {
                continue;
            }
            last = Some(Instant::now());
            check_github(&app, &state, &mut mem);
            check_gitlab(&app, &state, &mut mem);
        }
    });
}

#[cfg(test)]
#[path = "mention_alerts_tests.rs"]
mod tests;
