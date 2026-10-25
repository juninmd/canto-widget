//! TomTom, with the user's own key: traffic flow at a point, incidents in a box, travel times with live
//! traffic and the place search. The parsers are pure so the JSON shapes have tests.
use std::time::Duration;

use serde_json::Value;

use crate::traffic::{self, Incident, RouteEta, Spot};

const BASE: &str = "https://api.tomtom.com";
const TIMEOUT_S: u64 = 15;
/// A pane lists the nearest ones; a city at rush hour can have hundreds.
pub const MAX_INCIDENTS: usize = 30;
/// Enough vertices for the line on a widget-sized map.
const ROUTE_POINTS: usize = 160;

pub fn client() -> Result<reqwest::blocking::Client, String> {
    crate::net::client_builder()
        .user_agent("canto-widget")
        .timeout(Duration::from_secs(TIMEOUT_S))
        // Nothing here needs a redirect, and one would be a way out of the API's host.
        .redirect(reqwest::redirect::Policy::none())
        .build()
        .map_err(|e| e.to_string())
}

/// The key goes in the query string, as TomTom requires; errors never echo the URL, so it can't leak into the UI.
pub fn get(client: &reqwest::blocking::Client, url: reqwest::Url) -> Result<Vec<u8>, String> {
    let res = client
        .get(url)
        .send()
        .map_err(|_| crate::lang::tr("sem resposta da TomTom", "no answer from TomTom").to_string())?;
    match res.status().as_u16() {
        401 | 403 => Err(crate::lang::tr("a TomTom recusou a chave", "TomTom refused the key").into()),
        429 => Err(crate::lang::tr("limite diário da chave TomTom atingido", "TomTom key daily limit reached").into()),
        s if !(200..300).contains(&s) => {
            Err(format!("{} {s}", crate::lang::tr("a TomTom respondeu", "TomTom answered")))
        }
        _ => res.bytes().map(|b| b.to_vec()).map_err(crate::error::net_text),
    }
}

pub(crate) fn url(path: &str, params: &[(&str, String)]) -> Result<reqwest::Url, String> {
    reqwest::Url::parse_with_params(&format!("{BASE}{path}"), params).map_err(|e| e.to_string())
}

/// TomTom takes full tags; the app's other languages get English names rather than an error.
pub fn language() -> &'static str {
    match crate::lang::current() {
        "pt-BR" => "pt-BR",
        "es" => "es-ES",
        "fr" => "fr-FR",
        "it" => "it-IT",
        "de" => "de-DE",
        _ => "en-GB",
    }
}

pub fn flow(client: &reqwest::blocking::Client, key: &str, lat: f64, lon: f64) -> Result<Option<(f64, f64)>, String> {
    let u = url(
        "/traffic/services/4/flowSegmentData/absolute/10/json",
        &[("point", format!("{lat},{lon}")), ("unit", "KMPH".into()), ("key", key.into())],
    )?;
    Ok(parse_flow(&get(client, u)?))
}

/// `(current, free_flow)` in km/h; `None` when no road was near the point.
pub fn parse_flow(body: &[u8]) -> Option<(f64, f64)> {
    let v: Value = serde_json::from_slice(body).ok()?;
    let seg = v.get("flowSegmentData")?;
    let closed = seg.get("roadClosure").and_then(Value::as_bool).unwrap_or(false);
    let free = seg.get("freeFlowSpeed")?.as_f64()?;
    let now = if closed { 0.0 } else { seg.get("currentSpeed")?.as_f64()? };
    Some((now, free))
}

pub fn incidents(client: &reqwest::blocking::Client, key: &str, origin: &Spot) -> Result<Vec<Incident>, String> {
    let (a, b, c, d) = traffic::bbox(origin.lat, origin.lon, traffic::RADIUS_KM);
    let fields = "{incidents{geometry{type,coordinates},properties{iconCategory,magnitudeOfDelay,events{description},from,to,delay}}}";
    let u = url(
        "/traffic/services/5/incidentDetails",
        &[
            ("bbox", format!("{a:.5},{b:.5},{c:.5},{d:.5}")),
            ("fields", fields.into()),
            ("language", language().into()),
            ("timeValidityFilter", "present".into()),
            ("key", key.into()),
        ],
    )?;
    Ok(parse_incidents(&get(client, u)?, (origin.lat, origin.lon)))
}

/// Nearest first. A point is `[lon, lat]`; a line is placed at its first vertex, where the trouble starts.
pub fn parse_incidents(body: &[u8], origin: (f64, f64)) -> Vec<Incident> {
    let Ok(v) = serde_json::from_slice::<Value>(body) else { return Vec::new() };
    let Some(items) = v.get("incidents").and_then(Value::as_array) else { return Vec::new() };
    let mut out: Vec<Incident> = items
        .iter()
        .filter_map(|it| {
            let geo = it.get("geometry")?;
            let coords = geo.get("coordinates")?;
            let first = if geo.get("type")?.as_str()? == "Point" { coords } else { coords.get(0)? };
            let (lon, lat) = (first.get(0)?.as_f64()?, first.get(1)?.as_f64()?);
            let p = it.get("properties")?;
            let text_of = |k: &str| p.get(k).and_then(Value::as_str).unwrap_or("").trim().to_string();
            let (from, to) = (text_of("from"), text_of("to"));
            let road = match (from.is_empty(), to.is_empty()) {
                (false, false) if from != to => format!("{from} → {to}"),
                (false, _) => from,
                _ => to,
            };
            let text = p
                .get("events")
                .and_then(Value::as_array)
                .and_then(|e| e.first())
                .and_then(|e| e.get("description"))
                .and_then(Value::as_str)
                .unwrap_or("")
                .to_string();
            Some(Incident {
                kind: traffic::incident_kind(p.get("iconCategory").and_then(Value::as_u64).unwrap_or(0) as u8),
                text,
                road,
                delay_s: p.get("delay").and_then(Value::as_u64).unwrap_or(0) as u32,
                km: (traffic::km_between(origin, (lat, lon)) * 10.0).round() / 10.0,
                lat,
                lon,
                magnitude: p.get("magnitudeOfDelay").and_then(Value::as_u64).unwrap_or(0).min(4) as u8,
            })
        })
        .filter(|i| i.km <= traffic::RADIUS_KM * 1.5)
        .collect();
    out.sort_by(|a, b| a.km.total_cmp(&b.km));
    out.truncate(MAX_INCIDENTS);
    out
}

/// `depart_at` is RFC 3339 or "now"; TomTom predicts from history for a later departure.
pub fn route(
    client: &reqwest::blocking::Client,
    key: &str,
    from: &Spot,
    to: &Spot,
    depart_at: &str,
    with_points: bool,
) -> Result<RouteEta, String> {
    let path = format!("/routing/1/calculateRoute/{},{}:{},{}/json", from.lat, from.lon, to.lat, to.lon);
    let mut params = vec![
        ("traffic", "true".to_string()),
        ("travelMode", "car".into()),
        ("computeTravelTimeFor", "all".into()),
        ("departAt", depart_at.into()),
        ("key", key.into()),
    ];
    if !with_points {
        params.push(("routeRepresentation", "summaryOnly".into()));
    }
    parse_route(&get(client, url(&path, &params)?)?).ok_or_else(|| {
        crate::lang::tr("a rota veio em formato inesperado", "the route came in an unexpected format").into()
    })
}

pub fn parse_route(body: &[u8]) -> Option<RouteEta> {
    let v: Value = serde_json::from_slice(body).ok()?;
    let route = v.get("routes")?.get(0)?;
    let s = route.get("summary")?;
    let secs = |k: &str| s.get(k).and_then(Value::as_f64);
    let now = secs("travelTimeInSeconds")?;
    let free = secs("noTrafficTravelTimeInSeconds").unwrap_or(now - secs("trafficDelayInSeconds").unwrap_or(0.0));
    let points: Vec<[f64; 2]> = route
        .get("legs")
        .and_then(Value::as_array)
        .into_iter()
        .flatten()
        .filter_map(|leg| leg.get("points").and_then(Value::as_array))
        .flatten()
        .filter_map(|p| Some([p.get("latitude")?.as_f64()?, p.get("longitude")?.as_f64()?]))
        .collect();
    Some(RouteEta {
        trip: String::new(),
        minutes: (now / 60.0).round() as u32,
        free_minutes: (free.max(0.0) / 60.0).round() as u32,
        km: (secs("lengthInMeters").unwrap_or(0.0) / 100.0).round() / 10.0,
        points: traffic::decimate(points, ROUTE_POINTS),
        error: None,
    })
}

#[cfg(test)]
#[path = "traffic_feed_tests.rs"]
mod tests;
