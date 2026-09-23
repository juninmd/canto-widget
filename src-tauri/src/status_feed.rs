//! RSS/Atom incident-history feeds from services the team depends on for development.
//! Read-only, no auth, no vault data: safe to fetch even while the vault is locked.
use std::sync::Arc;
use std::time::Duration;

use serde::Serialize;

const TIMEOUT_S: u64 = 10;
/// Bounds the payload sent to the webview; a feed's older history stays on its own status page.
const MAX_ITEMS: usize = 6;

pub struct Source {
    pub id: &'static str,
    pub label: &'static str,
    pub url: &'static str,
}

pub const SOURCES: &[Source] = &[
    Source { id: "claude", label: "Claude", url: "https://status.claude.com/history.rss" },
    Source { id: "github", label: "GitHub", url: "https://www.githubstatus.com/history.rss" },
    Source { id: "codex", label: "OpenAI / Codex", url: "https://status.openai.com/history.rss" },
    Source { id: "aws", label: "AWS", url: "https://status.aws.amazon.com/rss/health.rss" },
    Source { id: "gcp", label: "Google Cloud", url: "https://status.cloud.google.com/en/feed.atom" },
    Source { id: "magalu", label: "Magalu Cloud", url: "https://status.magalu.cloud/rss" },
    Source { id: "cloudflare", label: "Cloudflare", url: "https://www.cloudflarestatus.com/history.rss" },
    Source { id: "vercel", label: "Vercel", url: "https://www.vercel-status.com/history.rss" },
    Source { id: "npm", label: "npm", url: "https://status.npmjs.org/history.rss" },
    Source { id: "crates", label: "crates.io", url: "https://status.crates.io/history.rss" },
    Source { id: "pypi", label: "PyPI", url: "https://status.python.org/history.rss" },
    Source { id: "supabase", label: "Supabase", url: "https://status.supabase.com/history.rss" },
    Source { id: "digitalocean", label: "DigitalOcean", url: "https://status.digitalocean.com/history.rss" },
];

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct StatusItem {
    pub title: String,
    pub link: String,
    /// ms epoch; 0 when the entry carries no date.
    pub published_at: i64,
}

#[derive(Debug, Clone, Serialize)]
pub struct StatusResult {
    pub id: String,
    pub label: String,
    pub items: Vec<StatusItem>,
    /// Set when the fetch or parse failed; `items` is then empty rather than stale.
    pub error: Option<String>,
    /// Current state, for Statuspage-hosted services only.
    pub live: Option<crate::status_live::Live>,
}

fn parse(bytes: &[u8]) -> Result<Vec<StatusItem>, String> {
    let feed = feed_rs::parser::parse(bytes).map_err(|e| e.to_string())?;
    // Site24x7 (Magalu Cloud's provider) puts the link on the channel only, not on each item.
    let channel_link = feed.links.first().map(|l| l.href.clone()).unwrap_or_default();
    let mut items: Vec<StatusItem> = feed
        .entries
        .into_iter()
        .map(|e| StatusItem {
            title: e.title.map(|t| t.content).unwrap_or_default(),
            link: e.links.first().map(|l| l.href.clone()).unwrap_or_else(|| channel_link.clone()),
            published_at: e.published.or(e.updated).map(|d| d.timestamp_millis()).unwrap_or(0),
        })
        .collect();
    items.sort_by_key(|i| std::cmp::Reverse(i.published_at));
    items.truncate(MAX_ITEMS);
    Ok(items)
}

fn fetch_one(client: &reqwest::blocking::Client, source: &Source) -> StatusResult {
    let outcome = client
        .get(source.url)
        .send()
        .and_then(|r| r.error_for_status())
        .map_err(|e| e.to_string())
        .and_then(|r| r.bytes().map_err(|e| e.to_string()))
        .and_then(|b| parse(&b));
    let live = crate::status_live::fetch(client, source.url);
    match outcome {
        Ok(items) => StatusResult { id: source.id.into(), label: source.label.into(), items, error: None, live },
        Err(error) => StatusResult {
            id: source.id.into(),
            label: source.label.into(),
            items: Vec::new(),
            error: Some(error),
            live,
        },
    }
}

/// One thread per feed: a slow or dead status page must not delay the others.
pub fn fetch_all() -> Vec<StatusResult> {
    let client =
        crate::net::client_builder().user_agent("canto-widget").timeout(Duration::from_secs(TIMEOUT_S)).build();
    let client = match client {
        Ok(c) => Arc::new(c),
        Err(e) => {
            return SOURCES
                .iter()
                .map(|s| StatusResult {
                    id: s.id.into(),
                    label: s.label.into(),
                    items: Vec::new(),
                    error: Some(e.to_string()),
                    live: None,
                })
                .collect();
        }
    };
    std::thread::scope(|scope| {
        let handles: Vec<_> = SOURCES.iter().map(|source| scope.spawn(|| fetch_one(&client, source))).collect();
        handles
            .into_iter()
            .zip(SOURCES)
            .map(|(h, source)| {
                h.join().unwrap_or_else(|_| StatusResult {
                    id: source.id.into(),
                    label: source.label.into(),
                    items: Vec::new(),
                    error: Some("thread interrompida".into()),
                    live: None,
                })
            })
            .collect()
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    const RSS: &str = r#"<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>Example Status</title>
<item><title>Elevated errors</title><link>https://status.example.com/incidents/1</link><pubDate>Thu, 17 Sep 2026 10:00:00 +0000</pubDate></item>
<item><title>Degraded performance</title><link>https://status.example.com/incidents/2</link><pubDate>Wed, 16 Sep 2026 08:00:00 +0000</pubDate></item>
</channel></rss>"#;

    const ATOM: &str = r#"<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom"><title>Example Status</title>
<entry><title>Network issue</title><link href="https://status.example.com/incidents/3"/><updated>2026-09-18T12:00:00Z</updated></entry>
</feed>"#;

    // Site24x7 feeds (Magalu Cloud): the link lives on the channel, not on each item.
    const RSS_NO_ITEM_LINK: &str = r#"<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>Example Status</title><link>https://status.example.com</link>
<item><title>Block Storage - Operational</title><pubDate>Thu, 17 Sep 2026 02:00:00 -0300</pubDate></item>
</channel></rss>"#;

    #[test]
    fn rss_entries_come_out_newest_first_with_title_link_and_date() {
        let items = parse(RSS.as_bytes()).unwrap();
        assert_eq!(items.len(), 2);
        assert_eq!(items[0].title, "Elevated errors");
        assert_eq!(items[0].link, "https://status.example.com/incidents/1");
        assert!(items[0].published_at > items[1].published_at);
    }

    #[test]
    fn atom_entries_parse_too() {
        let items = parse(ATOM.as_bytes()).unwrap();
        assert_eq!(
            items,
            vec![StatusItem {
                title: "Network issue".into(),
                link: "https://status.example.com/incidents/3".into(),
                published_at: 1_789_732_800_000,
            }]
        );
    }

    #[test]
    fn an_item_with_no_link_of_its_own_falls_back_to_the_channel_link() {
        let items = parse(RSS_NO_ITEM_LINK.as_bytes()).unwrap();
        assert_eq!(items[0].link, "https://status.example.com/");
    }

    #[test]
    fn garbage_bytes_fail_instead_of_panicking() {
        assert!(parse(b"not xml at all").is_err());
    }

    #[test]
    fn more_than_max_items_gets_truncated() {
        let mut xml = String::from(r#"<?xml version="1.0"?><rss version="2.0"><channel><title>t</title>"#);
        for i in 0..10 {
            xml.push_str(&format!(
                "<item><title>{i}</title><link>https://e.com/{i}</link><pubDate>Thu, 17 Sep 2026 10:{i:02}:00 +0000</pubDate></item>"
            ));
        }
        xml.push_str("</channel></rss>");
        assert_eq!(parse(xml.as_bytes()).unwrap().len(), MAX_ITEMS);
    }
}

#[cfg(test)]
mod live {
    /// Hits the real endpoints; run with `cargo test -- --ignored` after touching a source URL or the parser.
    #[test]
    #[ignore = "needs network"]
    fn every_configured_source_parses() {
        // An empty feed is a valid outcome (no recent incidents); only a fetch/parse error fails the test.
        for r in super::fetch_all() {
            assert!(r.error.is_none(), "{}: {:?}", r.label, r.error);
        }
    }
}
