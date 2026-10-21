//! Interface choices mirrored to disk: the webview's own storage can come back empty after an update.
use std::collections::BTreeMap;
use std::path::Path;
use std::sync::Mutex;

use tauri::State;

use crate::error::{AppError, Result};
use crate::store;
use crate::vault::AppState;

/// Only the tab choices; anything else from the webview is refused instead of piling up in a plain file.
const KEYS: [&str; 4] = ["canto.hiddenTabs", "canto.knownTabs", "canto.tabLayout", "canto.railPinned"];
const MAX_VALUE: usize = 2048;

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
    if KEYS.contains(&key) && value.len() <= MAX_VALUE {
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
    prefs.insert(key.into(), value.into());
    store::write_json_atomic(&path(dir), &prefs)
}

#[tauri::command]
pub fn prefs_get(state: State<AppState>, lock: State<PrefsLock>) -> Result<Prefs> {
    let _guard = lock.0.lock().unwrap();
    Ok(load(&state.dir).into_iter().filter(|(k, _)| KEYS.contains(&k.as_str())).collect())
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
        assert!(set(&dir, "canto.token", "x").is_err());
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
