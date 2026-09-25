//! Meeting alerts driven from Rust. The webview's `setInterval` is suspended while the window is hidden
//! (WKWebView on macOS, App Nap), so a widget parked in the tray never fired "reunião começando" there.
use std::collections::HashSet;
use std::sync::Mutex;
use std::time::{Duration, Instant};

use tauri::{AppHandle, Manager};
use time::format_description::well_known::Rfc3339;

use crate::calendar::AgendaItem;
use crate::model::now_ms;
use crate::notification::TASK_PREFIX;
use crate::vault::AppState;
use crate::{cmd_extras, window};

const TICK: Duration = Duration::from_secs(20);
const REFRESH: Duration = Duration::from_secs(3 * 60);
const LOOKAHEAD_MS: i64 = 60 * 60 * 1000;
/// Same window as `shouldAlert` in `src/lib/agenda.ts`: from 1 min before the start to 2 min after.
const LEAD_MS: i64 = 60_000;
const LATE_MS: i64 = 2 * 60_000;
/// Bounds the set over a long-running session; losing it only risks re-alerting an event already past.
const MAX_REMEMBERED: usize = 500;

/// Event ids already alerted, shared by this watcher and the UI's `alert_open` so neither rings twice.
#[derive(Default)]
pub struct Alerted(Mutex<HashSet<String>>);

impl Alerted {
    /// True the first time an id is seen; task reminders always pass (snoozes call `open_alert` directly).
    pub fn first(&self, event: &AgendaItem) -> bool {
        if event.id.starts_with(TASK_PREFIX) {
            return true;
        }
        let mut set = self.0.lock().unwrap();
        if set.len() >= MAX_REMEMBERED {
            set.clear();
        }
        set.insert(event.id.clone())
    }
}

pub fn start_ms(e: &AgendaItem) -> Option<i64> {
    if e.all_day {
        return None;
    }
    time::OffsetDateTime::parse(&e.start, &Rfc3339).ok().map(|t| (t.unix_timestamp_nanos() / 1_000_000) as i64)
}

pub fn due(items: &[AgendaItem], now: i64) -> impl Iterator<Item = &AgendaItem> {
    items.iter().filter(move |e| start_ms(e).is_some_and(|s| s - now <= LEAD_MS && s - now > -LATE_MS))
}

/// App Nap coalesces a hidden accessory app's timers by minutes: a 3-minute alert window would be missed.
#[cfg(target_os = "macos")]
fn keep_timers_on_time() {
    use objc2_foundation::{NSActivityOptions, NSProcessInfo, NSString};
    let reason = NSString::from_str("avisos de reunião");
    let token = NSProcessInfo::processInfo()
        .beginActivityWithOptions_reason(NSActivityOptions::UserInitiatedAllowingIdleSystemSleep, &reason);
    // Held for the whole process: ending the activity would re-enable App Nap.
    std::mem::forget(token);
}

pub fn watch(app: AppHandle) {
    #[cfg(target_os = "macos")]
    keep_timers_on_time();
    std::thread::spawn(move || {
        let mut items: Vec<AgendaItem> = Vec::new();
        let mut fetched: Option<Instant> = None;
        loop {
            if !app.state::<AppState>().is_unlocked() {
                items.clear();
                fetched = None;
            } else {
                if fetched.is_none_or(|t| t.elapsed() >= REFRESH) {
                    if let Some(fresh) = fetch(&app) {
                        items = fresh;
                    }
                    fetched = Some(Instant::now());
                }
                let alerted = app.state::<Alerted>();
                for event in due(&items, now_ms()) {
                    if alerted.first(event) {
                        let _ = window::open_alert(&app, event.clone());
                    }
                }
            }
            std::thread::sleep(TICK);
        }
    });
}

fn fetch(app: &AppHandle) -> Option<Vec<AgendaItem>> {
    let now = now_ms();
    let fmt = |ms: i64| time::OffsetDateTime::from_unix_timestamp(ms.div_euclid(1000)).ok()?.format(&Rfc3339).ok();
    // Starts a little in the past so an event that began a minute ago is still caught.
    let (min, max) = (fmt(now - LATE_MS)?, fmt(now + LOOKAHEAD_MS)?);
    cmd_extras::agenda(&app.state::<AppState>(), &min, &max, 20).ok()
}

#[cfg(test)]
mod tests {
    use super::*;

    const NOW: i64 = 1_789_700_400_000; // 2026-09-18T03:00:00Z

    fn event(id: &str, start: &str, all_day: bool) -> AgendaItem {
        AgendaItem { id: id.into(), start: start.into(), all_day, ..Default::default() }
    }

    fn due_ids(items: &[AgendaItem]) -> Vec<&str> {
        due(items, NOW).map(|e| e.id.as_str()).collect()
    }

    #[test]
    fn rings_from_one_minute_before_until_two_minutes_after_the_start() {
        let items = [
            event("in-30s", "2026-09-18T03:00:30Z", false),
            event("started-1m", "2026-09-18T02:59:00Z", false),
            event("in-5m", "2026-09-18T03:05:00Z", false),
            event("started-3m", "2026-09-18T02:57:00Z", false),
            event("other-offset", "2026-09-18T00:00:45-03:00", false),
        ];
        assert_eq!(due_ids(&items), ["in-30s", "started-1m", "other-offset"]);
    }

    #[test]
    fn all_day_and_unparsable_events_never_ring() {
        let items = [event("all-day", "2026-09-18", true), event("bad", "amanhã", false)];
        assert!(due_ids(&items).is_empty());
    }

    #[test]
    fn a_meeting_rings_once_but_task_reminders_always_pass() {
        let alerted = Alerted::default();
        let meeting = event("ev1", "", false);
        assert!(alerted.first(&meeting));
        assert!(!alerted.first(&meeting), "the UI and the Rust watcher must not both ring");
        let task = event("task:t1", "", false);
        assert!(alerted.first(&task) && alerted.first(&task));
    }
}
