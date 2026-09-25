use super::*;
use std::sync::atomic::{AtomicU32, Ordering};
use std::sync::Arc;

/// A `Forge` whose credential is just a bearer token, mirroring GitHub's shape.
struct FakeToken;
impl Forge for FakeToken {
    const NAME: &'static str = "fake-token";
    type Credential = Arc<AtomicU32>;

    fn fetch_section(
        calls: &Self::Credential,
        _s: Section,
        _p: u32,
        _f: &ForgeFilter,
    ) -> Result<(ForgeList, Option<Quota>)> {
        calls.fetch_add(1, Ordering::SeqCst);
        Ok((list(1, vec![item(1, "2026-09-01T00:00:00Z", "2026-09-01T00:00:00Z", 0)]), None))
    }

    fn fetch_activity(calls: &Self::Credential, _a: Activity, _since: &str) -> Result<(ForgeList, Option<Quota>)> {
        calls.fetch_add(1, Ordering::SeqCst);
        Ok((ForgeList::default(), None))
    }
}

/// A `Forge` whose credential is a struct (base URL + token + username), mirroring GitLab's shape.
struct FakeAccountCred {
    calls: Arc<AtomicU32>,
}
struct FakeAccount;
impl Forge for FakeAccount {
    const NAME: &'static str = "fake-account";
    type Credential = FakeAccountCred;

    fn fetch_section(
        cred: &Self::Credential,
        _s: Section,
        _p: u32,
        _f: &ForgeFilter,
    ) -> Result<(ForgeList, Option<Quota>)> {
        cred.calls.fetch_add(1, Ordering::SeqCst);
        Ok((list(1, vec![item(1, "2026-09-01T00:00:00Z", "2026-09-01T00:00:00Z", 0)]), None))
    }

    fn fetch_activity(cred: &Self::Credential, _a: Activity, _since: &str) -> Result<(ForgeList, Option<Quota>)> {
        cred.calls.fetch_add(1, Ordering::SeqCst);
        Ok((ForgeList::default(), None))
    }
}

/// Exercised once per adapter below: proves `list_all`/`review_requested` share one cache
/// entry per section regardless of the credential's shape.
fn assert_shared_orchestration<F: Forge>(cred: F::Credential, calls: &AtomicU32) {
    let cache = ForgeCache::default();
    let lists = list_all::<F>(&cache, &cred, &ForgeFilter::default(), false).unwrap();
    assert_eq!(calls.load(Ordering::SeqCst), 4, "collect() should fetch all four sections");
    assert_eq!(lists.assigned.items.len(), 1);

    list_all::<F>(&cache, &cred, &ForgeFilter::default(), false).unwrap();
    assert_eq!(calls.load(Ordering::SeqCst), 4, "a call within the TTL should be served from the cache");

    let total = review_requested::<F>(&cache, &cred).unwrap();
    assert_eq!(total, 1, "review_requested should reuse list_all's cached review_requested page");
    assert_eq!(calls.load(Ordering::SeqCst), 4);
}

#[test]
fn the_shared_orchestration_behaves_the_same_for_a_token_and_an_account_shaped_credential() {
    let token_calls = Arc::new(AtomicU32::new(0));
    assert_shared_orchestration::<FakeToken>(token_calls.clone(), &token_calls);

    let account_calls = Arc::new(AtomicU32::new(0));
    assert_shared_orchestration::<FakeAccount>(FakeAccountCred { calls: account_calls.clone() }, &account_calls);
}

fn list(total: u64, items: Vec<ForgeItem>) -> ForgeList {
    ForgeList { total, items, ..Default::default() }
}

fn numbers(l: &ForgeList) -> Vec<u64> {
    l.items.iter().map(|i| i.number).collect()
}

fn pages() -> (ForgeList, ForgeList) {
    let a = list(5, vec![item(1, "2026-09-01T00:00:00Z", "2026-09-09T00:00:00Z", 9)]);
    let b = list(4, vec![item(2, "2026-09-03T00:00:00Z", "2026-09-05T00:00:00Z", 1)]);
    (a, b)
}

#[test]
fn merged_pages_follow_the_order_the_user_picked() {
    let by = |sort, order| {
        let (a, b) = pages();
        numbers(&merge(a, b, &ForgeFilter { sort, order, ..Default::default() }))
    };
    assert_eq!(by(Sort::Updated, Order::Desc), vec![1, 2]);
    assert_eq!(by(Sort::Created, Order::Desc), vec![2, 1]);
    assert_eq!(by(Sort::Created, Order::Asc), vec![1, 2]);
    assert_eq!(by(Sort::Comments, Order::Asc), vec![2, 1]);
}

#[test]
fn merge_adds_totals_and_keeps_every_item() {
    let (a, b) = pages();
    let merged = merge(a, b, &ForgeFilter::default());
    assert_eq!((merged.total, merged.items.len()), (9, 2));
}

#[test]
fn github_combined_status_maps_to_the_three_states_the_ui_shows() {
    assert_eq!(checks_from_github("success"), ChecksStatus::Success);
    assert_eq!(checks_from_github("failure"), ChecksStatus::Failure);
    assert_eq!(checks_from_github("pending"), ChecksStatus::Running);
    assert_eq!(checks_from_github("whatever-github-adds-later"), ChecksStatus::None);
}

#[test]
fn gitlab_pipeline_status_maps_to_the_three_states_the_ui_shows() {
    assert_eq!(checks_from_gitlab(Some("success")), ChecksStatus::Success);
    assert_eq!(checks_from_gitlab(Some("failed")), ChecksStatus::Failure);
    assert_eq!(checks_from_gitlab(Some("running")), ChecksStatus::Running);
    assert_eq!(checks_from_gitlab(Some("canceled")), ChecksStatus::None);
    assert_eq!(checks_from_gitlab(None), ChecksStatus::None, "an MR with no pipeline configured");
}

#[test]
fn repo_paths_from_the_webview_only_accept_plain_segments() {
    assert!(valid_repo_path("octo/canto-widget", 2));
    assert!(valid_repo_path("group/sub/my.project", 20));
    assert!(!valid_repo_path("group/sub/project", 2), "GitHub repos have exactly two segments");
    assert!(!valid_repo_path("octo/../../user", 20));
    assert!(!valid_repo_path("octo/x?per_page=1", 2));
    assert!(!valid_repo_path("octo/x#frag", 2));
    assert!(!valid_repo_path("octo/%2e%2e", 2));
    assert!(!valid_repo_path("octo", 2));
    assert!(!valid_repo_path("octo//x", 20));
}
