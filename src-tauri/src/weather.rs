//! Open-Meteo, keyless: resolving a city name to coordinates and the forecast for it. Public data, no vault.
use std::time::Duration;

use serde::{Deserialize, Serialize};

const GEOCODE: &str = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST: &str = "https://api.open-meteo.com/v1/forecast";
const TIMEOUT_S: u64 = 15;
/// Long enough for "São Paulo" and short enough not to be a payload.
pub const MAX_CITY: usize = 64;
/// The card shows a window of the API's answer; asking for less keeps the payload small.
const HOURS: u8 = 12;
const DAYS: u8 = 5;
/// Rain from this probability on is worth a line on the card.
pub const RAIN_CHANCE: u8 = 50;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Place {
    pub city: String,
    pub country: String,
    pub lat: f64,
    pub lon: f64,
}

/// WMO 4677 groups: the UI turns each one into a sentence in the user's language.
#[derive(Debug, Clone, Copy, PartialEq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum Condition {
    Clear,
    Cloudy,
    Fog,
    Drizzle,
    Rain,
    Snow,
    Storm,
}

pub fn condition(code: u8) -> Condition {
    match code {
        0 | 1 => Condition::Clear,
        2 | 3 => Condition::Cloudy,
        45 | 48 => Condition::Fog,
        51..=57 => Condition::Drizzle,
        61..=65 | 80..=82 | 66 | 67 => Condition::Rain,
        71..=77 | 85 | 86 => Condition::Snow,
        _ => Condition::Storm,
    }
}

#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct Now {
    pub temp: f64,
    pub feels: f64,
    pub condition: Condition,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct Hour {
    /// ISO local time as the API sends it, already in the city's timezone.
    pub at: String,
    pub temp: f64,
    pub rain: u8,
    pub condition: Condition,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct Day {
    pub date: String,
    pub min: f64,
    pub max: f64,
    pub rain: u8,
    pub condition: Condition,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct Forecast {
    pub now: Now,
    pub hours: Vec<Hour>,
    pub days: Vec<Day>,
    /// The first hour with a real chance of rain, for the warning line.
    pub rain_from: Option<String>,
}

#[derive(Deserialize)]
struct RawGeo {
    #[serde(default)]
    results: Vec<RawPlace>,
}

#[derive(Deserialize)]
struct RawPlace {
    name: String,
    latitude: f64,
    longitude: f64,
    #[serde(default)]
    country: Option<String>,
}

#[derive(Deserialize)]
struct RawForecast {
    current: Option<RawCurrent>,
    hourly: Option<RawHourly>,
    daily: Option<RawDaily>,
}

#[derive(Deserialize)]
struct RawCurrent {
    temperature_2m: f64,
    apparent_temperature: f64,
    weather_code: u8,
}

#[derive(Deserialize)]
struct RawHourly {
    #[serde(default)]
    time: Vec<String>,
    #[serde(default)]
    temperature_2m: Vec<f64>,
    #[serde(default)]
    precipitation_probability: Vec<Option<u8>>,
    #[serde(default)]
    weather_code: Vec<u8>,
}

#[derive(Deserialize)]
struct RawDaily {
    #[serde(default)]
    time: Vec<String>,
    #[serde(default)]
    temperature_2m_max: Vec<f64>,
    #[serde(default)]
    temperature_2m_min: Vec<f64>,
    #[serde(default)]
    precipitation_probability_max: Vec<Option<u8>>,
    #[serde(default)]
    weather_code: Vec<u8>,
}

/// The first match, which is the best one: Open-Meteo ranks by population and relevance.
pub fn parse_place(body: &[u8]) -> Option<Place> {
    let geo: RawGeo = serde_json::from_slice(body).ok()?;
    let first = geo.results.into_iter().next()?;
    Some(Place {
        city: first.name,
        country: first.country.unwrap_or_default(),
        lat: first.latitude,
        lon: first.longitude,
    })
}

/// A forecast without the current reading or without hours is not worth a card.
pub fn parse_forecast(body: &[u8]) -> Option<Forecast> {
    let raw: RawForecast = serde_json::from_slice(body).ok()?;
    let current = raw.current?;
    let hourly = raw.hourly?;
    let hours: Vec<Hour> = hourly
        .time
        .iter()
        .enumerate()
        .filter_map(|(i, at)| {
            let temp = *hourly.temperature_2m.get(i)?;
            if !temp.is_finite() {
                return None;
            }
            let code = *hourly.weather_code.get(i)?;
            Some(Hour {
                at: at.clone(),
                temp,
                rain: hourly.precipitation_probability.get(i).copied().flatten().unwrap_or(0),
                condition: condition(code),
            })
        })
        .collect();
    if hours.is_empty() {
        return None;
    }
    let days: Vec<Day> = raw
        .daily
        .map(|daily| {
            daily
                .time
                .iter()
                .enumerate()
                .filter_map(|(i, date)| {
                    Some(Day {
                        date: date.clone(),
                        min: *daily.temperature_2m_min.get(i)?,
                        max: *daily.temperature_2m_max.get(i)?,
                        rain: daily.precipitation_probability_max.get(i).copied().flatten().unwrap_or(0),
                        condition: condition(*daily.weather_code.get(i)?),
                    })
                })
                .collect()
        })
        .unwrap_or_default();
    Some(Forecast {
        now: Now {
            temp: current.temperature_2m,
            feels: current.apparent_temperature,
            condition: condition(current.weather_code),
        },
        rain_from: hours.iter().find(|h| h.rain >= RAIN_CHANCE).map(|h| h.at.clone()),
        hours,
        days,
    })
}

pub fn client() -> Result<reqwest::blocking::Client, String> {
    crate::net::client_builder()
        .user_agent("canto-widget")
        .timeout(Duration::from_secs(TIMEOUT_S))
        // Nothing here needs a redirect, and one would be a way out of the API's host.
        .redirect(reqwest::redirect::Policy::none())
        .build()
        .map_err(|e| e.to_string())
}

fn body(client: &reqwest::blocking::Client, url: reqwest::Url) -> Result<Vec<u8>, String> {
    let res = client.get(url).send().map_err(|_| "sem resposta da Open-Meteo".to_string())?;
    match res.status().as_u16() {
        429 => Err("limite de buscas da Open-Meteo atingido".into()),
        s if !(200..300).contains(&s) => Err(format!("a Open-Meteo respondeu {s}")),
        _ => res.bytes().map(|b| b.to_vec()).map_err(|e| e.to_string()),
    }
}

/// The city name comes from the UI: trimmed, non-empty and short, nothing else is read from it.
pub fn clean_city(name: &str) -> Option<String> {
    let city = name.trim();
    let ok = !city.is_empty()
        && city.chars().count() <= MAX_CITY
        && !city.chars().any(|c| c.is_control())
        && city.chars().any(char::is_alphanumeric);
    ok.then(|| city.to_string())
}

pub fn geocode(city: &str) -> Result<Place, String> {
    let client = client()?;
    let url = reqwest::Url::parse_with_params(GEOCODE, [("name", city), ("count", "1"), ("format", "json")])
        .map_err(|e| e.to_string())?;
    let body = body(&client, url)?;
    parse_place(&body).ok_or_else(|| format!("cidade não encontrada: {city}"))
}

pub fn forecast(place: &Place) -> Result<Forecast, String> {
    let client = client()?;
    let url = reqwest::Url::parse_with_params(
        FORECAST,
        [
            ("latitude", place.lat.to_string()),
            ("longitude", place.lon.to_string()),
            ("current", "temperature_2m,apparent_temperature,weather_code".into()),
            ("hourly", "temperature_2m,precipitation_probability,weather_code".into()),
            ("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max".into()),
            ("timezone", "auto".into()),
            ("forecast_hours", HOURS.to_string()),
            ("forecast_days", DAYS.to_string()),
        ],
    )
    .map_err(|e| e.to_string())?;
    let body = body(&client, url)?;
    parse_forecast(&body).ok_or_else(|| "a previsão veio em formato inesperado".to_string())
}

#[cfg(test)]
#[path = "weather_tests.rs"]
mod tests;
