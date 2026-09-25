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
/// Far enough ahead to keep ringing through a long locked stretch: the Google token only exists unlocked.
const LOOKAHEAD_MS: i64 = 12 * 60 * 60 * 1000;
const MAX_EVENTS: u32 = 50;
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

/// What the watcher keeps across a lock: only what the alert shows, never descriptions, guests or attachments.
pub fn slim(e: &AgendaItem) -> AgendaItem {
    AgendaItem {
        id: e.id.clone(),
        title: e.title.clone(),
        start: e.start.clone(),
        end: e.end.clone(),
        all_day: e.all_day,
        location: e.location.clone(),
        meet: e.meet.clone(),
        link: e.link.clone(),
        ..Default::default()
    }
}

/// One watcher step. Unlocked, the cache is refreshed when due; locked, it keeps ringing from the events
/// fetched before the lock. Past events are dropped so the cache only shrinks while locked.
pub fn step(cache: &mut Vec<AgendaItem>, refresh: Option<Vec<AgendaItem>>, now: i64) -> Vec<AgendaItem> {
    if let Some(fresh) = refresh {
        *cache = fresh.iter().map(slim).collect();
    }
    cache.retain(|e| start_ms(e).is_some_and(|s| s - now > -LATE_MS));
    due(cache, now).cloned().collect()
}

pub fn watch(app: AppHandle) {
    #[cfg(target_os = "macos")]
    keep_timers_on_time();
    std::thread::spawn(move || {
        let mut items: Vec<AgendaItem> = Vec::new();
        let mut fetched: Option<Instant> = None;
        loop {
            let refresh = if !app.state::<AppState>().is_unlocked() {
                // Refetch as soon as the vault opens again.
                fetched = None;
                None
            } else if fetched.is_none_or(|t| t.elapsed() >= REFRESH) {
                fetched = Some(Instant::now());
                fetch(&app)
            } else {
                None
            };
            let alerted = app.state::<Alerted>();
            for event in step(&mut items, refresh, now_ms()) {
                if alerted.first(&event) {
                    let _ = window::open_alert(&app, event);
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
    cmd_extras::agenda(&app.state::<AppState>(), &min, &max, MAX_EVENTS).ok()
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

    #[test]
    fn keeps_ringing_from_the_cache_while_locked_and_drops_past_events() {
        let mut cache = Vec::new();
        let fetched = vec![
            AgendaItem {
                description: "pauta secreta".into(),
                guests: 9,
                ..event("soon", "2026-09-18T03:30:00Z", false)
            },
            event("over", "2026-09-18T02:00:00Z", false),
        ];
        assert!(step(&mut cache, Some(fetched), NOW).is_empty());
        assert_eq!(cache.len(), 1, "an event that already started long ago is dropped");
        assert!(cache[0].description.is_empty() && cache[0].guests == 0, "only what the alert shows is kept");

        // Locked: no refresh, yet the cached meeting still rings at its time.
        let at = NOW + 29 * 60_000 + 30_000;
        let rung: Vec<_> = step(&mut cache, None, at).into_iter().map(|e| e.id).collect();
        assert_eq!(rung, ["soon"]);
    }
}
