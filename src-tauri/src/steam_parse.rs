//! Pure parsers for what the Steam store and Web API answer. No network here, so every shape is
//! exercised by a captured payload in `steam_parse_tests.rs`.
use std::collections::HashMap;

use serde::Deserialize;

use crate::steam::{RecentGame, SteamRow};

/// The rows of a store search page: `data-ds-appid` marks where each one starts.
pub fn parse_search(html: &str) -> Vec<SteamRow> {
    let starts: Vec<usize> = html.match_indices("data-ds-appid=\"").map(|(at, _)| at).collect();
    starts
        .iter()
        .enumerate()
        .filter_map(|(i, &start)| row_of(&html[start..starts.get(i + 1).copied().unwrap_or(html.len())]))
        .collect()
}

fn row_of(chunk: &str) -> Option<SteamRow> {
    let appid: u32 = between(chunk, "data-ds-appid=\"", "\"")?.parse().ok()?;
    let name = unescape(between(chunk, "class=\"title\">", "<")?).trim().to_string();
    if name.is_empty() {
        return None;
    }
    let discount: u32 = between(chunk, "discount_pct\">-", "%").and_then(|v| v.trim().parse().ok()).unwrap_or(0);
    let clean = |open: &str| between(chunk, open, "<").map(|v| unescape(v).trim().to_string()).unwrap_or_default();
    let (review, review_label) = review_of(chunk);
    Some(SteamRow {
        appid,
        name,
        price: clean("discount_final_price\">"),
        original: clean("discount_original_price\">"),
        discount,
        review,
        review_label,
    })
}

/// Reviews ride in a tooltip: the sentiment before the first `<br>`, then "NN% das ... análises".
fn review_of(chunk: &str) -> (Option<u8>, String) {
    let Some(rest) = chunk.split_once("search_review_summary").map(|(_, r)| r) else {
        return (None, String::new());
    };
    let Some(tooltip) = between(rest, "data-tooltip-html=\"", "\"") else {
        return (None, String::new());
    };
    let tooltip = unescape(tooltip);
    let label = tooltip.split("<br>").next().unwrap_or_default().trim().to_string();
    let review = tooltip
        .find('%')
        .and_then(|at| tooltip[..at].trim_end().rsplit(|c: char| !c.is_ascii_digit()).next()?.parse::<u8>().ok());
    (review, label)
}

fn between<'a>(text: &'a str, open: &str, close: &str) -> Option<&'a str> {
    let start = text.find(open)? + open.len();
    let rest = &text[start..];
    Some(&rest[..rest.find(close)?])
}

/// A single pass over `&...;`, so `&amp;lt;` decodes to `&lt;` instead of `<`.
pub fn unescape(text: &str) -> String {
    let mut out = String::with_capacity(text.len());
    let mut rest = text;
    while let Some(at) = rest.find('&') {
        out.push_str(&rest[..at]);
        let tail = &rest[at..];
        let Some(end) = tail.find(';').filter(|end| *end <= 12) else {
            out.push('&');
            rest = &tail[1..];
            continue;
        };
        match &tail[1..end] {
            "amp" => out.push('&'),
            "lt" => out.push('<'),
            "gt" => out.push('>'),
            "quot" => out.push('"'),
            "apos" | "#39" => out.push('\''),
            "nbsp" => out.push(' '),
            other => match numeric(other) {
                Some(c) => out.push(c),
                // An entity we don't know is left alone rather than guessed at.
                None => out.push_str(&tail[..=end]),
            },
        }
        rest = &tail[end + 1..];
    }
    out.push_str(rest);
    out
}

fn numeric(entity: &str) -> Option<char> {
    let digits = entity.strip_prefix('#')?;
    let code = match digits.strip_prefix(['x', 'X']) {
        Some(hex) => u32::from_str_radix(hex, 16).ok()?,
        None => digits.parse().ok()?,
    };
    char::from_u32(code)
}

#[derive(Deserialize, Default)]
struct Wishlist {
    #[serde(default)]
    response: WishItems,
}

#[derive(Deserialize, Default)]
struct WishItems {
    #[serde(default)]
    items: Vec<WishItem>,
}

#[derive(Deserialize)]
struct WishItem {
    appid: u32,
}

/// `{"response":{}}` is a private or empty wishlist, not an error.
pub fn parse_wishlist(json: &str) -> Result<Vec<u32>, String> {
    let parsed: Wishlist = serde_json::from_str(json).map_err(|e| e.to_string())?;
    Ok(parsed.response.items.into_iter().map(|i| i.appid).collect())
}

#[derive(Debug, Clone, Default, PartialEq, Deserialize)]
pub struct Price {
    #[serde(default, rename = "discount_percent")]
    pub discount: u32,
    #[serde(default, rename = "final")]
    pub final_cents: i64,
    #[serde(default)]
    pub final_formatted: String,
    #[serde(default)]
    pub initial_formatted: String,
}

#[derive(Deserialize)]
struct PriceEntry {
    #[serde(default)]
    success: bool,
    /// An object for a priced app, `[]` for a free one.
    #[serde(default)]
    data: serde_json::Value,
}

#[derive(Deserialize, Default)]
struct PriceData {
    #[serde(default)]
    price_overview: Option<Price>,
}

pub fn parse_prices(json: &str) -> HashMap<u32, Price> {
    let map: HashMap<String, PriceEntry> = serde_json::from_str(json).unwrap_or_default();
    map.into_iter()
        .filter(|(_, e)| e.success)
        .filter_map(|(id, e)| {
            let price = serde_json::from_value::<PriceData>(e.data).ok()?.price_overview?;
            Some((id.parse::<u32>().ok()?, price))
        })
        .collect()
}

#[derive(Deserialize, Default)]
struct BasicEntry {
    #[serde(default)]
    success: bool,
    #[serde(default)]
    data: BasicData,
}

#[derive(Deserialize, Default)]
struct BasicData {
    #[serde(default)]
    name: String,
}

pub fn parse_name(json: &str) -> Option<String> {
    let map: HashMap<String, BasicEntry> = serde_json::from_str(json).ok()?;
    map.into_values().find(|e| e.success).map(|e| e.data.name).filter(|n| !n.is_empty())
}

#[derive(Deserialize, Default)]
struct RecentResponse {
    #[serde(default)]
    response: RecentItems,
}

#[derive(Deserialize, Default)]
struct RecentItems {
    #[serde(default)]
    games: Vec<RecentRaw>,
}

#[derive(Deserialize, Default)]
struct RecentRaw {
    #[serde(default)]
    appid: u32,
    #[serde(default)]
    name: String,
    #[serde(default, rename = "playtime_2weeks")]
    minutes_2weeks: u32,
    #[serde(default)]
    playtime_forever: u32,
}

pub fn parse_recent(json: &str) -> Vec<RecentGame> {
    let parsed: RecentResponse = serde_json::from_str(json).unwrap_or_default();
    parsed
        .response
        .games
        .into_iter()
        .filter(|g| !g.name.is_empty())
        .map(|g| RecentGame {
            appid: g.appid,
            name: g.name,
            recent_min: g.minutes_2weeks,
            total_min: g.playtime_forever,
        })
        .collect()
}

#[derive(Deserialize, Default)]
struct Vanity {
    #[serde(default)]
    response: VanityInner,
}

#[derive(Deserialize, Default)]
struct VanityInner {
    #[serde(default)]
    success: u8,
    #[serde(default)]
    steamid: String,
}

pub fn parse_vanity(json: &str) -> Option<String> {
    let parsed: Vanity = serde_json::from_str(json).ok()?;
    (parsed.response.success == 1 && !parsed.response.steamid.is_empty()).then_some(parsed.response.steamid)
}

#[derive(Deserialize, Default)]
struct Summary {
    #[serde(default)]
    response: SummaryInner,
}

#[derive(Deserialize, Default)]
struct SummaryInner {
    #[serde(default)]
    players: Vec<Player>,
}

#[derive(Deserialize, Default)]
struct Player {
    #[serde(default)]
    personaname: String,
}

pub fn parse_summary(json: &str) -> Option<String> {
    let parsed: Summary = serde_json::from_str(json).ok()?;
    parsed.response.players.into_iter().map(|p| p.personaname).find(|n| !n.is_empty())
}

#[cfg(test)]
#[path = "steam_parse_tests.rs"]
mod tests;
