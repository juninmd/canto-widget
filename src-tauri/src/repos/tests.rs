use super::*;
use crate::error::AppError;
use crate::repos::cache::Memo;
use std::cell::Cell;

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
fn repos_sort_by_latest_activity() {
    let mut v = vec![repo("a", "2026-10-01"), repo("b", "2026-11-01")];
    sort_repos(&mut v);
    assert_eq!(v[0].name, "b");
}

#[test]
fn only_the_forges_own_links_pass() {
    assert!(safe_url("https://github.com/a/b", "https://github.com/"));
    assert!(!safe_url("javascript:alert(1)", "https://github.com/"));
}

fn list(n: &str) -> RepoList {
    RepoList { repos: vec![repo(n, "")], ..Default::default() }
}

#[test]
fn the_cache_skips_the_network_until_forced_or_expired() {
    let memo = Memo::<RepoList>::default();
    let calls = Cell::new(0);
    let fetch = || {
        calls.set(calls.get() + 1);
        Ok(list("a"))
    };
    memo.get("github|repos", false, 1_000, fetch).unwrap();
    let again = memo.get("github|repos", false, 2_000, fetch).unwrap();
    assert_eq!((calls.get(), again.fetched_at), (1, 1_000));
    memo.get("github|repos", true, 3_000, fetch).unwrap();
    memo.get("github|repos", false, 3_000 + crate::repos::cache::TTL_MS, fetch).unwrap();
    assert_eq!(calls.get(), 3);
}

#[test]
fn a_rate_limit_serves_the_last_copy_or_fails_when_there_is_none() {
    let memo = Memo::<RepoList>::default();
    let limited = || Err(AppError::RateLimited { message: "x".into(), reset_at: 9_000 });
    assert!(memo.get("github|repos", false, 1_000, limited).is_err());
    memo.get("github|repos", false, 1_000, || Ok(list("a"))).unwrap();
    let got = memo.get("github|repos", true, 2_000, limited).unwrap();
    assert_eq!((got.repos.len(), got.limited_until, got.fetched_at), (1, Some(9_000), 1_000));
}

#[test]
fn forgetting_a_forge_drops_only_its_entries_and_a_late_reply_does_not_land() {
    let memo = Memo::<RepoList>::default();
    memo.get("github|repos", false, 1_000, || Ok(list("a"))).unwrap();
    memo.get("gitlab|repos", false, 1_000, || Ok(list("b"))).unwrap();
    memo.forget("github");
    let calls = Cell::new(0);
    memo.get("gitlab|repos", false, 1_500, || {
        calls.set(calls.get() + 1);
        Ok(list("b"))
    })
    .unwrap();
    assert_eq!(calls.get(), 0);
    memo.get("github|repos", false, 1_500, || {
        memo.forget("github");
        Ok(list("a"))
    })
    .unwrap();
    memo.get("github|repos", false, 1_600, || {
        calls.set(calls.get() + 1);
        Ok(list("a"))
    })
    .unwrap();
    assert_eq!(calls.get(), 1);
}
