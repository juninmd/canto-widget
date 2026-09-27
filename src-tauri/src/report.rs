//! The vault's side of the period report: tasks done and notes written in the period, bounded for the webview.
use chrono::NaiveDate;
use serde::Serialize;

use crate::error::{AppError, Result};
use crate::model::{Note, Task};

/// A month of tasks and notes stays far below this; it only bounds one IPC message.
pub const LIST_MAX: usize = 300;
/// The longest period the UI offers is a calendar month.
const MAX_DAYS: i64 = 31;
const TITLE_CHARS: usize = 80;

#[derive(Debug, Serialize, PartialEq)]
pub struct DoneTask {
    pub title: String,
    pub day: String,
}

#[derive(Debug, Serialize, PartialEq)]
pub struct TouchedNote {
    pub title: String,
    /// Created in the period; otherwise it existed before and was edited in it.
    pub created: bool,
    pub at: i64,
}

#[derive(Debug, Default, Serialize, PartialEq)]
pub struct VaultPeriod {
    pub done: Vec<DoneTask>,
    pub done_total: usize,
    pub notes: Vec<TouchedNote>,
    pub notes_total: usize,
}

/// Local days `YYYY-MM-DD` from the UI, in order and at most a month apart.
pub fn check_days(from_day: &str, to_day: &str) -> Result<()> {
    let parse = |d: &str| NaiveDate::parse_from_str(d, "%Y-%m-%d").ok().filter(|_| d.len() == 10);
    match (parse(from_day), parse(to_day)) {
        (Some(a), Some(b)) if a <= b && (b - a).num_days() < MAX_DAYS => Ok(()),
        _ => Err(AppError::Config("período inválido".into())),
    }
}

/// The model has no completion time, so a done task counts on its `day`: carry-over keeps unfinished
/// tasks on today, which makes that normally the day it was done. Notes use their own timestamps.
pub fn period(tasks: &[Task], notes: &[Note], from_day: &str, to_day: &str, from_ms: i64, to_ms: i64) -> VaultPeriod {
    let mut done: Vec<&Task> =
        tasks.iter().filter(|t| t.done && t.day.as_str() >= from_day && t.day.as_str() <= to_day).collect();
    done.sort_by(|a, b| (&a.day, a.updated_at).cmp(&(&b.day, b.updated_at)));
    let inside = |ms: i64| (from_ms..to_ms).contains(&ms);
    let mut touched: Vec<TouchedNote> = notes
        .iter()
        .filter(|n| inside(n.created_at) || inside(n.updated_at))
        .map(|n| TouchedNote {
            title: note_title(n),
            created: inside(n.created_at),
            at: if inside(n.updated_at) { n.updated_at } else { n.created_at },
        })
        .collect();
    touched.sort_by_key(|n| n.at);
    VaultPeriod {
        done_total: done.len(),
        done: done
            .into_iter()
            .take(LIST_MAX)
            .map(|t| DoneTask { title: t.title.clone(), day: t.day.clone() })
            .collect(),
        notes_total: touched.len(),
        notes: touched.into_iter().take(LIST_MAX).collect(),
    }
}

/// An untitled note is named by its first line, as the notes list shows it.
fn note_title(n: &Note) -> String {
    let raw =
        if n.title.trim().is_empty() { n.body.lines().find(|l| !l.trim().is_empty()).unwrap_or("") } else { &n.title };
    raw.trim().chars().take(TITLE_CHARS).collect()
}

#[cfg(test)]
#[path = "report_tests.rs"]
mod tests;
