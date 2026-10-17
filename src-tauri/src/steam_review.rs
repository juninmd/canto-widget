//! Steam's nine review buckets, spelled the way the interface reads them. The store words each bucket
//! itself, in the store's language: since every request asks for Portuguese, that wording is stable.
use serde::Deserialize;

/// The tokens the interface translates, in Steam's order (best to worst).
pub const BUCKETS: [&str; 9] = [
    "overwhelmingly_positive",
    "very_positive",
    "positive",
    "mostly_positive",
    "mixed",
    "mostly_negative",
    "negative",
    "very_negative",
    "overwhelmingly_negative",
];

pub fn is_bucket(key: &str) -> bool {
    BUCKETS.contains(&key)
}

/// Steam's own Portuguese wording to the token; a wording we don't know yields no bucket, and the row
/// then shows only the percentage.
pub fn bucket(wording: &str) -> String {
    let key = match wording.trim() {
        "Extremamente positivas" => "overwhelmingly_positive",
        "Muito positivas" => "very_positive",
        "Positivas" => "positive",
        "Praticamente positivas" => "mostly_positive",
        "Neutras" => "mixed",
        "Praticamente negativas" => "mostly_negative",
        "Negativas" => "negative",
        "Muito negativas" => "very_negative",
        "Extremamente negativas" => "overwhelmingly_negative",
        _ => "",
    };
    if is_bucket(key) {
        key.to_string()
    } else {
        String::new()
    }
}

/// What the store's own summary answers (the reviews endpoint used for the wishlist deals).
#[derive(Debug, Default, Deserialize)]
pub struct Summary {
    #[serde(default)]
    pub total_positive: u32,
    #[serde(default)]
    pub total_reviews: u32,
    #[serde(default)]
    pub review_score_desc: String,
}

impl Summary {
    /// How many of those reviews are positive, 0..=100; `None` with no reviews at all.
    pub fn percent(&self) -> Option<u8> {
        (self.total_reviews > 0)
            .then(|| (self.total_positive as f64 / self.total_reviews as f64 * 100.0).round().clamp(0.0, 100.0) as u8)
    }

    pub fn bucket(&self) -> String {
        bucket(&self.review_score_desc)
    }
}

#[cfg(test)]
#[path = "steam_review_tests.rs"]
mod tests;
