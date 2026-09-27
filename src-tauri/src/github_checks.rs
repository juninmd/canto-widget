//! CI status of the PRs in the GitHub lists. The search API has no head sha, so each PR costs a
//! `pulls/{n}` call, then the check runs (Actions, apps) and the legacy commit statuses of that sha.
use serde::{Deserialize, Serialize};
use std::sync::atomic::{AtomicBool, AtomicUsize, Ordering};
use std::sync::Mutex;

use crate::checks_cache::ChecksCache;
use crate::cmd_github::FORGE;
use crate::error::{AppError, Result};
use crate::forge::{checks_from_github, valid_repo_path, ChecksStatus};
use crate::github::{client, network, response, API};

/// PRs checked per request: an uncached one costs three REST calls.
pub const MAX_PRS: usize = 20;
const PARALLEL: usize = 4;

#[derive(Debug, Clone, Deserialize, PartialEq)]
pub struct PrRef {
    pub repo: String,
    pub number: u64,
}

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct PrChecks {
    pub repo: String,
    pub number: u64,
    pub status: ChecksStatus,
}

/// `status` is queued/in_progress/completed/...; `conclusion` only arrives once completed.
#[derive(Debug, Clone, Default, Deserialize, PartialEq)]
pub struct CheckRun {
    #[serde(default)]
    pub status: String,
    #[serde(default)]
    pub conclusion: Option<String>,
}

/// What GitHub says about one commit: its check runs plus the combined legacy status.
#[derive(Debug, Default)]
pub struct Signals {
    pub runs: Vec<CheckRun>,
    pub status_state: String,
    /// The combined status reads "pending" when nothing reported at all: only trust it with statuses.
    pub status_count: u64,
}

fn run_status(r: &CheckRun) -> ChecksStatus {
    if r.status != "completed" {
        return ChecksStatus::Running;
    }
    match r.conclusion.as_deref() {
        Some("success" | "neutral" | "skipped") => ChecksStatus::Success,
        Some("failure" | "timed_out" | "cancelled" | "action_required" | "startup_failure") => ChecksStatus::Failure,
        _ => ChecksStatus::None,
    }
}

/// Any failure wins, then anything still running; only all-green is a success; nothing reported is "sem CI".
pub fn combine(s: &Signals) -> ChecksStatus {
    let legacy = if s.status_count == 0 { ChecksStatus::None } else { checks_from_github(&s.status_state) };
    let all: Vec<ChecksStatus> =
        s.runs.iter().map(run_status).chain([legacy]).filter(|c| *c != ChecksStatus::None).collect();
    if all.contains(&ChecksStatus::Failure) {
        ChecksStatus::Failure
    } else if all.contains(&ChecksStatus::Running) {
        ChecksStatus::Running
    } else if all.is_empty() {
        ChecksStatus::None
    } else {
        ChecksStatus::Success
    }
}

/// Webview input: valid `owner/repo` and number only, no repeats, at most `MAX_PRS`.
pub fn pick(prs: Vec<PrRef>) -> Vec<PrRef> {
    let mut out: Vec<PrRef> = Vec::new();
    for pr in prs.into_iter().filter(|p| p.number > 0 && valid_repo_path(&p.repo, 2)) {
        if out.len() == MAX_PRS {
            break;
        }
        if !out.contains(&pr) {
            out.push(pr);
        }
    }
    out
}

pub trait ChecksApi: Sync {
    fn head_sha(&self, repo: &str, number: u64) -> Result<String>;
    fn signals(&self, repo: &str, sha: &str) -> Result<Signals>;
}

/// Served from the cache when the head sha and its status are still fresh; zero calls in the common refresh.
pub fn status_for(cache: &ChecksCache, api: &impl ChecksApi, pr: &PrRef, now: i64) -> Result<ChecksStatus> {
    let generation = cache.generation();
    let head_key = format!("{FORGE}|{}#{}", pr.repo, pr.number);
    let sha = match cache.head(&head_key, now) {
        Some(sha) => sha,
        None => {
            let sha = api.head_sha(&pr.repo, pr.number)?;
            if sha.len() != 40 || !sha.chars().all(|c| c.is_ascii_hexdigit()) {
                return Err(AppError::Github("resposta inesperada: sha inválido".into()));
            }
            cache.put_head(generation, head_key, sha.clone(), now);
            sha
        }
    };
    let key = format!("{FORGE}|{}@{sha}", pr.repo);
    if let Some(status) = cache.status(&key, now) {
        return Ok(status);
    }
    let status = combine(&api.signals(&pr.repo, &sha)?);
    cache.put_status(generation, key, status, now);
    Ok(status)
}

/// A few PRs at a time; a PR that fails is left out (the row keeps its "ver CI" link), and the rate limit stops the rest.
pub fn statuses(cache: &ChecksCache, api: &impl ChecksApi, prs: &[PrRef], now: i64) -> Vec<PrChecks> {
    let next = AtomicUsize::new(0);
    let stop = AtomicBool::new(false);
    let found = Mutex::new(Vec::new());
    std::thread::scope(|s| {
        for _ in 0..PARALLEL.min(prs.len()) {
            s.spawn(|| loop {
                let i = next.fetch_add(1, Ordering::Relaxed);
                if i >= prs.len() || stop.load(Ordering::Relaxed) {
                    break;
                }
                match status_for(cache, api, &prs[i], now) {
                    Ok(status) => found.lock().unwrap().push((i, status)),
                    Err(AppError::RateLimited { .. }) => stop.store(true, Ordering::Relaxed),
                    Err(_) => {}
                }
            });
        }
    });
    let mut found = found.into_inner().unwrap();
    found.sort_by_key(|(i, _)| *i);
    found.into_iter().map(|(i, status)| PrChecks { repo: prs[i].repo.clone(), number: prs[i].number, status }).collect()
}

#[derive(Deserialize)]
struct PullDetail {
    head: PullHead,
}

#[derive(Deserialize)]
struct PullHead {
    sha: String,
}

#[derive(Deserialize)]
struct CheckRuns {
    #[serde(default)]
    check_runs: Vec<CheckRun>,
}

#[derive(Deserialize)]
struct CombinedStatus {
    #[serde(default)]
    state: String,
    #[serde(default)]
    total_count: u64,
}

pub struct GithubChecks<'a> {
    token: &'a str,
    http: reqwest::blocking::Client,
}

impl<'a> GithubChecks<'a> {
    pub fn new(token: &'a str) -> Result<Self> {
        Ok(Self { token, http: client()? })
    }

    fn get<T: for<'de> Deserialize<'de>>(&self, url: &str) -> Result<T> {
        response(self.http.get(url).bearer_auth(self.token).send().map_err(network)?)
    }
}

impl ChecksApi for GithubChecks<'_> {
    fn head_sha(&self, repo: &str, number: u64) -> Result<String> {
        Ok(self.get::<PullDetail>(&format!("{API}/repos/{repo}/pulls/{number}"))?.head.sha)
    }

    fn signals(&self, repo: &str, sha: &str) -> Result<Signals> {
        let runs: CheckRuns = self.get(&format!("{API}/repos/{repo}/commits/{sha}/check-runs?per_page=100"))?;
        let status: CombinedStatus = self.get(&format!("{API}/repos/{repo}/commits/{sha}/status"))?;
        Ok(Signals { runs: runs.check_runs, status_state: status.state, status_count: status.total_count })
    }
}

#[cfg(test)]
#[path = "github_checks_tests.rs"]
mod tests;
