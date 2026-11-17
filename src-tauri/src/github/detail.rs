//! One PR in detail for the peek panel (description, jobs, reviewers) and the two things a user can do from it:
//! approve or comment. Reads cost three calls (`pulls/{n}`, its reviews, the check runs of its head); a write costs one.
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use crate::error::{AppError, Result};
use crate::forge::{valid_repo_path, ChecksStatus};
use crate::github::checks::{run_status, verdicts, CheckRun, Review};
use crate::github::{client, network, response, API};

/// The panel shows a glance, not the whole description.
pub const MAX_BODY: usize = 1500;
pub const MAX_JOBS: usize = 12;
pub const MAX_COMMENT: usize = 2000;
const PREFIX: &str = "https://github.com/";

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct PrJob {
    pub name: String,
    pub state: ChecksStatus,
    /// Empty when the link isn't on github.com.
    pub url: String,
}

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct PrReviewer {
    pub login: String,
    /// `approved`, `changes` or `pending` (asked, not answered yet).
    pub state: String,
}

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct PrDetail {
    pub body: String,
    pub head_branch: String,
    pub base_branch: String,
    pub changed_files: u64,
    pub jobs: Vec<PrJob>,
    pub reviewers: Vec<PrReviewer>,
}

#[derive(Deserialize)]
struct Pull {
    #[serde(default)]
    body: Option<String>,
    head: Branch,
    base: Branch,
    #[serde(default)]
    changed_files: u64,
    #[serde(default)]
    requested_reviewers: Vec<Login>,
}

#[derive(Deserialize)]
struct Branch {
    #[serde(default, rename = "ref")]
    name: String,
    #[serde(default)]
    sha: String,
}

#[derive(Deserialize)]
struct Login {
    login: String,
}

#[derive(Deserialize)]
struct RunList {
    #[serde(default)]
    check_runs: Vec<Run>,
}

#[derive(Deserialize)]
struct Run {
    #[serde(default)]
    name: String,
    #[serde(default)]
    html_url: String,
    #[serde(flatten)]
    run: CheckRun,
}

pub fn clip(text: &str, max: usize) -> String {
    let text = text.trim();
    match text.char_indices().nth(max) {
        Some((end, _)) => format!("{}…", text[..end].trim_end()),
        None => text.to_string(),
    }
}

/// People who answered (latest verdict) first, then the ones still asked.
pub fn reviewers(reviews: &[Review], asked: &[String]) -> Vec<PrReviewer> {
    let mut out: Vec<PrReviewer> = verdicts(reviews)
        .into_iter()
        .map(|(login, state)| PrReviewer {
            login: login.into(),
            state: if state == "APPROVED" { "approved" } else { "changes" }.into(),
        })
        .collect();
    for login in asked {
        if !out.iter().any(|r| &r.login == login) {
            out.push(PrReviewer { login: login.clone(), state: "pending".into() });
        }
    }
    out
}

fn jobs(runs: Vec<Run>) -> Vec<PrJob> {
    runs.into_iter()
        .take(MAX_JOBS)
        .map(|r| PrJob {
            state: run_status(&r.run),
            url: if r.html_url.starts_with(PREFIX) { r.html_url } else { String::new() },
            name: r.name,
        })
        .collect()
}

/// Webview input: a safe `owner/repo` and a real number, so nothing can steer the authenticated request elsewhere.
pub fn check_target(repo: &str, number: u64) -> Result<()> {
    if number == 0 || !valid_repo_path(repo, 2) {
        return Err(AppError::Format("repositório inválido".into()));
    }
    Ok(())
}

pub fn fetch(token: &str, repo: &str, number: u64) -> Result<PrDetail> {
    check_target(repo, number)?;
    let http = client()?;
    let get = |url: String| http.get(url).bearer_auth(token).send().map_err(network);
    let pull: Pull = response(get(format!("{API}/repos/{repo}/pulls/{number}"))?)?;
    let reviews: Vec<Review> = response(get(format!("{API}/repos/{repo}/pulls/{number}/reviews?per_page=100"))?)?;
    let runs: RunList = if pull.head.sha.len() == 40 && pull.head.sha.chars().all(|c| c.is_ascii_hexdigit()) {
        response(get(format!("{API}/repos/{repo}/commits/{}/check-runs?per_page=100", pull.head.sha))?)?
    } else {
        RunList { check_runs: Vec::new() }
    };
    let asked: Vec<String> = pull.requested_reviewers.into_iter().map(|l| l.login).collect();
    Ok(PrDetail {
        body: clip(pull.body.as_deref().unwrap_or(""), MAX_BODY),
        head_branch: pull.head.name,
        base_branch: pull.base.name,
        changed_files: pull.changed_files,
        jobs: jobs(runs.check_runs),
        reviewers: reviewers(&reviews, &asked),
    })
}

/// The one request of a write: the path under the API root and its JSON body.
#[derive(Debug, PartialEq)]
pub struct Write {
    pub path: String,
    pub json: Value,
}

/// `approve` posts an approving review (the text is optional); `comment` posts a conversation comment (the text is required).
pub fn plan(action: &str, repo: &str, number: u64, text: &str) -> Result<Write> {
    check_target(repo, number)?;
    let text = text.trim();
    if text.chars().count() > MAX_COMMENT {
        return Err(AppError::Format(format!("o texto passa de {MAX_COMMENT} caracteres")));
    }
    match action {
        "approve" => {
            let mut json = json!({ "event": "APPROVE" });
            if !text.is_empty() {
                json["body"] = text.into();
            }
            Ok(Write { path: format!("repos/{repo}/pulls/{number}/reviews"), json })
        }
        "comment" if !text.is_empty() => {
            Ok(Write { path: format!("repos/{repo}/issues/{number}/comments"), json: json!({ "body": text }) })
        }
        "comment" => Err(AppError::Format("escreva o comentário antes de enviar".into())),
        _ => Err(AppError::Format("ação desconhecida".into())),
    }
}

/// What a refused write means to the user; a rate limit is left to the shared handler.
pub fn write_refused(status: u16) -> Option<AppError> {
    let text = match status {
        403 | 404 => "o token não pode escrever neste PR: crie-o com permissão de escrita em Pull requests (e Issues, para comentar)",
        422 => "o GitHub recusou: não dá para aprovar o próprio PR, nem comentar ou aprovar um PR já fechado",
        _ => return None,
    };
    Some(AppError::Github(text.into()))
}

pub fn send(token: &str, w: &Write) -> Result<()> {
    let res = client()?.post(format!("{API}/{}", w.path)).bearer_auth(token).json(&w.json).send().map_err(network)?;
    let spent = res.headers().get("x-ratelimit-remaining").is_some_and(|v| v == "0");
    match write_refused(res.status().as_u16()) {
        Some(e) if !spent => Err(e),
        _ => response::<Value>(res).map(|_| ()),
    }
}

#[cfg(test)]
#[path = "detail_tests.rs"]
mod tests;
