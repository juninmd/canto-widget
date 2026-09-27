use super::*;
use crate::checks_cache::{FINAL_TTL_MS, HEAD_TTL_MS, RUNNING_TTL_MS};
use std::sync::atomic::AtomicU32;

fn run(status: &str, conclusion: Option<&str>) -> CheckRun {
    CheckRun { status: status.into(), conclusion: conclusion.map(Into::into) }
}

fn signals(runs: Vec<CheckRun>, state: &str, count: u64) -> Signals {
    Signals { runs, status_state: state.into(), status_count: count }
}

fn pr(repo: &str, number: u64) -> PrRef {
    PrRef { repo: repo.into(), number }
}

#[test]
fn any_failure_wins_over_running_and_success() {
    let s = signals(vec![run("completed", Some("success")), run("in_progress", None)], "failure", 1);
    assert_eq!(combine(&s), ChecksStatus::Failure);
    let s = signals(vec![run("completed", Some("timed_out")), run("queued", None)], "", 0);
    assert_eq!(combine(&s), ChecksStatus::Failure);
}

#[test]
fn something_pending_means_running() {
    let s = signals(vec![run("completed", Some("success")), run("queued", None)], "", 0);
    assert_eq!(combine(&s), ChecksStatus::Running);
    assert_eq!(combine(&signals(vec![run("completed", Some("success"))], "pending", 2)), ChecksStatus::Running);
}

#[test]
fn green_neutral_and_skipped_are_a_success() {
    let runs =
        vec![run("completed", Some("success")), run("completed", Some("neutral")), run("completed", Some("skipped"))];
    assert_eq!(combine(&signals(runs, "", 0)), ChecksStatus::Success);
    assert_eq!(combine(&signals(vec![], "success", 1)), ChecksStatus::Success);
}

#[test]
fn nothing_reported_is_no_ci_even_though_the_combined_status_says_pending() {
    assert_eq!(combine(&signals(vec![], "pending", 0)), ChecksStatus::None);
}

#[test]
fn pick_drops_bad_input_repeats_and_caps_the_batch() {
    let mut input = vec![pr("../x", 1), pr("o/r?x=1", 2), pr("o/r", 0), pr("o/r", 3), pr("o/r", 3)];
    input.extend((10..40).map(|n| pr("o/r", n)));
    let out = pick(input);
    assert_eq!(out.len(), MAX_PRS);
    assert_eq!(out[0], pr("o/r", 3));
    assert_eq!(out[1], pr("o/r", 10));
}

struct Fake {
    sha: Mutex<String>,
    signals: fn() -> Result<Signals>,
    heads: AtomicU32,
    calls: AtomicU32,
}

impl Fake {
    fn new(signals: fn() -> Result<Signals>) -> Self {
        Fake { sha: Mutex::new("a".repeat(40)), signals, heads: AtomicU32::new(0), calls: AtomicU32::new(0) }
    }
}

impl ChecksApi for Fake {
    fn head_sha(&self, _: &str, _: u64) -> Result<String> {
        self.heads.fetch_add(1, Ordering::SeqCst);
        Ok(self.sha.lock().unwrap().clone())
    }
    fn signals(&self, _: &str, _: &str) -> Result<Signals> {
        self.calls.fetch_add(1, Ordering::SeqCst);
        (self.signals)()
    }
}

fn green() -> Result<Signals> {
    Ok(signals(vec![run("completed", Some("success"))], "", 0))
}

fn busy() -> Result<Signals> {
    Ok(signals(vec![run("in_progress", None)], "", 0))
}

#[test]
fn a_refresh_within_the_ttl_spends_no_calls() {
    let (cache, api) = (ChecksCache::default(), Fake::new(green));
    assert_eq!(status_for(&cache, &api, &pr("o/r", 1), 0).unwrap(), ChecksStatus::Success);
    assert_eq!(status_for(&cache, &api, &pr("o/r", 1), HEAD_TTL_MS - 1).unwrap(), ChecksStatus::Success);
    assert_eq!((api.heads.load(Ordering::SeqCst), api.calls.load(Ordering::SeqCst)), (1, 1));
}

#[test]
fn a_finished_head_is_kept_across_head_checks_but_a_new_push_is_fetched() {
    let (cache, api) = (ChecksCache::default(), Fake::new(green));
    status_for(&cache, &api, &pr("o/r", 1), 0).unwrap();
    status_for(&cache, &api, &pr("o/r", 1), HEAD_TTL_MS + 1).unwrap();
    assert_eq!((api.heads.load(Ordering::SeqCst), api.calls.load(Ordering::SeqCst)), (2, 1), "same sha, final state");
    *api.sha.lock().unwrap() = "b".repeat(40);
    status_for(&cache, &api, &pr("o/r", 1), 2 * HEAD_TTL_MS + 2).unwrap();
    assert_eq!(api.calls.load(Ordering::SeqCst), 2, "new sha after a push");
    const { assert!(FINAL_TTL_MS > 2 * HEAD_TTL_MS) };
}

#[test]
fn a_running_pipeline_is_asked_again_sooner() {
    let (cache, api) = (ChecksCache::default(), Fake::new(busy));
    status_for(&cache, &api, &pr("o/r", 1), 0).unwrap();
    status_for(&cache, &api, &pr("o/r", 1), RUNNING_TTL_MS + 1).unwrap();
    assert_eq!(api.calls.load(Ordering::SeqCst), 2);
}

#[test]
fn a_disconnect_drops_the_cached_status() {
    let (cache, api) = (ChecksCache::default(), Fake::new(green));
    status_for(&cache, &api, &pr("o/r", 1), 0).unwrap();
    cache.forget(FORGE);
    status_for(&cache, &api, &pr("o/r", 1), 1).unwrap();
    assert_eq!(api.calls.load(Ordering::SeqCst), 2);
}

#[test]
fn a_batch_keeps_input_order_and_stops_at_the_rate_limit() {
    let (cache, api) = (ChecksCache::default(), Fake::new(green));
    let prs: Vec<PrRef> = (1..=6).map(|n| pr("o/r", n)).collect();
    let got = statuses(&cache, &api, &prs, 0);
    assert_eq!(got.iter().map(|c| c.number).collect::<Vec<_>>(), vec![1, 2, 3, 4, 5, 6]);

    let limited = Fake::new(|| Err(AppError::RateLimited { message: "limite".into(), reset_at: 0 }));
    assert!(statuses(&ChecksCache::default(), &limited, &prs, 0).is_empty());
    assert!(limited.calls.load(Ordering::SeqCst) <= PARALLEL as u32, "no new PR starts after the limit");
}
