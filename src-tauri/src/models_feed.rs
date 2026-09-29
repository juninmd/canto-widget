//! Artificial Analysis LLM list (`/api/v2/data/llms/models`): only the Intelligence Index, price and speed.
//! The free tier allows ~10 calls a day, so callers go through `models_state`'s floor, never straight here.
use std::time::Duration;

use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::error::{AppError, Result};

pub const URL: &str = "https://artificialanalysis.ai/api/v2/data/llms/models";
const TIMEOUT_S: u64 = 15;
const MAX_TEXT: usize = 120;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Model {
    pub id: String,
    pub name: String,
    pub creator: String,
    pub score: f64,
    /// USD per 1M tokens, blended 3:1 input/output.
    pub price: Option<f64>,
    /// Median output tokens per second.
    pub speed: Option<f64>,
}

#[derive(Debug, PartialEq)]
pub enum FetchError {
    Unauthorized,
    RateLimited,
    /// No HTTP answer at all (offline, DNS, timeout): doesn't count against the daily quota.
    Network(String),
    Other(String),
}

impl FetchError {
    pub fn message(&self) -> String {
        match self {
            FetchError::Unauthorized => "chave inválida".into(),
            FetchError::RateLimited => "limite diário da API atingido".into(),
            FetchError::Network(e) | FetchError::Other(e) => format!("sem resposta da Artificial Analysis: {e}"),
        }
    }
}

/// Keys are opaque; this only keeps garbage and header injection out of the request.
pub fn valid_key(input: &str) -> Result<&str> {
    let k = input.trim();
    let charset = k.bytes().all(|b| b.is_ascii_alphanumeric() || matches!(b, b'-' | b'_' | b'.'));
    if (16..=128).contains(&k.len()) && charset {
        Ok(k)
    } else {
        Err(AppError::Config("chave inválida: cole a chave de API gerada em artificialanalysis.ai".into()))
    }
}

fn text(v: &Value) -> Option<String> {
    let s = v.as_str()?.trim();
    (!s.is_empty()).then(|| s.chars().take(MAX_TEXT).collect())
}

/// Zero means "not measured" in this API, not "free" or "instant": it would top the price sort otherwise.
fn positive(v: &Value) -> Option<f64> {
    v.as_f64().filter(|n| n.is_finite() && *n > 0.0)
}

fn model(v: &Value) -> Option<Model> {
    let score = v["evaluations"]["artificial_analysis_intelligence_index"].as_f64().filter(|n| n.is_finite())?;
    let id = text(&v["id"])?;
    let name = text(&v["name"]).unwrap_or_else(|| id.clone());
    Some(Model {
        creator: text(&v["model_creator"]["name"]).unwrap_or_default(),
        score,
        price: positive(&v["pricing"]["price_1m_blended_3_to_1"]),
        speed: positive(&v["median_output_tokens_per_second"]),
        id,
        name,
    })
}

#[derive(Deserialize)]
struct Body {
    #[serde(default)]
    data: Vec<Value>,
}

/// Item by item: one malformed model is dropped instead of failing the whole list.
pub fn parse(bytes: &[u8]) -> std::result::Result<Vec<Model>, FetchError> {
    let body: Body = serde_json::from_slice(bytes).map_err(|e| FetchError::Other(e.to_string()))?;
    Ok(body.data.iter().filter_map(model).collect())
}

pub fn fetch(key: &str) -> std::result::Result<Vec<Model>, FetchError> {
    let client = crate::net::client_builder()
        .user_agent("canto-widget")
        .timeout(Duration::from_secs(TIMEOUT_S))
        .build()
        .map_err(|e| FetchError::Network(e.to_string()))?;
    let res = client.get(URL).header("x-api-key", key).send().map_err(|e| FetchError::Network(e.to_string()))?;
    match res.status().as_u16() {
        401 | 403 => Err(FetchError::Unauthorized),
        429 => Err(FetchError::RateLimited),
        s if !(200..300).contains(&s) => Err(FetchError::Other(format!("HTTP {s}"))),
        _ => parse(&res.bytes().map_err(|e| FetchError::Other(e.to_string()))?),
    }
}

#[cfg(test)]
#[path = "models_feed_tests.rs"]
mod tests;
