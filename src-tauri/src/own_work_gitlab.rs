//! GitLab side of the own-work watcher: merge state and comments on the user's MRs, what was assigned to them, new
//! review requests and the pipelines that broke on their MRs. The first reading of each only seeds.
use std::collections::{HashMap, HashSet};

use tauri::{AppHandle, Manager};

use crate::account;
use crate::cmd_gitlab::{to_account, Gitlab};
use crate::forge::{self, ForgeItem};
use crate::forge_filter::{ForgeFilter, Kind, Order, Section, Sort};
use crate::gitlab::Account;
use crate::gitlab_todos::{self, pending};
use crate::gitlab_work;
use crate::mention_alerts::advance_gitlab;
use crate::mention_sender;
use crate::my_pr_alerts::Config;
use crate::pr_state::{self, PrState};
use crate::review_alert::{self, ReviewAlerts};
use crate::vault::AppState;
use crate::work_events;

const PREVIEW_CHARS: usize = 160;

#[derive(Default)]
pub struct Seen {
    who: String,
    avatars: HashMap<String, String>,
    prs: Option<HashMap<String, PrState>>,
    assigned: Option<HashSet<String>>,
    review: Option<HashSet<String>>,
    pipelines: Option<HashSet<u64>>,
}

fn recent(kind: Kind) -> ForgeFilter {
    ForgeFilter { text: String::new(), kind, sort: Sort::Updated, order: Order::Desc }
}

pub fn run(app: &AppHandle, state: &AppState, cfg: &Config, seen: &mut Seen) {
    let c = match state.gitlab_config() {
        Ok(Some(c)) if !c.token.is_empty() => c,
        Ok(_) => return *seen = Seen::default(),
        Err(_) => return,
    };
    let who = format!("{}|{}", c.base_url, c.username);
    if seen.who != who {
        *seen = Seen { who, ..Default::default() };
    }
    let acc = to_account(&c);
    let w = crate::own_work_github::wanted(cfg);
    if crate::own_work_github::any_pr_alert(w) {
        own_mrs(app, &acc, w, seen);
    } else {
        seen.prs = None;
    }
    if cfg.assigned {
        assigned(app, state, &acc, seen);
    } else {
        seen.assigned = None;
    }
    if app.state::<ReviewAlerts>().enabled() {
        review_requested(app, state, &acc, seen);
    } else {
        seen.review = None;
    }
    if cfg.ci {
        pipelines(app, &acc, seen);
    } else {
        seen.pipelines = None;
    }
}

fn own_mrs(app: &AppHandle, acc: &Account, w: pr_state::Wanted, seen: &mut Seen) {
    let Ok(mrs) = gitlab_work::my_mrs(acc) else { return };
    let now: Vec<(&ForgeItem, PrState)> = mrs.iter().map(|(i, s)| (i, s.clone())).collect();
    let (changed, mut next) = pr_state::advance(seen.prs.as_ref(), now);
    let listed: Vec<&ForgeItem> = mrs.iter().map(|(i, _)| i).collect();
    pr_state::keep_blips(&mut next, seen.prs.as_ref(), &listed);
    // The list has no verdict text; the one lookup is for who commented, which also tells the user's own notes apart.
    let mut said: HashMap<(String, pr_state::Change), pr_state::Said> = HashMap::new();
    for (item, list) in &changed {
        if w.comments && list.contains(&pr_state::Change::Comments) {
            if let Some(s) = gitlab_work::latest_note(acc, item, PREVIEW_CHARS) {
                said.insert((item.reference.clone(), pr_state::Change::Comments), s);
            }
        }
    }
    let mut changed = changed;
    pr_state::drop_unheard(&mut changed, &said);
    let mut events = pr_state::events(&changed, &said, w, crate::lang::english());
    let base = acc.base.clone();
    mention_sender::resolve_avatars(
        events.iter_mut().filter_map(|e| e.sender.as_mut()),
        &mut seen.avatars,
        |u| mention_sender::trusted_gitlab_avatar(u, &base),
        account::download_image,
    );
    for event in events {
        let _ = crate::window::open_alert(app, event);
    }
    seen.prs = Some(next);
}

fn assigned(app: &AppHandle, state: &AppState, acc: &Account, seen: &mut Seen) {
    let Ok(list) = forge::list_page::<Gitlab>(&state.forges, acc, Section::Assigned, 1, &recent(Kind::All), false)
    else {
        return;
    };
    let list = work_events::others_only(list, &acc.username);
    let (fresh, next) = review_alert::advance(seen.assigned.as_ref(), &list);
    for event in work_events::assigned_events(&fresh, crate::lang::english()) {
        let _ = crate::window::open_alert(app, event);
    }
    seen.assigned = Some(next);
}

/// Like GitHub's: a system notification, since the badge already counts them.
fn review_requested(app: &AppHandle, state: &AppState, acc: &Account, seen: &mut Seen) {
    let f = ForgeFilter::default();
    let Ok(list) = forge::list_page::<Gitlab>(&state.forges, acc, Section::ReviewRequested, 1, &f, false) else {
        return;
    };
    let (fresh, next) = review_alert::advance(seen.review.as_ref(), &list);
    for (title, body) in review_alert::messages(&fresh) {
        crate::notification::notify_os(app, title, &body);
    }
    seen.review = Some(next);
}

fn pipelines(app: &AppHandle, acc: &Account, seen: &mut Seen) {
    let Ok(todos) = pending(acc) else { return };
    let failed: Vec<gitlab_todos::Mention> = todos.into_iter().filter(|m| m.action == "build_failed").collect();
    let (fresh, ids) = advance_gitlab(seen.pipelines.as_ref(), &failed);
    for event in work_events::pipeline_events(&fresh, crate::lang::english()) {
        let _ = crate::window::open_alert(app, event);
    }
    seen.pipelines = Some(ids);
}
