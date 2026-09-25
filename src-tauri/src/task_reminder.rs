//! Task reminders driven from Rust, like `meeting_alert`: a hidden webview (WKWebView on macOS) suspends
//! its timers, so the UI watcher never rang with the widget parked in the tray.
use std::collections::HashSet;
use std::sync::atomic::{AtomicI64, Ordering};
use std::time::{Duration, Instant};

use chrono::{Local, NaiveDate, NaiveDateTime, NaiveTime, TimeZone};
use tauri::{AppHandle, Manager, State};

use crate::calendar::AgendaItem;
use crate::error::{AppError, Result};
use crate::model::Task;
use crate::notification::TASK_PREFIX;
use crate::routine::reminders_for;
use crate::vault::AppState;
use crate::window;

const TICK: Duration = Duration::from_secs(20);
/// The watcher can run late (sleep, App Nap): a reminder still counts for this long after its time.
const TOLERANCE_MIN: i64 = 2;
/// Same options as `LEAD_OPTIONS` in `src/lib/reminderLead.ts`.
const LEAD_OPTIONS: [i64; 5] = [0, 5, 10, 15, 30];

/// Minutes before the task's time; the choice lives in the UI's localStorage and is pushed here.
#[derive(Default)]
pub struct ReminderLead(AtomicI64);

#[tauri::command]
pub fn reminder_lead_set(lead: State<'_, ReminderLead>, minutes: i64) -> Result<()> {
    if !LEAD_OPTIONS.contains(&minutes) {
        return Err(AppError::Config("antecedência de lembrete inválida".into()));
    }
    lead.0.store(minutes, Ordering::Relaxed);
    Ok(())
}

/// Includes day and time: rescheduling the task produces a new reminder.
pub fn key(t: &Task) -> String {
    format!("{}@{}T{}", t.id, t.day, t.reminder_time.as_deref().unwrap_or(""))
}

fn at(t: &Task) -> Option<NaiveDateTime> {
    let day = NaiveDate::parse_from_str(&t.day, "%Y-%m-%d").ok()?;
    let time = NaiveTime::parse_from_str(t.reminder_time.as_deref()?, "%H:%M").ok()?;
    Some(day.and_time(time))
}

/// Earliest instant (exclusive) whose reminders still count: the last tick, or the tolerance if that's older.
fn window_start(since: NaiveDateTime, now: NaiveDateTime) -> NaiveDateTime {
    since.min(now - chrono::Duration::minutes(TOLERANCE_MIN))
}

/// Open tasks whose time (minus `lead` minutes) fell in `(since or now - TOLERANCE_MIN, now]` and haven't rung yet.
/// `since` is the previous tick: a local-clock jump between two ticks (DST) can't skip a reminder.
pub fn due<'a>(
    tasks: &'a [Task],
    rung: &HashSet<String>,
    since: NaiveDateTime,
    now: NaiveDateTime,
    lead: i64,
) -> Vec<&'a Task> {
    let from = window_start(since, now);
    tasks
        .iter()
        .filter(|t| !t.done && !rung.contains(&key(t)))
        .filter(|t| {
            at(t).is_some_and(|start| {
                let point = start - chrono::Duration::minutes(lead);
                from < point && point <= now
            })
        })
        .collect()
}

/// Days whose tasks can be due in the window; a lead or a late tick may reach across midnight.
pub fn days_to_check(since: NaiveDateTime, now: NaiveDateTime, lead: i64) -> Vec<String> {
    let lead = chrono::Duration::minutes(lead);
    let (first, last) = ((window_start(since, now) + lead).date(), (now + lead).date());
    std::iter::successors(Some(first), |d| d.succ_opt().filter(|next| *next <= last))
        .map(|d| d.format("%Y-%m-%d").to_string())
        .collect()
}

/// The alert overlay speaks the agenda's language; the task becomes an event with a tagged id.
pub fn to_event(t: &Task) -> AgendaItem {
    let start =
        at(t).and_then(|n| Local.from_local_datetime(&n).earliest()).map(|d| d.to_rfc3339()).unwrap_or_default();
    AgendaItem {
        id: format!("{TASK_PREFIX}{}", t.id),
        title: t.title.clone(),
        end: start.clone(),
        start,
        ..Default::default()
    }
}

pub fn watch(app: AppHandle) {
    std::thread::spawn(move || {
        let mut rung: HashSet<String> = HashSet::new();
        let mut last: Option<(NaiveDateTime, Instant)> = None;
        loop {
            let state = app.state::<AppState>();
            if !state.is_unlocked() {
                rung.clear();
                last = None;
            } else {
                // Local time from chrono: `time`'s local offset is refused in multithreaded processes.
                let now = Local::now().naive_local();
                // A short real gap means the local clock itself jumped (DST): cover what it skipped.
                // A long one (sleep, hibernate) falls back to the tolerance instead of ringing old reminders.
                let since = last.filter(|(_, at)| at.elapsed() < TICK * 3).map_or(now, |(naive, _)| naive);
                let lead = app.state::<ReminderLead>().0.load(Ordering::Relaxed);
                for day in days_to_check(since, now, lead) {
                    let Ok(tasks) = reminders_for(&state, &day) else { continue };
                    for t in due(&tasks, &rung, since, now, lead) {
                        rung.insert(key(t));
                        let _ = window::open_alert(&app, to_event(t));
                    }
                }
                last = Some((now, Instant::now()));
            }
            std::thread::sleep(TICK);
        }
    });
}

#[cfg(test)]
mod tests {
    use super::*;

    fn task(id: &str, time: &str) -> Task {
        Task {
            id: id.into(),
            title: "tomar remédio".into(),
            day: "2026-09-09".into(),
            reminder_time: Some(time.into()),
            ..Default::default()
        }
    }

    fn now(h: u32, m: u32, s: u32) -> NaiveDateTime {
        NaiveDate::from_ymd_opt(2026, 9, 9).unwrap().and_hms_opt(h, m, s).unwrap()
    }

    fn rings(t: &Task, at: NaiveDateTime, lead: i64) -> bool {
        !due(std::slice::from_ref(t), &HashSet::new(), at, at, lead).is_empty()
    }

    fn on(day: u32, h: u32, m: u32) -> NaiveDateTime {
        NaiveDate::from_ymd_opt(2026, 9, day).unwrap().and_hms_opt(h, m, 0).unwrap()
    }

    #[test]
    fn a_lead_that_crosses_midnight_checks_tomorrow() {
        assert_eq!(days_to_check(on(9, 23, 40), on(9, 23, 40), 30), ["2026-09-10"]);
        assert_eq!(days_to_check(on(9, 23, 31), on(9, 23, 31), 30), ["2026-09-09", "2026-09-10"]);
        let t = Task { day: "2026-09-10".into(), ..task("t1", "00:10") };
        assert!(rings(&t, on(9, 23, 40), 30));
    }

    #[test]
    fn a_task_just_before_midnight_still_rings_right_after_it() {
        assert_eq!(days_to_check(on(10, 0, 0), on(10, 0, 0), 0), ["2026-09-09", "2026-09-10"]);
        assert!(rings(&task("t1", "23:59"), on(10, 0, 0), 0));
    }

    #[test]
    fn a_clock_jump_forward_between_ticks_still_rings_what_it_skipped() {
        // Spring forward: the local clock goes 01:59:50 -> 03:00:10 in one 20 s tick; 02:30 never "exists".
        let (before, after) = (now(1, 59, 50), now(3, 0, 10));
        let t = task("t1", "02:30");
        assert!(!rings(&t, after, 0));
        assert_eq!(due(std::slice::from_ref(&t), &HashSet::new(), before, after, 0).len(), 1);
    }

    #[test]
    fn after_a_long_sleep_old_reminders_stay_quiet() {
        // The caller passes `since = now` when real time jumped, so only the 2-minute tolerance applies.
        let t = task("t1", "12:00");
        assert!(!rings(&t, now(15, 0, 0), 0));
    }

    #[test]
    fn rings_at_the_time_and_for_two_minutes_after() {
        let t = task("t1", "08:30");
        assert!(!rings(&t, now(8, 29, 59), 0));
        assert!(rings(&t, now(8, 30, 0), 0));
        assert!(rings(&t, now(8, 31, 30), 0));
        assert!(!rings(&t, now(8, 32, 0), 0));
    }

    #[test]
    fn lead_moves_the_window_earlier() {
        let t = task("t1", "08:30");
        assert!(!rings(&t, now(8, 19, 59), 10));
        assert!(rings(&t, now(8, 20, 0), 10));
        assert!(!rings(&t, now(8, 22, 0), 10));
    }

    #[test]
    fn done_already_rung_and_untimed_tasks_stay_quiet() {
        let done = Task { done: true, ..task("d", "08:30") };
        let untimed = Task { reminder_time: None, ..task("u", "08:30") };
        let rung = task("r", "08:30");
        let set = HashSet::from([key(&rung)]);
        assert!(due(&[done, untimed, rung], &set, now(8, 30, 0), now(8, 30, 0), 0).is_empty());
    }

    #[test]
    fn rescheduling_rings_again() {
        let before = task("t1", "08:30");
        let set = HashSet::from([key(&before)]);
        assert_eq!(due(&[task("t1", "09:00")], &set, now(9, 0, 0), now(9, 0, 0), 0).len(), 1);
    }

    #[test]
    fn the_event_carries_the_task_prefix_and_title() {
        let e = to_event(&task("t9", "08:30"));
        assert_eq!(e.id, "task:t9");
        assert_eq!(e.title, "tomar remédio");
        assert!(e.start.contains("T08:30:00"), "{}", e.start);
    }
}
