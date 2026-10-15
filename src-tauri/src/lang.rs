//! UI language on the Rust side: OS notifications and the tray menu follow the choice made in Settings.
//! Errors returned to the UI stay pt-BR (see AGENTS.md).
use std::sync::atomic::{AtomicUsize, Ordering};

use tauri::menu::MenuItem;
use tauri::{AppHandle, Manager};

use crate::error::{AppError, Result};

#[path = "lang_catalogs.rs"]
mod catalogs;

static LANGUAGE: AtomicUsize = AtomicUsize::new(1);

pub fn english() -> bool {
    // Legacy alert builders only have two catalogs, so additional languages use their English text.
    LANGUAGE.load(Ordering::Relaxed) != 1
}

/// Built-in catalogs keep native notification labels offline.
pub fn tr(pt: &'static str, en: &'static str) -> &'static str {
    translate(catalogs::CODES[LANGUAGE.load(Ordering::Relaxed)], pt, en)
}

fn translate(code: &str, pt: &'static str, en: &'static str) -> &'static str {
    if code == "pt-BR" {
        pt
    } else {
        catalogs::translated(code, en).unwrap_or(en)
    }
}

/// Static tray items whose labels must follow the language (the join item is refreshed by `tray_live`).
pub struct TrayLabels {
    pub toggle: MenuItem<tauri::Wry>,
    pub mini: MenuItem<tauri::Wry>,
    pub lock: MenuItem<tauri::Wry>,
    pub quit: MenuItem<tauri::Wry>,
}

pub fn toggle_label() -> String {
    format!("{}  ({})", tr("Mostrar / esconder", "Show / hide"), crate::TOGGLE_SHORTCUT_LABEL)
}

pub fn parse(lang: &str) -> Result<usize> {
    catalogs::CODES.iter().position(|code| *code == lang).ok_or_else(|| AppError::Config("idioma não suportado".into()))
}

#[tauri::command]
pub fn language_set(app: AppHandle, lang: String) -> Result<()> {
    LANGUAGE.store(parse(&lang)?, Ordering::Relaxed);
    if let Some(items) = app.try_state::<TrayLabels>() {
        let _ = items.toggle.set_text(toggle_label());
        let _ = items.mini.set_text(tr("Modo mini", "Mini mode"));
        let _ = items.lock.set_text(tr("Trancar cofre", "Lock vault"));
        let _ = items.quit.set_text(tr("Sair", "Quit"));
    }
    crate::tray_live::refresh_join_label(&app);
    crate::do_not_disturb::refresh_tray(&app);
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn only_supported_languages_are_accepted() {
        for (index, code) in catalogs::CODES.iter().enumerate() {
            assert_eq!(parse(code).unwrap(), index);
        }
        assert!(parse("xx").is_err());
        assert!(parse("").is_err());
    }

    #[test]
    fn native_labels_cover_every_language_without_changing_process_state() {
        for code in catalogs::CODES.iter().filter(|code| !["en", "pt-BR"].contains(code)) {
            for key in ["Lock vault", "Mini mode", "Meeting starting", "Task reminder", "Quit"] {
                assert!(!catalogs::translated(code, key).unwrap().is_empty(), "{code}:{key}");
            }
        }
        assert_eq!(translate("es", "Sair", "Quit"), "Salir");
        assert_eq!(translate("pt-BR", "Sair", "Quit"), "Sair");
        assert_eq!(translate("en", "Sair", "Quit"), "Quit");
    }
}
