//! Tray extras that need live data: the "entrar" item for the soonest meeting with a Meet link,
//! the matching global shortcut, and the taskbar badge (review-requested PRs/MRs + open tasks + unread mentions).
use crate::resilient::LockExt;
use std::time::Duration;

#[cfg(desktop)]
use tauri::menu::MenuItem;
use tauri::{AppHandle, Manager, State};

use crate::calendar::AgendaItem;
use crate::model::now_ms;
use crate::vault::AppState;
use crate::{badge, forge};

pub const JOIN_ITEM_ID: &str = "join_meeting";
/// Background poll cadence; the badge's forge half is cheap (5 min cache), the agenda half reads `meeting_cache`.
const TICK: Duration = Duration::from_secs(90);

/// Kept in `AppHandle` state so the background thread and the tray's menu-click handler share it.
#[cfg(desktop)]
pub struct JoinMenuItem(pub MenuItem<tauri::Wry>);

/// The task the mini-dashboard offers to complete; the title is as sensitive as the Tarefas tab, so it lives only in
/// memory and is dropped on lock.
#[derive(Clone, Debug, PartialEq, serde::Serialize, serde::Deserialize)]
pub struct NextTask {
    pub id: String,
    pub title: String,
}

/// With no open task left (or no id) there is nothing to offer.
fn keep_next(count: u32, next: Option<NextTask>) -> Option<NextTask> {
    next.filter(|t| count > 0 && !t.id.is_empty())
}

/// `next` is optional so an older caller that only counts keeps working.
#[tauri::command]
pub fn badge_set_tasks(state: State<'_, AppState>, count: u32, next: Option<NextTask>) {
    *state.badge_tasks.lock_safe() = count;
    *state.badge_next_task.lock_safe() = keep_next(count, next);
}

/// Opens the cached next meeting's Meet link; used by both the tray item and the join shortcut.
pub fn join_next_meeting(app: &AppHandle) {
    let Some(meet) = app.state::<AppState>().next_meeting.lock_safe().as_ref().map(|m| m.meet.clone()) else {
        return;
    };
    if let Ok(url) = crate::web_url::parse_web_url(&meet) {
        let _ = tauri_plugin_opener::open_url(url.as_str(), None::<&str>);
    }
}

pub fn watch(app: AppHandle) {
    crate::resilient::supervise("tray-live", move || loop {
        tick(&app);
        std::thread::sleep(TICK);
    });
}

fn tick(app: &AppHandle) {
    let state = app.state::<AppState>();
    if !state.is_unlocked() {
        *state.next_meeting.lock_safe() = None;
        update_menu(app, None);
        badge::apply(app, 0);
        return;
    }

    let meeting = cached_next_meeting(app);
    update_menu(app, meeting.as_ref());
    *state.next_meeting.lock_safe() = meeting;

    let reviews = forge::cmd::review_requested_total(app);
    #[cfg(desktop)]
    crate::strip::feed_reviews(app, reviews);
    let tasks = *state.badge_tasks.lock_safe() as u64;
    let mentions = u64::from(app.state::<crate::mentions::state::MentionsUnread>().count());
    badge::apply(app, (reviews + tasks + mentions).min(u32::MAX as u64) as u32);
}

fn cached_next_meeting(app: &AppHandle) -> Option<AgendaItem> {
    app.state::<crate::meeting_cache::Upcoming>().next_with_meet(now_ms())
}

pub fn no_meeting_label() -> &'static str {
    crate::lang::tr("Sem reunião com Meet em breve", "No Meet meeting coming up")
}

/// Re-labels the join item in the current language, keeping the cached meeting.
pub fn refresh_join_label(app: &AppHandle) {
    let meeting = app.state::<AppState>().next_meeting.lock_safe().clone();
    update_menu(app, meeting.as_ref());
}

#[cfg(not(desktop))]
fn update_menu(_app: &AppHandle, _meeting: Option<&AgendaItem>) {}

#[cfg(desktop)]
fn update_menu(app: &AppHandle, meeting: Option<&AgendaItem>) {
    let Some(item) = app.try_state::<JoinMenuItem>() else { return };
    let (text, enabled) = match meeting {
        Some(m) => (format!("{}: {}", crate::lang::tr("Entrar", "Join"), m.title), true),
        None => (no_meeting_label().to_string(), false),
    };
    let _ = item.0.set_text(text);
    let _ = item.0.set_enabled(enabled);
}

#[cfg(test)]
mod next_task_tests {
    use super::*;

    fn task(id: &str) -> Option<NextTask> {
        Some(NextTask { id: id.into(), title: "Revisar o PR".into() })
    }

    #[test]
    fn the_offer_needs_an_open_task_and_an_id() {
        assert_eq!(keep_next(2, task("t1")), task("t1"));
        assert_eq!(keep_next(0, task("t1")), None, "nothing is open, so nothing to complete");
        assert_eq!(keep_next(2, task("")), None);
        assert_eq!(keep_next(2, None), None);
    }
}
