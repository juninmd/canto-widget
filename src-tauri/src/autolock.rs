//! How many idle minutes before the vault locks itself; a plain local file, nothing secret in it.
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use tauri::State;

use crate::error::{AppError, Result};
use crate::store;
use crate::vault::AppState;

pub const DEFAULT_MINUTES: i64 = 15;
/// The UI only ever offers these: no "never", so the vault key always leaves RAM eventually.
pub const OPTIONS: [i64; 4] = [5, 15, 30, 60];

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
struct Prefs {
    #[serde(default = "default_minutes")]
    minutes: i64,
}

fn default_minutes() -> i64 {
    DEFAULT_MINUTES
}

impl Default for Prefs {
    fn default() -> Self {
        Self { minutes: DEFAULT_MINUTES }
    }
}

fn path(dir: &Path) -> PathBuf {
    dir.join("autolock.json")
}

pub fn minutes(dir: &Path) -> i64 {
    store::read_json::<Prefs>(&path(dir)).ok().flatten().unwrap_or_default().minutes
}

pub fn valid(minutes: i64) -> bool {
    OPTIONS.contains(&minutes)
}

#[tauri::command]
pub fn autolock_get(state: State<'_, AppState>) -> i64 {
    minutes(&state.dir)
}

#[tauri::command]
pub fn autolock_set(state: State<'_, AppState>, minutes: i64) -> Result<()> {
    if !valid(minutes) {
        return Err(AppError::Config("tempo de auto-trava inválido".into()));
    }
    store::write_json_atomic(&path(&state.dir), &Prefs { minutes })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn tmpdir(name: &str) -> PathBuf {
        let d = std::env::temp_dir().join(format!("canto-autolock-{name}-{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&d);
        d
    }

    #[test]
    fn without_a_file_the_default_is_fifteen_minutes() {
        assert_eq!(minutes(&tmpdir("fresh")), DEFAULT_MINUTES);
    }

    #[test]
    fn a_saved_choice_survives_the_next_read() {
        let dir = tmpdir("saved");
        store::write_json_atomic(&path(&dir), &Prefs { minutes: 60 }).unwrap();
        assert_eq!(minutes(&dir), 60);
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn only_the_offered_options_are_accepted() {
        assert!(valid(5) && valid(60));
        assert!(!valid(0), "0 would mean auto-lock never fires");
        assert!(!valid(15 * 60), "an hour typo shouldn't quietly become a day");
    }
}
