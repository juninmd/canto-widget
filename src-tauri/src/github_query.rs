//! Search queries behind each GitHub tab section, with the user's filter applied.
use crate::forge_filter::{Activity, ForgeFilter, Kind, Section};

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

/// The day summary's PRs since `since` (RFC 3339), in any state: opened counts even if merged since.
/// Search can't filter by review date or verdict, so "reviewed" is any PR of others I reviewed that moved today.
pub fn activity_since(activity: Activity, since: &str) -> String {
    match activity {
        Activity::Opened => format!("is:pr author:@me created:>={since}"),
        Activity::Merged => format!("is:pr author:@me merged:>={since}"),
        Activity::Reviewed => format!("is:pr reviewed-by:@me -author:@me updated:>={since}"),
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
        let q = activity_since(Activity::Opened, "2026-09-18T03:00:00+00:00");
        assert!(!q.contains("is:open") && q.contains("created:>=2026-09-18T03:00:00+00:00"), "{q}");
    }

    #[test]
    fn merged_and_reviewed_today_look_at_the_merge_and_at_others_prs() {
        let since = "2026-09-18T03:00:00+00:00";
        assert_eq!(activity_since(Activity::Merged, since), format!("is:pr author:@me merged:>={since}"));
        let q = activity_since(Activity::Reviewed, since);
        assert!(q.contains("reviewed-by:@me") && q.contains("-author:@me") && !q.contains("is:open"), "{q}");
    }
}
