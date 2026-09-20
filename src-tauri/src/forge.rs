//! Issue and PR/MR lists as the UI shows them, whichever forge they came from.
use serde::Serialize;

use crate::error::Result;
use crate::forge_filter::{ForgeFilter, Order, Section, Sort};

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
mod tests {
    use super::*;

    fn list(total: u64, items: Vec<ForgeItem>) -> ForgeList {
        ForgeList { total, items, ..Default::default() }
    }

    fn numbers(l: &ForgeList) -> Vec<u64> {
        l.items.iter().map(|i| i.number).collect()
    }

    fn pages() -> (ForgeList, ForgeList) {
        let a = list(5, vec![item(1, "2026-09-01T00:00:00Z", "2026-09-09T00:00:00Z", 9)]);
        let b = list(4, vec![item(2, "2026-09-03T00:00:00Z", "2026-09-05T00:00:00Z", 1)]);
        (a, b)
    }

    #[test]
    fn merged_pages_follow_the_order_the_user_picked() {
        let by = |sort, order| {
            let (a, b) = pages();
            numbers(&merge(a, b, &ForgeFilter { sort, order, ..Default::default() }))
        };
        assert_eq!(by(Sort::Updated, Order::Desc), vec![1, 2]);
        assert_eq!(by(Sort::Created, Order::Desc), vec![2, 1]);
        assert_eq!(by(Sort::Created, Order::Asc), vec![1, 2]);
        assert_eq!(by(Sort::Comments, Order::Asc), vec![2, 1]);
    }

    #[test]
    fn merge_adds_totals_and_keeps_every_item() {
        let (a, b) = pages();
        let merged = merge(a, b, &ForgeFilter::default());
        assert_eq!((merged.total, merged.items.len()), (9, 2));
    }
}
