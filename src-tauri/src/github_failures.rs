//! Which jobs made a PR's CI red, for the alert: the failed check runs (with the step that broke, when GitHub
//! Actions says so) and the failed legacy commit statuses. Only asked for a PR that just turned red.
use serde::Deserialize;

use crate::error::Result;
use crate::github::{client, network, response, API};
use crate::github_checks::{ChecksApi, GithubChecks};

/// Enough to name the culprits without turning the alert into a log.
pub const MAX_JOBS: usize = 5;
/// Each failed job costs one more call for its steps.
const MAX_STEP_LOOKUPS: usize = 3;
const PREFIX: &str = "https://github.com/";

#[derive(Debug, Clone, PartialEq)]
pub struct FailedJob {
    /// The check run's id (which is the job id on GitHub Actions); 0 for a legacy commit status.
    pub id: u64,
    pub name: String,
    /// Empty when the link isn't on github.com.
    pub url: String,
    pub step: Option<String>,
}

#[derive(Deserialize)]
struct Runs {
    #[serde(default)]
    check_runs: Vec<Run>,
}

#[derive(Deserialize)]
pub struct Run {
    #[serde(default)]
    pub id: u64,
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub html_url: String,
    #[serde(default)]
    pub status: String,
    #[serde(default)]
    pub conclusion: Option<String>,
}

#[derive(Deserialize)]
struct Combined {
    #[serde(default)]
    statuses: Vec<Status>,
}

#[derive(Deserialize)]
pub struct Status {
    #[serde(default)]
    pub context: String,
    #[serde(default)]
    pub state: String,
    #[serde(default)]
    pub target_url: Option<String>,
}

#[derive(Deserialize)]
struct Job {
    #[serde(default)]
    steps: Vec<Step>,
}

#[derive(Deserialize)]
pub struct Step {
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub conclusion: Option<String>,
}

fn safe(url: &str) -> String {
    if url.starts_with(PREFIX) {
        url.into()
    } else {
        String::new()
    }
}

fn failed_run(r: &Run) -> bool {
    r.status == "completed"
        && matches!(
            r.conclusion.as_deref(),
            Some("failure" | "timed_out" | "cancelled" | "action_required" | "startup_failure")
        )
}

/// The runs that failed, then the legacy statuses that did, in the order GitHub listed them.
pub fn failed_jobs(runs: &[Run], statuses: &[Status]) -> Vec<FailedJob> {
    let from_runs = runs.iter().filter(|r| failed_run(r)).map(|r| FailedJob {
        id: r.id,
        name: r.name.clone(),
        url: safe(&r.html_url),
        step: None,
    });
    let from_statuses = statuses.iter().filter(|s| matches!(s.state.as_str(), "failure" | "error")).map(|s| {
        FailedJob { id: 0, name: s.context.clone(), url: safe(s.target_url.as_deref().unwrap_or("")), step: None }
    });
    from_runs.chain(from_statuses).filter(|j| !j.name.is_empty()).take(MAX_JOBS).collect()
}

/// The first step that broke.
pub fn broken_step(steps: &[Step]) -> Option<String> {
    steps.iter().find(|s| s.conclusion.as_deref() == Some("failure")).map(|s| s.name.clone())
}

/// Best effort: a PR whose details can't be read still gets its alert, just without the job names.
pub fn fetch(token: &str, repo: &str, number: u64) -> Result<Vec<FailedJob>> {
    let api = GithubChecks::new(token)?;
    let sha = api.head_sha(repo, number)?;
    let http = client()?;
    let get = |url: String| http.get(url).bearer_auth(token).send().map_err(network);
    let runs: Runs = response(get(format!("{API}/repos/{repo}/commits/{sha}/check-runs?per_page=100"))?)?;
    let combined: Combined = response(get(format!("{API}/repos/{repo}/commits/{sha}/status"))?)?;
    let mut jobs = failed_jobs(&runs.check_runs, &combined.statuses);
    for job in jobs.iter_mut().filter(|j| j.id > 0).take(MAX_STEP_LOOKUPS) {
        // Not every check run is a GitHub Actions job; the others answer 404 and just keep no step.
        let steps = get(format!("{API}/repos/{repo}/actions/jobs/{}", job.id)).and_then(response::<Job>);
        job.step = steps.ok().and_then(|j| broken_step(&j.steps));
    }
    Ok(jobs)
}

#[cfg(test)]
#[path = "github_failures_tests.rs"]
mod tests;
