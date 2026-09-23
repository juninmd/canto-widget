//! Open issues and merge requests from GitLab.com or a self-hosted instance, via API v4.
use serde::Deserialize;
use std::time::Duration;
use zeroize::Zeroizing;

use crate::error::{AppError, Result};
use crate::forge::{checks_from_gitlab, merge, valid_repo_path, ChecksStatus, ForgeItem, ForgeList};
use crate::forge_cache::{rate_limited, Quota};
use crate::forge_filter::{ForgeFilter, Section, PER_PAGE};
use crate::gitlab_query::{opened_since, requests, Request};
use crate::model::now_ms;

pub struct Account {
    /// Already validated by `gitlab_query::base_url`: https, no trailing slash.
    pub base: String,
    pub token: Zeroizing<String>,
    pub username: String,
}

#[derive(Deserialize)]
struct RawItem {
    iid: u64,
    #[serde(default)]
    title: String,
    #[serde(default)]
    web_url: String,
    #[serde(default)]
    created_at: String,
    #[serde(default)]
    updated_at: String,
    #[serde(default)]
    user_notes_count: u64,
    #[serde(default)]
    draft: bool,
    /// Pre-16.0 instances only send this one.
    #[serde(default)]
    work_in_progress: bool,
    #[serde(default)]
    references: Option<References>,
    #[serde(default)]
    author: Option<User>,
}

#[derive(Deserialize)]
struct References {
    full: String,
}

#[derive(Deserialize)]
struct User {
    username: String,
}

pub fn user(base: &str, token: &str) -> Result<String> {
    let res = client()?.get(format!("{base}/api/v4/user")).bearer_auth(token).send().map_err(network)?;
    Ok(response::<User>(res)?.username)
}

/// One page of a section plus the quota left; "assigned" pages issues and MRs side by side.
pub fn section(acc: &Account, section: Section, page: u32, f: &ForgeFilter) -> Result<(ForgeList, Option<Quota>)> {
    let (mut out, mut quota) = (ForgeList::default(), None);
    for r in requests(section, &acc.username, page, f)? {
        let (list, left) = fetch(acc, &r)?;
        out = merge(out, list, f);
        quota = left.or(quota);
    }
    Ok((out, quota))
}

pub fn mrs_opened_since(acc: &Account, since: &str) -> Result<(ForgeList, Option<Quota>)> {
    fetch(acc, &opened_since(since))
}

#[derive(Deserialize)]
struct MrDetail {
    #[serde(default)]
    head_pipeline: Option<HeadPipeline>,
}

#[derive(Deserialize)]
struct HeadPipeline {
    status: String,
}

/// One call: unlike GitHub, GitLab already embeds the head pipeline in the MR detail.
pub fn mr_checks(acc: &Account, project: &str, iid: u64) -> Result<ChecksStatus> {
    if !valid_repo_path(project, 20) {
        return Err(AppError::Format("projeto inválido".into()));
    }
    let encoded = project.replace('/', "%2F");
    let url = format!("{}/api/v4/projects/{encoded}/merge_requests/{iid}", acc.base);
    let res = client()?.get(url).bearer_auth(acc.token.as_str()).send().map_err(network)?;
    let detail: MrDetail = response(res)?;
    Ok(checks_from_gitlab(detail.head_pipeline.as_ref().map(|p| p.status.as_str())))
}

fn fetch(acc: &Account, r: &Request) -> Result<(ForgeList, Option<Quota>)> {
    let url = url::Url::parse_with_params(&format!("{}/api/v4/{}", acc.base, r.path), &r.params)
        .map_err(|e| AppError::Gitlab(e.to_string()))?;
    let res = client()?.get(url).bearer_auth(acc.token.as_str()).send().map_err(network)?;
    let h = res.headers();
    let quota = Quota::from_headers(h, "ratelimit-remaining", "ratelimit-reset", now_ms());
    let header = |name: &str| h.get(name).and_then(|v| v.to_str().ok()).map(str::trim).filter(|v| !v.is_empty()).map(String::from);
    let (total, next) = (header("x-total").and_then(|v| v.parse().ok()), header("x-next-page").is_some());
    let raw: Vec<RawItem> = response(res)?;
    Ok((convert(&acc.base, r, raw, total, next), quota))
}

/// Redirects are refused: the token must only ever reach the address the user typed.
fn client() -> Result<reqwest::blocking::Client> {
    crate::net::client_builder()
        .user_agent("canto-widget")
        .redirect(reqwest::redirect::Policy::none())
        .timeout(Duration::from_secs(20))
        .build()
        .map_err(network)
}

fn network(e: reqwest::Error) -> AppError {
    AppError::Gitlab(format!("sem resposta do GitLab: {e}"))
}

fn response<T: for<'de> Deserialize<'de>>(res: reqwest::blocking::Response) -> Result<T> {
    let status = res.status().as_u16();
    let now = now_ms();
    let spent = Quota::from_headers(res.headers(), "ratelimit-remaining", "ratelimit-reset", now).filter(|q| q.remaining == 0);
    let err = |m: &str| Err(AppError::Gitlab(m.into()));
    match status {
        200..=299 => res.json().map_err(|e| AppError::Gitlab(format!("resposta inesperada: {e}"))),
        300..=399 => err("o endereço redirecionou para outro lugar; confira o endereço da instância"),
        401 => err("token inválido, expirado ou revogado; conecte de novo"),
        403 | 429 if spent.is_some() || status == 429 => Err(rate_limited("gitlab", spent.map_or(now + 60_000, |q| q.reset_at), now)),
        403 => err("o token não tem acesso; ele precisa do escopo read_api"),
        404 => err("não achei a API do GitLab nesse endereço"),
        _ => Err(AppError::Gitlab(format!("o GitLab respondeu {status}"))),
    }
}

/// Without `X-Total` (GitLab drops it past 10,000 results) the total is an estimate that keeps "show more" working.
fn convert(base: &str, r: &Request, raw: Vec<RawItem>, total: Option<u64>, has_next: bool) -> ForgeList {
    let offset = (r.page() as u64 - 1) * PER_PAGE as u64;
    let estimate = offset + raw.len() as u64 + if has_next { PER_PAGE as u64 } else { 0 };
    let items = raw.into_iter().filter_map(|b| item(base, r.is_mr(), b)).collect();
    ForgeList { total: total.unwrap_or(estimate), items, ..Default::default() }
}

/// A link outside the configured instance is dropped: the UI opens this URL in the browser.
fn item(base: &str, is_mr: bool, b: RawItem) -> Option<ForgeItem> {
    if !b.web_url.starts_with(&format!("{base}/")) {
        return None;
    }
    let sigil = if is_mr { '!' } else { '#' };
    let reference = b.references.map(|r| r.full).unwrap_or_else(|| format!("{sigil}{}", b.iid));
    let repo = reference.rsplit_once(sigil).map(|(repo, _)| repo.to_string()).unwrap_or_default();
    Some(ForgeItem {
        repo,
        number: b.iid,
        reference,
        title: b.title,
        url: b.web_url,
        created_at: b.created_at,
        updated_at: b.updated_at,
        comments: b.user_notes_count,
        is_pr: is_mr,
        draft: b.draft || b.work_in_progress,
        author: b.author.map(|u| u.username).unwrap_or_default(),
    })
}

#[cfg(test)]
#[path = "gitlab_tests.rs"]
mod tests;
