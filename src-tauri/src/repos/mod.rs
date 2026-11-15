//! The repositories subtab of the GitHub and GitLab tabs: what the user can reach (paged, ETag-validated, kept sealed
//! on disk), group and repository icons, READMEs on demand and the contribution calendar behind the statistics.
pub mod avatars;
pub mod cache;
pub mod cmd;
pub mod github;
pub mod gitlab;
pub mod persist;

use serde::{Deserialize, Serialize};

/// One repository or project. `group` is the organization / group path, empty for the user's own (the "root").
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
pub struct Repo {
    /// GitLab's numeric project id (the README and other calls need it); empty on GitHub, where `full_name` is the key.
    #[serde(default)]
    pub id: String,
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
    #[serde(default)]
    pub open_issues: u64,
    pub language: String,
    pub updated_at: String,
    #[serde(default)]
    pub topics: Vec<String>,
    /// The repository's own icon (GitLab project avatar) or, lacking one, its owner's.
    #[serde(default)]
    pub avatar_url: String,
    /// The organization / group icon: what the tree shows beside the group.
    #[serde(default)]
    pub group_avatar_url: String,
    #[serde(default)]
    pub default_branch: String,
}

/// One page of the list: the UI asks for page 1, 2, 3... and shows what it has while the rest arrives.
#[derive(Debug, Clone, Serialize, PartialEq, Default)]
pub struct RepoPage {
    pub page: u32,
    pub repos: Vec<Repo>,
    /// More pages exist after this one.
    pub has_next: bool,
    /// When the page left the forge (ms); older than now when it came from the cache.
    pub fetched_at: i64,
    /// Set when the rate limit forced a cached copy: fresh data only after this instant (ms).
    pub limited_until: Option<i64>,
    /// The forge confirmed (304) that the cached copy is still current.
    pub revalidated: bool,
}

/// A repository's README, read on demand. `text` is empty when the repository has none.
#[derive(Debug, Clone, Serialize, PartialEq, Default)]
pub struct Readme {
    pub text: String,
    pub truncated: bool,
    pub fetched_at: i64,
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

/// Repositories per request and the most pages one list reaches (10,000 repositories): the UI loads them one page
/// at a time, so a long list never blocks the first screen.
pub const PER_PAGE: u32 = 100;
pub const MAX_PAGES: u32 = 100;
/// A README is read in full up to this many bytes; the rest is cut (the UI says so).
pub const README_MAX_BYTES: u64 = 96 * 1024;

/// `rel="next"` in a GitHub `Link` header.
pub fn has_next_link(link: &str) -> bool {
    link.split(',').any(|part| part.contains("rel=\"next\""))
}

/// `owner/name` as GitHub spells it: nothing that could change the path of the request.
pub fn valid_full_name(full_name: &str) -> bool {
    let ok = |s: &str| {
        !s.is_empty()
            && s.len() <= 100
            && s != "."
            && s != ".."
            && s.bytes().all(|c| c.is_ascii_alphanumeric() || matches!(c, b'-' | b'_' | b'.'))
    };
    full_name.split_once('/').is_some_and(|(o, n)| ok(o) && ok(n))
}

/// Text cut at a character boundary below `max` bytes; the bool says something was cut.
pub fn cap_text(bytes: &[u8], max: usize) -> (String, bool) {
    let cut = bytes.len() > max;
    let mut text = String::from_utf8_lossy(&bytes[..bytes.len().min(max)]).into_owned();
    if cut {
        // A character split by the cut shows as U+FFFD at the very end.
        while text.ends_with('\u{FFFD}') {
            text.pop();
        }
    }
    (text, cut)
}

/// Only http(s) links reach the webview, which opens them in the browser.
pub fn safe_url(url: &str, prefix: &str) -> bool {
    url.starts_with(prefix)
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
