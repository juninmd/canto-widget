use tauri::State;

use crate::error::{AppError, Result};
use crate::model::{now_ms, Task};
use crate::vault::AppState;

/// Task title always arrives trimmed and never empty, on create and on rename.
fn task_title(raw: &str) -> Result<String> {
    let clean = raw.trim();
    if clean.is_empty() {
        return Err(AppError::Config("a tarefa precisa de um titulo".into()));
    }
    Ok(clean.to_string())
}

pub fn new_id() -> String {
    format!("{:x}{:x}", now_ms(), rand::random::<u32>())
}

#[derive(serde::Serialize)]
pub struct Status {
    exists: bool,
    unlocked: bool,
}

#[tauri::command]
pub fn vault_status(state: State<'_, AppState>) -> Status {
    Status {
        exists: state.vault_exists(),
        unlocked: state.is_unlocked(),
    }
}

#[tauri::command(async)]
pub fn vault_create(state: State<'_, AppState>, password: String) -> Result<()> {
    state.create(&password)
}

#[tauri::command(async)]
pub fn vault_unlock(state: State<'_, AppState>, password: String) -> Result<()> {
    state.unlock(&password)
}

#[tauri::command]
pub fn vault_lock(state: State<'_, AppState>) {
    state.lock();
}

#[tauri::command(async)]
pub fn tasks_for_day(state: State<'_, AppState>, day: String) -> Result<Vec<Task>> {
    state.mutate_if(|d| crate::routine::materialize(d, &day, now_ms()) > 0)?;
    state.read(|d| {
        let mut list: Vec<Task> = d.tasks.iter().filter(|t| t.day == day).cloned().collect();
        list.sort_by_key(|t| (t.done, t.created_at));
        list
    })
}

#[tauri::command(async)]
pub fn task_add(state: State<'_, AppState>, title: String, day: String) -> Result<Task> {
    let title = task_title(&title)?;
    let now = now_ms();
    let task = Task {
        id: new_id(),
        title,
        done: false,
        day,
        created_at: now,
        updated_at: now,
        ..Default::default()
    };
    let created = task.clone();
    state.mutate(|d| d.tasks.push(task))?;
    Ok(created)
}

#[tauri::command(async)]
pub fn task_toggle(state: State<'_, AppState>, id: String) -> Result<()> {
    state.mutate(|d| {
        if let Some(t) = d.tasks.iter_mut().find(|t| t.id == id) {
            t.done = !t.done;
            t.updated_at = now_ms();
        }
    })
}

/// Idempotent, unlike toggle: a reminder's "complete" must not reopen a task already marked from the list.
#[tauri::command(async)]
pub fn task_complete(state: State<'_, AppState>, id: String) -> Result<()> {
    state.mutate_if(|d| complete(d, &id, now_ms()))
}

pub fn complete(d: &mut crate::model::VaultData, id: &str, now: i64) -> bool {
    match d.tasks.iter_mut().find(|t| t.id == id && !t.done) {
        Some(t) => {
            t.done = true;
            t.updated_at = now;
            true
        }
        None => false,
    }
}

#[tauri::command(async)]
pub fn task_rename(state: State<'_, AppState>, id: String, title: String) -> Result<()> {
    let title = task_title(&title)?;
    state.mutate(|d| {
        if let Some(t) = d.tasks.iter_mut().find(|t| t.id == id) {
            t.title = title;
            t.updated_at = now_ms();
        }
    })
}

fn pr_url(raw: Option<String>) -> Result<Option<String>> {
    let Some(raw) = raw else { return Ok(None) };
    let clean = raw.trim();
    if clean.is_empty() {
        return Ok(None);
    }
    if !(clean.starts_with("https://") || clean.starts_with("http://")) {
        return Err(AppError::Config("link precisa comecar com http(s)://".into()));
    }
    Ok(Some(clean.to_string()))
}

/// `url: None` clears the link, matching the "unset by omission" shape the frontend already uses for schedule.
#[tauri::command(async)]
pub fn task_link_pr(state: State<'_, AppState>, id: String, url: Option<String>) -> Result<()> {
    let url = pr_url(url)?;
    state.mutate(|d| {
        if let Some(t) = d.tasks.iter_mut().find(|t| t.id == id) {
            t.pr_url = url;
            t.updated_at = now_ms();
        }
    })
}

/// Marks deliberate user activity to postpone auto-lock.
#[tauri::command]
pub fn vault_touch(state: State<'_, AppState>) {
    if state.is_unlocked() {
        state.touch();
    }
}

/// Brings to `day` the open tasks from earlier days, without duplicating anything.
#[tauri::command(async)]
pub fn tasks_carry_over(state: State<'_, AppState>, day: String) -> Result<usize> {
    state.mutate(|d| {
        let now = now_ms();
        let mut moved = 0;
        for t in d.tasks.iter_mut() {
            // A recurring series gets its own instance for the day; carrying it over would duplicate the task.
            if !t.done && t.day < day && t.series.is_none() {
                t.day = day.clone();
                t.updated_at = now;
                moved += 1;
            }
        }
        moved
    })
}

#[tauri::command(async)]
pub fn item_delete(state: State<'_, AppState>, id: String) -> Result<Option<String>> {
    let removed = state.mutate(|d| d.remove(&id, now_ms()))?;
    Ok(removed.and_then(|r| state.store_in_trash(r)))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn valid_title_comes_back_trimmed() {
        assert_eq!(task_title("  comprar leite  ").unwrap(), "comprar leite");
    }

    #[test]
    fn empty_or_whitespace_only_title_is_rejected() {
        for raw in ["", "   ", "\t\n", "\u{00a0}"] {
            assert!(
                matches!(task_title(raw), Err(AppError::Config(_))),
                "aceitou {raw:?} como titulo"
            );
        }
    }

    #[test]
    fn ids_generated_in_sequence_do_not_repeat() {
        let ids: std::collections::HashSet<String> = (0..500).map(|_| new_id()).collect();
        assert_eq!(ids.len(), 500);
    }

    #[test]
    fn pr_url_accepts_trimmed_https_and_clears_on_blank() {
        assert_eq!(pr_url(Some("  https://github.com/o/r/pull/1  ".into())).unwrap(), Some("https://github.com/o/r/pull/1".into()));
        assert_eq!(pr_url(Some("   ".into())).unwrap(), None);
        assert_eq!(pr_url(None).unwrap(), None);
    }

    #[test]
    fn pr_url_rejects_a_non_http_scheme() {
        assert!(matches!(pr_url(Some("javascript:alert(1)".into())), Err(AppError::Config(_))));
    }
}
