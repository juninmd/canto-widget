//! Interface choices mirrored to disk: the webview's own storage can come back empty after an update.
use std::collections::BTreeMap;
use std::path::Path;
use std::sync::Mutex;

use tauri::State;

use crate::error::{AppError, Result};
use crate::store;
use crate::vault::AppState;

/// Only the webview's own `canto.*` choices (theme, language, tabs...), bounded so the plain file can't pile up.
const PREFIX: &str = "canto.";
const MAX_KEY: usize = 128;
const MAX_VALUE: usize = 16 * 1024;
const MAX_KEYS: usize = 200;

fn known(key: &str) -> bool {
    key.starts_with(PREFIX) && key.len() <= MAX_KEY
}

type Prefs = BTreeMap<String, String>;

#[derive(Default)]
pub struct PrefsLock(Mutex<()>);

fn path(dir: &Path) -> std::path::PathBuf {
    dir.join("preferencias.json")
}

/// A corrupt file reads as empty: the webview's copy, if any, repopulates it.
fn load(dir: &Path) -> Prefs {
    store::read_json(&path(dir)).ok().flatten().unwrap_or_default()
}

pub fn accept(key: &str, value: &str) -> Result<()> {
    if known(key) && value.len() <= MAX_VALUE {
        return Ok(());
    }
    Err(AppError::Config(crate::lang::tr("preferência inválida", "invalid preference").into()))
}

fn set(dir: &Path, key: &str, value: &str) -> Result<()> {
    accept(key, value)?;
    let mut prefs = load(dir);
    if prefs.get(key).map(String::as_str) == Some(value) {
        return Ok(());
    }
    if !prefs.contains_key(key) && prefs.len() >= MAX_KEYS {
        return Err(AppError::Config(crate::lang::tr("preferências demais", "too many preferences").into()));
    }
    prefs.insert(key.into(), value.into());
    store::write_json_atomic(&path(dir), &prefs)
}

#[tauri::command]
pub fn prefs_get(state: State<AppState>, lock: State<PrefsLock>) -> Result<Prefs> {
    let _guard = lock.0.lock().unwrap();
    Ok(load(&state.dir).into_iter().filter(|(k, _)| known(k)).collect())
}

#[tauri::command]
pub fn prefs_set(state: State<AppState>, lock: State<PrefsLock>, key: String, value: String) -> Result<()> {
    let _guard = lock.0.lock().unwrap();
    set(&state.dir, &key, &value)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn temp(name: &str) -> std::path::PathBuf {
        let dir = std::env::temp_dir().join(format!("canto-prefs-{}-{name}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        dir
    }

    #[test]
    fn a_saved_choice_survives_a_reload_and_other_keys_are_refused() {
        let dir = temp("reload");
        set(&dir, "canto.hiddenTabs", r#"["gitlab"]"#).unwrap();
        set(&dir, "canto.tabLayout", "vertical").unwrap();
        set(&dir, "canto.hiddenTabs", "[]").unwrap();
        let prefs = load(&dir);
        assert_eq!(prefs["canto.hiddenTabs"], "[]");
        assert_eq!(prefs["canto.tabLayout"], "vertical");
        set(&dir, "canto.skin", "noite").unwrap();
        assert_eq!(load(&dir)["canto.skin"], "noite");
        assert!(set(&dir, "token", "x").is_err());
        assert!(set(&dir, "canto.hiddenTabs", &"x".repeat(MAX_VALUE + 1)).is_err());
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn a_corrupt_file_reads_as_empty() {
        let dir = temp("corrupt");
        std::fs::write(path(&dir), "{oops").unwrap();
        assert!(load(&dir).is_empty());
        set(&dir, "canto.railPinned", "1").unwrap();
        assert_eq!(load(&dir)["canto.railPinned"], "1");
        let _ = std::fs::remove_dir_all(&dir);
    }
}
