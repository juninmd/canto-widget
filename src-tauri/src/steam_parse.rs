//! Pure parsers for the JSON the store's `appdetails`, the wishlist endpoint and the review summary
//! answer. No network here, so every shape is exercised by a captured payload. The store's HTML page
//! lives in `steam_store.rs` and the player data in `steam_player.rs`.
use std::collections::HashMap;

use serde::Deserialize;

use crate::steam_review;

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

/// Serialized only into the RAM cache: the scan behind the deals is cached as a whole, so paging
/// never re-reads the wishlist.
#[derive(Debug, Clone, Default, PartialEq, Deserialize, serde::Serialize)]
pub struct Price {
    #[serde(default, rename = "discount_percent")]
    pub discount: u32,
    #[serde(default)]
    pub initial: i64,
    #[serde(default, rename = "final")]
    pub final_cents: i64,
    #[serde(default)]
    pub final_formatted: String,
    #[serde(default)]
    pub initial_formatted: String,
}

impl Price {
    /// What the discount takes off, in cents; 0 when there is none.
    pub fn saved_cents(&self) -> u32 {
        if self.initial > self.final_cents {
            self.initial.saturating_sub(self.final_cents).min(u32::MAX as i64) as u32
        } else {
            0
        }
    }
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
    /// The small 231x87 capsule and the wider header; the capsule is the one a row wants.
    #[serde(default)]
    capsule_image: String,
    #[serde(default)]
    header_image: String,
}

/// The name plus the smallest image the app has; `None` when Steam answered without one.
pub fn parse_basic(json: &str) -> Option<(String, String)> {
    let map: HashMap<String, BasicEntry> = serde_json::from_str(json).ok()?;
    let data = map.into_values().find(|e| e.success)?.data;
    if data.name.is_empty() {
        return None;
    }
    let art = if data.capsule_image.is_empty() { data.header_image } else { data.capsule_image };
    Some((data.name, art))
}

#[derive(Deserialize, Default)]
struct Reviews {
    #[serde(default)]
    success: u8,
    #[serde(default)]
    query_summary: steam_review::Summary,
}

/// The positive percentage, the bucket and how many reviews it counts, from the store's summary.
/// `None` for an app with no reviews at all.
pub fn parse_reviews(json: &str) -> Option<(u8, String, u32)> {
    let parsed: Reviews = serde_json::from_str(json).ok()?;
    if parsed.success != 1 {
        return None;
    }
    let summary = parsed.query_summary;
    Some((summary.percent()?, summary.bucket(), summary.total_reviews))
}

#[cfg(test)]
#[path = "steam_parse_tests.rs"]
mod tests;
