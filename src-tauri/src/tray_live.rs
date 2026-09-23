//! Tray extras that need live data: the "entrar" item for the soonest meeting with a Meet link,
//! the matching global shortcut, and the taskbar badge (review-requested PRs/MRs + open tasks).
use std::time::Duration;

use tauri::menu::MenuItem;
use tauri::{AppHandle, Manager, State};
use time::format_description::well_known::Rfc3339;

use crate::calendar::AgendaItem;
use crate::model::now_ms;
use crate::vault::AppState;
use crate::{badge, cmd_extras, cmd_forges, next_meeting};

pub const JOIN_ITEM_ID: &str = "join_meeting";
/// Background poll cadence; the badge's forge half is cheap (5 min cache), the agenda half is one light GET.
const TICK: Duration = Duration::from_secs(90);
/// Google Calendar window ahead of "now": far enough to always have a next meeting queued.
const LOOKAHEAD_MS: i64 = 6 * 60 * 60 * 1000;

/// Kept in `AppHandle` state so the background thread and the tray's menu-click handler share it.
pub struct JoinMenuItem(pub MenuItem<tauri::Wry>);

#[tauri::command]
pub fn badge_set_tasks(state: State<'_, AppState>, count: u32) {
    *state.badge_tasks.lock().unwrap() = count;
}

/// Opens the cached next meeting's Meet link; used by both the tray item and the join shortcut.
pub fn join_next_meeting(app: &AppHandle) {
    let Some(meet) = app.state::<AppState>().next_meeting.lock().unwrap().as_ref().map(|m| m.meet.clone()) else {
        return;
    };
    if meet.starts_with("https://") || meet.starts_with("http://") {
        let _ = tauri_plugin_opener::open_url(meet, None::<&str>);
    }
}

pub fn watch(app: AppHandle) {
    std::thread::spawn(move || loop {
        tick(&app);
        std::thread::sleep(TICK);
    });
}

fn tick(app: &AppHandle) {
    let state = app.state::<AppState>();
    if !state.is_unlocked() {
        *state.next_meeting.lock().unwrap() = None;
        update_menu(app, None);
        badge::apply(app, 0);
        return;
    }

    let meeting = fetch_next_meeting(app);
    update_menu(app, meeting.as_ref());
    *state.next_meeting.lock().unwrap() = meeting;

    let reviews = cmd_forges::review_requested_total(app);
    let tasks = *state.badge_tasks.lock().unwrap() as u64;
    badge::apply(app, (reviews + tasks).min(u32::MAX as u64) as u32);
}

fn fetch_next_meeting(app: &AppHandle) -> Option<AgendaItem> {
    let now = now_ms();
    let (time_min, time_max) = (to_rfc3339(now)?, to_rfc3339(now + LOOKAHEAD_MS)?);
    let items = cmd_extras::agenda(&app.state::<AppState>(), &time_min, &time_max, 20).ok()?;
    next_meeting::next_with_meet(&items, now).cloned()
}

fn to_rfc3339(ms: i64) -> Option<String> {
    time::OffsetDateTime::from_unix_timestamp(ms.div_euclid(1000)).ok()?.format(&Rfc3339).ok()
}

pub fn no_meeting_label() -> &'static str {
    crate::lang::tr("Sem reunião com Meet em breve", "No Meet meeting coming up")
}

/// Re-labels the join item in the current language, keeping the cached meeting.
pub fn refresh_join_label(app: &AppHandle) {
    let meeting = app.state::<AppState>().next_meeting.lock().unwrap().clone();
    update_menu(app, meeting.as_ref());
}

fn update_menu(app: &AppHandle, meeting: Option<&AgendaItem>) {
    let Some(item) = app.try_state::<JoinMenuItem>() else { return };
    let (text, enabled) = match meeting {
        Some(m) => (format!("{}: {}", crate::lang::tr("Entrar", "Join"), m.title), true),
        None => (no_meeting_label().to_string(), false),
    };
    let _ = item.0.set_text(text);
    let _ = item.0.set_enabled(enabled);
}
