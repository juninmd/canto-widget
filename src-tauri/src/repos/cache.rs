//! Repository lists and contribution calendars kept in RAM, like the issue lists: a second look costs no API call.
use std::collections::HashMap;
use std::sync::Mutex;

use crate::error::{AppError, Result};
use crate::repos::{Contributions, RepoList};
use crate::resilient::LockExt;

/// Repositories rarely change; the calendar changes once a day. "atualizar" bypasses it.
pub const TTL_MS: i64 = 10 * 60_000;
const MAX_ENTRIES: usize = 16;

/// A cached value that knows how to carry its freshness to the UI.
pub trait Stamped: Clone {
    fn stamp(self, fetched_at: i64, limited_until: Option<i64>) -> Self;
}

impl Stamped for RepoList {
    fn stamp(self, fetched_at: i64, limited_until: Option<i64>) -> Self {
        RepoList { fetched_at, limited_until, ..self }
    }
}

impl Stamped for Contributions {
    fn stamp(self, fetched_at: i64, limited_until: Option<i64>) -> Self {
        Contributions { fetched_at, limited_until, ..self }
    }
}

struct Inner<T> {
    entries: HashMap<String, (T, i64)>,
    /// Bumped by forget/clear: a reply that left before a disconnect or lock must not land afterwards.
    generation: u64,
}

pub struct Memo<T: Stamped> {
    inner: Mutex<Inner<T>>,
}

impl<T: Stamped> Default for Memo<T> {
    fn default() -> Self {
        Memo { inner: Mutex::new(Inner { entries: HashMap::new(), generation: 0 }) }
    }
}

impl<T: Stamped> Memo<T> {
    /// `key` is `forge|what`. A rate limit serves the last copy when there is one.
    pub fn get(&self, key: &str, force: bool, now: i64, fetch: impl FnOnce() -> Result<T>) -> Result<T> {
        let generation = {
            let g = self.inner.lock_safe();
            if let Some((v, at)) = g.entries.get(key).filter(|(_, at)| !force && now - at < TTL_MS) {
                return Ok(v.clone().stamp(*at, None));
            }
            g.generation
        };
        match fetch() {
            Ok(v) => {
                let mut g = self.inner.lock_safe();
                if g.generation == generation {
                    g.entries.insert(key.to_string(), (v.clone(), now));
                    while g.entries.len() > MAX_ENTRIES {
                        let Some(old) = g.entries.iter().min_by_key(|(_, (_, at))| *at).map(|(k, _)| k.clone()) else {
                            break;
                        };
                        g.entries.remove(&old);
                    }
                }
                Ok(v.stamp(now, None))
            }
            Err(AppError::RateLimited { message, reset_at }) => {
                let g = self.inner.lock_safe();
                match g.entries.get(key).filter(|_| g.generation == generation) {
                    Some((v, at)) => Ok(v.clone().stamp(*at, Some(reset_at))),
                    None => Err(AppError::RateLimited { message, reset_at }),
                }
            }
            Err(e) => Err(e),
        }
    }

    pub fn forget(&self, forge: &str) {
        let prefix = format!("{forge}|");
        let mut g = self.inner.lock_safe();
        g.entries.retain(|k, _| !k.starts_with(&prefix));
        g.generation += 1;
    }

    pub fn clear(&self) {
        let mut g = self.inner.lock_safe();
        g.entries.clear();
        g.generation += 1;
    }
}

/// Both caches of the subtab, dropped together on disconnect or lock.
#[derive(Default)]
pub struct RepoCache {
    pub lists: Memo<RepoList>,
    pub calendars: Memo<Contributions>,
}

impl RepoCache {
    pub fn forget(&self, forge: &str) {
        self.lists.forget(forge);
        self.calendars.forget(forge);
    }

    pub fn clear(&self) {
        self.lists.clear();
        self.calendars.clear();
    }
}
