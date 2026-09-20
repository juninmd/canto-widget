//! Local, unsealed record of the last unlocks: proof of unexpected access if the machine was left open.
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};

use crate::store;

const MAX_ENTRIES: usize = 20;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct UnlockEntry {
    pub at: i64,
    /// "password" or "windows_hello"; the UI translates it to the label the user sees.
    pub method: String,
}

fn path(dir: &Path) -> PathBuf {
    dir.join("desbloqueios.json")
}

/// Best-effort: a failed write here must never fail the unlock that already succeeded.
pub fn record(dir: &Path, method: &str, now: i64) {
    let mut entries = history(dir);
    entries.push(UnlockEntry { at: now, method: method.into() });
    if entries.len() > MAX_ENTRIES {
        entries.drain(0..entries.len() - MAX_ENTRIES);
    }
    let _ = store::write_json_atomic(&path(dir), &entries);
}

pub fn history(dir: &Path) -> Vec<UnlockEntry> {
    store::read_json(&path(dir)).ok().flatten().unwrap_or_default()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn tmpdir(name: &str) -> PathBuf {
        let d = std::env::temp_dir().join(format!("canto-unlocklog-{name}-{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&d);
        d
    }

    #[test]
    fn an_unlock_is_recorded_and_read_back_in_order() {
        let dir = tmpdir("order");
        record(&dir, "password", 1);
        record(&dir, "windows_hello", 2);
        assert_eq!(history(&dir), vec![
            UnlockEntry { at: 1, method: "password".into() },
            UnlockEntry { at: 2, method: "windows_hello".into() },
        ]);
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn only_the_most_recent_entries_survive() {
        let dir = tmpdir("cap");
        for i in 0..30 {
            record(&dir, "password", i);
        }
        let kept = history(&dir);
        assert_eq!(kept.len(), MAX_ENTRIES);
        assert_eq!(kept.first().unwrap().at, 10, "oldest entries should have been dropped first");
        assert_eq!(kept.last().unwrap().at, 29);
        let _ = std::fs::remove_dir_all(&dir);
    }
}
