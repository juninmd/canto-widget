//! What the user picks for the pill: which items, in which order, and how it looks. Plain preferences, never sealed.
use serde::{Deserialize, Serialize};

/// Every item the pill knows; the user's own order is kept, this is only the vocabulary and the Ajustes list.
pub const ITEMS: [&str; 15] = [
    "clock", "cpu", "memory", "gpu", "temp", "disk", "network", "battery", "tasks", "weather", "event", "reviews",
    "notices", "health", "market",
];

#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Edge {
    #[default]
    Top,
    Bottom,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Density {
    Compact,
    #[default]
    Comfortable,
}

const fn yes() -> bool {
    true
}

const fn full() -> u8 {
    100
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct StripConfig {
    #[serde(default)]
    pub enabled: bool,
    #[serde(default)]
    pub edge: Edge,
    #[serde(default = "default_items")]
    pub items: Vec<String>,
    /// Name from `place::monitor_names`; empty or gone means the monitor the widget is on.
    #[serde(default)]
    pub monitor: Option<String>,
    #[serde(default)]
    pub density: Density,
    /// A word next to each number ("CPU 23%") for who doesn't read icons.
    #[serde(default)]
    pub labels: bool,
    #[serde(default = "yes")]
    pub icons: bool,
    /// Pill opacity in %, from 40 (a hint on the wallpaper) to 100.
    #[serde(default = "full")]
    pub opacity: u8,
    /// Mini charts of the last minute on the CPU, memory and network cards.
    #[serde(default = "yes")]
    pub charts: bool,
    /// The "Abrir aba" row under the cards.
    #[serde(default = "yes")]
    pub launcher: bool,
}

fn default_items() -> Vec<String> {
    ["cpu", "weather", "event", "reviews", "notices"].map(String::from).to_vec()
}

impl Default for StripConfig {
    fn default() -> Self {
        Self {
            enabled: false,
            edge: Edge::Top,
            items: default_items(),
            monitor: None,
            density: Density::Comfortable,
            labels: false,
            icons: true,
            opacity: 100,
            charts: true,
            launcher: true,
        }
    }
}

/// Unknown names (a file from a newer build) go away and duplicates collapse; the user's order stays.
pub fn known(items: &[String]) -> Vec<String> {
    let mut out: Vec<String> = Vec::new();
    for item in items {
        if ITEMS.contains(&item.as_str()) && !out.contains(item) {
            out.push(item.clone());
        }
    }
    out
}

impl StripConfig {
    /// What the webview sends is cleaned before it is saved or used.
    pub fn sanitized(mut self) -> Self {
        self.items = known(&self.items);
        self.opacity = self.opacity.clamp(40, 100);
        self.monitor = self.monitor.filter(|m| !m.trim().is_empty()).map(|m| m.chars().take(120).collect());
        self
    }
}
