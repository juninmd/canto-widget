//! "Atualizações": the patch notes the games post on Steam, read from the public news feed and
//! trimmed to a short changelog the pane can show. Pure, so `steam_news_tests.rs` pins every shape.
use serde::{Deserialize, Serialize};

/// What the pane shows of one update.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct NewsItem {
    pub gid: String,
    pub appid: u32,
    pub game: String,
    pub title: String,
    pub url: String,
    /// Unix seconds.
    pub date: i64,
    /// The changelog, one line per change, at most `LINES`.
    pub lines: Vec<String>,
    /// Posted after the user last marked the list as read.
    pub fresh: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct SteamNews {
    pub items: Vec<NewsItem>,
    pub unread: u32,
}

pub const LINES: usize = 12;
const LINE_MAX: usize = 200;

#[derive(Deserialize, Default)]
struct Feed {
    #[serde(default)]
    appnews: AppNews,
}

#[derive(Deserialize, Default)]
struct AppNews {
    #[serde(default)]
    newsitems: Vec<Raw>,
}

#[derive(Deserialize, Default)]
struct Raw {
    #[serde(default)]
    gid: String,
    #[serde(default)]
    title: String,
    #[serde(default)]
    url: String,
    #[serde(default)]
    contents: String,
    #[serde(default)]
    date: i64,
    #[serde(default)]
    tags: Vec<String>,
}

/// An announcement is an update when Steam tags it as patch notes or its title says so; events,
/// sales and streams are left out.
fn is_update(raw: &Raw) -> bool {
    if raw.tags.iter().any(|t| t == "patchnotes") {
        return true;
    }
    let title = raw.title.to_lowercase();
    ["update", "patch", "hotfix", "changelog", "release notes", "version ", "atualiza"]
        .iter()
        .any(|w| title.contains(w))
}

/// The updates in one game's feed, newest first. The game's name comes from the caller: the feed
/// only carries the appid.
pub fn parse(json: &str, appid: u32, game: &str) -> Vec<NewsItem> {
    let feed: Feed = serde_json::from_str(json).unwrap_or_default();
    let mut items: Vec<NewsItem> = feed
        .appnews
        .newsitems
        .into_iter()
        .filter(|raw| !raw.gid.is_empty() && is_update(raw))
        .map(|raw| NewsItem {
            url: safe_url(&raw.url, appid),
            lines: changelog(&raw.contents),
            gid: raw.gid,
            appid,
            game: game.to_string(),
            title: raw.title.trim().to_string(),
            date: raw.date,
            fresh: false,
        })
        .collect();
    items.sort_by_key(|i| std::cmp::Reverse(i.date));
    items
}

/// Only Steam's own pages open from the pane; anything else falls back to the game's news page.
fn safe_url(url: &str, appid: u32) -> String {
    let ok = url::Url::parse(url).is_ok_and(|u| {
        u.scheme() == "https"
            && u.host_str().is_some_and(|h| {
                h == "store.steampowered.com" || h == "steamcommunity.com" || h.ends_with(".steamstatic.com")
            })
    });
    if ok {
        url.to_string()
    } else {
        crate::steam_url::news_page(appid)
    }
}

/// The changelog out of Steam's BBCode: list items and paragraphs become lines, tags, images and
/// links are dropped, and the result is capped so a huge patch stays a glance.
pub fn changelog(contents: &str) -> Vec<String> {
    let text = contents.replace("[*]", "\n").replace("[/p]", "\n").replace("<br>", "\n").replace("\\n", "\n");
    let mut out = Vec::new();
    for line in text.lines() {
        let clean = strip(line);
        let clean = clean.trim_start_matches(['-', '•', '*', '–', ' ']).trim();
        if clean.is_empty() || clean.starts_with("{STEAM") || clean.starts_with("http") {
            continue;
        }
        let mut line: String = clean.chars().take(LINE_MAX).collect();
        if clean.chars().count() > LINE_MAX {
            line.push('…');
        }
        out.push(line);
        if out.len() == LINES {
            break;
        }
    }
    out
}

/// Drops `[tag]`, `[url=...]`, `<tag>` and Steam's image placeholders from one line.
fn strip(line: &str) -> String {
    let mut out = String::with_capacity(line.len());
    let mut depth: Option<char> = None;
    for c in line.chars() {
        match (depth, c) {
            (None, '[') => depth = Some(']'),
            (None, '<') => depth = Some('>'),
            (Some(end), c) if c == end => depth = None,
            (Some(_), _) => {}
            (None, c) => out.push(c),
        }
    }
    let out = out.replace("&amp;", "&").replace("&quot;", "\"").replace("&#39;", "'").replace("&lt;", "<");
    out.split_whitespace().collect::<Vec<_>>().join(" ")
}

/// Marks what came after `read_at` (ms) as fresh; before the first "mark as read", the last three
/// days are. Newest first across games, capped at `max`.
pub fn combine(mut items: Vec<NewsItem>, read_at_ms: i64, now_ms: i64, max: usize) -> SteamNews {
    let since = if read_at_ms > 0 { read_at_ms } else { now_ms - 3 * 24 * 3_600_000 };
    items.sort_by(|a, b| b.date.cmp(&a.date).then_with(|| a.gid.cmp(&b.gid)));
    items.dedup_by(|a, b| a.gid == b.gid);
    items.truncate(max);
    for item in &mut items {
        item.fresh = item.date * 1000 > since;
    }
    let unread = items.iter().filter(|i| i.fresh).count() as u32;
    SteamNews { items, unread }
}

#[cfg(test)]
#[path = "steam_news_tests.rs"]
mod tests;
