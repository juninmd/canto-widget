//! The user's open issues and PRs, via the GitHub REST API search.
use serde::{Deserialize, Serialize};
use std::time::Duration;

use crate::error::{AppError, Result};
use crate::forge::{merge, ForgeItem, ForgeList};
use crate::forge_cache::{rate_limited, Quota};
use crate::forge_filter::{self as filter, Activity, ForgeFilter, Section, Sort, Window, PER_PAGE};
use crate::github_query::{activity_since, queries, team_queries};
use crate::model::now_ms;

pub(crate) const API: &str = "https://api.github.com";

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

#[derive(Deserialize, Serialize, Clone, Debug, PartialEq)]
pub struct GithubUser {
    pub login: String,
    #[serde(default, rename = "type")]
    pub user_type: Option<String>,
    #[serde(default)]
    pub avatar_url: Option<String>,
}

#[derive(Deserialize)]
struct RawComment {
    id: u64,
    #[serde(default)]
    html_url: String,
    #[serde(default)]
    body: String,
    #[serde(default)]
    created_at: String,
    #[serde(default)]
    user: Option<GithubUser>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct PrComment {
    pub id: u64,
    pub author: String,
    pub author_type: String,
    pub avatar_url: String,
    pub body: String,
    pub created_at: String,
    pub url: String,
}

/// One page of a section plus the search quota left; "assigned" pages issues and PRs side by side, so a page may bring up to 60.
pub fn section(token: &str, section: Section, page: u32, f: &ForgeFilter) -> Result<(ForgeList, Option<Quota>)> {
    let (mut out, mut quota) = (ForgeList::default(), None);
    let found = match section {
        Section::TeamMentioned => team_queries(&crate::github_teams::lookup(token), f),
        _ => queries(section, f),
    };
    for q in found {
        let (list, left) = search(token, &q, filter::page(page), f)?;
        out = merge(out, list, f);
        quota = left.or(quota);
    }
    Ok((out, quota))
}

/// Comments on a pull request, newest first; non-GitHub URLs are dropped.
pub fn pr_comments(token: &str, repo: &str, number: u64) -> Result<Vec<PrComment>> {
    let url = format!("{API}/repos/{repo}/issues/{number}/comments?per_page=100");
    let res = client()?.get(url).bearer_auth(token).send().map_err(network)?;
    let raw: Vec<RawComment> = response(res)?;
    Ok(raw
        .into_iter()
        .filter_map(|c| {
            if !c.html_url.starts_with("https://github.com/") {
                return None;
            }
            let user = c.user;
            Some(PrComment {
                id: c.id,
                author: user.as_ref().map(|u| u.login.clone()).unwrap_or_default(),
                author_type: user.as_ref().and_then(|u| u.user_type.clone()).unwrap_or_default(),
                avatar_url: user.as_ref().and_then(|u| u.avatar_url.clone()).unwrap_or_default(),
                body: c.body,
                created_at: c.created_at,
                url: c.html_url,
            })
        })
        .collect())
}

/// First page of the PRs of one kind inside `w`, newest first; `total` still counts the ones past it.
pub fn prs_since(token: &str, activity: Activity, w: &Window) -> Result<(ForgeList, Option<Quota>)> {
    search(token, &activity_since(activity, w), 1, &ForgeFilter { sort: Sort::Created, ..Default::default() })
}

pub fn user(token: &str) -> Result<String> {
    let res = client()?.get(format!("{API}/user")).bearer_auth(token).send().map_err(network)?;
    Ok(response::<GithubUser>(res)?.login)
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
    static CLIENT: std::sync::OnceLock<reqwest::blocking::Client> = std::sync::OnceLock::new();
    crate::net::shared(&CLIENT, || {
        use reqwest::header::{HeaderMap, HeaderValue, ACCEPT};
        let mut h = HeaderMap::new();
        h.insert(ACCEPT, HeaderValue::from_static("application/vnd.github+json"));
        h.insert("X-GitHub-Api-Version", HeaderValue::from_static("2022-11-28"));
        crate::net::client_builder()
            .user_agent("canto-widget")
            .default_headers(h)
            .timeout(Duration::from_secs(20))
            .build()
    })
    .map_err(network)
}

pub(crate) fn network(e: reqwest::Error) -> AppError {
    AppError::Github(format!("sem resposta do GitHub: {e}"))
}

pub(crate) fn response<T: for<'de> Deserialize<'de>>(res: reqwest::blocking::Response) -> Result<T> {
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
        conflict: false,
    })
}

#[cfg(test)]
#[path = "github_tests.rs"]
mod tests;
