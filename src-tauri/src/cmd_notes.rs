use serde::Serialize;
use tauri::State;

use crate::commands::new_id;
use crate::error::{AppError, Result};
use crate::model::{now_ms, Note};
use crate::vault::AppState;

pub const PAGE_DEFAULT: usize = 50;
const PAGE_MAX: usize = 500;
pub const MAX_BODY_CHARS: usize = 100_000;
pub const MAX_TITLE_CHARS: usize = 300;

#[derive(Serialize)]
pub struct NotesPage {
    pub total: usize,
    pub items: Vec<Note>,
}

#[tauri::command(async)]
pub fn notes_search(state: State<'_, AppState>, query: String, limit: Option<usize>) -> Result<NotesPage> {
    state.read(|d| page(&d.notes, &query, limit.unwrap_or(PAGE_DEFAULT)))
}

/// Sorts references and clones only the page: the webview never receives the whole vault.
pub fn page(notes: &[Note], query: &str, limit: usize) -> NotesPage {
    let q = query.trim().to_lowercase();
    let mut hits: Vec<&Note> = notes.iter().filter(|n| q.is_empty() || note_matches(n, &q)).collect();
    hits.sort_by_key(|n| order(n));
    NotesPage {
        total: hits.len(),
        items: hits.into_iter().take(limit.clamp(1, PAGE_MAX)).cloned().collect(),
    }
}

/// Pinned on top; within each group, most recent first.
pub fn sort(list: &mut [Note]) {
    list.sort_by_key(order);
}

fn order(n: &Note) -> std::cmp::Reverse<(bool, i64)> {
    std::cmp::Reverse((n.pinned, n.updated_at))
}

/// `before` is the stored note's (title, body) size: a note that arrived bigger via merge can still be edited, just not grown.
pub fn check_size(title: &str, body: &str, before: (usize, usize)) -> Result<()> {
    if title.chars().count() > MAX_TITLE_CHARS.max(before.0) {
        return Err(AppError::Config(format!("título grande demais: máximo de {MAX_TITLE_CHARS} caracteres")));
    }
    if body.chars().count() > MAX_BODY_CHARS.max(before.1) {
        return Err(AppError::Config("card grande demais: máximo de 100 mil caracteres".into()));
    }
    Ok(())
}

/// `#tag` filters by the exact tag (clicking a tag); anything else searches title, body and tags.
pub fn note_matches(n: &Note, needle_lower: &str) -> bool {
    if let Some(tag) = needle_lower.strip_prefix('#').filter(|t| !t.is_empty()) {
        return n.tags.iter().any(|t| t == tag);
    }
    n.title.to_lowercase().contains(needle_lower)
        || n.body.to_lowercase().contains(needle_lower)
        || n.tags.iter().any(|t| t.to_lowercase().contains(needle_lower))
}

#[tauri::command(async)]
pub fn note_save(
    state: State<'_, AppState>,
    id: Option<String>,
    title: String,
    body: String,
    tags: Vec<String>,
) -> Result<Note> {
    let before = state.read(|d| {
        d.notes
            .iter()
            .find(|n| id.as_deref() == Some(n.id.as_str()))
            .map_or((0, 0), |n| (n.title.chars().count(), n.body.chars().count()))
    })?;
    check_size(&title, &body, before)?;
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

#[tauri::command(async)]
pub fn note_pin(state: State<'_, AppState>, id: String) -> Result<bool> {
    state.mutate(|d| {
        let n = d.notes.iter_mut().find(|n| n.id == id).ok_or(AppError::NotFound)?;
        n.pinned = !n.pinned;
        // Fresh timestamp: pinning on one machine needs to win the merge on the other.
        n.updated_at = now_ms();
        Ok(n.pinned)
    })?
}
