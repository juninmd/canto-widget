//! The user's open issues and PRs, via the GitHub REST API search.
use serde::Deserialize;
use std::time::Duration;

use crate::error::{AppError, Result};
use crate::forge::{checks_from_github, merge, valid_repo_path, ChecksStatus, ForgeItem, ForgeList};
use crate::forge_cache::{rate_limited, Quota};
use crate::forge_filter::{self as filter, ForgeFilter, Section, Sort, PER_PAGE};
use crate::github_query::{opened_since, queries};
use crate::model::now_ms;

const API: &str = "https://api.github.com";

#[derive(Deserialize)]
struct SearchResponse {
    #[serde(default)]
    total_count: u64,
    #[serde(default)]
    items: Vec<RawItem>,
}

#[derive(Deserialize)]
struct RawItem {
    number: u64,
    #[serde(default)]
    title: String,
    #[serde(default)]
    html_url: String,
    #[serde(default)]
    repository_url: String,
    #[serde(default)]
    created_at: String,
    #[serde(default)]
    updated_at: String,
    #[serde(default)]
    comments: u64,
    #[serde(default)]
    draft: Option<bool>,
    #[serde(default)]
    pull_request: Option<serde_json::Value>,
    #[serde(default)]
    user: Option<GithubUser>,
}

#[derive(Deserialize)]
pub struct GithubUser {
    pub login: String,
}

/// One page of a section plus the search quota left; "assigned" pages issues and PRs side by side, so a page may bring up to 60.
pub fn section(token: &str, section: Section, page: u32, f: &ForgeFilter) -> Result<(ForgeList, Option<Quota>)> {
    let (mut out, mut quota) = (ForgeList::default(), None);
    for q in queries(section, f) {
        let (list, left) = search(token, &q, filter::page(page), f)?;
        out = merge(out, list, f);
        quota = left.or(quota);
    }
    Ok((out, quota))
}

/// First page of the PRs opened since `since` (RFC 3339), newest first.
pub fn prs_opened_since(token: &str, since: &str) -> Result<(ForgeList, Option<Quota>)> {
    search(token, &opened_since(since), 1, &ForgeFilter { sort: Sort::Created, ..Default::default() })
}

pub fn user(token: &str) -> Result<String> {
    let res = client()?.get(format!("{API}/user")).bearer_auth(token).send().map_err(network)?;
    Ok(response::<GithubUser>(res)?.login)
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
struct CombinedStatus {
    #[serde(default)]
    state: String,
}

/// Two calls (head sha, then its combined status): only on an explicit click, never per row of a list.
pub fn pr_checks(token: &str, repo: &str, number: u64) -> Result<ChecksStatus> {
    if !valid_repo_path(repo, 2) {
        return Err(AppError::Format("repositório inválido".into()));
    }
    let pr: PullDetail = response(
        client()?.get(format!("{API}/repos/{repo}/pulls/{number}")).bearer_auth(token).send().map_err(network)?,
    )?;
    let status: CombinedStatus = response(
        client()?
            .get(format!("{API}/repos/{repo}/commits/{}/status", pr.head.sha))
            .bearer_auth(token)
            .send()
            .map_err(network)?,
    )?;
    Ok(checks_from_github(&status.state))
}

fn search(token: &str, query: &str, page: u32, f: &ForgeFilter) -> Result<(ForgeList, Option<Quota>)> {
    let url = url::Url::parse_with_params(
        &format!("{API}/search/issues"),
        [
            ("q", query),
            ("sort", f.sort.as_str()),
            ("order", f.order.as_str()),
            ("per_page", &PER_PAGE.to_string()),
            ("page", &page.to_string()),
        ],
    )
    .map_err(|e| AppError::Github(e.to_string()))?;
    let res = client()?.get(url).bearer_auth(token).send().map_err(network)?;
    let quota = Quota::from_headers(
        res.headers(),
        res.status().as_u16(),
        "x-ratelimit-remaining",
        "x-ratelimit-reset",
        now_ms(),
    );
    Ok((convert(response(res)?), quota))
}

pub(crate) fn client() -> Result<reqwest::blocking::Client> {
    use reqwest::header::{HeaderMap, HeaderValue, ACCEPT};
    let mut h = HeaderMap::new();
    h.insert(ACCEPT, HeaderValue::from_static("application/vnd.github+json"));
    h.insert("X-GitHub-Api-Version", HeaderValue::from_static("2022-11-28"));
    crate::net::client_builder()
        .user_agent("canto-widget")
        .default_headers(h)
        .timeout(Duration::from_secs(20))
        .build()
        .map_err(network)
}

pub(crate) fn network(e: reqwest::Error) -> AppError {
    AppError::Github(format!("sem resposta do GitHub: {e}"))
}

fn response<T: for<'de> Deserialize<'de>>(res: reqwest::blocking::Response) -> Result<T> {
    let status = res.status().as_u16();
    let now = now_ms();
    let spent = Quota::from_headers(res.headers(), status, "x-ratelimit-remaining", "x-ratelimit-reset", now)
        .filter(|q| q.remaining == 0);
    match status {
        200..=299 => res.json().map_err(|e| AppError::Github(format!("resposta inesperada: {e}"))),
        401 => Err(AppError::Github("token expirado ou revogado; conecte de novo".into())),
        403 | 429 if spent.is_some() || status == 429 => {
            Err(rate_limited("github", spent.map_or(now + 60_000, |q| q.reset_at), now))
        }
        _ => Err(AppError::Github(format!("o GitHub respondeu {status}"))),
    }
}

fn convert(search: SearchResponse) -> ForgeList {
    let items = search.items.into_iter().filter_map(item).collect();
    ForgeList { total: search.total_count, items, ..Default::default() }
}

/// A link outside github.com is dropped: the UI opens this URL in the browser.
fn item(b: RawItem) -> Option<ForgeItem> {
    if !b.html_url.starts_with("https://github.com/") {
        return None;
    }
    let repo = b.repository_url.strip_prefix(&format!("{API}/repos/"))?.to_string();
    Some(ForgeItem {
        reference: format!("{repo}#{}", b.number),
        repo,
        number: b.number,
        title: b.title,
        url: b.html_url,
        created_at: b.created_at,
        updated_at: b.updated_at,
        comments: b.comments,
        is_pr: b.pull_request.is_some(),
        draft: b.draft.unwrap_or(false),
        author: b.user.map(|u| u.login).unwrap_or_default(),
    })
}

#[cfg(test)]
#[path = "github_tests.rs"]
mod tests;
