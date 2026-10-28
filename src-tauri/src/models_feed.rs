//! Artificial Analysis LLM ranking read from its public leaderboard page (no account, no API key): the page
//! ships the whole model list, Intelligence Index, prices and speed, inside its Next.js payload. Callers go
//! through `models_state`'s floor, so the page is fetched at most once every few hours.
use std::time::Duration;

use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::models_fields::{self, Details};

pub const URL: &str = "https://artificialanalysis.ai/leaderboards/models";
/// Names the index version ("Intelligence Index v5.0 incorporates..."), when the leaderboard doesn't.
pub const VERSION_URL: &str = "https://artificialanalysis.ai/models";
const VERSION_TAG: &str = "Intelligence Index v";
const TIMEOUT_S: u64 = 20;
const MAX_TEXT: usize = 120;
/// Opens each Next.js flight chunk: a JSON string literal holding a slice of the payload.
const CHUNK: &str = "self.__next_f.push([1,\"";

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct Model {
    pub id: String,
    pub name: String,
    pub creator: String,
    pub score: f64,
    /// USD per 1M tokens, blended 3:1 input/output.
    pub price: Option<f64>,
    /// Median output tokens per second.
    pub speed: Option<f64>,
    /// Absent from rankings sealed before the sheet existed: they read back empty until the next fetch.
    #[serde(flatten)]
    pub details: Details,
}

/// One reading: the models plus the index version the page names, so a new version needs no code change.
#[derive(Debug, Default, PartialEq)]
pub struct Page {
    pub models: Vec<Model>,
    pub index: Option<String>,
}

impl From<Vec<Model>> for Page {
    fn from(models: Vec<Model>) -> Self {
        Page { models, index: None }
    }
}

#[derive(Debug, PartialEq)]
pub enum FetchError {
    RateLimited,
    /// No HTTP answer at all (offline, DNS, timeout): doesn't spend the fetch window.
    Network(String),
    Other(String),
}

impl FetchError {
    pub fn message(&self) -> String {
        match self {
            FetchError::RateLimited => "limite de buscas atingido, tente mais tarde".into(),
            FetchError::Network(e) | FetchError::Other(e) => format!("sem resposta da Artificial Analysis: {e}"),
        }
    }
}

fn text(v: &Value) -> Option<String> {
    let s = v.as_str()?.trim();
    (!s.is_empty()).then(|| s.chars().take(MAX_TEXT).collect())
}

/// Zero or null means "not measured", not "free" or "instant": it would top the price sort otherwise.
fn positive(v: &Value) -> Option<f64> {
    v.as_f64().filter(|n| n.is_finite() && *n > 0.0)
}

fn blended(v: &Value) -> Option<f64> {
    let (input, output) = (v["price1mInputTokens"].as_f64()?, v["price1mOutputTokens"].as_f64()?);
    Some((3.0 * input + output) / 4.0).filter(|p| p.is_finite() && *p > 0.0)
}

fn model(v: &Value) -> Option<Model> {
    if v["deprecated"].as_bool() == Some(true) {
        return None;
    }
    let score = v["intelligenceIndex"].as_f64().filter(|n| n.is_finite())?;
    let id = text(&v["slug"])?;
    let name = text(&v["name"]).unwrap_or_else(|| id.clone());
    Some(Model {
        creator: text(&v["modelCreatorName"]).unwrap_or_default(),
        score,
        price: blended(v),
        speed: positive(&v["medianOutputTokensPerSecond"]),
        details: models_fields::details(v),
        id,
        name,
    })
}

/// The payload is split in string-literal chunks; joining the decoded chunks gives back one JSON-ish document.
fn payload(html: &str) -> String {
    let mut out = String::new();
    let mut rest = html;
    while let Some(i) = rest.find(CHUNK) {
        rest = &rest[i + CHUNK.len() - 1..];
        let b = rest.as_bytes();
        let mut end = 1;
        while end < b.len() && b[end] != b'"' {
            end += if b[end] == b'\\' { 2 } else { 1 };
        }
        if end >= b.len() {
            break;
        }
        if let Ok(s) = serde_json::from_str::<String>(&rest[..=end]) {
            out.push_str(&s);
        }
        rest = &rest[end + 1..];
    }
    out
}

/// The first `"models":[...]` whose items carry an `intelligenceIndex`; item by item, so one malformed model
/// is dropped instead of failing the whole list.
pub fn parse_page(html: &str) -> std::result::Result<Vec<Model>, FetchError> {
    let data = payload(html);
    let list = data.match_indices("\"models\":[").find_map(|(i, m)| {
        let mut items = serde_json::Deserializer::from_str(&data[i + m.len() - 1..]).into_iter::<Vec<Value>>();
        items.next()?.ok().filter(|l| l.first().is_some_and(|first| first.get("intelligenceIndex").is_some()))
    });
    match list {
        Some(list) => Ok(list.iter().filter_map(model).collect()),
        None => Err(FetchError::Other("a página mudou de formato".into())),
    }
}

/// The highest `Intelligence Index vX.Y` the page names; `None` when it names none.
pub fn index_version(html: &str) -> Option<String> {
    html.match_indices(VERSION_TAG)
        .filter_map(|(i, _)| {
            let v: String =
                html[i + VERSION_TAG.len()..].chars().take_while(|c| c.is_ascii_digit() || *c == '.').collect();
            let v = v.trim_end_matches('.');
            v.starts_with(|c: char| c.is_ascii_digit()).then(|| v.to_string())
        })
        .max_by(|a, b| {
            let parts = |s: &str| s.split('.').map(|p| p.parse::<u32>().unwrap_or(0)).collect::<Vec<_>>();
            parts(a).cmp(&parts(b))
        })
}

pub fn fetch() -> std::result::Result<Page, FetchError> {
    let client = crate::net::client_builder()
        .user_agent("Mozilla/5.0 (compatible; canto-widget)")
        .timeout(Duration::from_secs(TIMEOUT_S))
        .build()
        .map_err(|e| FetchError::Network(e.to_string()))?;
    let res = client.get(URL).send().map_err(|e| FetchError::Network(e.to_string()))?;
    let html = match res.status().as_u16() {
        429 => return Err(FetchError::RateLimited),
        s if !(200..300).contains(&s) => return Err(FetchError::Other(format!("HTTP {s}"))),
        _ => res.text().map_err(|e| FetchError::Other(e.to_string()))?,
    };
    let models = parse_page(&html)?;
    let index = index_version(&html).or_else(|| {
        let res = client.get(VERSION_URL).send().ok().filter(|r| r.status().is_success())?;
        index_version(&res.text().ok()?)
    });
    Ok(Page { models, index })
}

#[cfg(test)]
#[path = "models_feed_tests.rs"]
mod tests;
