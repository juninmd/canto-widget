//! Mini-dashboard: a small always-visible pill on the top or bottom edge (CPU, weather, next event, reviews, notices)
//! in its own window. Only preferences live on disk; the numbers come from caches the app already keeps.
pub mod cmd;
pub mod place;
pub mod snapshot;

use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU32, Ordering};
use std::sync::Mutex;
use std::time::Duration;

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

use crate::error::Result;
use crate::resilient::LockExt;

/// Declared in `tauri.conf.json` (hidden, never created at runtime).
pub const WINDOW: &str = "strip";
const FILE: &str = "minipainel.json";
const TICK: Duration = Duration::from_secs(2);
/// Order of the pill; the config keeps whichever the user switched on, in this order.
pub const ITEMS: [&str; 6] = ["cpu", "memory", "weather", "event", "reviews", "notices"];

#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Edge {
    #[default]
    Top,
    Bottom,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct StripConfig {
    #[serde(default)]
    pub enabled: bool,
    #[serde(default)]
    pub edge: Edge,
    #[serde(default = "default_items")]
    pub items: Vec<String>,
}

fn default_items() -> Vec<String> {
    ["cpu", "weather", "event", "reviews", "notices"].map(String::from).to_vec()
}

impl Default for StripConfig {
    fn default() -> Self {
        Self { enabled: false, edge: Edge::Top, items: default_items() }
    }
}

/// Unknown names (a file from a newer build) go away; duplicates collapse; the order is the pill's.
pub fn known(items: &[String]) -> Vec<String> {
    ITEMS.iter().filter(|k| items.iter().any(|x| x == *k)).map(|k| k.to_string()).collect()
}

pub struct StripState {
    path: PathBuf,
    cfg: Mutex<StripConfig>,
    /// Fed by the tray's tick, which already asks the forges: the pill never goes to the network itself.
    reviews: AtomicU32,
}

impl StripState {
    pub fn load(dir: &Path) -> Self {
        let path = dir.join(FILE);
        let mut cfg: StripConfig = crate::store::read_json(&path).ok().flatten().unwrap_or_default();
        cfg.items = known(&cfg.items);
        Self { path, cfg: Mutex::new(cfg), reviews: AtomicU32::new(0) }
    }

    pub fn cfg(&self) -> StripConfig {
        self.cfg.lock_safe().clone()
    }

    pub fn set(&self, mut cfg: StripConfig) -> Result<StripConfig> {
        cfg.items = known(&cfg.items);
        crate::store::write_json_atomic(&self.path, &cfg)?;
        *self.cfg.lock_safe() = cfg.clone();
        Ok(cfg)
    }

    pub fn reviews(&self) -> u32 {
        self.reviews.load(Ordering::Relaxed)
    }

    pub fn set_reviews(&self, count: u32) {
        self.reviews.store(count, Ordering::Relaxed);
    }
}

/// Called by the tray's tick; a no-op until the state exists.
pub fn feed_reviews(app: &AppHandle, count: u64) {
    if let Some(state) = app.try_state::<StripState>() {
        state.set_reviews(count.min(u64::from(u32::MAX)) as u32);
    }
}

pub fn watch(app: AppHandle) {
    crate::resilient::supervise("strip", move || loop {
        place::sync(&app);
        std::thread::sleep(TICK);
    });
}

#[cfg(test)]
#[path = "tests.rs"]
mod tests;
