//! UI language on the Rust side: OS notifications and the tray menu follow the choice made in Settings.
//! Errors returned to the UI stay pt-BR (see AGENTS.md).
use std::sync::atomic::{AtomicBool, Ordering};

use tauri::menu::MenuItem;
use tauri::{AppHandle, Manager};

use crate::error::{AppError, Result};

static ENGLISH: AtomicBool = AtomicBool::new(false);

pub fn english() -> bool {
    ENGLISH.load(Ordering::Relaxed)
}

/// Picks the string for the current language; both sides are compile-time literals.
pub fn tr(pt: &'static str, en: &'static str) -> &'static str {
    if english() {
        en
    } else {
        pt
    }
}

/// Static tray items whose labels must follow the language (the join item is refreshed by `tray_live`).
pub struct TrayLabels {
    pub toggle: MenuItem<tauri::Wry>,
    pub lock: MenuItem<tauri::Wry>,
    pub quit: MenuItem<tauri::Wry>,
}

pub fn toggle_label() -> String {
    format!("{}  ({})", tr("Mostrar / esconder", "Show / hide"), crate::TOGGLE_SHORTCUT_LABEL)
}

pub fn parse(lang: &str) -> Result<bool> {
    match lang {
        "pt-BR" => Ok(false),
        "en" => Ok(true),
        _ => Err(AppError::Config("idioma não suportado".into())),
    }
}

#[tauri::command]
pub fn language_set(app: AppHandle, lang: String) -> Result<()> {
    ENGLISH.store(parse(&lang)?, Ordering::Relaxed);
    if let Some(items) = app.try_state::<TrayLabels>() {
        let _ = items.toggle.set_text(toggle_label());
        let _ = items.lock.set_text(tr("Trancar cofre", "Lock vault"));
        let _ = items.quit.set_text(tr("Sair", "Quit"));
    }
    crate::tray_live::refresh_join_label(&app);
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn only_supported_languages_are_accepted() {
        assert!(!parse("pt-BR").unwrap());
        assert!(parse("en").unwrap());
        assert!(parse("fr").is_err());
        assert!(parse("").is_err());
    }
}
