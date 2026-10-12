//! Pop-up when someone @-mentions the user on GitHub or GitLab. GitHub: the search for open threads that mention
//! the user (a direct @username; team mentions don't match). GitLab: the user's pending "mentioned" to-dos. Both
//! only with the account connected and the vault open; the first reading of each only seeds.
use std::collections::{HashMap, HashSet};
use std::time::{Duration, Instant};

use tauri::{AppHandle, Manager};

use crate::account;
use crate::calendar::{AgendaItem, Sender};
use crate::cmd_github::{valid_token, GithubState};
use crate::cmd_github_lists::Github;
use crate::cmd_gitlab::to_account;
use crate::forge::{self, ForgeItem};
use crate::forge_filter::{ForgeFilter, Kind, Order, Section, Sort};
use crate::gitlab::{self, Mention};
use crate::mention_sender::{self, trusted_github_avatar, trusted_gitlab_avatar, Mentioned};
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

fn who(s: Option<&Sender>) -> String {
    s.map(|s| if s.name.is_empty() { s.login.as_str() } else { s.name.as_str() })
        .map_or(String::new(), |n| format!("{n} · "))
}

/// `found` is keyed by the item's reference; a missing one leaves the alert without a name or text, as before.
pub fn github_events(fresh: &[&ForgeItem], found: &HashMap<String, Mentioned>, en: bool) -> Vec<AgendaItem> {
    if fresh.len() > MAX_EACH {
        let lines = fresh
            .iter()
            .map(|i| format!("{}{} {}", who(found.get(&i.reference).map(|m| &m.sender)), i.reference, i.title))
            .collect();
        return vec![summary("github", fresh.len(), lines, en)];
    }
    fresh
        .iter()
        .map(|i| {
            let m = found.get(&i.reference);
            AgendaItem {
                id: format!("{MENTION_PREFIX}github:{}", i.reference),
                title: i.title.clone(),
                organizer: i.reference.clone(),
                description: match m {
                    Some(m) => with_author(&m.sender.login, &m.excerpt),
                    None if en => format!("You were mentioned in {}.", i.reference),
                    None => format!("Você foi mencionado em {}.", i.reference),
                },
                link: i.url.clone(),
                tag: "github".into(),
                sender: m.map(|m| m.sender.clone()),
                ..Default::default()
            }
        })
        .collect()
}

fn with_author(author: &str, text: &str) -> String {
    match (author, text) {
        ("", t) => t.to_string(),
        (a, "") => format!("@{a}"),
        (a, t) => format!("@{a}: {t}"),
    }
}

pub fn gitlab_events(fresh: &[&Mention], en: bool) -> Vec<AgendaItem> {
    if fresh.len() > MAX_EACH {
        let lines = fresh
            .iter()
            .map(|m| format!("{}{} {}", who(mention_sender::gitlab_sender(m).as_ref()), m.project, m.title))
            .collect();
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
                description: with_author(&m.author, &body),
                link: m.url.clone(),
                tag: "gitlab".into(),
                sender: mention_sender::gitlab_sender(m),
                ..Default::default()
            }
        })
        .collect()
}

#[derive(Default)]
struct Memory {
    github: Option<(String, HashSet<String>)>,
    gitlab: Option<(String, HashSet<u64>)>,
    /// Avatar URL -> `data:` URL, in RAM only.
    avatars: HashMap<String, String>,
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
    // A summary carries no avatars, so the lookups (up to three calls each) only run for the individual alerts.
    let found: HashMap<String, Mentioned> = if fresh.len() > MAX_EACH {
        HashMap::new()
    } else {
        fresh
            .iter()
            .filter_map(|i| Some((i.reference.clone(), mention_sender::github_mention(&cred, i, &login, BODY_CHARS)?)))
            .collect()
    };
    let mut events = github_events(&fresh, &found, crate::lang::english());
    mention_sender::resolve_avatars(
        events.iter_mut().filter_map(|e| e.sender.as_mut()),
        &mut mem.avatars,
        trusted_github_avatar,
        account::download_image,
    );
    for event in events {
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
    let mut events = gitlab_events(&fresh, crate::lang::english());
    let base = cfg.base_url.clone();
    mention_sender::resolve_avatars(
        events.iter_mut().filter_map(|e| e.sender.as_mut()),
        &mut mem.avatars,
        |u| trusted_gitlab_avatar(u, &base),
        account::download_image,
    );
    for event in events {
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
