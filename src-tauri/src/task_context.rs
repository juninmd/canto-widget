//! "Remind me when I open Slack / join the office Wi-Fi": the place a task waits for instead of a clock time.
use serde::{Deserialize, Serialize};
use tauri::State;

use crate::error::{AppError, Result};
use crate::model::{next_version, now_ms, VaultData};
use crate::vault::AppState;

const MAX_LEN: usize = 64;

/// New synced field: an older install ignores it on read and drops it on its next save of the task.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum TaskContext {
    /// The frontmost program, named as the activity log names it (`Code`, `Slack`, `Safari`).
    App { name: String },
    /// The Wi-Fi network (SSID) the computer is connected to.
    Wifi { name: String },
}

/// What the probes saw on this tick; `None` is "unknown", which never matches.
#[derive(Debug, Default, Clone, PartialEq)]
pub struct Seen {
    pub app: Option<String>,
    pub wifi: Option<String>,
}

/// Case and a trailing `.exe` never matter: `slack` is the `Slack.exe` the user sees in the task manager.
fn norm(raw: &str) -> String {
    let low = raw.trim().to_lowercase();
    low.strip_suffix(".exe").unwrap_or(&low).trim().to_string()
}

impl TaskContext {
    pub fn name(&self) -> &str {
        match self {
            TaskContext::App { name } | TaskContext::Wifi { name } => name,
        }
    }

    pub fn matches(&self, seen: &Seen) -> bool {
        let (name, now) = match self {
            TaskContext::App { name } => (name, &seen.app),
            TaskContext::Wifi { name } => (name, &seen.wifi),
        };
        now.as_deref().is_some_and(|now| norm(now) == norm(name))
    }
}

/// The name arrives from the webview: trimmed, non-empty, bounded and free of control characters.
pub fn clean(context: TaskContext) -> Result<TaskContext> {
    let name = context.name().trim().to_string();
    if name.is_empty() || name.chars().count() > MAX_LEN || name.chars().any(char::is_control) {
        return Err(AppError::Config("nome do app ou da rede inválido".into()));
    }
    Ok(match context {
        TaskContext::App { .. } => TaskContext::App { name },
        TaskContext::Wifi { .. } => TaskContext::Wifi { name },
    })
}

pub fn set_context(d: &mut VaultData, id: &str, context: Option<TaskContext>, now: i64) -> Result<()> {
    let context = context.map(clean).transpose()?;
    let t = d.tasks.iter_mut().find(|t| t.id == id).ok_or(AppError::NotFound)?;
    t.context = context;
    t.updated_at = next_version(t.updated_at, now);
    Ok(())
}

#[tauri::command(async)]
pub fn task_set_context(state: State<'_, AppState>, id: String, context: Option<TaskContext>) -> Result<()> {
    state.mutate(|d| set_context(d, &id, context, now_ms()))?
}

#[cfg(test)]
#[path = "task_context_tests.rs"]
mod tests;
