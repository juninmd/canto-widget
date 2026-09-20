use tauri::State;

use crate::error::Result;
use crate::model::{now_ms, Priority};
use crate::vault::AppState;

#[tauri::command(async)]
pub fn task_set_priority(state: State<'_, AppState>, id: String, priority: Option<Priority>) -> Result<()> {
    state.mutate(|d| {
        if let Some(t) = d.tasks.iter_mut().find(|t| t.id == id) {
            t.priority = priority;
            t.updated_at = now_ms();
        }
    })
}
