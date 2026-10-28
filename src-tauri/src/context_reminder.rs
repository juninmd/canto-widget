//! Reminders that wait for a place instead of a time (see `task_context`). Rung from Rust like `task_reminder`,
//! because a parked widget's webview sleeps. Nothing is probed, and no tool is run, while no open task has a context.
use std::collections::HashMap;
use std::time::Duration;

use chrono::Local;
use tauri::{AppHandle, Manager};

use crate::activity_os;
use crate::calendar::AgendaItem;
use crate::error::Result;
use crate::model::{now_ms, Task};
use crate::notification::TASK_PREFIX;
use crate::routine::materialize;
use crate::task_context::{Seen, TaskContext};
use crate::vault::AppState;
use crate::wifi_os;
use crate::window;

const TICK: Duration = Duration::from_secs(15);

/// Task id -> the day it already rang. Kept across locks, so unlocking in the same place doesn't ring it again.
#[derive(Default)]
pub struct Rung(HashMap<String, String>);

impl Rung {
    /// Open tasks, today or overdue, whose context holds now and that haven't rung today; marks them rung.
    pub fn take_due(&mut self, tasks: &[Task], seen: &Seen, today: &str) -> Vec<Task> {
        self.0.retain(|_, day| day == today);
        let due: Vec<Task> = tasks
            .iter()
            .filter(|t| !t.done && t.day.as_str() <= today && !self.0.contains_key(&t.id))
            .filter(|t| t.context.as_ref().is_some_and(|c| c.matches(seen)))
            .cloned()
            .collect();
        due.iter().for_each(|t| {
            self.0.insert(t.id.clone(), today.to_string());
        });
        due
    }
}

/// Only what the tasks ask about is probed: a Wi-Fi tool is not run for someone who only watches apps.
pub fn observe(tasks: &[Task], app: impl Fn() -> Option<String>, wifi: impl Fn() -> Option<String>) -> Seen {
    let wants = |f: fn(&TaskContext) -> bool| tasks.iter().any(|t| t.context.as_ref().is_some_and(f));
    Seen {
        app: wants(|c| matches!(c, TaskContext::App { .. })).then(app).flatten(),
        wifi: wants(|c| matches!(c, TaskContext::Wifi { .. })).then(wifi).flatten(),
    }
}

/// Open tasks of today or earlier with a context, after materializing today's recurring instances.
fn with_context(state: &AppState, today: &str) -> Result<Vec<Task>> {
    state.in_background(|d| {
        let created = materialize(d, today, now_ms());
        let list = d.tasks.iter().filter(|t| !t.done && t.context.is_some()).cloned().collect();
        (list, created > 0)
    })
}

/// One watcher tick: the tasks that must ring now, already marked as rung.
pub fn tick(
    state: &AppState,
    rung: &mut Rung,
    today: &str,
    app: impl Fn() -> Option<String>,
    wifi: impl Fn() -> Option<String>,
) -> Vec<Task> {
    let tasks = with_context(state, today).unwrap_or_default();
    if tasks.is_empty() {
        return Vec::new();
    }
    let seen = observe(&tasks, app, wifi);
    rung.take_due(&tasks, &seen, today)
}

pub fn to_event(t: &Task) -> AgendaItem {
    let now = Local::now().to_rfc3339();
    AgendaItem {
        id: format!("{TASK_PREFIX}{}", t.id),
        title: t.title.clone(),
        start: now.clone(),
        end: now,
        ..Default::default()
    }
}

pub fn watch(app: AppHandle) {
    std::thread::spawn(move || {
        let mut rung = Rung::default();
        loop {
            let state = app.state::<AppState>();
            if state.is_unlocked() {
                // Local time from chrono: `time`'s local offset is refused in multithreaded processes.
                let today = Local::now().format("%Y-%m-%d").to_string();
                for t in tick(&state, &mut rung, &today, activity_os::foreground_app, wifi_os::current_ssid) {
                    let _ = window::open_alert(&app, to_event(&t));
                }
            }
            std::thread::sleep(TICK);
        }
    });
}

#[cfg(test)]
#[path = "context_reminder_tests.rs"]
mod tests;
