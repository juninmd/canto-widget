use super::*;
use crate::error::AppError;
use crate::error::Result;
use crate::repos::cache::{Fetched, Memo, Pages, TTL_MS};
use std::cell::{Cell, RefCell};

#[test]
fn days_are_counted_oldest_first_and_bad_stamps_dropped() {
    let days = count_days(
        ["2026-11-02T10:00:00Z", "2026-11-01T09:00:00Z", "2026-11-02T23:59:59Z", "ontem", "2026/11/02x"].into_iter(),
    );
    assert_eq!(days, vec![Day { date: "2026-11-01".into(), count: 1 }, Day { date: "2026-11-02".into(), count: 2 }]);
}

fn repo(name: &str, at: &str) -> Repo {
    Repo { name: name.into(), full_name: format!("o/{name}"), updated_at: at.into(), ..Default::default() }
}

#[test]
fn only_the_forges_own_links_pass() {
    assert!(safe_url("https://github.com/a/b", "https://github.com/"));
    assert!(!safe_url("javascript:alert(1)", "https://github.com/"));
}

const GH: &str = "github";

fn fetched(n: &str, etag: &str, has_next: bool) -> Result<Fetched> {
    Ok(Fetched::Page { repos: vec![repo(n, "")], has_next, etag: etag.into() })
}

#[test]
fn a_page_is_served_from_memory_until_forced_or_expired_and_then_revalidated_with_its_etag() {
    let pages = Pages::default();
    let seen = RefCell::new(Vec::<Option<String>>::new());
    let fetch = |etag: Option<&str>| {
        seen.borrow_mut().push(etag.map(String::from));
        fetched("a", "\"v1\"", true)
    };
    pages.get(GH, "ana", 1, false, 1_000, fetch).unwrap();
    let (again, changed) = pages.get(GH, "ana", 1, false, 2_000, fetch).unwrap();
    assert_eq!((seen.borrow().len(), again.fetched_at, changed), (1, 1_000, false));
    let (revalidated, changed) = pages
        .get(GH, "ana", 1, false, 1_000 + TTL_MS, |etag| {
            seen.borrow_mut().push(etag.map(String::from));
            Ok(Fetched::NotModified)
        })
        .unwrap();
    assert_eq!(seen.borrow().last().unwrap().as_deref(), Some("\"v1\""));
    assert!(revalidated.revalidated && changed);
    assert_eq!((revalidated.fetched_at, revalidated.repos.len()), (1_000 + TTL_MS, 1));
    pages.get(GH, "ana", 1, true, 1_000 + TTL_MS, fetch).unwrap();
    assert_eq!(seen.borrow().len(), 3);
}

#[test]
fn a_rate_limit_serves_the_held_page_or_fails_when_there_is_none() {
    let pages = Pages::default();
    let limited = |_: Option<&str>| Err(AppError::RateLimited { message: "x".into(), reset_at: 9_000 });
    assert!(pages.get(GH, "ana", 1, false, 1_000, limited).is_err());
    pages.get(GH, "ana", 1, false, 1_000, |_| fetched("a", "e", false)).unwrap();
    let (got, changed) = pages.get(GH, "ana", 1, true, 2_000, limited).unwrap();
    assert_eq!((got.repos.len(), got.limited_until, got.fetched_at, changed), (1, Some(9_000), 1_000, false));
}

#[test]
fn cached_pages_come_back_in_order_and_stop_at_the_first_gap_or_another_account() {
    let pages = Pages::default();
    for p in [1, 2, 4] {
        pages.get(GH, "ana", p, false, 1_000, |_| fetched(&p.to_string(), "e", true)).unwrap();
    }
    let held: Vec<u32> = pages.cached(GH, "ana").iter().map(|p| p.page).collect();
    assert_eq!(held, vec![1, 2]);
    assert!(pages.cached(GH, "bob").is_empty());
    assert!(pages.cached("gitlab", "ana").is_empty());
}

#[test]
fn the_last_page_drops_what_lay_beyond_it_and_another_account_starts_clean() {
    let pages = Pages::default();
    for p in 1..=3 {
        pages.get(GH, "ana", p, false, 1_000, |_| fetched("x", "e", true)).unwrap();
    }
    pages.get(GH, "ana", 2, true, 2_000, |_| fetched("x", "e", false)).unwrap();
    assert_eq!(pages.cached(GH, "ana").len(), 2);
    let calls = Cell::new(0);
    pages
        .get(GH, "bob", 1, false, 2_500, |etag| {
            calls.set(calls.get() + 1);
            assert!(etag.is_none(), "another account must not reuse the ETag");
            fetched("y", "f", false)
        })
        .unwrap();
    assert_eq!((calls.get(), pages.cached(GH, "ana").len()), (1, 0));
}

#[test]
fn the_disk_copy_is_read_once_and_forgetting_or_locking_drops_it() {
    let pages = Pages::default();
    pages.get(GH, "ana", 1, false, 1_000, |_| fetched("a", "e", false)).unwrap();
    let saved = pages.snapshot();
    let fresh = Pages::default();
    let loads = Cell::new(0);
    for _ in 0..2 {
        fresh.hydrate(|| {
            loads.set(loads.get() + 1);
            Some(saved.clone())
        });
    }
    assert_eq!((loads.get(), fresh.cached(GH, "ana").len()), (1, 1));
    fresh.clear();
    assert!(fresh.cached(GH, "ana").is_empty());
    fresh.hydrate(|| Some(saved.clone()));
    assert_eq!(fresh.cached(GH, "ana").len(), 1, "after a lock the next unlock reads the disk copy again");
    fresh.forget(GH);
    assert!(fresh.cached(GH, "ana").is_empty());
}

#[test]
fn forgetting_a_forge_drops_only_its_entries_and_a_late_reply_does_not_land() {
    let pages = Pages::default();
    pages.get(GH, "ana", 1, false, 1_000, |_| fetched("a", "e", false)).unwrap();
    pages.get("gitlab", "ana|x", 1, false, 1_000, |_| fetched("b", "e", false)).unwrap();
    pages.forget(GH);
    assert_eq!((pages.cached(GH, "ana").len(), pages.cached("gitlab", "ana|x").len()), (0, 1));
    pages
        .get(GH, "ana", 1, false, 1_500, |_| {
            pages.forget(GH);
            fetched("a", "e", false)
        })
        .unwrap();
    assert!(pages.cached(GH, "ana").is_empty());
}

#[test]
fn readmes_are_cached_per_repository_for_longer_than_pages() {
    let memo = Memo::<Readme>::with(30 * 60_000, 2);
    let calls = Cell::new(0);
    let fetch = || {
        calls.set(calls.get() + 1);
        Ok(Readme { text: "# oi".into(), ..Default::default() })
    };
    memo.get("github|a/b", false, 1_000, fetch).unwrap();
    memo.get("github|a/b", false, 1_000 + TTL_MS + 1, fetch).unwrap();
    assert_eq!(calls.get(), 1);
    memo.get("github|a/c", false, 2_000, fetch).unwrap();
    memo.get("github|a/d", false, 3_000, fetch).unwrap();
    memo.get("github|a/b", false, 4_000, fetch).unwrap();
    assert_eq!(calls.get(), 4, "the oldest entry made room");
}

#[test]
fn next_page_and_names_and_text_caps() {
    assert!(has_next_link(
        "<https://api.github.com/x?page=2>; rel=\"next\", <https://api.github.com/x?page=9>; rel=\"last\""
    ));
    assert!(!has_next_link("<https://api.github.com/x?page=1>; rel=\"prev\""));
    assert!(valid_full_name("acme/atlas.js") && valid_full_name("a-b/c_d"));
    assert!(
        !valid_full_name("acme")
            && !valid_full_name("../x/y")
            && !valid_full_name("a/b/c")
            && !valid_full_name("a/b?x=1")
    );
    assert_eq!(cap_text("olá".as_bytes(), 3), ("ol".into(), true));
    assert_eq!(cap_text(b"ok", 10), ("ok".into(), false));
}
