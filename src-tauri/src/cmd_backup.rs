#[cfg(mobile)]
use tauri::Manager;
use tauri::State;
use tauri_plugin_dialog::{DialogExt, FilePath};

use crate::backup::{self, ImportSummary, EXTENSION};
use crate::error::{AppError, Result};
use crate::picked;
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
    export_to(&app, &state, chosen).map(Some)
}

#[cfg(desktop)]
fn export_to(_app: &tauri::AppHandle, state: &AppState, chosen: FilePath) -> Result<String> {
    let destination = picked::path(chosen)?;
    backup::export(&state.dir, &destination)?;
    Ok(destination.display().to_string())
}

/// The backup is sealed, so it can sit in the cache for the moment between sealing and the copy to the chosen URI.
#[cfg(mobile)]
fn export_to(app: &tauri::AppHandle, state: &AppState, chosen: FilePath) -> Result<String> {
    let staged = staging(app)?;
    let sealed = backup::export(&state.dir, &staged)
        .and_then(|_| std::fs::read(&staged).map_err(|e| AppError::Io(e.to_string())));
    let _ = std::fs::remove_file(&staged);
    picked::write(app, chosen.clone(), &sealed?)?;
    Ok(picked::label(&chosen))
}

#[tauri::command(async)]
pub fn backup_import(app: tauri::AppHandle, state: State<'_, AppState>) -> Result<Option<ImportSummary>> {
    if !state.is_unlocked() {
        return Err(AppError::Locked);
    }
    let Some(chosen) = app.dialog().file().add_filter("Backup do Canto", &[EXTENSION]).blocking_pick_file() else {
        return Ok(None);
    };
    import_from(&app, &state, chosen).map(Some)
}

#[cfg(desktop)]
fn import_from(_app: &tauri::AppHandle, state: &AppState, chosen: FilePath) -> Result<ImportSummary> {
    backup::import(state, &picked::path(chosen)?)
}

#[cfg(mobile)]
fn import_from(app: &tauri::AppHandle, state: &AppState, chosen: FilePath) -> Result<ImportSummary> {
    let staged = staging(app)?;
    let imported = picked::read(app, chosen)
        .and_then(|bytes| std::fs::write(&staged, bytes).map_err(|e| AppError::Io(e.to_string())))
        .and_then(|_| backup::import(state, &staged));
    let _ = std::fs::remove_file(&staged);
    imported
}

#[cfg(mobile)]
fn staging(app: &tauri::AppHandle) -> Result<std::path::PathBuf> {
    let dir = app.path().app_cache_dir().map_err(|e| AppError::Io(e.to_string()))?;
    std::fs::create_dir_all(&dir).map_err(|e| AppError::Io(e.to_string()))?;
    Ok(dir.join("backup.tmp"))
}
