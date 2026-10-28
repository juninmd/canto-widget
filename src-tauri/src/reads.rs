//! RSS/Atom reader: fetching the feeds the user added and turning each entry into a card. Public data, no vault.
//! Thumbnails and favicons leave here as `data:` URLs, so the webview never talks to a remote origin.
use std::time::Duration;

use feed_rs::model::Entry;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

use crate::plain_text::plain_text;

const TIMEOUT_S: u64 = 15;
/// A feed is text; anything past this is not one.
const MAX_FEED_BYTES: usize = 4 * 1024 * 1024;
pub const MAX_FEEDS: usize = 20;
pub const MAX_ITEMS: usize = 60;
pub const MAX_TITLE: usize = 160;
pub const MAX_SUMMARY: usize = 240;
/// Read marks kept on disk: enough for months of reading and bounded forever.
pub const MAX_READ: usize = 500;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Article {
    pub id: String,
    pub title: String,
    /// http(s) only: the UI opens it in the browser.
    pub url: String,
    /// The host, so the UI asks for the favicon by host and never by URL.
    pub host: String,
    pub source: String,
    /// ms epoch; 0 when the entry carries no date.
    pub published_at: i64,
    pub summary: String,
    pub unread: bool,
    /// A thumbnail was found; its bytes only come out of `reads_thumb`, by id.
    pub has_image: bool,
    #[serde(skip)]
    pub image: Option<String>,
}

/// Short, stable and not reversible into the address it came from.
pub fn article_id(url: &str) -> String {
    let digest = Sha256::digest(url.as_bytes());
    digest.iter().take(8).map(|b| format!("{b:02x}")).collect()
}

/// `https://host/...` or `http://host/...`, with a host worth showing.
pub fn host_of(url: &str) -> Option<String> {
    let parsed = reqwest::Url::parse(url.trim()).ok()?;
    if !matches!(parsed.scheme(), "http" | "https") {
        return None;
    }
    let host = parsed.host_str()?.trim_end_matches('.').to_ascii_lowercase();
    (!host.is_empty() && host.len() <= 253).then_some(host)
}

fn ipv4(host: &str) -> Option<[u8; 4]> {
    let mut parts = [0u8; 4];
    let mut seen = 0;
    for part in host.split('.') {
        if seen == 4 || part.is_empty() || part.len() > 3 || !part.bytes().all(|b| b.is_ascii_digit()) {
            return None;
        }
        parts[seen] = part.parse().ok()?;
        seen += 1;
    }
    (seen == 4).then_some(parts)
}

/// Loopback, private, link-local, CGNAT and the documentation ranges: nothing a feed image should reach.
fn private_v4(ip: [u8; 4]) -> bool {
    match ip {
        [0, ..] | [10, ..] | [127, ..] => true,
        [100, b, ..] if (64..128).contains(&b) => true,
        [169, 254, ..] => true,
        [172, b, ..] if (16..32).contains(&b) => true,
        [192, 168, ..] | [192, 0, ..] | [198, 51, 100, ..] | [203, 0, 113, ..] => true,
        _ => false,
    }
}

/// A name that resolves inside the machine or the local network.
pub fn is_public_host(host: &str) -> bool {
    let host = host.trim_end_matches('.').to_ascii_lowercase();
    let shaped = !host.is_empty()
        && host.len() <= 253
        && host.chars().all(|c| c.is_ascii_alphanumeric() || c == '.' || c == '-')
        && !host.starts_with(['.', '-'])
        && !host.ends_with('-')
        && !host.contains("..")
        && !host.contains(".-")
        && !host.contains("-.");
    if !shaped || host == "localhost" {
        return false;
    }
    if [".localhost", ".local", ".internal", ".home", ".lan"].iter().any(|suffix| host.ends_with(suffix)) {
        return false;
    }
    ipv4(&host).is_none_or(|ip| !private_v4(ip))
}

/// Feed content is untrusted: a thumbnail has to be HTTPS and on a host that could serve it to the user.
pub fn safe_image_url(raw: &str) -> Option<String> {
    let parsed = reqwest::Url::parse(raw.trim()).ok()?;
    (parsed.scheme() == "https" && parsed.host_str().is_some_and(is_public_host)).then(|| parsed.to_string())
}

/// The enclosure in the HTML, or the first `<img src>` in it; `entry.media` wins over both.
fn image_from_html(html: &str) -> Option<String> {
    let lower = html.to_ascii_lowercase();
    let mut from = 0;
    while let Some(found) = lower.get(from..)?.find("<img") {
        let start = from + found;
        let end = html[start..].find('>').map_or(html.len(), |i| start + i);
        let (tag, lower_tag) = (&html[start..end], &lower[start..end]);
        if let Some(at) = lower_tag.find("src=") {
            let value = tag[at + 4..].trim_start();
            let value = match value.chars().next() {
                Some(quote @ ('"' | '\'')) => value.trim_start_matches(quote).split(quote).next().unwrap_or(""),
                _ => value.split_whitespace().next().unwrap_or(""),
            };
            if let Some(url) = safe_image_url(value) {
                return Some(url);
            }
        }
        from = (end + 1).min(lower.len());
    }
    None
}

/// A feed entry's picture, in the order a reader would pick it.
pub fn first_image(entry: &Entry) -> Option<String> {
    let typed = entry
        .media
        .iter()
        .flat_map(|object| object.content.iter())
        .filter(|content| content.content_type.as_ref().is_none_or(|kind| kind.to_string().starts_with("image/")))
        .filter_map(|content| content.url.as_ref().map(|url| url.to_string()))
        .find_map(|url| safe_image_url(&url));
    let thumbs = entry
        .media
        .iter()
        .flat_map(|object| object.thumbnails.iter())
        .find_map(|thumb| safe_image_url(&thumb.image.uri));
    let enclosure = entry.content.as_ref().and_then(|c| c.src.as_ref()).and_then(|link| safe_image_url(&link.href));
    let body = entry
        .content
        .as_ref()
        .and_then(|c| c.body.clone())
        .or_else(|| entry.summary.as_ref().map(|s| s.content.clone()));
    typed.or(thumbs).or(enclosure).or_else(|| body.and_then(|html| image_from_html(&html)))
}

/// Every entry worth a card, newest first kept by the caller; entries without an http(s) link are skipped.
pub fn parse_feed(bytes: &[u8], feed_url: &str) -> Result<Vec<Article>, String> {
    let feed = feed_rs::parser::parse(bytes).map_err(|e| e.to_string())?;
    let source = feed
        .title
        .map(|t| plain_text(&t.content, MAX_TITLE))
        .filter(|t| !t.trim().is_empty())
        .or_else(|| host_of(feed_url))
        .unwrap_or_default();
    let mut articles = Vec::new();
    for entry in feed.entries {
        let Some((url, host)) =
            entry.links.iter().find_map(|link| host_of(&link.href).map(|host| (link.href.trim().to_string(), host)))
        else {
            continue;
        };
        let title = entry
            .title
            .as_ref()
            .map(|t| plain_text(&t.content, MAX_TITLE))
            .filter(|t| !t.trim().is_empty())
            .unwrap_or_else(|| host.clone());
        let image = first_image(&entry);
        let summary = entry
            .summary
            .as_ref()
            .map(|t| t.content.clone())
            .or_else(|| entry.content.as_ref().and_then(|c| c.body.clone()))
            .map(|body| plain_text(&body, MAX_SUMMARY))
            .unwrap_or_default();
        articles.push(Article {
            id: article_id(&url),
            title,
            url,
            host,
            source: source.clone(),
            published_at: entry.published.or(entry.updated).map(|at| at.timestamp_millis()).unwrap_or(0),
            summary,
            unread: true,
            has_image: image.is_some(),
            image,
        });
    }
    Ok(articles)
}

/// The feed address comes from the UI: http(s), nothing else.
pub fn valid_feed_url(url: &str) -> bool {
    host_of(url).is_some()
}

/// Feeds move and shorteners exist, so a few hops are normal here; images are the strict path (`safe_image_url`).
pub fn fetch(url: &str) -> Result<Vec<u8>, String> {
    if !valid_feed_url(url) {
        return Err("endereço inválido: use http(s)".into());
    }
    let client = crate::net::client_builder()
        .user_agent("canto-widget")
        .timeout(Duration::from_secs(TIMEOUT_S))
        .redirect(reqwest::redirect::Policy::limited(3))
        .build()
        .map_err(|e| e.to_string())?;
    let res = client.get(url).send().map_err(|_| "sem resposta do feed".to_string())?;
    match res.status().as_u16() {
        404 => return Err("o feed respondeu 404".into()),
        429 => return Err("limite de buscas do feed atingido".into()),
        s if !(200..300).contains(&s) => return Err(format!("o feed respondeu {s}")),
        _ => {}
    }
    let mut bytes = Vec::new();
    // The read error wraps reqwest's, whose text names the feed URL, and a private feed keeps its token there.
    std::io::Read::read_to_end(&mut std::io::Read::take(res, MAX_FEED_BYTES as u64 + 1), &mut bytes)
        .map_err(|_| "o feed parou de responder no meio".to_string())?;
    if bytes.len() > MAX_FEED_BYTES {
        return Err("o feed é grande demais".into());
    }
    Ok(bytes)
}

#[cfg(test)]
#[path = "reads_tests.rs"]
mod tests;
