//! The map behind the Mapa tab: a 3×3 block of 256 px tiles around the starting point, downloaded here and
//! handed to the webview as data URLs, so the CSP keeps allowing no remote image origin.
use base64::{engine::general_purpose::STANDARD as B64, Engine};
use serde::{Deserialize, Serialize};

use crate::traffic_cache::TrafficCache;

pub const MIN_ZOOM: u8 = 11;
pub const MAX_ZOOM: u8 = 17;
pub const DEFAULT_ZOOM: u8 = 14;
/// A street map barely changes; the traffic layer is what moves.
const BASE_TTL_MS: i64 = 24 * 3_600_000;
const FLOW_TTL_MS: i64 = 2 * 60_000;
/// A tile is a few tens of KB; anything bigger is not a map tile.
const MAX_TILE: usize = 512 * 1024;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tile {
    pub x: u32,
    pub y: u32,
    /// `data:image/png;base64,...`, empty when the download failed.
    pub base: String,
    /// The traffic colors on a transparent tile, laid over `base`; empty without a key.
    pub flow: String,
}

#[derive(Debug, Serialize)]
pub struct MapTiles {
    pub zoom: u8,
    pub tiles: Vec<Tile>,
    /// "tomtom" or "osm", for the credit line under the map.
    pub source: &'static str,
}

/// Web Mercator, as every slippy map: the tile that holds the point, plus where inside the world it falls, in tiles.
pub fn world(lat: f64, lon: f64, zoom: u8) -> (f64, f64) {
    let n = f64::from(1u32 << zoom);
    let lat = lat.clamp(-85.05, 85.05).to_radians();
    let x = (lon + 180.0) / 360.0 * n;
    let y = (1.0 - (lat.tan() + 1.0 / lat.cos()).ln() / std::f64::consts::PI) / 2.0 * n;
    (x, y)
}

/// The 3×3 block centered on the point's tile, wrapping around the antimeridian and dropping rows past the poles.
pub fn block(lat: f64, lon: f64, zoom: u8) -> Vec<(u32, u32)> {
    let n = 1i64 << zoom;
    let (x, y) = world(lat, lon, zoom);
    let (cx, cy) = (x.floor() as i64, y.floor() as i64);
    let mut out = Vec::with_capacity(9);
    for dy in -1..=1 {
        for dx in -1..=1 {
            let ty = cy + dy;
            if (0..n).contains(&ty) {
                out.push((((cx + dx).rem_euclid(n)) as u32, ty as u32));
            }
        }
    }
    out
}

fn base_url(key: &str, dark: bool, z: u8, x: u32, y: u32) -> String {
    if key.is_empty() {
        format!("https://tile.openstreetmap.org/{z}/{x}/{y}.png")
    } else {
        let style = if dark { "night" } else { "main" };
        format!("https://api.tomtom.com/map/1/tile/basic/{style}/{z}/{x}/{y}.png?key={key}")
    }
}

fn flow_url(key: &str, dark: bool, z: u8, x: u32, y: u32) -> String {
    let style = if dark { "relative0-dark" } else { "relative0" };
    format!("https://api.tomtom.com/traffic/map/4/tile/flow/{style}/{z}/{x}/{y}.png?key={key}")
}

fn download(client: &reqwest::blocking::Client, url: &str) -> String {
    let Ok(res) = client.get(url).send() else { return String::new() };
    if !res.status().is_success() {
        return String::new();
    }
    match res.bytes() {
        Ok(b) if b.len() <= MAX_TILE && b.starts_with(b"\x89PNG") => {
            format!("data:image/png;base64,{}", B64.encode(&b))
        }
        _ => String::new(),
    }
}

/// Cached by tile and style, never by key, so the sealed key does not end up as a map key in RAM.
fn cached(
    cache: &TrafficCache,
    client: &reqwest::blocking::Client,
    id: String,
    url: &str,
    ttl: i64,
    now: i64,
) -> String {
    cache.get_or(&id, ttl, now, || Ok(download(client, url))).map(|(v, _)| v).unwrap_or_default()
}

pub fn fetch(
    cache: &TrafficCache,
    key: &str,
    lat: f64,
    lon: f64,
    zoom: u8,
    dark: bool,
    now: i64,
) -> Result<MapTiles, String> {
    let zoom = zoom.clamp(MIN_ZOOM, MAX_ZOOM);
    let client = crate::traffic_feed::client()?;
    let source = if key.is_empty() { "osm" } else { "tomtom" };
    let tiles = std::thread::scope(|s| {
        let jobs: Vec<_> = block(lat, lon, zoom)
            .into_iter()
            .map(|(x, y)| {
                let client = &client;
                s.spawn(move || {
                    let base = cached(
                        cache,
                        client,
                        format!("tile:{source}:{dark}:{zoom}/{x}/{y}"),
                        &base_url(key, dark, zoom, x, y),
                        BASE_TTL_MS,
                        now,
                    );
                    let flow = if key.is_empty() {
                        String::new()
                    } else {
                        cached(
                            cache,
                            client,
                            format!("flow:{dark}:{zoom}/{x}/{y}"),
                            &flow_url(key, dark, zoom, x, y),
                            FLOW_TTL_MS,
                            now,
                        )
                    };
                    Tile { x, y, base, flow }
                })
            })
            .collect();
        jobs.into_iter().filter_map(|j| j.join().ok()).collect()
    });
    Ok(MapTiles { zoom, tiles, source })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_point_falls_in_the_tile_every_slippy_map_agrees_on() {
        // São Paulo's Praça da Sé at zoom 14 is tile 6069/9295 on OpenStreetMap.
        let (x, y) = world(-23.5505, -46.6333, 14);
        assert_eq!((x.floor() as u32, y.floor() as u32), (6069, 9295));
    }

    #[test]
    fn the_block_is_three_by_three_around_the_point_and_wraps_at_the_antimeridian() {
        let tiles = block(0.0, 179.99, 11);
        assert_eq!(tiles.len(), 9);
        assert!(tiles.iter().any(|(x, _)| *x == 0), "the column east of the last one is column 0");
        assert!(block(85.05, 0.0, 11).len() < 9, "no rows above the top of the map");
    }

    #[test]
    fn without_a_key_the_map_is_openstreetmap_and_with_one_it_is_tomtom() {
        assert!(base_url("", true, 14, 1, 2).starts_with("https://tile.openstreetmap.org/14/1/2.png"));
        assert!(base_url("k", true, 14, 1, 2).contains("/basic/night/14/1/2.png?key=k"));
        assert!(flow_url("k", false, 14, 1, 2).contains("/flow/relative0/14/1/2.png"));
    }
}
