//! Local, unsealed record of the last unlocks: proof of unexpected access if the machine was left open.
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};

use crate::store;

/// Successes and failures are capped apart, so a burst of wrong guesses can't push every real unlock out of the list.
const MAX_ENTRIES: usize = 20;

fn default_true() -> bool {
    true
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct UnlockEntry {
    pub at: i64,
    /// "password" or "windows_hello"; the UI translates it to the label the user sees.
    pub method: String,
    /// Files written before failures were recorded have no field: they were all successes.
    #[serde(default = "default_true")]
    pub ok: bool,
}

fn path(dir: &Path) -> PathBuf {
    dir.join("desbloqueios.json")
}

/// Best-effort: a failed write here must never fail the unlock that already succeeded.
pub fn record(dir: &Path, method: &str, now: i64) {
    push(dir, UnlockEntry { at: now, method: method.into(), ok: true });
}

/// Best-effort too: a refused attempt is the signal that someone tried to get in while the machine was left open.
pub fn record_failure(dir: &Path, method: &str, now: i64) {
    push(dir, UnlockEntry { at: now, method: method.into(), ok: false });
}

fn push(dir: &Path, entry: UnlockEntry) {
    let mut entries = history(dir);
    entries.push(entry);
    for ok in [true, false] {
        let excess = entries.iter().filter(|e| e.ok == ok).count().saturating_sub(MAX_ENTRIES);
        let mut dropped = 0;
        entries.retain(|e| {
            let drop = e.ok == ok && dropped < excess;
            dropped += usize::from(drop);
            !drop
        });
    }
    let _ = store::write_json_atomic(&path(dir), &entries);
}

/// A biometric check the system refused (wrong finger, locked device), as opposed to the user closing the prompt.
pub fn is_refused_verification(e: &crate::error::AppError) -> bool {
    matches!(e, crate::error::AppError::Config(m) if m.contains("falhou;") || m.contains("bloqueado por tentativas"))
}

/// Refused attempts since the last success: what the lock screen reports to the owner.
pub fn failed_since_last_success(dir: &Path) -> usize {
    history(dir).iter().rev().take_while(|e| !e.ok).count()
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
        assert_eq!(
            history(&dir),
            vec![
                UnlockEntry { at: 1, method: "password".into(), ok: true },
                UnlockEntry { at: 2, method: "windows_hello".into(), ok: true },
            ]
        );
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

    #[test]
    fn a_refused_attempt_is_recorded_as_a_failure() {
        let dir = tmpdir("fail");
        record(&dir, "password", 1);
        record_failure(&dir, "password", 2);
        record_failure(&dir, "password", 3);
        assert_eq!(failed_since_last_success(&dir), 2);
        assert!(!history(&dir)[1].ok);
        record(&dir, "password", 4);
        assert_eq!(failed_since_last_success(&dir), 0);
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn a_file_from_before_failures_were_recorded_reads_as_successes() {
        let dir = tmpdir("old");
        std::fs::create_dir_all(&dir).unwrap();
        std::fs::write(path(&dir), r#"[{"at":5,"method":"password"}]"#).unwrap();
        assert!(history(&dir)[0].ok);
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn failures_never_push_the_successes_out() {
        let dir = tmpdir("burst");
        record(&dir, "password", 1);
        for i in 0..50 {
            record_failure(&dir, "password", 10 + i);
        }
        let h = history(&dir);
        assert_eq!(h.iter().filter(|e| e.ok).count(), 1);
        assert_eq!(h.iter().filter(|e| !e.ok).count(), MAX_ENTRIES);
        let _ = std::fs::remove_dir_all(&dir);
    }
}
