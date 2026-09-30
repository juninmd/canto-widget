//! Search queries behind each GitHub tab section, with the user's filter applied.
use crate::forge_filter::{Activity, ForgeFilter, Kind, Section, Window};

/// Qualifier for issues and for PRs; `None` where the section has no such items.
fn qualifiers(section: Section) -> (Option<&'static str>, Option<&'static str>) {
    match section {
        Section::ReviewRequested => (None, Some("review-requested:@me")),
        Section::Assigned => (Some("assignee:@me"), Some("assignee:@me")),
        Section::MyPrs => (None, Some("author:@me")),
        Section::MyIssues => (Some("author:@me"), None),
    }
}

/// One query per item type, since the search requires an explicit `is:issue` or `is:pr`.
/// Free text may carry qualifiers such as `repo:` or `label:`; it only narrows the user's own search.
pub fn queries(section: Section, filter: &ForgeFilter) -> Vec<String> {
    let (issue, pr) = qualifiers(section);
    let text = filter.text();
    let mut out = Vec::new();
    for (kind, qualifier, is) in [(Kind::Issue, issue, "issue"), (Kind::Pr, pr, "pr")] {
        let Some(q) = qualifier else { continue };
        if filter.wants(kind) {
            let base = format!("is:open is:{is} archived:false {q}");
            out.push(if text.is_empty() { base } else { format!("{base} {text}") });
        }
    }
    out
}

/// The summary's PRs inside `w`, in any state: opened counts even if merged since.
/// Search can't filter by review date or verdict, so "reviewed" is any PR of others I reviewed that moved in `w`.
pub fn activity_since(activity: Activity, w: &Window) -> String {
    let range = match &w.until {
        Some(until) => format!("{}..{until}", w.since),
        None => format!(">={}", w.since),
    };
    match activity {
        Activity::Opened => format!("is:pr author:@me created:{range}"),
        Activity::Merged => format!("is:pr author:@me merged:{range}"),
        Activity::Reviewed => format!("is:pr reviewed-by:@me -author:@me updated:{range}"),
        Activity::Closed => format!("is:pr author:@me is:closed is:unmerged closed:{range}"),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::forge_filter::SECTIONS;

    fn filter(text: &str, kind: Kind) -> ForgeFilter {
        ForgeFilter { text: text.into(), kind, ..Default::default() }
    }

    #[test]
    fn every_query_carries_an_explicit_type_and_only_open_items() {
        for s in SECTIONS {
            for q in queries(s, &ForgeFilter::default()) {
                assert!(q.contains("is:open") && q.contains("archived:false"), "{q}");
                assert!(q.contains("is:issue") ^ q.contains("is:pr"), "{q}");
            }
        }
    }

    #[test]
    fn assigned_searches_issues_and_prs_unless_the_filter_picks_one() {
        assert_eq!(queries(Section::Assigned, &ForgeFilter::default()).len(), 2);
        assert_eq!(
            queries(Section::Assigned, &filter("", Kind::Pr)),
            vec!["is:open is:pr archived:false assignee:@me"]
        );
    }

    #[test]
    fn a_type_filter_skips_sections_that_cannot_match_without_a_request() {
        assert!(queries(Section::ReviewRequested, &filter("", Kind::Issue)).is_empty());
        assert!(queries(Section::MyIssues, &filter("", Kind::Pr)).is_empty());
    }

    #[test]
    fn free_text_is_appended_flattened() {
        let q = queries(Section::MyPrs, &filter("  repo:acme/atlas\n\tcsv  ", Kind::All));
        assert_eq!(q, vec!["is:open is:pr archived:false author:@me repo:acme/atlas csv"]);
    }

    #[test]
    fn opened_today_includes_merged_and_closed_prs() {
        let q = activity_since(Activity::Opened, &Window::since("2026-09-18T03:00:00+00:00"));
        assert!(!q.contains("is:open") && q.contains("created:>=2026-09-18T03:00:00+00:00"), "{q}");
    }

    #[test]
    fn merged_and_reviewed_today_look_at_the_merge_and_at_others_prs() {
        let since = "2026-09-18T03:00:00+00:00";
        let w = Window::since(since);
        assert_eq!(activity_since(Activity::Merged, &w), format!("is:pr author:@me merged:>={since}"));
        let q = activity_since(Activity::Reviewed, &w);
        assert!(q.contains("reviewed-by:@me") && q.contains("-author:@me") && !q.contains("is:open"), "{q}");
    }

    #[test]
    fn closed_looks_at_my_prs_closed_without_a_merge() {
        let q = activity_since(Activity::Closed, &Window::since("2026-09-18T03:00:00+00:00"));
        assert_eq!(q, "is:pr author:@me is:closed is:unmerged closed:>=2026-09-18T03:00:00+00:00");
    }

    #[test]
    fn a_period_searches_a_closed_range_on_the_same_date_each_activity_uses() {
        let w = Window { since: "2026-09-01T03:00:00+00:00".into(), until: Some("2026-09-28T03:00:00+00:00".into()) };
        let range = "2026-09-01T03:00:00+00:00..2026-09-28T03:00:00+00:00";
        assert_eq!(activity_since(Activity::Opened, &w), format!("is:pr author:@me created:{range}"));
        assert_eq!(activity_since(Activity::Merged, &w), format!("is:pr author:@me merged:{range}"));
        assert_eq!(
            activity_since(Activity::Reviewed, &w),
            format!("is:pr reviewed-by:@me -author:@me updated:{range}")
        );
    }
}
