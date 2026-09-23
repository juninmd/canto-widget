//! Current state from Statuspage's `/api/v2/status.json`: the RSS history only says what happened, not
//! whether it is still happening. Best effort; the UI falls back to "incident in the last 24 h".
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct Live {
    /// Statuspage's `none`, `minor`, `major`, `critical` or `maintenance`.
    pub indicator: String,
    pub description: String,
}

#[derive(Deserialize)]
struct Body {
    status: Status,
}

#[derive(Deserialize)]
struct Status {
    indicator: String,
    #[serde(default)]
    description: String,
}

const INDICATORS: [&str; 5] = ["none", "minor", "major", "critical", "maintenance"];

/// Statuspage publishes the incident history at `/history.rss`; other providers have no such endpoint.
pub fn url_for(feed_url: &str) -> Option<String> {
    feed_url.strip_suffix("/history.rss").map(|base| format!("{base}/api/v2/status.json"))
}

pub fn parse(bytes: &[u8]) -> Option<Live> {
    let body: Body = serde_json::from_slice(bytes).ok()?;
    let description: String = body.status.description.chars().take(120).collect();
    INDICATORS
        .contains(&body.status.indicator.as_str())
        .then_some(Live { indicator: body.status.indicator, description })
}

pub fn fetch(client: &reqwest::blocking::Client, feed_url: &str) -> Option<Live> {
    let res = client.get(url_for(feed_url)?).send().ok()?.error_for_status().ok()?;
    parse(&res.bytes().ok()?)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn only_statuspage_feeds_have_a_live_endpoint() {
        assert_eq!(
            url_for("https://www.githubstatus.com/history.rss").as_deref(),
            Some("https://www.githubstatus.com/api/v2/status.json")
        );
        assert_eq!(url_for("https://status.cloud.google.com/en/feed.atom"), None);
    }

    #[test]
    fn parses_the_indicator_and_rejects_unknown_ones() {
        let ok = br#"{"page":{"id":"x"},"status":{"indicator":"major","description":"Partial System Outage"}}"#;
        assert_eq!(parse(ok), Some(Live { indicator: "major".into(), description: "Partial System Outage".into() }));
        assert_eq!(parse(br#"{"status":{"indicator":"<script>"}}"#), None);
        assert_eq!(parse(b"<html>not json</html>"), None);
    }
}
