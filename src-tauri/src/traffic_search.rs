//! TomTom's place search, for the starting point and the trips, and the cheap call that proves a key.
use serde_json::Value;

use crate::traffic::{self, Spot};
use crate::traffic_feed::{client, get, language, url};

const MATCHES: &str = "6";

pub fn search(
    client: &reqwest::blocking::Client,
    key: &str,
    query: &str,
    near: Option<&Spot>,
) -> Result<Vec<Spot>, String> {
    let encoded: String = url::form_urlencoded::byte_serialize(query.as_bytes()).collect();
    let mut params = vec![("limit", MATCHES.to_string()), ("language", language().into()), ("key", key.into())];
    if let Some(near) = near {
        params.push(("lat", near.lat.to_string()));
        params.push(("lon", near.lon.to_string()));
    }
    Ok(parse_search(&get(client, url(&format!("/search/2/search/{encoded}.json"), &params)?)?))
}

/// A business shows its own name over the address; a street shows the address with its city below.
pub fn parse_search(body: &[u8]) -> Vec<Spot> {
    let Ok(v) = serde_json::from_slice::<Value>(body) else { return Vec::new() };
    let Some(items) = v.get("results").and_then(Value::as_array) else { return Vec::new() };
    items
        .iter()
        .filter_map(|r| {
            let pos = r.get("position")?;
            let addr = r.get("address");
            let field = |k: &str| addr.and_then(|a| a.get(k)).and_then(Value::as_str).unwrap_or("").to_string();
            let poi = r.get("poi").and_then(|p| p.get("name")).and_then(Value::as_str).unwrap_or("").to_string();
            let free = field("freeformAddress");
            let (name, detail) = if poi.is_empty() { (free, field("municipality")) } else { (poi, free) };
            traffic::clean_spot(Spot { name, detail, lat: pos.get("lat")?.as_f64()?, lon: pos.get("lon")?.as_f64()? })
        })
        .collect()
}

/// Cheapest call that proves a key: one geocode.
pub fn check_key(key: &str) -> Result<(), String> {
    let client = client()?;
    get(&client, url("/search/2/geocode/Brasil.json", &[("limit", "1".into()), ("key", key.into())])?).map(|_| ())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn search_prefers_the_place_name_over_the_address() {
        let body = r#"{"results":[
          {"poi":{"name":"Academia Exemplo"},"address":{"freeformAddress":"Rua Fictícia, 10, Aurora","municipality":"Aurora"},"position":{"lat":-23.5,"lon":-46.6}},
          {"address":{"freeformAddress":"Avenida Aurora, 200","municipality":"Aurora"},"position":{"lat":-23.4,"lon":-46.5}}
        ]}"#;
        let list = parse_search(body.as_bytes());
        assert_eq!(list[0].name, "Academia Exemplo");
        assert_eq!(list[0].detail, "Rua Fictícia, 10, Aurora");
        assert_eq!((list[1].name.as_str(), list[1].detail.as_str()), ("Avenida Aurora, 200", "Aurora"));
    }
}
