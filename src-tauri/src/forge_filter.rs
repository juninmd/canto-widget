//! What the user asked for in a forge tab: section, type, free text and order. Shared by GitHub and GitLab.
use serde::Deserialize;

/// GitHub's search stops at 1,000 results (34 pages of 30); GitLab gets the same ceiling so both tabs behave alike.
pub const MAX_PAGE: u32 = 34;
pub const PER_PAGE: usize = 30;
const MAX_TEXT_CHARS: usize = 120;

#[derive(Debug, Clone, Copy, Default, PartialEq, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Kind {
    #[default]
    All,
    Pr,
    Issue,
}

#[derive(Debug, Clone, Copy, Default, PartialEq, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Sort {
    #[default]
    Updated,
    Created,
    Comments,
}

#[derive(Debug, Clone, Copy, Default, PartialEq, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Order {
    #[default]
    Desc,
    Asc,
}

#[derive(Debug, Clone, Copy, PartialEq, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Section {
    ReviewRequested,
    Assigned,
    MyPrs,
    MyIssues,
}

pub const SECTIONS: [Section; 4] = [Section::ReviewRequested, Section::Assigned, Section::MyPrs, Section::MyIssues];

#[derive(Debug, Clone, Default, Deserialize)]
pub struct ForgeFilter {
    #[serde(default)]
    pub text: String,
    #[serde(default)]
    pub kind: Kind,
    #[serde(default)]
    pub sort: Sort,
    #[serde(default)]
    pub order: Order,
}

impl ForgeFilter {
    /// Control characters flattened, whitespace collapsed, capped: safe to append to a query.
    pub fn text(&self) -> String {
        let flat: String =
            self.text.chars().map(|c| if c.is_control() { ' ' } else { c }).take(MAX_TEXT_CHARS).collect();
        flat.split_whitespace().collect::<Vec<_>>().join(" ")
    }

    pub fn wants(&self, kind: Kind) -> bool {
        self.kind == Kind::All || self.kind == kind
    }

    /// Cache key: filters that search the same thing share an entry.
    pub fn key(&self) -> String {
        format!("{:?}|{:?}|{:?}|{}", self.kind, self.sort, self.order, self.text())
    }
}

impl Sort {
    pub fn as_str(self) -> &'static str {
        match self {
            Sort::Updated => "updated",
            Sort::Created => "created",
            Sort::Comments => "comments",
        }
    }
}

impl Order {
    pub fn as_str(self) -> &'static str {
        match self {
            Order::Desc => "desc",
            Order::Asc => "asc",
        }
    }
}

/// Section, page and filter: everything that changes what a forge returns for the same account.
pub fn cache_key(section: Section, p: u32, f: &ForgeFilter) -> String {
    format!("{section:?}|{}|{}", page(p), f.key())
}

pub fn page(p: u32) -> u32 {
    p.clamp(1, MAX_PAGE)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn filter(text: &str) -> ForgeFilter {
        ForgeFilter { text: text.into(), ..Default::default() }
    }

    #[test]
    fn text_is_flattened_collapsed_and_capped() {
        assert_eq!(filter("  repo:acme/atlas\n\tcsv  ").text(), "repo:acme/atlas csv");
        assert_eq!(filter(&"á".repeat(500)).text().chars().count(), MAX_TEXT_CHARS);
    }

    #[test]
    fn equivalent_filters_share_a_cache_key_and_a_new_order_does_not() {
        assert_eq!(filter(" bug ").key(), filter("bug").key());
        let asc = ForgeFilter { order: Order::Asc, ..filter("bug") };
        assert_ne!(asc.key(), filter("bug").key());
    }

    #[test]
    fn an_older_ui_without_sort_fields_still_deserializes() {
        let f: ForgeFilter = serde_json::from_str(r#"{"text":"x","kind":"pr"}"#).unwrap();
        assert_eq!((f.kind, f.sort, f.order), (Kind::Pr, Sort::Updated, Order::Desc));
    }

    #[test]
    fn page_stays_inside_what_the_search_api_serves() {
        assert_eq!((page(0), page(3), page(99)), (1, 3, MAX_PAGE));
    }
}
