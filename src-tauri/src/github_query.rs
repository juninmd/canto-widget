//! Search queries behind each GitHub tab section, with the user's filter applied.
use crate::forge_filter::{ForgeFilter, Kind, Section};

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

/// PRs opened since `since` (RFC 3339) in any state: the day summary counts what was opened, even if merged since.
pub fn opened_since(since: &str) -> String {
    format!("is:pr author:@me created:>={since}")
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
        let q = opened_since("2026-09-18T03:00:00+00:00");
        assert!(!q.contains("is:open") && q.contains("created:>=2026-09-18T03:00:00+00:00"), "{q}");
    }
}
