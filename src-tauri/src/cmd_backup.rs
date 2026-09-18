use tauri::State;
use tauri_plugin_dialog::DialogExt;

use crate::backup::{self, ImportSummary, EXTENSION};
use crate::error::{AppError, Result};
use crate::vault::AppState;

/// The path comes from the native dialog, never from the webview: the UI doesn't choose where Rust reads or writes.
#[tauri::command(async)]
pub fn backup_export(app: tauri::AppHandle, state: State<'_, AppState>) -> Result<Option<String>> {
    if !state.is_unlocked() {
        return Err(AppError::Locked);
    }
    let Some(chosen) = app
        .dialog()
        .file()
        .add_filter("Backup do Canto", &[EXTENSION])
        .set_file_name(format!("canto-{}.{EXTENSION}", backup::today_utc()))
        .blocking_save_file()
    else {
        return Ok(None);
    };
    let destination = path(chosen)?;
    backup::export(&state.dir, &destination)?;
    Ok(Some(destination.display().to_string()))
}

#[tauri::command(async)]
pub fn backup_import(app: tauri::AppHandle, state: State<'_, AppState>) -> Result<Option<ImportSummary>> {
    if !state.is_unlocked() {
        return Err(AppError::Locked);
    }
    let Some(chosen) = app
        .dialog()
        .file()
        .add_filter("Backup do Canto", &[EXTENSION])
        .blocking_pick_file()
    else {
        return Ok(None);
    };
    backup::import(&state, &path(chosen)?).map(Some)
}

fn path(fp: tauri_plugin_dialog::FilePath) -> Result<std::path::PathBuf> {
    fp.into_path().map_err(|e| AppError::Io(e.to_string()))
}
