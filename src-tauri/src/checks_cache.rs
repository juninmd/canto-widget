//! CI status of PR heads kept in RAM, so a list refresh doesn't spend three API calls per PR every time.
//! Two layers: `repo#n` → head sha (a new push shows up within `HEAD_TTL_MS`) and `repo@sha` → status.
use std::collections::HashMap;
use std::sync::Mutex;

use crate::forge::ChecksStatus;

pub const HEAD_TTL_MS: i64 = 2 * 60_000;
/// A running pipeline changes within minutes; a finished one only on a re-run.
pub const RUNNING_TTL_MS: i64 = 60_000;
pub const FINAL_TTL_MS: i64 = 15 * 60_000;
const MAX_ENTRIES: usize = 512;

pub fn ttl(status: ChecksStatus) -> i64 {
    match status {
        ChecksStatus::Running => RUNNING_TTL_MS,
        _ => FINAL_TTL_MS,
    }
}

#[derive(Default)]
struct Inner {
    heads: HashMap<String, (String, i64)>,
    checks: HashMap<String, (ChecksStatus, i64)>,
    /// Bumped by forget/clear: a reply that left before a disconnect or lock must not land afterwards.
    generation: u64,
}

#[derive(Default)]
pub struct ChecksCache {
    inner: Mutex<Inner>,
}

impl ChecksCache {
    pub fn generation(&self) -> u64 {
        self.inner.lock().unwrap().generation
    }

    pub fn head(&self, key: &str, now: i64) -> Option<String> {
        let g = self.inner.lock().unwrap();
        g.heads.get(key).filter(|(_, at)| now - at < HEAD_TTL_MS).map(|(sha, _)| sha.clone())
    }

    pub fn status(&self, key: &str, now: i64) -> Option<ChecksStatus> {
        let g = self.inner.lock().unwrap();
        g.checks.get(key).filter(|(s, at)| now - at < ttl(*s)).map(|(s, _)| *s)
    }

    pub fn put_head(&self, generation: u64, key: String, sha: String, now: i64) {
        let mut g = self.inner.lock().unwrap();
        if g.generation == generation {
            g.heads.insert(key, (sha, now));
            bound(&mut g.heads, now, |_| HEAD_TTL_MS);
        }
    }

    pub fn put_status(&self, generation: u64, key: String, status: ChecksStatus, now: i64) {
        let mut g = self.inner.lock().unwrap();
        if g.generation == generation {
            g.checks.insert(key, (status, now));
            bound(&mut g.checks, now, |(s, _)| ttl(*s));
        }
    }

    pub fn forget(&self, forge: &str) {
        let prefix = format!("{forge}|");
        let mut g = self.inner.lock().unwrap();
        g.heads.retain(|k, _| !k.starts_with(&prefix));
        g.checks.retain(|k, _| !k.starts_with(&prefix));
        g.generation += 1;
    }

    pub fn clear(&self) {
        let mut g = self.inner.lock().unwrap();
        g.heads.clear();
        g.checks.clear();
        g.generation += 1;
    }
}

/// Stale entries go first; if the map is still full of fresh ones, starting over only costs API calls.
fn bound<V>(map: &mut HashMap<String, (V, i64)>, now: i64, ttl: impl Fn(&(V, i64)) -> i64) {
    if map.len() > MAX_ENTRIES {
        map.retain(|_, e| now - e.1 < ttl(e));
    }
    if map.len() > MAX_ENTRIES {
        map.clear();
    }
}
