//! The user's open issues and PRs, via the GitHub REST API search.
use serde::{Deserialize, Serialize};
use std::time::Duration;

use crate::error::{AppError, Result};

const API: &str = "https://api.github.com";
const PER_PAGE: usize = 30;

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct GithubItem {
    pub repo: String,
    pub number: u64,
    pub title: String,
    pub url: String,
    pub updated_at: String,
    pub is_pr: bool,
    pub draft: bool,
    pub author: String,
}

#[derive(Debug, Default, Serialize, PartialEq)]
pub struct GithubList {
    /// Total on GitHub; `items` only carries the first page.
    pub total: u64,
    pub items: Vec<GithubItem>,
}

#[derive(Debug, Default, Serialize)]
pub struct GithubLists {
    pub assigned: GithubList,
    pub my_prs: GithubList,
    pub review_requested: GithubList,
    pub my_issues: GithubList,
}

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
    updated_at: String,
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

/// The search requires an explicit `is:issue` or `is:pr`; that's why "assigned" is two queries.
const ASSIGNED_ISSUES: &str = "is:open is:issue archived:false assignee:@me";
const ASSIGNED_PRS: &str = "is:open is:pr archived:false assignee:@me";
const MY_PRS: &str = "is:open is:pr archived:false author:@me";
const REVIEW_REQUESTED: &str = "is:open is:pr archived:false review-requested:@me";
const MY_ISSUES: &str = "is:open is:issue archived:false author:@me";

pub fn lists(token: &str) -> Result<GithubLists> {
    let (issues, prs) = (search(token, ASSIGNED_ISSUES)?, search(token, ASSIGNED_PRS)?);
    Ok(GithubLists {
        assigned: merge(issues, prs),
        my_prs: search(token, MY_PRS)?,
        review_requested: search(token, REVIEW_REQUESTED)?,
        my_issues: search(token, MY_ISSUES)?,
    })
}

pub fn user(token: &str) -> Result<String> {
    let res = client()?.get(format!("{API}/user")).bearer_auth(token).send().map_err(network)?;
    Ok(response::<GithubUser>(res)?.login)
}

fn search(token: &str, query: &str) -> Result<GithubList> {
    let url = url::Url::parse_with_params(
        &format!("{API}/search/issues"),
        [("q", query), ("sort", "updated"), ("order", "desc"), ("per_page", &PER_PAGE.to_string())],
    )
    .map_err(|e| AppError::Github(e.to_string()))?;
    let res = client()?.get(url).bearer_auth(token).send().map_err(network)?;
    Ok(convert(response::<SearchResponse>(res)?))
}

pub(crate) fn client() -> Result<reqwest::blocking::Client> {
    use reqwest::header::{HeaderMap, HeaderValue, ACCEPT};
    let mut h = HeaderMap::new();
    h.insert(ACCEPT, HeaderValue::from_static("application/vnd.github+json"));
    h.insert("X-GitHub-Api-Version", HeaderValue::from_static("2022-11-28"));
    reqwest::blocking::Client::builder()
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
    let no_quota = res.headers().get("x-ratelimit-remaining").is_some_and(|v| v == "0");
    match status {
        200..=299 => res.json().map_err(|e| AppError::Github(format!("resposta inesperada: {e}"))),
        401 => Err(AppError::Github("token expirado ou revogado; conecte de novo".into())),
        403 | 429 if no_quota || status == 429 => {
            Err(AppError::Github("limite de requisicoes atingido; tente de novo em alguns minutos".into()))
        }
        _ => Err(AppError::Github(format!("o GitHub respondeu {status}"))),
    }
}

fn convert(search: SearchResponse) -> GithubList {
    let items = search.items.into_iter().filter_map(item).collect();
    GithubList { total: search.total_count, items }
}

/// A link outside github.com is dropped: the UI opens this URL in the browser.
fn item(b: RawItem) -> Option<GithubItem> {
    if !b.html_url.starts_with("https://github.com/") {
        return None;
    }
    let repo = b.repository_url.strip_prefix(&format!("{API}/repos/"))?.to_string();
    Some(GithubItem {
        repo,
        number: b.number,
        title: b.title,
        url: b.html_url,
        updated_at: b.updated_at,
        is_pr: b.pull_request.is_some(),
        draft: b.draft.unwrap_or(false),
        author: b.user.map(|u| u.login).unwrap_or_default(),
    })
}

/// The queries don't overlap (one is `is:issue`, the other `is:pr`): just concatenate.
fn merge(a: GithubList, b: GithubList) -> GithubList {
    let mut items: Vec<GithubItem> = a.items.into_iter().chain(b.items).collect();
    // RFC 3339 in UTC sorts as text.
    items.sort_by(|x, y| y.updated_at.cmp(&x.updated_at));
    items.truncate(PER_PAGE);
    GithubList { total: a.total + b.total, items }
}

#[cfg(test)]
#[path = "github_tests.rs"]
mod tests;
