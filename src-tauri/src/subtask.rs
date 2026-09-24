use tauri::State;

use crate::commands::new_id;
use crate::error::{AppError, Result};
use crate::model::{next_version, now_ms, Subtask, Task};
use crate::vault::AppState;

fn subtask_title(raw: &str) -> Result<String> {
    let clean = raw.trim();
    if clean.is_empty() {
        return Err(AppError::Config("a subtarefa precisa de um titulo".into()));
    }
    Ok(clean.to_string())
}

fn find_task<'a>(d: &'a mut crate::model::VaultData, id: &str) -> Result<&'a mut Task> {
    d.tasks.iter_mut().find(|t| t.id == id).ok_or(AppError::NotFound)
}

#[tauri::command(async)]
pub fn subtask_add(state: State<'_, AppState>, id: String, title: String) -> Result<Subtask> {
    let title = subtask_title(&title)?;
    state.mutate(|d| {
        let t = find_task(d, &id)?;
        let subtask = Subtask { id: new_id(), title, done: false };
        t.subtasks.push(subtask.clone());
        t.updated_at = next_version(t.updated_at, now_ms());
        Ok(subtask)
    })?
}

#[tauri::command(async)]
pub fn subtask_toggle(state: State<'_, AppState>, id: String, subtask_id: String) -> Result<()> {
    state.mutate(|d| {
        let t = find_task(d, &id)?;
        let sub = t.subtasks.iter_mut().find(|s| s.id == subtask_id).ok_or(AppError::NotFound)?;
        sub.done = !sub.done;
        t.updated_at = next_version(t.updated_at, now_ms());
        Ok(())
    })?
}

#[tauri::command(async)]
pub fn subtask_remove(state: State<'_, AppState>, id: String, subtask_id: String) -> Result<()> {
    state.mutate(|d| {
        let t = find_task(d, &id)?;
        let before = t.subtasks.len();
        t.subtasks.retain(|s| s.id != subtask_id);
        if t.subtasks.len() == before {
            return Err(AppError::NotFound);
        }
        t.updated_at = next_version(t.updated_at, now_ms());
        Ok(())
    })?
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn valid_title_comes_back_trimmed() {
        assert_eq!(subtask_title("  ligar prestador  ").unwrap(), "ligar prestador");
    }

    #[test]
    fn empty_or_whitespace_only_title_is_rejected() {
        assert!(matches!(subtask_title("   "), Err(AppError::Config(_))));
    }
}
