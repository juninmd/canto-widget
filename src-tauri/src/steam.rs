//! Steam: wishlist deals, top sellers, the last games played and the store catalog by rating.
//! Only the SteamID64 and an optional Web API key are kept, sealed; the lists live in RAM while the
//! vault is open, because prices and rankings change all the time.
use std::collections::HashMap;
use std::sync::Mutex;

use serde::{Deserialize, Serialize};

use crate::error::Result;
use crate::store::{self, STEAM_AAD};
use crate::vault::AppState;

/// The store is read in BRL and Portuguese: prices and review labels come already localized, so they
/// are never re-formatted here.
pub const COUNTRY: &str = "BR";
pub const LANGUAGE: &str = "portuguese";
/// How many rows each list shows: one widget pane, not a storefront.
pub const DEALS: usize = 12;
pub const TRENDING: usize = 25;
pub const CATALOG: usize = 25;
pub const RECENT: usize = 5;
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
}

pub fn status(cfg: Option<&SteamConfig>) -> SteamStatus {
    let cfg = cfg.cloned().unwrap_or_default();
    SteamStatus {
        configured: !cfg.steamid.is_empty(),
        steamid: cfg.steamid,
        has_key: !cfg.api_key.is_empty(),
        name: cfg.name,
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

pub enum SteamId {
    Id(String),
    /// A vanity name: only the Web API can resolve it, so a key is required.
    Vanity(String),
}

/// Accepts a SteamID64, a `steamcommunity.com` link or a bare vanity name.
pub fn classify(input: &str) -> Option<SteamId> {
    let text = input.trim().trim_end_matches('/');
    if text.is_empty() {
        return None;
    }
    let body = text.split_once("://").map_or(text, |(_, rest)| rest);
    let body = body.trim_start_matches("www.");
    let path = body.strip_prefix("steamcommunity.com").unwrap_or(body);
    let parts: Vec<&str> = path.trim_start_matches('/').split('/').filter(|s| !s.is_empty()).collect();
    match parts.as_slice() {
        ["profiles", id] => is_steamid(id).then(|| SteamId::Id((*id).to_string())),
        ["id", name] => is_vanity(name).then(|| SteamId::Vanity((*name).to_string())),
        [only] if is_steamid(only) => Some(SteamId::Id((*only).to_string())),
        // A run of digits that is not a valid id is a mistyped id, never a vanity name.
        [only] if !only.bytes().all(|b| b.is_ascii_digit()) => {
            is_vanity(only).then(|| SteamId::Vanity((*only).to_string()))
        }
        _ => None,
    }
}

/// Every SteamID64 is 17 digits and starts with 7656119.
pub fn is_steamid(text: &str) -> bool {
    text.len() == 17 && text.starts_with("7656119") && text.bytes().all(|b| b.is_ascii_digit())
}

fn is_vanity(text: &str) -> bool {
    !text.is_empty() && text.len() <= 64 && text.chars().all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '-')
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
