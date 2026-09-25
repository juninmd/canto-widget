//! Keeps the last fetch of every status feed in RAM: no secrets, so a disk cache buys nothing
//! and would just add a re-seal path for public data.
use std::sync::Mutex;

use crate::status_feed::StatusResult;

/// Fresh enough to skip the network; "atualizar" bypasses it.
pub const TTL_MS: i64 = 5 * 60_000;

struct Entry {
    results: Vec<StatusResult>,
    at: i64,
}

#[derive(Default)]
pub struct StatusCache(Mutex<Option<Entry>>);

impl StatusCache {
    pub fn get(&self, force: bool, now: i64, fetch: impl FnOnce() -> Vec<StatusResult>) -> Vec<StatusResult> {
        if !force {
            if let Some(e) = self.0.lock().unwrap().as_ref() {
                if now - e.at < TTL_MS {
                    return e.results.clone();
                }
            }
        }
        // Lock released while fetching: the network calls must not block another tab's lookups.
        let results = fetch();
        *self.0.lock().unwrap() = Some(Entry { results: results.clone(), at: now });
        results
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn result(label: &str) -> Vec<StatusResult> {
        vec![StatusResult { id: "x".into(), label: label.into(), items: Vec::new(), error: None, live: None }]
    }

    #[test]
    fn a_fresh_entry_is_served_without_calling_fetch_again() {
        let cache = StatusCache::default();
        let mut calls = 0;
        cache.get(false, 1_000, || {
            calls += 1;
            result("first")
        });
        let second = cache.get(false, 1_000 + TTL_MS - 1, || {
            calls += 1;
            result("second")
        });
        assert_eq!(calls, 1);
        assert_eq!(second[0].label, "first");
    }

    #[test]
    fn an_expired_entry_triggers_a_refetch() {
        let cache = StatusCache::default();
        cache.get(false, 1_000, || result("first"));
        let second = cache.get(false, 1_000 + TTL_MS, || result("second"));
        assert_eq!(second[0].label, "second");
    }

    #[test]
    fn force_bypasses_a_still_fresh_entry() {
        let cache = StatusCache::default();
        cache.get(false, 1_000, || result("first"));
        let second = cache.get(true, 1_001, || result("second"));
        assert_eq!(second[0].label, "second");
    }
}
