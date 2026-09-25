//! Issue and PR/MR lists as the UI shows them, whichever forge they came from.
use serde::Serialize;

use crate::error::Result;
use crate::forge_cache::{ForgeCache, Quota};
use crate::forge_filter::{cache_key, Activity, ForgeFilter, Order, Section, Sort};
use crate::model::now_ms;

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct ForgeItem {
    pub repo: String,
    pub number: u64,
    /// How the forge writes it: `owner/repo#12` on GitHub, `group/project!12` for a GitLab MR.
    pub reference: String,
    pub title: String,
    pub url: String,
    pub created_at: String,
    pub updated_at: String,
    pub comments: u64,
    pub is_pr: bool,
    pub draft: bool,
    pub author: String,
}

#[derive(Debug, Clone, Default, Serialize, PartialEq)]
pub struct ForgeList {
    /// Total on the forge; `items` only carries the requested page.
    pub total: u64,
    pub items: Vec<ForgeItem>,
    /// When this page left the forge (ms); older than now when it came from the cache.
    pub fetched_at: i64,
    /// Set when the rate limit forced a cached copy: fresh data only after this instant (ms).
    pub limited_until: Option<i64>,
}

/// Combined CI/pipeline status of a PR/MR's head commit, fetched on demand (one click, not per list row).
#[derive(Debug, Clone, Copy, PartialEq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum ChecksStatus {
    Success,
    Failure,
    Running,
    /// No checks configured, or the forge reported a state this app doesn't track (cancelled, skipped, ...).
    None,
}

/// `owner/repo` (or `group/sub/project` on GitLab) coming from the webview: only safe path segments, so a
/// crafted value can't steer the authenticated request to another endpoint (`..`, `?`, `#`, `%`).
pub fn valid_repo_path(path: &str, max_segments: usize) -> bool {
    let segments: Vec<&str> = path.split('/').collect();
    (2..=max_segments).contains(&segments.len())
        && segments.iter().all(|s| {
            !s.is_empty()
                && *s != "."
                && *s != ".."
                && s.chars().all(|c| c.is_ascii_alphanumeric() || matches!(c, '-' | '_' | '.'))
        })
}

pub fn checks_from_github(state: &str) -> ChecksStatus {
    match state {
        "success" => ChecksStatus::Success,
        "failure" | "error" => ChecksStatus::Failure,
        "pending" => ChecksStatus::Running,
        _ => ChecksStatus::None,
    }
}

pub fn checks_from_gitlab(status: Option<&str>) -> ChecksStatus {
    match status {
        Some("success") => ChecksStatus::Success,
        Some("failed") => ChecksStatus::Failure,
        Some("running" | "pending" | "created" | "waiting_for_resource" | "scheduled") => ChecksStatus::Running,
        _ => ChecksStatus::None,
    }
}

#[derive(Debug, Default, Serialize)]
pub struct ForgeLists {
    pub assigned: ForgeList,
    pub my_prs: ForgeList,
    pub review_requested: ForgeList,
    pub my_issues: ForgeList,
}

impl ForgeLists {
    pub fn collect(mut section: impl FnMut(Section) -> Result<ForgeList>) -> Result<ForgeLists> {
        Ok(ForgeLists {
            assigned: section(Section::Assigned)?,
            my_prs: section(Section::MyPrs)?,
            review_requested: section(Section::ReviewRequested)?,
            my_issues: section(Section::MyIssues)?,
        })
    }
}

/// One forge (GitHub, GitLab, ...) behind the cache-backed "list a section" orchestration every
/// tab and the day summary share. `Credential` is the one place that differs by shape (a bearer
/// token vs base URL + token + username) — getting one, and deciding whether the account is even
/// connected, stays with each command module, since that step needs different context per forge
/// (GitHub's OAuth refresh needs its own extra state; GitLab's doesn't). Everything downstream of
/// "I already have a credential" is identical and lives here, so it's testable without a Tauri
/// app: a fake `Forge` impl over cache + credential is enough.
pub trait Forge {
    /// Quota bucket and cache-key prefix; a disconnect only drops this forge's own entries.
    const NAME: &'static str;
    type Credential;

    fn fetch_section(
        cred: &Self::Credential,
        section: Section,
        page: u32,
        f: &ForgeFilter,
    ) -> Result<(ForgeList, Option<Quota>)>;
    fn fetch_activity(cred: &Self::Credential, activity: Activity, since: &str) -> Result<(ForgeList, Option<Quota>)>;
}

/// The four sections of a tab, each served from the cache unless `force`.
pub fn list_all<F: Forge>(
    cache: &ForgeCache,
    cred: &F::Credential,
    filter: &ForgeFilter,
    force: bool,
) -> Result<ForgeLists> {
    ForgeLists::collect(|s| list_page::<F>(cache, cred, s, 1, filter, force))
}

/// A single page of a single section (a tab's own request, or "mostrar mais").
pub fn list_page<F: Forge>(
    cache: &ForgeCache,
    cred: &F::Credential,
    section: Section,
    page: u32,
    filter: &ForgeFilter,
    force: bool,
) -> Result<ForgeList> {
    cache.get(F::NAME, &cache_key(section, page, filter), force, now_ms(), || {
        F::fetch_section(cred, section, page, filter)
    })
}

/// Background aggregation for the day summary.
pub fn activity_since<F: Forge>(
    cache: &ForgeCache,
    cred: &F::Credential,
    activity: Activity,
    since: &str,
) -> Result<ForgeList> {
    cache.get(F::NAME, &format!("{activity:?}|{since}"), false, now_ms(), || F::fetch_activity(cred, activity, since))
}

/// Background aggregation for the tray badge.
pub fn review_requested<F: Forge>(cache: &ForgeCache, cred: &F::Credential) -> Result<u64> {
    Ok(list_page::<F>(cache, cred, Section::ReviewRequested, 1, &ForgeFilter::default(), false)?.total)
}

/// A section's queries don't overlap (issues vs PRs): concatenate, then order the way the forge did.
/// No cap: dropping the tail of a page would make "show more" skip those items for good.
pub fn merge(a: ForgeList, b: ForgeList, filter: &ForgeFilter) -> ForgeList {
    let mut items: Vec<ForgeItem> = a.items.into_iter().chain(b.items).collect();
    items.sort_by(|x, y| {
        // RFC 3339 in UTC sorts as text.
        let o = match filter.sort {
            Sort::Updated => x.updated_at.cmp(&y.updated_at),
            Sort::Created => x.created_at.cmp(&y.created_at),
            Sort::Comments => x.comments.cmp(&y.comments),
        };
        if filter.order == Order::Desc {
            o.reverse()
        } else {
            o
        }
    });
    ForgeList { total: a.total + b.total, items, ..Default::default() }
}

#[cfg(test)]
pub(crate) fn item(number: u64, created: &str, updated: &str, comments: u64) -> ForgeItem {
    ForgeItem {
        repo: "o/r".into(),
        number,
        reference: format!("o/r#{number}"),
        title: format!("item {number}"),
        url: format!("https://github.com/o/r/issues/{number}"),
        created_at: created.into(),
        updated_at: updated.into(),
        comments,
        is_pr: false,
        draft: false,
        author: "octocat".into(),
    }
}

#[cfg(test)]
#[path = "forge_tests.rs"]
mod tests;
