use rand::Rng;
use tauri::State;

use crate::error::{AppError, Result};
use crate::model::{now_ms, Note, Task};
use crate::vault::AppState;

pub fn new_id() -> String {
    format!("{:x}{:x}", now_ms(), rand::thread_rng().gen::<u32>())
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

#[tauri::command]
pub fn vault_create(state: State<'_, AppState>, password: String) -> Result<()> {
    state.create(&password)
}

#[tauri::command]
pub fn vault_unlock(state: State<'_, AppState>, password: String) -> Result<()> {
    state.unlock(&password)
}

#[tauri::command]
pub fn vault_lock(state: State<'_, AppState>) {
    state.lock();
}

#[tauri::command]
pub fn tasks_for_day(state: State<'_, AppState>, day: String) -> Result<Vec<Task>> {
    state.read(|d| {
        let mut list: Vec<Task> = d.tasks.iter().filter(|t| t.day == day).cloned().collect();
        list.sort_by_key(|t| (t.done, t.created_at));
        list
    })
}

#[tauri::command]
pub fn task_add(state: State<'_, AppState>, title: String, day: String) -> Result<Task> {
    let title = title.trim().to_string();
    if title.is_empty() {
        return Err(AppError::Config("a tarefa precisa de um titulo".into()));
    }
    let now = now_ms();
    let task = Task {
        id: new_id(),
        title,
        done: false,
        day,
        created_at: now,
        updated_at: now,
    };
    let created = task.clone();
    state.mutate(|d| d.tasks.push(task))?;
    Ok(created)
}

#[tauri::command]
pub fn task_toggle(state: State<'_, AppState>, id: String) -> Result<()> {
    state.mutate(|d| {
        if let Some(t) = d.tasks.iter_mut().find(|t| t.id == id) {
            t.done = !t.done;
            t.updated_at = now_ms();
        }
    })
}

#[tauri::command]
pub fn task_rename(state: State<'_, AppState>, id: String, title: String) -> Result<()> {
    state.mutate(|d| {
        if let Some(t) = d.tasks.iter_mut().find(|t| t.id == id) {
            t.title = title;
            t.updated_at = now_ms();
        }
    })
}

/// Traz para `day` as tarefas em aberto de dias anteriores, sem duplicar nada.
#[tauri::command]
pub fn tasks_carry_over(state: State<'_, AppState>, day: String) -> Result<usize> {
    state.mutate(|d| {
        let now = now_ms();
        let mut moved = 0;
        for t in d.tasks.iter_mut() {
            if !t.done && t.day < day {
                t.day = day.clone();
                t.updated_at = now;
                moved += 1;
            }
        }
        moved
    })
}

#[tauri::command]
pub fn notes_search(state: State<'_, AppState>, query: String) -> Result<Vec<Note>> {
    let q = query.trim().to_lowercase();
    state.read(|d| {
        let mut list: Vec<Note> = d
            .notes
            .iter()
            .filter(|n| q.is_empty() || note_matches(n, &q))
            .cloned()
            .collect();
        list.sort_by(|a, b| b.updated_at.cmp(&a.updated_at));
        list
    })
}

pub fn note_matches(n: &Note, needle_lower: &str) -> bool {
    n.title.to_lowercase().contains(needle_lower)
        || n.body.to_lowercase().contains(needle_lower)
        || n.tags.iter().any(|t| t.to_lowercase().contains(needle_lower))
}

#[tauri::command]
pub fn note_save(
    state: State<'_, AppState>,
    id: Option<String>,
    title: String,
    body: String,
    tags: Vec<String>,
) -> Result<Note> {
    let now = now_ms();
    let tags: Vec<String> = tags
        .into_iter()
        .map(|t| t.trim().to_lowercase())
        .filter(|t| !t.is_empty())
        .collect();
    state.mutate(move |d| match id.and_then(|id| d.notes.iter_mut().find(|n| n.id == id)) {
        Some(n) => {
            n.title = title;
            n.body = body;
            n.tags = tags;
            n.updated_at = now;
            n.clone()
        }
        None => {
            let note = Note {
                id: new_id(),
                title,
                body,
                tags,
                created_at: now,
                updated_at: now,
            };
            d.notes.push(note.clone());
            note
        }
    })
}

#[tauri::command]
pub fn item_delete(state: State<'_, AppState>, id: String) -> Result<()> {
    state.mutate(|d| d.tombstone(&id, now_ms()))
}
