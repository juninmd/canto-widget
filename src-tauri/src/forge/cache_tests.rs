use super::*;
use crate::forge::item;
use reqwest::header::{HeaderMap, HeaderValue};
use std::cell::Cell;

const T0: i64 = 1_000_000_000;

fn page(n: u64) -> ForgeList {
    ForgeList {
        total: 1,
        items: vec![item(n, "2026-09-01T00:00:00Z", "2026-09-01T00:00:00Z", 0)],
        ..Default::default()
    }
}

fn quota(remaining: u32) -> Option<Quota> {
    Some(Quota { remaining, reset_at: T0 + 60_000 })
}

fn number(l: &ForgeList) -> u64 {
    l.items[0].number
}

#[test]
fn a_fresh_entry_is_served_without_touching_the_network() {
    let cache = ForgeCache::default();
    let calls = Cell::new(0);
    let fetch = || {
        calls.set(calls.get() + 1);
        Ok((page(1), quota(29)))
    };
    cache.get("github", "k", false, T0, fetch).unwrap();
    let again = cache.get("github", "k", false, T0 + TTL_MS - 1, fetch).unwrap();
    assert_eq!((calls.get(), again.fetched_at), (1, T0));
    cache.get("github", "k", false, T0 + TTL_MS, fetch).unwrap();
    assert_eq!(calls.get(), 2, "expired entries go back to the forge");
}

#[test]
fn refresh_bypasses_the_ttl() {
    let cache = ForgeCache::default();
    cache.get("github", "k", false, T0, || Ok((page(1), quota(29)))).unwrap();
    let forced = cache.get("github", "k", true, T0 + 1, || Ok((page(2), quota(28)))).unwrap();
    assert_eq!((number(&forced), forced.fetched_at), (2, T0 + 1));
}

#[test]
fn near_the_limit_the_cached_copy_is_served_and_says_until_when() {
    let cache = ForgeCache::default();
    cache.get("github", "k", false, T0, || Ok((page(1), quota(RESERVE)))).unwrap();
    let got =
        cache.get("github", "k", true, T0 + 1, || panic!("must not call the forge with the quota spent")).unwrap();
    assert_eq!((number(&got), got.limited_until), (1, Some(T0 + 60_000)));
    let err = cache.get("github", "other", false, T0 + 1, || panic!("no call without quota")).unwrap_err();
    assert!(matches!(err, AppError::RateLimited { reset_at, .. } if reset_at == T0 + 60_000), "{err}");
    assert!(err.to_string().contains("1 min"), "{err}");
}

#[test]
fn after_the_reset_the_forge_is_called_again() {
    let cache = ForgeCache::default();
    cache.get("github", "k", false, T0, || Ok((page(1), quota(0)))).unwrap();
    let got = cache.get("github", "k", true, T0 + 60_000, || Ok((page(2), quota(30)))).unwrap();
    assert_eq!(number(&got), 2);
}

#[test]
fn a_rate_limit_reply_falls_back_to_the_cached_copy() {
    let cache = ForgeCache::default();
    cache.get("gitlab", "k", false, T0, || Ok((page(1), None))).unwrap();
    let limited = || Err(rate_limited("GitLab", T0 + 90_000, T0));
    let got = cache.get("gitlab", "k", true, T0 + 1, limited).unwrap();
    assert_eq!(got.limited_until, Some(T0 + 90_000));
    assert!(cache.get("gitlab", "new", false, T0 + 2, || panic!("quota is known to be spent")).is_err());
}

#[test]
fn other_errors_are_not_masked_by_the_cache() {
    let cache = ForgeCache::default();
    cache.get("github", "k", false, T0, || Ok((page(1), quota(29)))).unwrap();
    let err = cache.get("github", "k", true, T0 + 1, || Err(AppError::Github("token expirado".into()))).unwrap_err();
    assert!(err.to_string().contains("token expirado"));
}

#[test]
fn quotas_are_per_forge_and_forget_drops_only_that_forge() {
    let cache = ForgeCache::default();
    cache.get("github", "k", false, T0, || Ok((page(1), quota(0)))).unwrap();
    cache.get("gitlab", "k", false, T0, || Ok((page(2), quota(500)))).unwrap();
    assert!(cache.get("gitlab", "x", false, T0, || Ok((page(3), None))).is_ok());
    cache.forget("github");
    let got = cache.get("github", "k", false, T0 + 1, || Ok((page(4), quota(30)))).unwrap();
    assert_eq!(number(&got), 4, "a new account must not see the old one's lists");
    assert_eq!(number(&cache.get("gitlab", "k", false, T0 + 1, || panic!("still cached")).unwrap()), 2);
}

#[test]
fn a_reply_that_lands_after_a_lock_is_not_kept() {
    let cache = ForgeCache::default();
    cache
        .get("github", "k", false, T0, || {
            cache.clear();
            Ok((page(1), quota(29)))
        })
        .unwrap();
    let got = cache.get("github", "k", false, T0 + 1, || Ok((page(2), quota(29)))).unwrap();
    assert_eq!(number(&got), 2);
}

#[test]
fn the_cache_stays_bounded_dropping_the_least_used() {
    let cache = ForgeCache::default();
    for n in 0..=MAX_ENTRIES as u64 {
        cache.get("github", &n.to_string(), false, T0 + n as i64, || Ok((page(n), None))).unwrap();
    }
    assert_eq!(cache.inner.lock().unwrap().entries.len(), MAX_ENTRIES);
    assert!(!cache.inner.lock().unwrap().entries.contains_key("github|0"));
}

#[test]
fn headers_become_a_quota_and_retry_after_means_stop() {
    let mut h = HeaderMap::new();
    h.insert("x-ratelimit-remaining", HeaderValue::from_static("7"));
    h.insert("x-ratelimit-reset", HeaderValue::from_static("1700000000"));
    assert_eq!(
        Quota::from_headers(&h, 429, "x-ratelimit-remaining", "x-ratelimit-reset", T0),
        Some(Quota { remaining: 7, reset_at: 1_700_000_000_000 })
    );
    h.insert("retry-after", HeaderValue::from_static("30"));
    assert_eq!(
        Quota::from_headers(&h, 429, "x-ratelimit-remaining", "x-ratelimit-reset", T0),
        Some(Quota { remaining: 0, reset_at: T0 + 30_000 })
    );
    assert_eq!(Quota::from_headers(&HeaderMap::new(), 429, "a", "b", T0), None);
    let mut junk = HeaderMap::new();
    junk.insert("ratelimit-remaining", HeaderValue::from_static("-4"));
    junk.insert("ratelimit-reset", HeaderValue::from_static("x"));
    assert_eq!(Quota::from_headers(&junk, 429, "ratelimit-remaining", "ratelimit-reset", T0), None);
}

#[test]
fn a_rate_limit_that_lands_after_a_disconnect_does_not_block_the_next_account() {
    let cache = ForgeCache::default();
    let err = cache
        .get("gitlab", "k", false, T0, || {
            cache.forget("gitlab");
            Err(rate_limited("GitLab", T0 + 3_600_000, T0))
        })
        .unwrap_err();
    assert!(matches!(err, AppError::RateLimited { .. }));
    let got = cache.get("gitlab", "k", false, T0 + 1, || Ok((page(5), None))).unwrap();
    assert_eq!(number(&got), 5);
}

#[test]
fn retry_after_on_a_server_error_does_not_block_the_token() {
    let mut h = HeaderMap::new();
    h.insert("x-ratelimit-remaining", HeaderValue::from_static("4000"));
    h.insert("x-ratelimit-reset", HeaderValue::from_static("1700000000"));
    h.insert("retry-after", HeaderValue::from_static("3600"));
    let quota = Quota::from_headers(&h, 503, "x-ratelimit-remaining", "x-ratelimit-reset", T0);
    assert_eq!(quota, Some(Quota { remaining: 4000, reset_at: 1_700_000_000_000 }));
}
