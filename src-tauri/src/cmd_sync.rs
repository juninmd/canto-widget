use tauri::State;
use tauri_plugin_dialog::DialogExt;

use crate::backup::ImportSummary;
use crate::error::{AppError, Result};
use crate::sync;
use crate::vault::AppState;

#[tauri::command(async)]
pub fn sync_get(state: State<'_, AppState>) -> Option<String> {
    sync::folder(&state.dir).map(|p| p.display().to_string())
}

/// The path comes from the native dialog, never from the webview, like `backup_export`/`backup_import`.
#[tauri::command(async)]
pub fn sync_set_folder(app: tauri::AppHandle, state: State<'_, AppState>) -> Result<Option<String>> {
    if !state.is_unlocked() {
        return Err(AppError::Locked);
    }
    let Some(chosen) = app.dialog().file().blocking_pick_folder() else {
        return Ok(None);
    };
    let folder = chosen.into_path().map_err(|e| AppError::Io(e.to_string()))?;
    sync::set_folder(&state, folder.clone())?;
    Ok(Some(folder.display().to_string()))
}

#[tauri::command(async)]
pub fn sync_clear(state: State<'_, AppState>) -> Result<()> {
    sync::clear_folder(&state.dir)
}

/// Manual nudge for immediate feedback; the same merge already runs on unlock and every few minutes.
#[tauri::command(async)]
pub fn sync_now(state: State<'_, AppState>) -> Result<Option<ImportSummary>> {
    sync::poll_and_merge(&state)
}
