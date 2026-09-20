//! Forge lists kept in RAM while the vault is open, plus a guard that stops short of the API's rate limit.
//! RAM only: titles are private and a disk copy would need re-sealing on every password change.
use std::collections::HashMap;
use std::sync::Mutex;

use crate::error::{AppError, Result};
use crate::forge::ForgeList;

/// Fresh enough to skip the network; "atualizar" bypasses it, the rate-limit guard does not.
pub const TTL_MS: i64 = 5 * 60_000;
const MAX_ENTRIES: usize = 256;
/// Calls left in hand, so another tool using the same token doesn't hit the wall because of us.
const RESERVE: u32 = 2;

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Quota {
    pub remaining: u32,
    /// When the forge refills the quota (ms).
    pub reset_at: i64,
}

impl Quota {
    /// `Retry-After` wins: it's the forge saying "stop" regardless of what `remaining` shows.
    pub fn from_headers(h: &reqwest::header::HeaderMap, remaining: &str, reset: &str, now: i64) -> Option<Quota> {
        let num = |name: &str| h.get(name)?.to_str().ok()?.trim().parse::<i64>().ok();
        if let Some(secs) = num("retry-after") {
            return Some(Quota { remaining: 0, reset_at: now + secs.max(0) * 1000 });
        }
        let remaining = num(remaining)?.clamp(0, u32::MAX as i64) as u32;
        Some(Quota { remaining, reset_at: num(reset)? * 1000 })
    }
}

pub fn rate_limited(forge: &str, reset_at: i64, now: i64) -> AppError {
    let minutes = ((reset_at - now) as f64 / 60_000.0).ceil().max(1.0) as i64;
    AppError::RateLimited { message: format!("{forge}: limite de requisicoes atingido; tente de novo em {minutes} min"), reset_at }
}

struct Entry {
    list: ForgeList,
    at: i64,
    used: i64,
}

#[derive(Default)]
struct Inner {
    entries: HashMap<String, Entry>,
    quotas: HashMap<String, Quota>,
    /// Bumped by forget/clear: a reply that left before a disconnect or lock must not land afterwards.
    generation: u64,
}

#[derive(Default)]
pub struct ForgeCache {
    inner: Mutex<Inner>,
}

impl ForgeCache {
    /// `forge` names the quota bucket and prefixes the key, so a disconnect drops only its own entries.
    pub fn get(&self, forge: &str, key: &str, force: bool, now: i64, fetch: impl FnOnce() -> Result<(ForgeList, Option<Quota>)>) -> Result<ForgeList> {
        let full = format!("{forge}|{key}");
        let generation = {
            let mut g = self.inner.lock().unwrap();
            if let Some(e) = g.entries.get_mut(&full) {
                e.used = now;
                if !force && now - e.at < TTL_MS {
                    return Ok(stamped(e, None));
                }
            }
            if let Some(q) = g.quotas.get(forge).copied().filter(|q| q.remaining <= RESERVE && now < q.reset_at) {
                return g.entries.get(&full).map(|e| stamped(e, Some(q.reset_at))).ok_or_else(|| rate_limited(forge, q.reset_at, now));
            }
            g.generation
        };
        // Lock released: the network call must not block the other tab's lookups.
        match fetch() {
            Ok((list, quota)) => {
                let mut g = self.inner.lock().unwrap();
                if g.generation != generation {
                    return Ok(ForgeList { fetched_at: now, ..list });
                }
                if let Some(q) = quota {
                    g.quotas.insert(forge.to_string(), q);
                }
                let entry = Entry { list, at: now, used: now };
                let out = stamped(&entry, None);
                g.entries.insert(full, entry);
                evict(&mut g.entries);
                Ok(out)
            }
            Err(AppError::RateLimited { message, reset_at }) => {
                let mut g = self.inner.lock().unwrap();
                if g.generation != generation {
                    return Err(AppError::RateLimited { message, reset_at });
                }
                g.quotas.insert(forge.to_string(), Quota { remaining: 0, reset_at });
                g.entries.get(&full).map(|e| stamped(e, Some(reset_at))).ok_or(AppError::RateLimited { message, reset_at })
            }
            Err(e) => Err(e),
        }
    }

    pub fn forget(&self, forge: &str) {
        let prefix = format!("{forge}|");
        let mut g = self.inner.lock().unwrap();
        g.entries.retain(|k, _| !k.starts_with(&prefix));
        g.quotas.remove(forge);
        g.generation += 1;
    }

    pub fn clear(&self) {
        let mut g = self.inner.lock().unwrap();
        g.entries.clear();
        g.quotas.clear();
        g.generation += 1;
    }
}

fn stamped(e: &Entry, limited_until: Option<i64>) -> ForgeList {
    ForgeList { fetched_at: e.at, limited_until, ..e.list.clone() }
}

fn evict(entries: &mut HashMap<String, Entry>) {
    while entries.len() > MAX_ENTRIES {
        let Some(oldest) = entries.iter().min_by_key(|(_, e)| e.used).map(|(k, _)| k.clone()) else { return };
        entries.remove(&oldest);
    }
}

#[cfg(test)]
#[path = "forge_cache_tests.rs"]
mod tests;
