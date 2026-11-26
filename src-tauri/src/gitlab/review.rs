//! One MR for the peek view: description, pipeline jobs, approvals, discussions and changed files, plus the writes a
//! reviewer does most (approve, comment, reply, resolve). Reads cost one call each and happen only when a tab opens.
use serde::Deserialize;
use serde_json::{json, Value};

use crate::blocking::run;
use crate::error::{AppError, Result};
use crate::forge::{checks_from_gitlab, valid_repo_path, ChecksStatus};
use crate::github::conversation::ConvEntry;
use crate::github::detail::{clip, PrDetail, PrJob, PrReviewer, MAX_BODY, MAX_COMMENT, MAX_JOBS};
use crate::github::files::{cap_patch, PrFile, MAX_FILES};
use crate::gitlab::cmd::account;
use crate::gitlab::{client, network, response, Account};

const PER_PAGE: usize = 100;

/// Webview input: a safe project path and a real iid, so nothing can steer the authenticated request elsewhere.
pub fn target(project: &str, iid: u64) -> Result<String> {
    if iid == 0 || !valid_repo_path(project, 20) {
        return Err(AppError::Format("projeto inválido".into()));
    }
    Ok(project.replace('/', "%2F"))
}

fn discussion_id(id: &str) -> Result<&str> {
    if (8..=64).contains(&id.len()) && id.chars().all(|c| c.is_ascii_hexdigit()) {
        Ok(id)
    } else {
        Err(AppError::Format("discussão inválida".into()))
    }
}

fn get<T: for<'de> Deserialize<'de>>(acc: &Account, path: &str) -> Result<T> {
    response(
        client()?.get(format!("{}/api/v4/{path}", acc.base)).bearer_auth(acc.token.as_str()).send().map_err(network)?,
    )
}

#[derive(Deserialize)]
struct Named {
    username: String,
}

#[derive(Deserialize)]
struct Mr {
    #[serde(default)]
    description: Option<String>,
    #[serde(default)]
    source_branch: String,
    #[serde(default)]
    target_branch: String,
    #[serde(default)]
    changes_count: Option<String>,
    #[serde(default)]
    head_pipeline: Option<Pipeline>,
    #[serde(default)]
    reviewers: Vec<Named>,
}

#[derive(Deserialize)]
struct Pipeline {
    id: u64,
}

#[derive(Deserialize)]
struct Approvals {
    #[serde(default)]
    approved_by: Vec<Approver>,
}

#[derive(Deserialize)]
struct Approver {
    user: Named,
}

#[derive(Deserialize)]
struct RawJob {
    #[serde(default)]
    name: String,
    #[serde(default)]
    stage: String,
    #[serde(default)]
    status: String,
    #[serde(default)]
    duration: Option<f64>,
    #[serde(default)]
    web_url: String,
}

fn jobs(base: &str, raw: Vec<RawJob>) -> Vec<PrJob> {
    raw.into_iter()
        .take(MAX_JOBS * 4)
        .map(|j| {
            let state = checks_from_gitlab(Some(&j.status));
            PrJob {
                label: if state == ChecksStatus::None { j.status } else { String::new() },
                state,
                url: if j.web_url.starts_with(&format!("{base}/")) { j.web_url } else { String::new() },
                name: j.name,
                stage: j.stage,
                seconds: j.duration.map_or(0, |d| d.max(0.0) as u64),
            }
        })
        .collect()
}

pub fn reviewers(approved: &[String], asked: &[String]) -> Vec<PrReviewer> {
    let mut out: Vec<PrReviewer> =
        approved.iter().map(|l| PrReviewer { login: l.clone(), state: "approved".into() }).collect();
    for l in asked.iter().filter(|l| !approved.contains(l)) {
        out.push(PrReviewer { login: l.clone(), state: "pending".into() });
    }
    out
}

pub fn detail(acc: &Account, project: &str, iid: u64) -> Result<PrDetail> {
    let id = target(project, iid)?;
    let mr: Mr = get(acc, &format!("projects/{id}/merge_requests/{iid}"))?;
    // Approvals can be off on the plan or the project; the panel then just shows who was asked.
    let approved: Vec<String> = get::<Approvals>(acc, &format!("projects/{id}/merge_requests/{iid}/approvals"))
        .map(|a| a.approved_by.into_iter().map(|a| a.user.username).collect())
        .unwrap_or_default();
    let asked: Vec<String> = mr.reviewers.into_iter().map(|r| r.username).collect();
    let jobs = match mr.head_pipeline {
        Some(p) => jobs(&acc.base, get(acc, &format!("projects/{id}/pipelines/{}/jobs?per_page={PER_PAGE}", p.id))?),
        None => Vec::new(),
    };
    let digits: String = mr.changes_count.unwrap_or_default().chars().take_while(char::is_ascii_digit).collect();
    Ok(PrDetail {
        body: clip(mr.description.as_deref().unwrap_or(""), MAX_BODY),
        head_branch: mr.source_branch,
        base_branch: mr.target_branch,
        changed_files: digits.parse().unwrap_or(0),
        jobs,
        reviewers: reviewers(&approved, &asked),
    })
}

#[derive(Deserialize)]
struct Discussion {
    id: String,
    #[serde(default)]
    individual_note: bool,
    #[serde(default)]
    notes: Vec<Note>,
}

#[derive(Deserialize)]
struct Note {
    id: u64,
    #[serde(default)]
    body: String,
    #[serde(default)]
    created_at: String,
    #[serde(default)]
    system: bool,
    #[serde(default)]
    author: Option<Author>,
    #[serde(default)]
    resolvable: bool,
    #[serde(default)]
    resolved: bool,
    #[serde(default)]
    position: Option<Position>,
}

#[derive(Deserialize)]
struct Author {
    username: String,
    #[serde(default)]
    bot: bool,
}

#[derive(Deserialize)]
struct Position {
    #[serde(default)]
    new_path: Option<String>,
    #[serde(default)]
    old_path: Option<String>,
    #[serde(default)]
    new_line: Option<u64>,
    #[serde(default)]
    old_line: Option<u64>,
}

/// Notes in time order inside each discussion, system notes ("added 2 commits") left out, whole list oldest first.
fn entries(base: &str, project: &str, iid: u64, raw: Vec<Discussion>) -> Vec<ConvEntry> {
    let mut all = Vec::new();
    for d in raw {
        let (resolvable, resolved) = d.notes.first().map_or((false, false), |n| (n.resolvable, n.resolved));
        for (i, n) in d.notes.into_iter().enumerate().filter(|(_, n)| !n.system) {
            let (author, bot) = n.author.map_or((String::new(), false), |a| {
                let bot = a.bot || a.username.ends_with("_bot") || a.username.ends_with("[bot]");
                (a.username, bot)
            });
            let (path, line) = n.position.map_or((String::new(), 0), |p| {
                (p.new_path.or(p.old_path).unwrap_or_default(), p.new_line.or(p.old_line).unwrap_or(0))
            });
            all.push(ConvEntry {
                id: n.id,
                author,
                bot,
                body: clip(&n.body, MAX_BODY),
                created_at: n.created_at,
                url: format!("{base}/{project}/-/merge_requests/{iid}#note_{}", n.id),
                path,
                line,
                hunk: String::new(),
                reply: i > 0,
                thread: if d.individual_note { String::new() } else { d.id.clone() },
                resolved: resolvable && resolved,
                resolvable,
            });
        }
    }
    all.sort_by(|a, b| a.created_at.cmp(&b.created_at).then(a.id.cmp(&b.id)));
    all
}

pub fn conversation(acc: &Account, project: &str, iid: u64) -> Result<Vec<ConvEntry>> {
    let id = target(project, iid)?;
    let raw: Vec<Discussion> =
        get(acc, &format!("projects/{id}/merge_requests/{iid}/discussions?per_page={PER_PAGE}"))?;
    Ok(entries(&acc.base, project, iid, raw))
}

#[derive(Deserialize)]
struct Diff {
    #[serde(default)]
    old_path: String,
    #[serde(default)]
    new_path: String,
    #[serde(default)]
    new_file: bool,
    #[serde(default)]
    deleted_file: bool,
    #[serde(default)]
    renamed_file: bool,
    #[serde(default)]
    diff: String,
}

/// GitLab sends no counts, so they come from the patch itself.
pub fn count_changes(patch: &str) -> (u64, u64) {
    patch.lines().fold((0, 0), |(a, d), l| match l.as_bytes().first() {
        Some(b'+') if !l.starts_with("+++") => (a + 1, d),
        Some(b'-') if !l.starts_with("---") => (a, d + 1),
        _ => (a, d),
    })
}

fn convert(raw: Vec<Diff>) -> Vec<PrFile> {
    raw.into_iter()
        .take(MAX_FILES)
        .map(|f| {
            let (additions, deletions) = count_changes(&f.diff);
            let (patch, truncated) = cap_patch(&f.diff);
            let status = if f.new_file {
                "added"
            } else if f.deleted_file {
                "removed"
            } else if f.renamed_file {
                "renamed"
            } else {
                "modified"
            };
            let name = if f.new_path.is_empty() { f.old_path } else { f.new_path };
            PrFile { name, status: status.into(), additions, deletions, patch, truncated }
        })
        .collect()
}

pub fn files(acc: &Account, project: &str, iid: u64) -> Result<Vec<PrFile>> {
    let id = target(project, iid)?;
    Ok(convert(get(acc, &format!("projects/{id}/merge_requests/{iid}/diffs?per_page={MAX_FILES}"))?))
}

/// One write: the HTTP verb, the path under `api/v4` and its JSON body.
#[derive(Debug, PartialEq)]
pub struct Write {
    pub put: bool,
    pub path: String,
    pub json: Value,
}

fn text_of(text: &str) -> Result<&str> {
    let text = text.trim();
    if text.is_empty() {
        return Err(AppError::Format("escreva o comentário antes de enviar".into()));
    }
    if text.chars().count() > MAX_COMMENT {
        return Err(AppError::Format(format!("o texto passa de {MAX_COMMENT} caracteres")));
    }
    Ok(text)
}

/// `approve` (no text) or `comment` (text required); GitLab has no "request changes" in its REST API.
pub fn plan(action: &str, project: &str, iid: u64, text: &str) -> Result<Write> {
    let id = target(project, iid)?;
    let base = format!("projects/{id}/merge_requests/{iid}");
    match action {
        "approve" => Ok(Write { put: false, path: format!("{base}/approve"), json: json!({}) }),
        "comment" => Ok(Write { put: false, path: format!("{base}/notes"), json: json!({ "body": text_of(text)? }) }),
        _ => Err(AppError::Format("ação desconhecida".into())),
    }
}

pub fn plan_reply(project: &str, iid: u64, discussion: &str, text: &str) -> Result<Write> {
    let id = target(project, iid)?;
    let d = discussion_id(discussion)?;
    Ok(Write {
        put: false,
        path: format!("projects/{id}/merge_requests/{iid}/discussions/{d}/notes"),
        json: json!({ "body": text_of(text)? }),
    })
}

pub fn plan_resolve(project: &str, iid: u64, discussion: &str, resolved: bool) -> Result<Write> {
    let id = target(project, iid)?;
    let d = discussion_id(discussion)?;
    Ok(Write {
        put: true,
        path: format!("projects/{id}/merge_requests/{iid}/discussions/{d}"),
        json: json!({ "resolved": resolved }),
    })
}

/// What a refused write means to the user; the shared handler keeps the rate-limit and sign-in cases.
pub fn write_refused(status: u16) -> Option<AppError> {
    let text = match status {
        403 | 404 => "o token não pode escrever neste MR: crie-o com o escopo api",
        405 | 422 => "o GitLab recusou: não dá para aprovar o próprio MR, nem comentar ou aprovar um MR já fechado",
        _ => return None,
    };
    Some(AppError::Gitlab(text.into()))
}

pub fn send(acc: &Account, w: &Write) -> Result<()> {
    let url = format!("{}/api/v4/{}", acc.base, w.path);
    let http = client()?;
    let req = if w.put { http.put(url) } else { http.post(url) };
    let res = req.bearer_auth(acc.token.as_str()).json(&w.json).send().map_err(network)?;
    let spent = res.headers().get("ratelimit-remaining").is_some_and(|v| v == "0");
    match write_refused(res.status().as_u16()) {
        Some(e) if !spent => Err(e),
        _ => response::<Value>(res).map(|_| ()),
    }
}

#[tauri::command]
pub async fn gitlab_mr_detail(app: tauri::AppHandle, project: String, iid: u64) -> Result<PrDetail> {
    target(&project, iid)?;
    run(move || detail(&account(&app)?, &project, iid)).await
}

#[tauri::command]
pub async fn gitlab_mr_conversation(app: tauri::AppHandle, project: String, iid: u64) -> Result<Vec<ConvEntry>> {
    target(&project, iid)?;
    run(move || conversation(&account(&app)?, &project, iid)).await
}

#[tauri::command]
pub async fn gitlab_mr_files(app: tauri::AppHandle, project: String, iid: u64) -> Result<Vec<PrFile>> {
    target(&project, iid)?;
    run(move || files(&account(&app)?, &project, iid)).await
}

/// A user-triggered write (`approve` or `comment`); validated before the token is even read.
#[tauri::command]
pub async fn gitlab_mr_review(
    app: tauri::AppHandle,
    project: String,
    iid: u64,
    action: String,
    body: Option<String>,
) -> Result<()> {
    let w = plan(&action, &project, iid, body.as_deref().unwrap_or(""))?;
    run(move || send(&account(&app)?, &w)).await
}

#[tauri::command]
pub async fn gitlab_mr_reply(
    app: tauri::AppHandle,
    project: String,
    iid: u64,
    discussion: String,
    body: String,
) -> Result<()> {
    let w = plan_reply(&project, iid, &discussion, &body)?;
    run(move || send(&account(&app)?, &w)).await
}

#[tauri::command]
pub async fn gitlab_mr_resolve(
    app: tauri::AppHandle,
    project: String,
    iid: u64,
    discussion: String,
    resolved: bool,
) -> Result<()> {
    let w = plan_resolve(&project, iid, &discussion, resolved)?;
    run(move || send(&account(&app)?, &w)).await
}

#[cfg(test)]
#[path = "review_tests.rs"]
mod tests;
