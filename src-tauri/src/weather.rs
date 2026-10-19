//! Open-Meteo, keyless: resolving a city name to coordinates and the forecast for it. Public data, no vault.
use std::time::Duration;

use serde::{Deserialize, Serialize};

const GEOCODE: &str = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST: &str = "https://api.open-meteo.com/v1/forecast";
const TIMEOUT_S: u64 = 15;
/// Long enough for "São Paulo" and short enough not to be a payload.
pub const MAX_CITY: usize = 64;
/// The card shows a window of the API's answer; asking for less keeps the payload small.
const HOURS: u8 = 24;
const DAYS: u8 = 7;
/// Rain from this probability on is worth a line on the card.
pub const RAIN_CHANCE: u8 = 50;
/// Enough candidates to disambiguate ("Londres" has a dozen), few enough to stay a list on the card.
const MATCHES: u8 = 8;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Place {
    pub city: String,
    /// State or region, so two cities with the same name can be told apart; empty when the API omits it.
    #[serde(default)]
    pub admin1: String,
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
    /// Relative humidity in percent.
    pub humidity: u8,
    /// Wind speed in km/h and the direction it blows *from*, in degrees.
    pub wind: f64,
    pub wind_dir: u16,
    /// Night changes the sky and the icons; an API that omits it reads as day.
    pub is_day: bool,
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
    /// ISO local times of the sun, empty when the API omits them (polar day and night).
    pub sunrise: String,
    pub sunset: String,
    pub uv: f64,
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
    admin1: Option<String>,
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
    #[serde(default)]
    relative_humidity_2m: Option<f64>,
    #[serde(default)]
    wind_speed_10m: Option<f64>,
    #[serde(default)]
    wind_direction_10m: Option<f64>,
    #[serde(default)]
    is_day: Option<u8>,
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
    #[serde(default)]
    sunrise: Vec<Option<String>>,
    #[serde(default)]
    sunset: Vec<Option<String>>,
    #[serde(default)]
    uv_index_max: Vec<Option<f64>>,
}

/// Every match the API sent, in its own order (ranked by population and relevance). Rows that would not survive
/// `clean_place` are dropped here, so the UI never offers a city the backend would refuse to save.
pub fn parse_places(body: &[u8]) -> Vec<Place> {
    let Ok(geo) = serde_json::from_slice::<RawGeo>(body) else {
        return Vec::new();
    };
    geo.results
        .into_iter()
        .filter_map(|raw| {
            clean_place(Place {
                city: raw.name,
                admin1: raw.admin1.unwrap_or_default(),
                country: raw.country.unwrap_or_default(),
                lat: raw.latitude,
                lon: raw.longitude,
            })
        })
        .collect()
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
                        sunrise: daily.sunrise.get(i).cloned().flatten().unwrap_or_default(),
                        sunset: daily.sunset.get(i).cloned().flatten().unwrap_or_default(),
                        uv: daily.uv_index_max.get(i).copied().flatten().filter(|uv| uv.is_finite()).unwrap_or(0.0),
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
            humidity: percent(current.relative_humidity_2m),
            wind: current.wind_speed_10m.filter(|w| w.is_finite()).unwrap_or(0.0).max(0.0),
            wind_dir: current.wind_direction_10m.filter(|d| d.is_finite()).map_or(0, |d| d.rem_euclid(360.0) as u16),
            is_day: current.is_day.unwrap_or(1) != 0,
        },
        rain_from: hours.iter().find(|h| h.rain >= RAIN_CHANCE).map(|h| h.at.clone()),
        hours,
        days,
    })
}

fn percent(value: Option<f64>) -> u8 {
    value.filter(|v| v.is_finite()).map_or(0, |v| v.clamp(0.0, 100.0).round() as u8)
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

/// Optional display text the API may omit (state, country): trimmed, bounded, no control characters.
fn clean_optional(value: &str) -> Option<String> {
    let trimmed = value.trim();
    (trimmed.chars().count() <= MAX_CITY && !trimmed.chars().any(|c| c.is_control())).then(|| trimmed.to_string())
}

/// Everything but the coordinates is display text, and the chosen place comes back from the webview: a city name
/// is required and the coordinates have to be a real point on Earth, so a bad payload is refused instead of saved.
pub fn clean_place(place: Place) -> Option<Place> {
    let on_earth = place.lat.is_finite()
        && place.lon.is_finite()
        && (-90.0..=90.0).contains(&place.lat)
        && (-180.0..=180.0).contains(&place.lon);
    if !on_earth {
        return None;
    }
    Some(Place {
        city: clean_city(&place.city)?,
        admin1: clean_optional(&place.admin1)?,
        country: clean_optional(&place.country)?,
        lat: place.lat,
        lon: place.lon,
    })
}

/// Open-Meteo ranks "Londres" without the language by population, which puts Argentina and Mexico above the
/// United Kingdom and leaves no way to pick. The language localises the names and lifts the city people mean.
pub fn search(query: &str) -> Result<Vec<Place>, String> {
    let client = client()?;
    let language = crate::lang::current().split('-').next().unwrap_or("en").to_string();
    let matches = MATCHES.to_string();
    let url = reqwest::Url::parse_with_params(
        GEOCODE,
        [("name", query), ("count", &matches), ("format", "json"), ("language", &language)],
    )
    .map_err(|e| e.to_string())?;
    let body = body(&client, url)?;
    Ok(parse_places(&body))
}

pub fn forecast(place: &Place) -> Result<Forecast, String> {
    let client = client()?;
    let url = reqwest::Url::parse_with_params(
        FORECAST,
        [
            ("latitude", place.lat.to_string()),
            ("longitude", place.lon.to_string()),
            (
                "current",
                "temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m,wind_direction_10m,is_day"
                    .into(),
            ),
            ("hourly", "temperature_2m,precipitation_probability,weather_code".into()),
            (
                "daily",
                "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max"
                    .into(),
            ),
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
