//! Which application had focus and when, as spans of unix seconds. Only the application name is kept, never a
//! window title, and the log lives in a sealed local file that is not part of the synced vault.
use serde::{Deserialize, Serialize};

pub const ACTIVITY_AAD: &[u8] = b"canto.activity.v1";

/// How often the sampler looks; a sample means "this app had focus during the last interval".
pub const INTERVAL_SECS: i64 = 5;
/// Two samples further apart than this (idle, locked, app closed) start a new span.
const GAP_SECS: i64 = INTERVAL_SECS * 3;
const RETENTION_SECS: i64 = 35 * 24 * 3600;
const MAX_SPANS: usize = 60_000;
const APP_CHARS: usize = 60;
/// Two flushes of one task closer than this are one stretch; the UI flushes every minute, give or take a second.
const FOCUS_GAP_SECS: i64 = 10;
const TASK_ID_CHARS: usize = 100;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Span {
    pub app: String,
    pub start: i64,
    pub end: i64,
}

/// A stretch with the computer on and Canto running but no keyboard or mouse input.
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub struct Away {
    pub start: i64,
    pub end: i64,
}

/// Time the focus timer spent on one task. Only the task id is kept, never its title.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct FocusSpan {
    pub task: String,
    pub start: i64,
    pub end: i64,
}

#[derive(Debug, Default, Clone, PartialEq, Serialize, Deserialize)]
pub struct Log {
    #[serde(default)]
    pub spans: Vec<Span>,
    /// Older logs have no such key; they load with none.
    #[serde(default)]
    pub idle: Vec<Away>,
    /// Same: logs from before the per-task time have no such key.
    #[serde(default)]
    pub focus: Vec<FocusSpan>,
}

impl Log {
    /// Adds one sample taken at `now` (unix seconds). `None` (idle or unknown) adds nothing: gaps are the idle time.
    pub fn record(&mut self, app: Option<&str>, now: i64) {
        let Some(app) = app.map(clean).filter(|a| !a.is_empty()) else { return };
        let from = now - INTERVAL_SECS;
        match self.spans.last_mut() {
            Some(last) if last.app == app && from - last.end <= GAP_SECS - INTERVAL_SECS => {
                last.end = last.end.max(now)
            }
            _ => self.spans.push(Span { app, start: from, end: now }),
        }
        self.prune(now);
    }

    /// Adds one idle sample taken at `now`; the user was away, which is not the same as a gap in the log.
    pub fn record_idle(&mut self, now: i64) {
        let from = now - INTERVAL_SECS;
        match self.idle.last_mut() {
            Some(last) if from - last.end <= GAP_SECS - INTERVAL_SECS => last.end = last.end.max(now),
            _ => self.idle.push(Away { start: from, end: now }),
        }
        self.prune(now);
    }

    /// Adds the `secs` the focus timer just flushed for `task`, ending at `now`.
    pub fn record_focus(&mut self, task: &str, secs: u32, now: i64) {
        let task: String = task.chars().take(TASK_ID_CHARS).collect();
        if task.is_empty() || secs == 0 {
            return;
        }
        let from = now - i64::from(secs);
        match self.focus.last_mut() {
            Some(last) if last.task == task && from - last.end <= FOCUS_GAP_SECS => last.end = last.end.max(now),
            _ => self.focus.push(FocusSpan { task, start: from, end: now }),
        }
        self.prune(now);
    }

    pub fn clear(&mut self) {
        self.spans.clear();
        self.idle.clear();
        self.focus.clear();
    }

    fn prune(&mut self, now: i64) {
        let oldest = now - RETENTION_SECS;
        self.spans.retain(|s| s.end >= oldest);
        self.idle.retain(|a| a.end >= oldest);
        self.focus.retain(|f| f.end >= oldest);
        if self.spans.len() > MAX_SPANS {
            self.spans.drain(0..self.spans.len() - MAX_SPANS);
        }
        if self.idle.len() > MAX_SPANS {
            self.idle.drain(0..self.idle.len() - MAX_SPANS);
        }
        if self.focus.len() > MAX_SPANS {
            self.focus.drain(0..self.focus.len() - MAX_SPANS);
        }
    }
}

/// A process name is the only thing kept: trimmed, one line, bounded.
fn clean(app: &str) -> String {
    app.lines().next().unwrap_or("").trim().chars().take(APP_CHARS).collect()
}

#[derive(Debug, Serialize, PartialEq)]
pub struct AppTotal {
    pub app: String,
    pub secs: i64,
}

/// Focus time on one task inside the window; the command fills `title` from the vault (None: the task is gone).
#[derive(Debug, Serialize, PartialEq)]
pub struct FocusTotal {
    pub task: String,
    pub title: Option<String>,
    pub secs: i64,
}

#[derive(Debug, Default, Serialize, PartialEq)]
pub struct Summary {
    /// Spans clipped to the window, oldest first.
    pub spans: Vec<Span>,
    /// Time per application, most used first.
    pub apps: Vec<AppTotal>,
    pub total_secs: i64,
    /// Away stretches clipped to the window, oldest first.
    pub idle: Vec<Away>,
    pub idle_secs: i64,
    /// Time per task from the focus timer, most first.
    pub focus: Vec<FocusTotal>,
}

/// Bounds the answer to the webview; the newest spans win, since they are the ones the timeline shows.
const SPANS_MAX: usize = 4_000;

pub fn summarize(log: &Log, from: i64, to: i64) -> Summary {
    let mut spans: Vec<Span> = log
        .spans
        .iter()
        .filter(|s| s.end > from && s.start < to)
        .map(|s| Span { app: s.app.clone(), start: s.start.max(from), end: s.end.min(to) })
        .collect();
    spans.sort_by_key(|s| s.start);
    let mut totals: Vec<AppTotal> = Vec::new();
    for s in &spans {
        match totals.iter_mut().find(|t| t.app == s.app) {
            Some(t) => t.secs += s.end - s.start,
            None => totals.push(AppTotal { app: s.app.clone(), secs: s.end - s.start }),
        }
    }
    totals.sort_by(|a, b| b.secs.cmp(&a.secs).then_with(|| a.app.cmp(&b.app)));
    let total_secs = totals.iter().map(|t| t.secs).sum();
    if spans.len() > SPANS_MAX {
        spans.drain(0..spans.len() - SPANS_MAX);
    }
    let idle: Vec<Away> = log
        .idle
        .iter()
        .filter(|a| a.end > from && a.start < to)
        .map(|a| Away { start: a.start.max(from), end: a.end.min(to) })
        .collect();
    let idle_secs = idle.iter().map(|a| a.end - a.start).sum();
    let mut focus: Vec<FocusTotal> = Vec::new();
    for f in log.focus.iter().filter(|f| f.end > from && f.start < to) {
        let secs = f.end.min(to) - f.start.max(from);
        match focus.iter_mut().find(|t| t.task == f.task) {
            Some(t) => t.secs += secs,
            None => focus.push(FocusTotal { task: f.task.clone(), title: None, secs }),
        }
    }
    focus.sort_by(|a, b| b.secs.cmp(&a.secs).then_with(|| a.task.cmp(&b.task)));
    Summary {
        spans,
        apps: totals,
        total_secs,
        idle: idle.into_iter().rev().take(SPANS_MAX).rev().collect(),
        idle_secs,
        focus,
    }
}

#[cfg(test)]
#[path = "activity_tests.rs"]
mod tests;
