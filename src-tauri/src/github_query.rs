//! Search queries behind each GitHub tab section, with the user's filter applied.
use serde::Deserialize;

/// The search API stops at 1,000 results: 34 pages of 30.
pub const MAX_PAGE: u32 = 34;
const MAX_TEXT_CHARS: usize = 120;

#[derive(Debug, Clone, Copy, Default, PartialEq, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Kind {
    #[default]
    All,
    Pr,
    Issue,
}

#[derive(Debug, Clone, Default, Deserialize)]
pub struct GithubFilter {
    #[serde(default)]
    pub text: String,
    #[serde(default)]
    pub kind: Kind,
}

#[derive(Debug, Clone, Copy, PartialEq, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Section {
    ReviewRequested,
    Assigned,
    MyPrs,
    MyIssues,
}

impl Section {
    /// Qualifier for issues and for PRs; `None` where the section has no such items.
    fn qualifiers(self) -> (Option<&'static str>, Option<&'static str>) {
        match self {
            Section::ReviewRequested => (None, Some("review-requested:@me")),
            Section::Assigned => (Some("assignee:@me"), Some("assignee:@me")),
            Section::MyPrs => (None, Some("author:@me")),
            Section::MyIssues => (Some("author:@me"), None),
        }
    }
}

/// One query per item type, since the search requires an explicit `is:issue` or `is:pr`.
/// Free text may carry qualifiers such as `repo:` or `label:`; it only narrows the user's own search.
pub fn queries(section: Section, filter: &GithubFilter) -> Vec<String> {
    let (issue, pr) = section.qualifiers();
    let text = clean_text(&filter.text);
    let mut out = Vec::new();
    for (kind, qualifier, is) in [(Kind::Issue, issue, "issue"), (Kind::Pr, pr, "pr")] {
        let Some(q) = qualifier else { continue };
        if filter.kind == Kind::All || filter.kind == kind {
            let base = format!("is:open is:{is} archived:false {q}");
            out.push(if text.is_empty() { base } else { format!("{base} {text}") });
        }
    }
    out
}

pub fn page(p: u32) -> u32 {
    p.clamp(1, MAX_PAGE)
}

fn clean_text(text: &str) -> String {
    let flat: String = text.chars().map(|c| if c.is_control() { ' ' } else { c }).take(MAX_TEXT_CHARS).collect();
    flat.split_whitespace().collect::<Vec<_>>().join(" ")
}

#[cfg(test)]
mod tests {
    use super::*;

    const ALL: [Section; 4] = [Section::ReviewRequested, Section::Assigned, Section::MyPrs, Section::MyIssues];

    fn filter(text: &str, kind: Kind) -> GithubFilter {
        GithubFilter { text: text.into(), kind }
    }

    #[test]
    fn every_query_carries_an_explicit_type_and_only_open_items() {
        for s in ALL {
            for q in queries(s, &GithubFilter::default()) {
                assert!(q.contains("is:open") && q.contains("archived:false"), "{q}");
                assert!(q.contains("is:issue") ^ q.contains("is:pr"), "{q}");
            }
        }
    }

    #[test]
    fn assigned_searches_issues_and_prs_unless_the_filter_picks_one() {
        assert_eq!(queries(Section::Assigned, &GithubFilter::default()).len(), 2);
        assert_eq!(queries(Section::Assigned, &filter("", Kind::Pr)), vec!["is:open is:pr archived:false assignee:@me"]);
    }

    #[test]
    fn a_type_filter_skips_sections_that_cannot_match_without_a_request() {
        assert!(queries(Section::ReviewRequested, &filter("", Kind::Issue)).is_empty());
        assert!(queries(Section::MyIssues, &filter("", Kind::Pr)).is_empty());
    }

    #[test]
    fn free_text_is_appended_flattened_and_capped() {
        let q = queries(Section::MyPrs, &filter("  repo:acme/atlas\n\tcsv  ", Kind::All));
        assert_eq!(q, vec!["is:open is:pr archived:false author:@me repo:acme/atlas csv"]);
        let long = queries(Section::MyPrs, &filter(&"x".repeat(500), Kind::All)).remove(0);
        assert!(long.ends_with(&"x".repeat(MAX_TEXT_CHARS)) && !long.ends_with(&"x".repeat(MAX_TEXT_CHARS + 1)));
    }

    #[test]
    fn page_stays_inside_what_the_search_api_serves() {
        assert_eq!((page(0), page(3), page(99)), (1, 3, MAX_PAGE));
    }
}
