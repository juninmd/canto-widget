//! What became of each alert today, for the notifications column of the maximized mode.
//! Memory only: meeting and PR titles are as sensitive as the agenda, so nothing is written to disk.
use std::collections::VecDeque;
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use tauri::Manager;

use crate::calendar::AgendaItem;

/// A day of alerts is a few dozen; the bound only protects a long-running widget.
pub const MAX_ENTRIES: usize = 50;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Outcome {
    /// The main action: joined the meeting, opened the PR, completed the task.
    Done,
    Snoozed,
    Closed,
    Muted,
}

#[derive(Debug, Clone, Serialize)]
pub struct Resolved {
    pub item: AgendaItem,
    pub outcome: Outcome,
    /// Unix milliseconds; the webview decides what "today" means (the Rust timezone is unreliable).
    pub at: i64,
}

#[derive(Default)]
pub struct AlertLog(Mutex<VecDeque<Resolved>>);

impl AlertLog {
    pub fn push(&self, item: AgendaItem, outcome: Outcome, at: i64) {
        let mut list = self.0.lock().unwrap();
        list.push_front(Resolved { item, outcome, at });
        list.truncate(MAX_ENTRIES);
    }

    pub fn list(&self) -> Vec<Resolved> {
        self.0.lock().unwrap().iter().cloned().collect()
    }
}

fn now_ms() -> i64 {
    SystemTime::now().duration_since(UNIX_EPOCH).map_or(0, |d| d.as_millis() as i64)
}

pub fn record(app: &tauri::AppHandle, item: AgendaItem, outcome: Outcome) {
    if let Some(log) = app.try_state::<AlertLog>() {
        log.push(item, outcome, now_ms());
    }
}

#[tauri::command]
pub fn alert_log(log: tauri::State<'_, AlertLog>) -> Vec<Resolved> {
    log.list()
}

#[cfg(test)]
#[path = "alert_log_tests.rs"]
mod tests;
