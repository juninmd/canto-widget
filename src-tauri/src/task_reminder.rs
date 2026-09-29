//! Task reminders driven from Rust, like `meeting_alert`: a hidden webview (WKWebView on macOS) suspends
//! its timers, so the UI watcher never rang with the widget parked in the tray.
use std::collections::HashMap;
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

/// Reminders already rung, by `key`, with the time they were for. Kept across locks: locking and unlocking within
/// the tolerance would otherwise ring the same reminder again.
#[derive(Default)]
pub struct Rung(HashMap<String, NaiveDateTime>);

/// Well past any tolerance, lead or DST fall-back that could make a reminder due again.
const REMEMBER_FOR: chrono::Duration = chrono::Duration::days(2);

impl Rung {
    pub fn contains(&self, t: &Task) -> bool {
        self.0.contains_key(&key(t))
    }

    pub fn insert(&mut self, t: &Task) {
        if let Some(when) = at(t) {
            self.0.insert(key(t), when);
        }
    }

    /// Keeps the memory bounded over a session that stays open for weeks.
    pub fn forget_before(&mut self, now: NaiveDateTime) {
        self.0.retain(|_, when| *when > now - REMEMBER_FOR);
    }
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
pub fn due<'a>(tasks: &'a [Task], rung: &Rung, since: NaiveDateTime, now: NaiveDateTime, lead: i64) -> Vec<&'a Task> {
    let from = window_start(since, now);
    tasks
        .iter()
        .filter(|t| !t.done && !rung.contains(t))
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

/// What the watcher carries between ticks.
#[derive(Default)]
pub struct Memory {
    pub rung: Rung,
    last: Option<(NaiveDateTime, Instant)>,
}

impl Memory {
    /// The clock gap is meaningless across a lock, but what already rang stays rung.
    pub fn lock(&mut self) {
        self.last = None;
    }

    /// One unlocked tick: the tasks to ring now, already marked as rung.
    pub fn tick(&mut self, now: NaiveDateTime, lead: i64, tasks_for: impl Fn(&str) -> Vec<Task>) -> Vec<Task> {
        // A short real gap means the local clock itself jumped (DST): cover what it skipped.
        // A long one (sleep, hibernate) falls back to the tolerance instead of ringing old reminders.
        let since = self.last.filter(|(_, at)| at.elapsed() < TICK * 3).map_or(now, |(naive, _)| naive);
        self.rung.forget_before(now);
        let mut ring = Vec::new();
        for day in days_to_check(since, now, lead) {
            let tasks = tasks_for(&day);
            let fresh: Vec<Task> = due(&tasks, &self.rung, since, now, lead).into_iter().cloned().collect();
            fresh.iter().for_each(|t| self.rung.insert(t));
            ring.extend(fresh);
        }
        self.last = Some((now, Instant::now()));
        ring
    }
}

pub fn watch(app: AppHandle) {
    std::thread::spawn(move || {
        let mut memory = Memory::default();
        loop {
            let state = app.state::<AppState>();
            if !state.is_unlocked() {
                memory.lock();
            } else {
                // Local time from chrono: `time`'s local offset is refused in multithreaded processes.
                let now = Local::now().naive_local();
                let lead = app.state::<ReminderLead>().0.load(Ordering::Relaxed);
                for t in memory.tick(now, lead, |day| reminders_for(&state, day).unwrap_or_default()) {
                    let _ = window::open_alert(&app, to_event(&t));
                }
            }
            std::thread::sleep(TICK);
        }
    });
}

#[cfg(test)]
#[path = "task_reminder_tests.rs"]
mod tests;
