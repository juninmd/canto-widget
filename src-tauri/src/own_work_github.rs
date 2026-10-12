//! GitHub side of the own-work watcher: review verdicts, merge state and comments on the user's PRs, what was
//! assigned to them and replies in threads they took part in. The first reading of each only seeds.
use std::collections::{HashMap, HashSet};

use tauri::{AppHandle, Manager};
use zeroize::Zeroizing;

use crate::account;
use crate::cmd_github::{valid_token, GithubState};
use crate::cmd_github_lists::Github;
use crate::forge::{self, ForgeItem};
use crate::forge_filter::{ForgeFilter, Kind, Order, Section, Sort};
use crate::github_thread;
use crate::mention_sender::{resolve_avatars, trusted_github_avatar};
use crate::model::now_ms;
use crate::my_pr_alerts::Config;
use crate::pr_state::{self, Change, PrState, Said, Wanted};
use crate::review_alert;
use crate::vault::AppState;
use crate::work_events;

/// Each PR costs two calls per reading.
const MAX_PRS: usize = 20;
const PREVIEW_CHARS: usize = 160;

#[derive(Default)]
pub struct Seen {
    login: String,
    prs: Option<HashMap<String, PrState>>,
    assigned: Option<HashSet<String>>,
    replies: Option<HashMap<String, String>>,
    avatars: HashMap<String, String>,
}

pub fn wanted(cfg: &Config) -> Wanted {
    Wanted { reviews: cfg.reviews, merge_state: cfg.merge_state, comments: cfg.comments }
}

pub fn any_pr_alert(w: Wanted) -> bool {
    w.reviews || w.merge_state || w.comments
}

fn recent(kind: Kind) -> ForgeFilter {
    ForgeFilter { text: String::new(), kind, sort: Sort::Updated, order: Order::Desc }
}

pub fn run(app: &AppHandle, state: &AppState, cfg: &Config, seen: &mut Seen) {
    let login = match state.github_config() {
        Ok(Some(c)) if !c.tokens.access_token.is_empty() => c.login,
        Ok(_) => return *seen = Seen::default(),
        Err(_) => return,
    };
    if seen.login != login {
        *seen = Seen { login: login.clone(), ..Default::default() };
    }
    // No `touch()`: a background read must not keep the vault from auto-locking.
    let Ok(cred) = valid_token(state, &app.state::<GithubState>(), now_ms()) else { return };
    let w = wanted(cfg);
    if any_pr_alert(w) {
        own_prs(app, state, &cred, &login, w, seen);
    } else {
        seen.prs = None;
    }
    if cfg.assigned {
        assigned(app, state, &cred, &login, seen);
    } else {
        seen.assigned = None;
    }
    if cfg.replies {
        replies(app, state, &cred, &login, seen);
    } else {
        seen.replies = None;
    }
}

fn ring(app: &AppHandle, mut events: Vec<crate::calendar::AgendaItem>, avatars: &mut HashMap<String, String>) {
    resolve_avatars(
        events.iter_mut().filter_map(|e| e.sender.as_mut()),
        avatars,
        trusted_github_avatar,
        account::download_image,
    );
    for event in events {
        let _ = crate::window::open_alert(app, event);
    }
}

fn own_prs(app: &AppHandle, state: &AppState, cred: &Zeroizing<String>, login: &str, w: Wanted, seen: &mut Seen) {
    let Ok(list) = forge::list_page::<Github>(&state.forges, cred, Section::MyPrs, 1, &recent(Kind::Pr), false) else {
        return;
    };
    let mut verdicts: HashMap<String, Said> = HashMap::new();
    let now: Vec<(&ForgeItem, PrState)> = list
        .items
        .iter()
        .take(MAX_PRS)
        .filter_map(|i| {
            let (st, said) = github_thread::state(cred, i)?;
            verdicts.insert(i.reference.clone(), said);
            Some((i, st))
        })
        .collect();
    let (changed, mut next) = pr_state::advance(seen.prs.as_ref(), now);
    let listed: Vec<&ForgeItem> = list.items.iter().take(MAX_PRS).collect();
    pr_state::keep_blips(&mut next, seen.prs.as_ref(), &listed);
    let mut said: HashMap<(String, Change), Said> = HashMap::new();
    for (item, changes) in &changed {
        for &c in changes.iter().filter(|c| w.allows(**c)) {
            let found = match c {
                Change::Approved | Change::Changes => verdicts.get(&item.reference).cloned(),
                Change::Comments => github_thread::latest_comment(cred, item, login, PREVIEW_CHARS),
                _ => None,
            };
            if let Some(s) = found {
                said.insert((item.reference.clone(), c), s);
            }
        }
    }
    let mut changed = changed;
    pr_state::drop_unheard(&mut changed, &said);
    let events = pr_state::events(&changed, &said, w, crate::lang::english());
    ring(app, events, &mut seen.avatars);
    seen.prs = Some(next);
}

fn assigned(app: &AppHandle, state: &AppState, cred: &Zeroizing<String>, login: &str, seen: &mut Seen) {
    let Ok(list) = forge::list_page::<Github>(&state.forges, cred, Section::Assigned, 1, &recent(Kind::All), false)
    else {
        return;
    };
    let list = work_events::others_only(list, login);
    let (fresh, next) = review_alert::advance(seen.assigned.as_ref(), &list);
    let events = work_events::assigned_events(&fresh, crate::lang::english());
    ring(app, events, &mut seen.avatars);
    seen.assigned = Some(next);
}

fn replies(app: &AppHandle, state: &AppState, cred: &Zeroizing<String>, login: &str, seen: &mut Seen) {
    let Ok(list) =
        forge::list_page::<Github>(&state.forges, cred, Section::Participating, 1, &recent(Kind::All), false)
    else {
        return;
    };
    let (moved, next) = work_events::advance_replies(seen.replies.as_ref(), &list.items);
    let found: Vec<(&ForgeItem, Said)> = moved
        .into_iter()
        .filter_map(|i| Some((i, github_thread::latest_comment(cred, i, login, PREVIEW_CHARS)?)))
        // A comment that names the user already rang as a mention.
        .filter(|(_, s)| !s.mentions_me)
        .collect();
    let events = work_events::reply_events(&found, crate::lang::english());
    ring(app, events, &mut seen.avatars);
    seen.replies = Some(next);
}
