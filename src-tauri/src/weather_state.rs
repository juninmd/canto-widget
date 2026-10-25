//! The city the Clima tab shows and the forecast cache. The choice lives next to the vault (public data, like
//! the Status API list) and the forecast is RAM only, served for 30 min.
use crate::resilient::LockExt;
use std::path::{Path, PathBuf};
use std::sync::Mutex;

use serde::{Deserialize, Serialize};

use crate::error::Result;
use crate::weather::{Forecast, Place};

const FILE: &str = "clima.json";
pub const TTL_MS: i64 = 30 * 60_000;

#[derive(Default, Serialize, Deserialize)]
struct Saved {
    #[serde(default)]
    place: Option<Place>,
}

pub struct WeatherState {
    path: PathBuf,
    place: Mutex<Option<Place>>,
    cached: Mutex<Option<(i64, Forecast)>>,
}

impl WeatherState {
    pub fn load(dir: &Path) -> Self {
        let path = dir.join(FILE);
        let saved: Saved = crate::store::read_json(&path).ok().flatten().unwrap_or_default();
        Self { path, place: Mutex::new(saved.place), cached: Mutex::new(None) }
    }

    pub fn place(&self) -> Option<Place> {
        self.place.lock_safe().clone()
    }

    /// Changing the city throws the forecast away: it belongs to the old one.
    pub fn set_place(&self, place: Option<Place>) -> Result<()> {
        *self.cached.lock_safe() = None;
        crate::store::write_json_atomic(&self.path, &Saved { place: place.clone() })?;
        *self.place.lock_safe() = place;
        Ok(())
    }

    pub fn fetched_at(&self) -> i64 {
        self.cached.lock_safe().as_ref().map_or(0, |(at, _)| *at)
    }

    /// A fresh reading comes from RAM; `force` (or the floor) goes to the network. The lock is released while
    /// fetching, so a slow API never blocks another tab.
    pub fn forecast(
        &self,
        force: bool,
        now: i64,
        fetch: impl FnOnce(&Place) -> std::result::Result<Forecast, String>,
    ) -> std::result::Result<Forecast, String> {
        if !force {
            if let Some((at, forecast)) = self.cached.lock_safe().clone() {
                if now - at < TTL_MS {
                    return Ok(forecast);
                }
            }
        }
        let place = self.place().ok_or_else(|| "escolha uma cidade".to_string())?;
        let forecast = fetch(&place)?;
        *self.cached.lock_safe() = Some((now, forecast.clone()));
        Ok(forecast)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::weather::{Condition, Day, Hour, Now};

    fn place() -> Place {
        Place {
            city: "São Paulo".into(), admin1: "São Paulo".into(), country: "Brasil".into(), lat: -23.5, lon: -46.6
        }
    }

    fn forecast(temp: f64) -> Forecast {
        Forecast {
            now: Now {
                temp,
                feels: temp,
                condition: Condition::Clear,
                humidity: 50,
                wind: 10.0,
                wind_dir: 90,
                is_day: true,
                gusts: None,
                pressure: None,
                visibility: None,
                dew_point: None,
            },
            hours: vec![Hour {
                at: "2026-10-17T10:00".into(),
                temp,
                rain: 0,
                condition: Condition::Clear,
                feels: temp,
                wind: 0.0,
                wind_dir: 0,
                precip: 0.0,
            }],
            days: vec![Day {
                date: "2026-10-17".into(),
                min: temp,
                max: temp,
                rain: 0,
                condition: Condition::Clear,
                sunrise: String::new(),
                sunset: String::new(),
                uv: 0.0,
            }],
            rain_from: None,
            next_rain: Vec::new(),
            air: None,
        }
    }

    fn dir(name: &str) -> PathBuf {
        let dir = std::env::temp_dir().join(format!("canto-weather-{}-{name}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        dir
    }

    #[test]
    fn the_city_survives_a_restart() {
        let dir = dir("case");
        let state = WeatherState::load(&dir);
        assert_eq!(state.place(), None);
        state.set_place(Some(place())).unwrap();
        assert_eq!(WeatherState::load(&dir).place(), Some(place()));
        let state = WeatherState::load(&dir);
        state.set_place(None).unwrap();
        assert_eq!(WeatherState::load(&dir).place(), None);
        std::fs::remove_dir_all(&dir).unwrap();
    }

    #[test]
    fn a_fresh_forecast_is_served_without_calling_the_api_again() {
        let state = WeatherState::load(&dir("fresh"));
        state.set_place(Some(place())).unwrap();
        let mut calls = 0;
        let first = state.forecast(false, 1_000, |_| {
            calls += 1;
            Ok(forecast(20.0))
        });
        let second = state.forecast(false, 1_000 + TTL_MS - 1, |_| {
            calls += 1;
            Ok(forecast(30.0))
        });
        assert_eq!(calls, 1);
        assert_eq!(first.unwrap().now.temp, 20.0);
        assert_eq!(second.unwrap().now.temp, 20.0);
        assert_eq!(state.fetched_at(), 1_000);
    }

    #[test]
    fn the_floor_and_the_button_both_refetch() {
        let state = WeatherState::load(&dir("floor"));
        state.set_place(Some(place())).unwrap();
        state.forecast(false, 1_000, |_| Ok(forecast(20.0))).unwrap();
        assert_eq!(state.forecast(false, 1_000 + TTL_MS, |_| Ok(forecast(30.0))).unwrap().now.temp, 30.0);
        assert_eq!(state.forecast(true, 1_001, |_| Ok(forecast(40.0))).unwrap().now.temp, 40.0);
    }

    #[test]
    fn without_a_city_there_is_nothing_to_fetch_and_changing_it_clears_the_cache() {
        let state = WeatherState::load(&dir("nocidade"));
        let mut calls = 0;
        assert_eq!(
            state.forecast(false, 0, |_| {
                calls += 1;
                Ok(forecast(20.0))
            }),
            Err("escolha uma cidade".into())
        );
        assert_eq!(calls, 0);
        state.set_place(Some(place())).unwrap();
        state.forecast(false, 0, |_| Ok(forecast(20.0))).unwrap();
        state.set_place(Some(Place { city: "Recife".into(), ..place() })).unwrap();
        assert_eq!(state.fetched_at(), 0, "a previsão antiga não vale para a cidade nova");
    }

    #[test]
    fn a_failed_fetch_is_not_remembered() {
        let state = WeatherState::load(&dir("failed"));
        state.set_place(Some(place())).unwrap();
        assert!(state.forecast(false, 0, |_| Err("sem resposta".into())).is_err());
        assert_eq!(state.fetched_at(), 0);
        assert!(state.forecast(false, 1, |_| Ok(forecast(20.0))).is_ok());
    }
}
