use tauri::State;

use crate::commands::new_id;
use crate::error::{AppError, Result};
use crate::model::{now_ms, Note};
use crate::vault::AppState;

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
        ordenar(&mut list);
        list
    })
}

/// Fixadas no topo; dentro de cada grupo, a mais recente primeiro.
pub fn ordenar(list: &mut [Note]) {
    list.sort_by_key(|n| std::cmp::Reverse((n.fixada, n.updated_at)));
}

/// `#tag` filtra pela tag exata (clique na tag); o resto busca em titulo, corpo e tags.
pub fn note_matches(n: &Note, needle_lower: &str) -> bool {
    if let Some(tag) = needle_lower.strip_prefix('#').filter(|t| !t.is_empty()) {
        return n.tags.iter().any(|t| t == tag);
    }
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
                ..Default::default()
            };
            d.notes.push(note.clone());
            note
        }
    })
}

#[tauri::command]
pub fn note_pin(state: State<'_, AppState>, id: String) -> Result<bool> {
    state.mutate(|d| {
        let n = d.notes.iter_mut().find(|n| n.id == id).ok_or(AppError::NotFound)?;
        n.fixada = !n.fixada;
        // Carimbo novo: fixar em uma maquina precisa vencer o merge na outra.
        n.updated_at = now_ms();
        Ok(n.fixada)
    })?
}
