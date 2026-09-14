use tauri::State;
use tauri_plugin_dialog::DialogExt;

use crate::backup::{self, ResumoImport, EXTENSAO};
use crate::error::{AppError, Result};
use crate::vault::AppState;

/// O caminho vem do dialogo nativo, nunca da webview: a UI nao escolhe onde o
/// Rust le ou grava. `None` significa que o usuario cancelou.
#[tauri::command(async)]
pub fn backup_exportar(app: tauri::AppHandle, state: State<'_, AppState>) -> Result<Option<String>> {
    if !state.is_unlocked() {
        return Err(AppError::Locked);
    }
    let Some(escolhido) = app
        .dialog()
        .file()
        .add_filter("Backup do Canto", &[EXTENSAO])
        .set_file_name(format!("canto-{}.{EXTENSAO}", backup::hoje_utc()))
        .blocking_save_file()
    else {
        return Ok(None);
    };
    let destino = caminho(escolhido)?;
    backup::exportar(&state.dir, &destino)?;
    Ok(Some(destino.display().to_string()))
}

#[tauri::command(async)]
pub fn backup_importar(app: tauri::AppHandle, state: State<'_, AppState>) -> Result<Option<ResumoImport>> {
    if !state.is_unlocked() {
        return Err(AppError::Locked);
    }
    let Some(escolhido) = app
        .dialog()
        .file()
        .add_filter("Backup do Canto", &[EXTENSAO])
        .blocking_pick_file()
    else {
        return Ok(None);
    };
    backup::importar(&state, &caminho(escolhido)?).map(Some)
}

fn caminho(fp: tauri_plugin_dialog::FilePath) -> Result<std::path::PathBuf> {
    fp.into_path().map_err(|e| AppError::Io(e.to_string()))
}
