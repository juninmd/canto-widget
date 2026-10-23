//! Mapa tab: the TomTom key, the starting point and the saved trips, sealed because they say where someone lives
//! and works. Readings (flow, incidents, travel times, map tiles) live in RAM while the vault is open.
use serde::{Deserialize, Serialize};

use crate::error::Result;
use crate::vault::AppState;

pub const AAD: &[u8] = b"canto.traffic.v1";
/// A pane of trips, not an address book; also bounds the routing requests of one reading.
pub const MAX_TRIPS: usize = 6;
/// Long enough for "Casa da mãe", short enough not to be a payload.
pub const MAX_NAME: usize = 48;
/// TomTom's free tier is 2,500 requests a day; a reading is about a dozen, so five minutes keeps a working day under it.
pub const TTL_MS: i64 = 5 * 60_000;
/// "atualizar" still can't hammer the API.
pub const FLOOR_MS: i64 = 60_000;
/// Incidents within this radius of the starting point.
pub const RADIUS_KM: f64 = 5.0;
const ICONS: [&str; 5] = ["work", "home", "gym", "heart", "pin"];

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Spot {
    pub name: String,
    /// Street, district or city under the name; empty when the search gave none.
    #[serde(default)]
    pub detail: String,
    pub lat: f64,
    pub lon: f64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Trip {
    pub id: String,
    pub name: String,
    pub icon: String,
    pub to: Spot,
}

/// Deliberately not `Debug`: it holds the API key.
#[derive(Default, Clone, Serialize, Deserialize)]
pub struct TrafficConfig {
    #[serde(default)]
    pub api_key: String,
    #[serde(default)]
    pub origin: Option<Spot>,
    #[serde(default)]
    pub trips: Vec<Trip>,
}

impl AppState {
    pub fn traffic_config(&self) -> Result<TrafficConfig> {
        Ok(self.sealed(&crate::store::traffic_path(&self.dir), AAD)?.unwrap_or_default())
    }

    pub fn save_traffic(&self, cfg: &TrafficConfig) -> Result<()> {
        self.save_sealed(&crate::store::traffic_path(&self.dir), AAD, cfg)
    }
}

#[derive(Debug, Serialize)]
pub struct TrafficStatus {
    pub has_key: bool,
    pub origin: Option<Spot>,
    pub trips: Vec<Trip>,
}

pub fn status(cfg: &TrafficConfig) -> TrafficStatus {
    TrafficStatus { has_key: !cfg.api_key.is_empty(), origin: cfg.origin.clone(), trips: cfg.trips.clone() }
}

/// What a TomTom incident is about, as a token the interface translates.
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum IncidentKind {
    Accident,
    Jam,
    Works,
    Closed,
    Hazard,
}

/// TomTom `iconCategory`: 1 accident, 6 jam, 7 lane closed, 8 road closed, 9 road works; the rest is weather or debris.
pub fn incident_kind(category: u8) -> IncidentKind {
    match category {
        1 => IncidentKind::Accident,
        6 => IncidentKind::Jam,
        7 | 8 => IncidentKind::Closed,
        9 => IncidentKind::Works,
        _ => IncidentKind::Hazard,
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Incident {
    pub kind: IncidentKind,
    /// TomTom's own sentence in the app's language ("Acidente", "Trânsito parado"); may be empty.
    pub text: String,
    /// "from → to" as TomTom names the stretch; may be empty.
    pub road: String,
    /// Extra seconds the stretch costs; 0 when unknown or a closure.
    pub delay_s: u32,
    pub km: f64,
    pub lat: f64,
    pub lon: f64,
    /// 0 unknown, 1 minor, 2 moderate, 3 major, 4 closure.
    pub magnitude: u8,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct RouteEta {
    pub trip: String,
    pub minutes: u32,
    pub free_minutes: u32,
    pub km: f64,
    /// The road the trip follows, decimated so a long trip stays a small payload: `[lat, lon]`.
    pub points: Vec<[f64; 2]>,
    /// Set when this trip could not be routed; the others still come.
    pub error: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Reading {
    /// How much slower than free flow the roads around the point are, 0..=100; `None` when no sample answered.
    pub slowdown: Option<u8>,
    pub incidents: Vec<Incident>,
    pub routes: Vec<RouteEta>,
}

/// Fifty-fifty weighting by free-flow speed, so a stopped avenue counts more than a stopped alley.
pub fn slowdown(samples: &[(f64, f64)]) -> Option<u8> {
    let (now, free) =
        samples.iter().filter(|(_, f)| *f > 0.0).fold((0.0, 0.0), |(n, f), (c, ff)| (n + c.min(*ff), f + ff));
    (free > 0.0).then(|| ((1.0 - now / free) * 100.0).round().clamp(0.0, 100.0) as u8)
}

/// Great-circle distance, enough to sort incidents by how near they are.
pub fn km_between(a: (f64, f64), b: (f64, f64)) -> f64 {
    let (la1, la2) = (a.0.to_radians(), b.0.to_radians());
    let dla = la2 - la1;
    let dlo = (b.1 - a.1).to_radians();
    let h = (dla / 2.0).sin().powi(2) + la1.cos() * la2.cos() * (dlo / 2.0).sin().powi(2);
    6371.0 * 2.0 * h.sqrt().asin()
}

/// `(min_lon, min_lat, max_lon, max_lat)` of a square `km` around the point.
pub fn bbox(lat: f64, lon: f64, km: f64) -> (f64, f64, f64, f64) {
    let dlat = km / 111.0;
    let dlon = km / (111.0 * lat.to_radians().cos().max(0.01));
    (lon - dlon, lat - dlat, lon + dlon, lat + dlat)
}

/// Four points around the start, so the slowdown speaks for the neighborhood and not for one street.
pub fn sample_points(lat: f64, lon: f64) -> Vec<(f64, f64)> {
    let (min_lon, min_lat, max_lon, max_lat) = bbox(lat, lon, 1.2);
    vec![(lat, lon), (max_lat, lon), (min_lat, lon), (lat, max_lon), (lat, min_lon)]
}

/// At most `max` points, always keeping the last one so the line ends at the destination.
pub fn decimate(points: Vec<[f64; 2]>, max: usize) -> Vec<[f64; 2]> {
    if points.len() <= max || max < 2 {
        return points;
    }
    let step = points.len().div_ceil(max - 1);
    let last = *points.last().unwrap();
    let mut out: Vec<[f64; 2]> = points.into_iter().step_by(step).collect();
    if out.last() != Some(&last) {
        out.push(last);
    }
    out
}

fn clean_text(value: &str, max: usize) -> Option<String> {
    let text = value.trim();
    (text.chars().count() <= max && !text.chars().any(char::is_control)).then(|| text.to_string())
}

/// A spot coming back from the webview: a name is required and the point has to be on Earth.
pub fn clean_spot(spot: Spot) -> Option<Spot> {
    let on_earth = spot.lat.is_finite()
        && spot.lon.is_finite()
        && (-90.0..=90.0).contains(&spot.lat)
        && (-180.0..=180.0).contains(&spot.lon);
    let name = clean_text(&spot.name, 120).filter(|n| !n.is_empty())?;
    on_earth.then_some(Spot { name, detail: clean_text(&spot.detail, 160)?, lat: spot.lat, lon: spot.lon })
}

pub fn clean_trip_name(name: &str) -> Option<String> {
    clean_text(name, MAX_NAME).filter(|n| !n.is_empty())
}

/// Unknown icons fall back to a pin instead of failing: it is decoration.
pub fn clean_icon(icon: &str) -> String {
    if ICONS.contains(&icon) { icon } else { "pin" }.to_string()
}

/// A TomTom key is 32 alphanumerics; anything else is a paste mistake, refused before it reaches the network.
pub fn clean_key(key: &str) -> Option<String> {
    let key = key.trim();
    (key.len() >= 16 && key.len() <= 64 && key.chars().all(|c| c.is_ascii_alphanumeric())).then(|| key.to_string())
}

#[cfg(test)]
#[path = "traffic_tests.rs"]
mod tests;
