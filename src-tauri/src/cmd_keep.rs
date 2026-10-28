use serde::Serialize;
use tauri::State;
use tauri_plugin_dialog::{DialogExt, FilePath};

use crate::commands::new_id;
use crate::error::{AppError, Result};
use crate::keep_import::{self, Parsed};
use crate::lang::tr;
use crate::vault::AppState;

#[derive(Serialize, Default, Debug, PartialEq)]
pub struct KeepImport {
    pub imported: usize,
    pub duplicates: usize,
    pub skipped: usize,
}

/// The files come from the native dialog (the JSON files of Takeout's Keep folder), never from the webview.
#[tauri::command(async)]
pub fn notes_import_keep(app: tauri::AppHandle, state: State<'_, AppState>) -> Result<Option<KeepImport>> {
    if !state.is_unlocked() {
        return Err(AppError::Locked);
    }
    let Some(picked) = app.dialog().file().add_filter("Google Keep (Takeout)", &["json"]).blocking_pick_files() else {
        return Ok(None);
    };
    if picked.len() > keep_import::MAX_FILES {
        return Err(AppError::Config(
            tr("arquivos demais: escolha até 5000 de cada vez", "too many files: pick up to 5000 at a time").into(),
        ));
    }
    let texts: Vec<String> = picked.into_iter().filter_map(|p| read(&app, p)).collect();
    store(&state, &texts).map(Some)
}

pub fn store(state: &AppState, texts: &[String]) -> Result<KeepImport> {
    let untitled = tr("sem título", "untitled");
    let archived = tr("arquivada", "archived");
    let mut summary = KeepImport::default();
    let mut notes = Vec::new();
    for text in texts {
        match keep_import::parse(text, untitled, archived) {
            Parsed::Note(n) => notes.push(n),
            Parsed::Skipped => summary.skipped += 1,
            Parsed::Foreign => {}
        }
    }
    if notes.is_empty() && summary.skipped == 0 {
        return Err(AppError::Config(
            tr(
                "nenhuma nota do Keep nesses arquivos: escolha os .json da pasta Keep do Google Takeout",
                "no Keep notes in those files: pick the .json files in Google Takeout's Keep folder",
            )
            .into(),
        ));
    }
    state.mutate(move |d| {
        for mut n in notes {
            if keep_import::already_there(&d.notes, &n) {
                summary.duplicates += 1;
                continue;
            }
            n.id = new_id();
            d.notes.push(n);
            summary.imported += 1;
        }
        summary
    })
}

/// An unreadable or oversized file is left out rather than failing the whole import.
#[cfg(desktop)]
fn read(_app: &tauri::AppHandle, picked: FilePath) -> Option<String> {
    let path = crate::picked::path(picked).ok()?;
    let bytes = crate::store::read_capped(&path, keep_import::MAX_FILE_BYTES, "").ok()?;
    String::from_utf8(bytes).ok()
}

#[cfg(mobile)]
fn read(app: &tauri::AppHandle, picked: FilePath) -> Option<String> {
    let bytes = crate::picked::read(app, picked).ok()?;
    if bytes.len() as u64 > keep_import::MAX_FILE_BYTES {
        return None;
    }
    String::from_utf8(bytes).ok()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn importing_the_same_export_twice_adds_the_notes_once() {
        let dir = std::env::temp_dir().join(format!("canto-keep-{}-{}", std::process::id(), crate::model::now_ms()));
        let st = AppState::new(dir);
        st.create("senha-mestra").unwrap();
        let texts = vec![
            r#"{"title":"a","textContent":"b","createdTimestampUsec":5000}"#.to_string(),
            r#"{"title":"x","textContent":"y","isTrashed":true,"createdTimestampUsec":1}"#.to_string(),
            "<html></html>".to_string(),
        ];
        assert_eq!(store(&st, &texts).unwrap(), KeepImport { imported: 1, duplicates: 0, skipped: 1 });
        assert_eq!(store(&st, &texts).unwrap(), KeepImport { imported: 0, duplicates: 1, skipped: 1 });
        assert_eq!(st.read(|d| d.notes.len()).unwrap(), 1);
        assert!(store(&st, &["{}".to_string()]).is_err());
        let _ = std::fs::remove_dir_all(&st.dir);
    }
}
