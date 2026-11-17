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

/// Where along the edge the pill sits.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Align {
    Start,
    #[default]
    Center,
    End,
}

/// How the pill is painted: the theme's panel, frosted glass, or only an outline.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Surface {
    #[default]
    Solid,
    Glass,
    Outline,
}

const fn yes() -> bool {
    true
}

const fn full() -> u8 {
    100
}

const fn two() -> u8 {
    2
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
    /// Left, middle or right along the edge.
    #[serde(default)]
    pub align: Align,
    /// Where the user dragged the pill: its center as a fraction (0 to 1) of the work area's width. Wins over `align`.
    #[serde(default)]
    pub pos: Option<f64>,
    /// Space between the pill and the screen edge (and the corner, when not centered), in px: 0 to 64.
    #[serde(default)]
    pub gap: u8,
    /// Pill and cards zoom in %, from 80 to 140.
    #[serde(default = "full")]
    pub scale: u8,
    #[serde(default)]
    pub surface: Surface,
    /// The thin lines between the numbers.
    #[serde(default = "yes")]
    pub dividers: bool,
    /// Seconds between readings: 1 to 30.
    #[serde(default = "two")]
    pub refresh: u8,
    /// Details open on hover; off means only a click opens them.
    #[serde(default = "yes")]
    pub hover: bool,
    /// Off keeps the pill on screen over a full-screen app too.
    #[serde(default = "yes")]
    pub hide_fullscreen: bool,
    /// Columns of cards in the details: 1 or 2.
    #[serde(default = "two")]
    pub columns: u8,
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
            align: Align::Center,
            pos: None,
            gap: 0,
            scale: 100,
            surface: Surface::Solid,
            dividers: true,
            refresh: 2,
            hover: true,
            hide_fullscreen: true,
            columns: 2,
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
        self.gap = self.gap.min(64);
        self.pos = self.pos.filter(|p| p.is_finite()).map(|p| p.clamp(0.0, 1.0));
        self.scale = self.scale.clamp(80, 140);
        self.refresh = self.refresh.clamp(1, 30);
        self.columns = self.columns.clamp(1, 2);
        self.monitor = self.monitor.filter(|m| !m.trim().is_empty()).map(|m| m.chars().take(120).collect());
        self
    }
}
