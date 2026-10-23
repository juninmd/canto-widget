//! The model sheet beyond score, price and speed. The page's payload is undocumented and its keys have moved
//! between camelCase and snake_case, so each field tries a few spellings and stays empty when none is there.
use serde::{Deserialize, Serialize};
use serde_json::Value;

const MODALITIES: [&str; 4] = ["text", "image", "audio", "video"];

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(default)]
pub struct Details {
    /// USD per 1M tokens.
    pub input_price: Option<f64>,
    pub output_price: Option<f64>,
    /// Median seconds to the first token.
    pub ttft: Option<f64>,
    /// Tokens.
    pub context: Option<u64>,
    /// `YYYY-MM-DD`.
    pub released: Option<String>,
    pub open_weights: Option<bool>,
    pub reasoning: Option<bool>,
    pub coding: Option<f64>,
    pub math: Option<f64>,
    /// Input modalities among `MODALITIES`, in that order.
    pub inputs: Vec<String>,
}

fn first<'a>(v: &'a Value, keys: &[&str]) -> Option<&'a Value> {
    keys.iter().map(|k| &v[*k]).find(|x| !x.is_null())
}

/// Zero means "not measured" for prices, speed and latency; a free model would otherwise top every sort.
fn positive(v: &Value, keys: &[&str]) -> Option<f64> {
    first(v, keys)?.as_f64().filter(|n| n.is_finite() && *n > 0.0)
}

fn index(v: &Value, keys: &[&str]) -> Option<f64> {
    first(v, keys)?.as_f64().filter(|n| n.is_finite() && *n >= 0.0)
}

fn flag(v: &Value, keys: &[&str]) -> Option<bool> {
    first(v, keys)?.as_bool()
}

/// Keeps the date part of `2026-09-30` or `2026-09-30T00:00:00Z`; anything else is dropped rather than shown wrong.
fn date(v: &Value, keys: &[&str]) -> Option<String> {
    let s = first(v, keys)?.as_str()?.get(..10)?;
    let b = s.as_bytes();
    let ok = b.iter().enumerate().all(|(i, c)| if i == 4 || i == 7 { *c == b'-' } else { c.is_ascii_digit() });
    ok.then(|| s.to_string())
}

/// Either a list (`["text","image"]`) or one flag per modality (`inputModalityImage: true`).
fn inputs(v: &Value) -> Vec<String> {
    let list = first(v, &["inputModalities", "input_modalities"]).and_then(Value::as_array);
    MODALITIES
        .iter()
        .filter(|m| match list {
            Some(l) => l.iter().any(|x| x.as_str().is_some_and(|s| s.eq_ignore_ascii_case(m))),
            None => {
                let key = format!("inputModality{}{}", m[..1].to_uppercase(), &m[1..]);
                v[key.as_str()].as_bool() == Some(true)
            }
        })
        .map(|m| m.to_string())
        .collect()
}

pub fn details(v: &Value) -> Details {
    Details {
        input_price: positive(v, &["price1mInputTokens", "price_1m_input_tokens"]),
        output_price: positive(v, &["price1mOutputTokens", "price_1m_output_tokens"]),
        ttft: positive(
            v,
            &["medianTimeToFirstTokenSeconds", "timeToFirstTokenSeconds", "median_time_to_first_token_seconds"],
        ),
        context: positive(v, &["contextWindowTokens", "contextWindow", "context_window_tokens"])
            .map(|n| n.round() as u64),
        released: date(v, &["releaseDate", "release_date"]),
        open_weights: flag(v, &["isOpenWeights", "openWeights", "is_open_weights"]),
        reasoning: flag(v, &["isReasoning", "reasoningModel", "reasoning_model", "is_reasoning"]),
        coding: index(v, &["codingIndex", "artificialAnalysisCodingIndex", "coding_index"]),
        math: index(v, &["mathIndex", "artificialAnalysisMathIndex", "math_index"]),
        inputs: inputs(v),
    }
}

#[cfg(test)]
#[path = "models_fields_tests.rs"]
mod tests;
