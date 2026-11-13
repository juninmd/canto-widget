//! The repositories subtab of the GitHub and GitLab tabs: what the user can reach, grouped by owner, and the
//! contribution calendar behind the optional statistics.
pub mod cache;
pub mod cmd;
pub mod github;
pub mod gitlab;

use serde::Serialize;

/// One repository or project. `group` is the organization / group path, empty for the user's own (the "root").
#[derive(Debug, Clone, Serialize, PartialEq, Default)]
pub struct Repo {
    pub name: String,
    pub full_name: String,
    pub group: String,
    pub description: String,
    pub url: String,
    pub private: bool,
    pub fork: bool,
    pub archived: bool,
    pub stars: u64,
    pub forks: u64,
    pub language: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, PartialEq, Default)]
pub struct RepoList {
    pub repos: Vec<Repo>,
    /// More repositories exist than the pages fetched.
    pub truncated: bool,
    /// When the list left the forge (ms); older than now when it came from the cache.
    pub fetched_at: i64,
    /// Set when the rate limit forced a cached copy: fresh data only after this instant (ms).
    pub limited_until: Option<i64>,
}

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct Day {
    /// `YYYY-MM-DD`.
    pub date: String,
    pub count: u32,
}

#[derive(Debug, Clone, Serialize, PartialEq, Default)]
pub struct Contributions {
    pub days: Vec<Day>,
    pub total: u64,
    pub fetched_at: i64,
    pub limited_until: Option<i64>,
}

/// Repositories per request and requests per list: 500 repositories are far more than a widget can browse.
pub const PER_PAGE: u32 = 100;
pub const MAX_PAGES: u32 = 5;

/// Only http(s) links reach the webview, which opens them in the browser.
pub fn safe_url(url: &str, prefix: &str) -> bool {
    url.starts_with(prefix)
}

/// Groups first by name, the root (empty group) leading is left to the UI; inside a group, latest activity first.
pub fn sort_repos(repos: &mut [Repo]) {
    repos.sort_by(|a, b| b.updated_at.cmp(&a.updated_at).then_with(|| a.full_name.cmp(&b.full_name)));
}

/// Per-day counts from timestamps (`2026-11-02T10:00:00Z`), oldest day first; unparseable stamps are dropped.
pub fn count_days<'a>(stamps: impl Iterator<Item = &'a str>) -> Vec<Day> {
    let mut by_day = std::collections::BTreeMap::<String, u32>::new();
    for s in stamps {
        let Some(day) = s.get(..10).filter(|d| is_date(d)) else { continue };
        *by_day.entry(day.to_string()).or_default() += 1;
    }
    by_day.into_iter().map(|(date, count)| Day { date, count }).collect()
}

fn is_date(s: &str) -> bool {
    let b = s.as_bytes();
    b.len() == 10 && b.iter().enumerate().all(|(i, c)| if i == 4 || i == 7 { *c == b'-' } else { c.is_ascii_digit() })
}

#[cfg(test)]
#[path = "tests.rs"]
mod tests;
