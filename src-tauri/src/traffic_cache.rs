//! RAM-only cache for the Mapa tab: readings, map tiles and today's slowdown line. Nothing here touches disk.
use std::collections::HashMap;
use std::sync::Mutex;

use serde::Serialize;

use crate::error::Result;

struct Entry {
    at: i64,
    json: String,
}

/// RAM-only readings and tiles, keyed by what was asked; `clear` drops everything on lock or when the place changes.
#[derive(Default)]
pub struct TrafficCache {
    entries: Mutex<HashMap<String, Entry>>,
    /// Today's slowdown readings `(at_ms, percent)`, for the line under the gauge.
    history: Mutex<Vec<(i64, u8)>>,
}

/// Tiles of a few zoom levels plus the readings; the oldest go first.
const MAX_ENTRIES: usize = 400;

impl TrafficCache {
    pub fn get_or<T: serde::de::DeserializeOwned + Serialize>(
        &self,
        key: &str,
        ttl: i64,
        now: i64,
        fetch: impl FnOnce() -> Result<T>,
    ) -> Result<(T, i64)> {
        let hit = self.entries.lock().unwrap().get(key).filter(|e| now - e.at < ttl).map(|e| (e.json.clone(), e.at));
        if let Some((json, at)) = hit {
            return Ok((serde_json::from_str(&json)?, at));
        }
        let value = fetch()?;
        let mut map = self.entries.lock().unwrap();
        map.insert(key.to_string(), Entry { at: now, json: serde_json::to_string(&value)? });
        while map.len() > MAX_ENTRIES {
            let Some(oldest) = map.iter().min_by_key(|(_, e)| e.at).map(|(k, _)| k.clone()) else {
                break;
            };
            map.remove(&oldest);
        }
        Ok((value, now))
    }

    pub fn fetched_at(&self, key: &str) -> i64 {
        self.entries.lock().unwrap().get(key).map_or(0, |e| e.at)
    }

    /// Keeps one reading per refresh and only the last 24 hours.
    pub fn record(&self, at: i64, slowdown: u8) -> Vec<(i64, u8)> {
        let mut history = self.history.lock().unwrap();
        if history.last().is_none_or(|(last, _)| *last != at) {
            history.push((at, slowdown));
        }
        history.retain(|(t, _)| at - t < 24 * 3_600_000);
        history.clone()
    }

    pub fn history(&self) -> Vec<(i64, u8)> {
        self.history.lock().unwrap().clone()
    }

    pub fn clear(&self) {
        self.entries.lock().unwrap().clear();
        self.history.lock().unwrap().clear();
    }
}
