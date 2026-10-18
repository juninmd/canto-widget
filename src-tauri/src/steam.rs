//! Steam: wishlist deals, top sellers, the last games played and the store catalog by rating.
//! Only the SteamID64 and an optional Web API key are kept, sealed; the lists live in RAM while the
//! vault is open, because prices and rankings change all the time.
use std::collections::HashMap;
use std::sync::Mutex;

use serde::{Deserialize, Serialize};

use crate::error::Result;
use crate::store::{self, STEAM_AAD};
use crate::vault::AppState;

/// How many rows each list shows: one widget pane, not a storefront. A page, on the wishlist too.
pub const DEALS: usize = 12;
pub const TRENDING: usize = 25;
/// The store answers 50 rows per search page, and `start` only moves in 50s.
pub const CATALOG_PAGE: usize = 50;
/// Everything Steam reports for the last two weeks, within a bound the pane can scroll.
pub const RECENT: usize = 30;
/// A library can be thousands of games; one pane shows this many, the most played first.
pub const LIBRARY: usize = 100;
/// Fresh enough to skip the network; the "atualizar" button bypasses it.
pub const TTL_MS: i64 = 5 * 60_000;
/// The catalog keys on free text and every capsule is an entry, so the cache is capped; the oldest
/// entry goes. Big enough for a list plus the covers it is showing.
const MAX_ENTRIES: usize = 64;

/// Deliberately not `Debug`: it holds the Web API key.
#[derive(Default, Clone, Serialize, Deserialize)]
pub struct SteamConfig {
    #[serde(default)]
    pub steamid: String,
    /// Empty when the user did not paste one: only the "recent" list needs it.
    #[serde(default)]
    pub api_key: String,
    /// Persona name from the last successful connect, shown in the header.
    #[serde(default)]
    pub name: String,
    /// The storefront chosen in the tab ("br", "us"...); empty means "derive it from the language".
    #[serde(default)]
    pub region: String,
}

/// The storefront the configuration means: the chosen one, or the one the UI language implies.
pub fn region_of(cfg: &SteamConfig) -> crate::steam_region::Region {
    crate::steam_region::effective(&cfg.region, crate::lang::code())
}

impl AppState {
    pub fn steam_config(&self) -> Result<Option<SteamConfig>> {
        self.sealed(&store::steam_path(&self.dir), STEAM_AAD)
    }

    pub fn save_steam(&self, cfg: &SteamConfig) -> Result<()> {
        self.save_sealed(&store::steam_path(&self.dir), STEAM_AAD, cfg)
    }
}

#[derive(Debug, Serialize)]
pub struct SteamStatus {
    pub configured: bool,
    pub steamid: String,
    pub has_key: bool,
    pub name: String,
    /// The effective region code, so the picker opens on what the lists are actually reading.
    pub region: String,
    /// Whether the price alerts are on; filled in by the command, which has the sealed state.
    pub watching: bool,
}

pub fn status(cfg: Option<&SteamConfig>) -> SteamStatus {
    let cfg = cfg.cloned().unwrap_or_default();
    let region = region_of(&cfg).code.to_string();
    SteamStatus {
        configured: !cfg.steamid.is_empty(),
        steamid: cfg.steamid,
        has_key: !cfg.api_key.is_empty(),
        name: cfg.name,
        region,
        watching: false,
    }
}

/// One game on any of the lists. `price` and `original` are Steam's own localized strings.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct SteamRow {
    pub appid: u32,
    pub name: String,
    pub price: String,
    /// Set only while the game is discounted.
    pub original: String,
    pub discount: u32,
    /// Positive reviews, 0..=100; `None` for a game Steam has no review summary for.
    pub review: Option<u8>,
    /// Steam's own bucket, as a token the interface translates ("very_positive"); empty when unknown.
    pub review_key: String,
    /// How many reviews the percentage is drawn from; 0 when Steam didn't say.
    pub review_count: u32,
    /// What the discount takes off, in cents; 0 when there is none.
    pub saved_cents: u32,
    /// Capsule image on Steam's CDN. The UI asks `steam_image` for it per row, so the list stays light.
    pub art: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SteamList {
    pub items: Vec<SteamRow>,
    pub has_more: bool,
    /// ISO 4217 of the region the prices came from; the interface formats the savings with it.
    pub currency: String,
}

/// A game played in the last two weeks, newest first.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct RecentGame {
    pub appid: u32,
    pub name: String,
    pub recent_min: u32,
    pub total_min: u32,
    /// Capsule on Steam's CDN; the row asks `steam_image` for it.
    pub art: String,
}

/// `has_key` is false when no Web API key was pasted: only this list needs one, so the UI explains
/// instead of showing an error.
#[derive(Debug, Serialize, Deserialize)]
pub struct SteamRecent {
    pub items: Vec<RecentGame>,
    pub has_key: bool,
}

/// A game the player owns. Only the total playtime is kept: the two-week figure belongs to "jogue agora".
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct OwnedGame {
    pub appid: u32,
    pub name: String,
    pub total_min: u32,
    /// Capsule on Steam's CDN; built from the appid, so a whole library needs no extra request.
    pub art: String,
}

/// `items` is a page of the library, most played first; `total` is how many games matched the search
/// and `minutes` how long they add up to, so the pane can say what it is showing.
#[derive(Debug, Serialize, Deserialize)]
pub struct SteamLibrary {
    pub items: Vec<OwnedGame>,
    pub total: u32,
    pub minutes: u32,
    pub has_key: bool,
}

struct Cached {
    at: i64,
    json: String,
}

/// RAM-only, keyed by sub-tab and arguments; `clear` drops every list on lock, like the forge cache.
#[derive(Default)]
pub struct SteamCache(Mutex<HashMap<String, Cached>>);

impl SteamCache {
    pub fn get_or<T: serde::de::DeserializeOwned + Serialize>(
        &self,
        key: &str,
        force: bool,
        now: i64,
        fetch: impl FnOnce() -> Result<T>,
    ) -> Result<T> {
        if !force {
            let hit = self.0.lock().unwrap().get(key).filter(|e| now - e.at < TTL_MS).map(|e| e.json.clone());
            if let Some(json) = hit {
                return Ok(serde_json::from_str(&json)?);
            }
        }
        let value = fetch()?;
        let mut map = self.0.lock().unwrap();
        map.insert(key.to_string(), Cached { at: now, json: serde_json::to_string(&value)? });
        while map.len() > MAX_ENTRIES {
            let Some(oldest) = map.iter().min_by_key(|(_, e)| e.at).map(|(k, _)| k.clone()) else {
                break;
            };
            map.remove(&oldest);
        }
        Ok(value)
    }

    pub fn clear(&self) {
        self.0.lock().unwrap().clear();
    }
}

#[cfg(test)]
#[path = "steam_tests.rs"]
mod tests;
