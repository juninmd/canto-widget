//! Latest GitHub release of each known harness: the changelog the "Agentes" tab shows. Public data, no auth,
//! no vault access, so it works while the vault is locked. Callers go through `harness_cache`'s floor.
use std::sync::Arc;
use std::time::Duration;

use serde::{Deserialize, Serialize};

use crate::harness::{Harness, HARNESSES};

const TIMEOUT_S: u64 = 20;
/// The card shows a summary; the whole body stays on GitHub, one click away.
const MAX_NOTES: usize = 1500;

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct Release {
    pub tag: String,
    pub name: String,
    /// ISO-8601 as GitHub sends it; the UI formats it in the user's locale and timezone.
    pub published_at: String,
    pub url: String,
    pub notes: String,
}

#[derive(Debug, Clone, PartialEq)]
pub struct FeedEntry {
    /// None when the repository has no release published yet.
    pub release: Option<Release>,
    /// pt-BR text when this harness alone failed; the rest of the list keeps showing.
    pub error: Option<String>,
}

#[derive(Deserialize)]
struct Raw {
    #[serde(default)]
    tag_name: String,
    #[serde(default)]
    name: String,
    #[serde(default)]
    published_at: Option<String>,
    #[serde(default)]
    html_url: String,
    #[serde(default)]
    body: Option<String>,
}

/// A release with no tag, or whose link is not on github.com, is unusable: the row would have nothing to show.
pub fn parse(bytes: &[u8]) -> Option<Release> {
    let raw: Raw = serde_json::from_slice(bytes).ok()?;
    let (tag, url) = (raw.tag_name.trim(), raw.html_url.trim());
    if tag.is_empty() || !url.starts_with("https://github.com/") {
        return None;
    }
    Some(Release {
        tag: tag.to_string(),
        name: raw.name.trim().to_string(),
        published_at: raw.published_at.unwrap_or_default(),
        url: url.to_string(),
        notes: raw.body.unwrap_or_default().chars().take(MAX_NOTES).collect(),
    })
}

fn fetch_one(client: &reqwest::blocking::Client, harness: &Harness) -> FeedEntry {
    let url = format!("https://api.github.com/repos/{}/releases/latest", harness.repo);
    let res = match client.get(url).send() {
        Ok(res) => res,
        Err(_) => return FeedEntry { release: None, error: Some("sem resposta do GitHub".into()) },
    };
    match res.status().as_u16() {
        // A repository that never published a release is not a failure: the row just has no changelog.
        404 => FeedEntry { release: None, error: None },
        403 | 429 => FeedEntry { release: None, error: Some("limite de buscas do GitHub atingido".into()) },
        s if !(200..300).contains(&s) => FeedEntry { release: None, error: Some(format!("o GitHub respondeu {s}")) },
        _ => match res.bytes().ok().and_then(|b| parse(&b)) {
            Some(release) => FeedEntry { release: Some(release), error: None },
            None => FeedEntry { release: None, error: Some("a release veio em formato inesperado".into()) },
        },
    }
}

/// One thread per harness: a slow repository must not delay the others.
pub fn fetch_all() -> Vec<FeedEntry> {
    let client =
        crate::net::client_builder().user_agent("canto-widget").timeout(Duration::from_secs(TIMEOUT_S)).build();
    let Ok(client) = client else {
        let error = Some("sem resposta do GitHub".to_string());
        return HARNESSES.iter().map(|_| FeedEntry { release: None, error: error.clone() }).collect();
    };
    let client = Arc::new(client);
    std::thread::scope(|scope| {
        let handles: Vec<_> = HARNESSES.iter().map(|h| scope.spawn(|| fetch_one(&client, h))).collect();
        handles
            .into_iter()
            .map(|h| h.join().unwrap_or(FeedEntry { release: None, error: Some("consulta interrompida".into()) }))
            .collect()
    })
}

#[cfg(test)]
#[path = "harness_feed_tests.rs"]
mod tests;
