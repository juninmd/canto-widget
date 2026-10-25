//! Keeps the last release lookup in RAM: public data, so a disk cache would just add a re-seal path.
use crate::resilient::LockExt;
use std::sync::Mutex;

use crate::harness_feed::FeedEntry;

/// Fresh enough to skip the network; "atualizar" bypasses it. An anonymous GitHub quota is 60 calls an hour.
pub const TTL_MS: i64 = 30 * 60_000;

struct Entry {
    feeds: Vec<FeedEntry>,
    at: i64,
}

#[derive(Default)]
pub struct HarnessCache(Mutex<Option<Entry>>);

impl HarnessCache {
    pub fn get(&self, force: bool, now: i64, fetch: impl FnOnce() -> Vec<FeedEntry>) -> Vec<FeedEntry> {
        if !force {
            if let Some(e) = self.0.lock_safe().as_ref() {
                if now - e.at < TTL_MS {
                    return e.feeds.clone();
                }
            }
        }
        // Lock released while fetching: the six requests must not block another tab's lookups.
        let feeds = fetch();
        *self.0.lock_safe() = Some(Entry { feeds: feeds.clone(), at: now });
        feeds
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::harness_feed::Release;

    fn feed(tag: &str) -> Vec<FeedEntry> {
        let release = Release {
            tag: tag.into(),
            name: tag.into(),
            published_at: String::new(),
            url: "https://github.com/openai/codex/releases/tag/v1".into(),
            notes: String::new(),
        };
        vec![FeedEntry { release: Some(release), error: None }]
    }

    #[test]
    fn a_fresh_entry_is_served_without_calling_fetch_again() {
        let cache = HarnessCache::default();
        let mut calls = 0;
        cache.get(false, 1_000, || {
            calls += 1;
            feed("first")
        });
        let second = cache.get(false, 1_000 + TTL_MS - 1, || {
            calls += 1;
            feed("second")
        });
        assert_eq!(calls, 1);
        assert_eq!(second[0].release.as_ref().unwrap().tag, "first");
    }

    #[test]
    fn an_expired_entry_triggers_a_refetch() {
        let cache = HarnessCache::default();
        cache.get(false, 1_000, || feed("first"));
        let second = cache.get(false, 1_000 + TTL_MS, || feed("second"));
        assert_eq!(second[0].release.as_ref().unwrap().tag, "second");
    }

    #[test]
    fn force_bypasses_a_still_fresh_entry() {
        let cache = HarnessCache::default();
        cache.get(false, 1_000, || feed("first"));
        let second = cache.get(true, 1_001, || feed("second"));
        assert_eq!(second[0].release.as_ref().unwrap().tag, "second");
    }
}
