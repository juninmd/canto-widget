use std::path::PathBuf;
use tauri::{Manager, State};
use tauri_plugin_clipboard_manager::ClipboardExt;

use serde::Serialize;

use crate::calendar::{self, AgendaItem};
use crate::clipboard::{ClipItem, ClipView, MAX_PINNED_CEILING};
use sha2::{Digest, Sha256};
use crate::trash::Removed;
use crate::commands::new_id;
use crate::drive;
use crate::error::{AppError, Result};
use crate::transcripts::{self, TranscriptMeta, TranscriptSettings};
use crate::vault::AppState;
use crate::{store, window};

#[derive(Serialize)]
pub struct ClipList {
    pub items: Vec<ClipView>,
    pub max_pinned: usize,
}

#[tauri::command(async)]
pub fn clip_list(state: State<'_, AppState>, query: String) -> Result<ClipList> {
    let q = query.trim().to_lowercase();
    let hist = state.clip_load()?;
    let items = hist
        .items
        .iter()
        .filter(|i| q.is_empty() || i.text.to_lowercase().contains(&q))
        .map(ClipView::from)
        .collect();
    Ok(ClipList { items, max_pinned: hist.max_pinned })
}

/// Clamped so a typo (`0`, a huge number) can't lock pinning out or defeat the cap's purpose.
#[tauri::command(async)]
pub fn clip_set_max_pinned(state: State<'_, AppState>, max: usize) -> Result<()> {
    let mut hist = state.clip_load()?;
    hist.max_pinned = max.clamp(1, MAX_PINNED_CEILING);
    state.clip_save(&hist)
}

#[tauri::command(async)]
pub fn clip_copy(app: tauri::AppHandle, state: State<'_, AppState>, id: String) -> Result<()> {
    let hist = state.clip_load()?;
    let item = hist
        .items
        .iter()
        .find(|i| i.id == id)
        .ok_or(AppError::NotFound)?;
    app.clipboard()
        .write_text(item.text.clone())
        .map_err(|e| AppError::Io(e.to_string()))
}

#[tauri::command(async)]
pub fn clip_pin(state: State<'_, AppState>, id: String) -> Result<()> {
    let mut hist = state.clip_load()?;
    hist.toggle_pin(&id)?;
    state.clip_save(&hist)
}

#[tauri::command(async)]
pub fn clip_delete(state: State<'_, AppState>, id: String) -> Result<Option<String>> {
    let mut hist = state.clip_load()?;
    let (removed, kept) = std::mem::take(&mut hist.items).into_iter().partition(|i| i.id == id);
    hist.items = kept;
    state.clip_save(&hist)?;
    Ok(store_clips(&state, removed))
}

#[tauri::command(async)]
pub fn clip_clear(state: State<'_, AppState>) -> Result<Option<String>> {
    let mut hist = state.clip_load()?;
    let (pinned, removed) = std::mem::take(&mut hist.items).into_iter().partition(|i| i.pinned);
    hist.items = pinned;
    state.clip_save(&hist)?;
    Ok(store_clips(&state, removed))
}

fn store_clips(state: &AppState, items: Vec<ClipItem>) -> Option<String> {
    if items.is_empty() {
        return None;
    }
    state.store_in_trash(Removed::Clips(items))
}

/// Only decrypts the history when the text actually changed, else it would pay a read + AES-GCM of the whole file 50 times a minute.
pub fn watch_clipboard(app: tauri::AppHandle) {
    std::thread::spawn(move || {
        let mut seen_seq: Option<u32> = None;
        let mut seen_digest = [0u8; 32];
        loop {
            std::thread::sleep(std::time::Duration::from_millis(1200));
            let Some(state) = app.try_state::<AppState>() else {
                continue;
            };
            if !state.is_unlocked() {
                // Forget what was seen so the first copy after unlocking isn't mistaken for a repeat.
                (seen_seq, seen_digest) = (None, [0; 32]);
                continue;
            }
            let seq = crate::clip_os::sequence();
            if seq.is_some() && seq == seen_seq {
                continue;
            }
            if crate::clip_os::concealed() {
                seen_seq = seq;
                continue;
            }
            let Ok(text) = app.clipboard().read_text() else {
                continue;
            };
            seen_seq = seq;
            let digest: [u8; 32] = Sha256::digest(text.as_bytes()).into();
            if digest == seen_digest || crate::clip_os::concealed() {
                continue;
            }
            seen_digest = digest;
            let Ok(mut hist) = state.clip_load() else { continue };
            if hist.push(&text, new_id()) {
                let _ = state.clip_save(&hist);
            }
        }
    });
}

fn transcript_dir(state: &AppState) -> PathBuf {
    let cfg: Option<TranscriptSettings> =
        store::read_json(&store::settings_path(&state.dir)).unwrap_or_default();
    match cfg.map(|c| c.dir).filter(|d| !d.is_empty()) {
        Some(d) => PathBuf::from(d),
        None => transcripts::default_dir(),
    }
}

#[tauri::command]
pub fn transcripts_dir(state: State<'_, AppState>) -> String {
    transcript_dir(&state).to_string_lossy().to_string()
}

#[tauri::command(async)]
pub fn transcripts_set_dir(state: State<'_, AppState>, dir: String) -> Result<()> {
    let path = PathBuf::from(dir.trim());
    if !path.is_dir() {
        return Err(AppError::Config("pasta inexistente".into()));
    }
    store::write_json_atomic(
        &store::settings_path(&state.dir),
        &TranscriptSettings {
            dir: path.to_string_lossy().to_string(),
        },
    )
}

#[tauri::command(async)]
pub fn transcripts_list(state: State<'_, AppState>, query: String) -> Result<Vec<TranscriptMeta>> {
    transcripts::list(&transcript_dir(&state), &query)
}

#[tauri::command(async)]
pub fn transcript_read(state: State<'_, AppState>, name: String) -> Result<String> {
    transcripts::read(&transcript_dir(&state), &name)
}

#[tauri::command]
pub async fn agenda_today(app: tauri::AppHandle, time_min: String, time_max: String) -> Result<Vec<AgendaItem>> {
    crate::blocking::run(move || agenda(&app.state::<AppState>(), &time_min, &time_max, 50)).await
}

pub(crate) fn agenda(state: &AppState, time_min: &str, time_max: &str, max_results: u32) -> Result<Vec<AgendaItem>> {
    let mut cfg = state.drive_config()?;
    let tokens = cfg
        .tokens
        .as_mut()
        .ok_or_else(|| AppError::Config("entre com o Google para ver a agenda".into()))?;
    let token = drive::fresh_access_token(tokens, &cfg.client_id, &cfg.client_secret)?;
    let events = calendar::events(&token, time_min, time_max, max_results)?;
    state.save_drive_config(&cfg)?;
    Ok(events)
}

#[tauri::command]
pub fn alert_open(app: tauri::AppHandle, event: AgendaItem) -> Result<()> {
    if !app.state::<crate::meeting_alert::Alerted>().first(&event) {
        return Ok(());
    }
    window::open_alert(&app, event).map_err(|e| AppError::Io(e.to_string()))
}

#[tauri::command]
pub fn alert_payload(state: State<'_, AppState>) -> Option<AgendaItem> {
    state.alert.lock().unwrap().clone()
}

#[tauri::command]
pub fn alert_close(app: tauri::AppHandle) -> Result<()> {
    window::close_alert(&app).map_err(|e| AppError::Io(e.to_string()))
}

#[tauri::command]
pub fn open_link(url: String) -> Result<()> {
    // http(s) links only: the alert must never become a local scheme executor.
    if !(url.starts_with("https://") || url.starts_with("http://")) {
        return Err(AppError::Config("link não suportado".into()));
    }
    tauri_plugin_opener::open_url(url, None::<&str>).map_err(|e| AppError::Io(e.to_string()))
}
