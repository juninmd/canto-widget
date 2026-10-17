//! Clima tab commands: the saved city plus the Open-Meteo forecast, cached for 30 min. Public data, no vault.
use serde::Serialize;
use tauri::{AppHandle, Manager};

use crate::blocking::run;
use crate::error::{AppError, Result};
use crate::model::now_ms;
use crate::weather::{self, Forecast, Place};
use crate::weather_state::WeatherState;

#[derive(Serialize)]
pub struct WeatherView {
    pub place: Option<Place>,
    pub forecast: Option<Forecast>,
    pub fetched_at: i64,
    /// pt-BR text when this reading failed; a saved city still comes through with it.
    pub error: Option<String>,
}

fn view(state: &WeatherState, forecast: std::result::Result<Forecast, String>) -> WeatherView {
    match forecast {
        Ok(forecast) => {
            WeatherView { place: state.place(), forecast: Some(forecast), fetched_at: state.fetched_at(), error: None }
        }
        Err(error) => {
            WeatherView { place: state.place(), forecast: None, fetched_at: state.fetched_at(), error: Some(error) }
        }
    }
}

#[tauri::command]
pub async fn weather_get(app: AppHandle, force: bool) -> WeatherView {
    run(move || {
        let state = app.state::<WeatherState>();
        let forecast = state.forecast(force, now_ms(), weather::forecast);
        Ok::<_, AppError>(view(&state, forecast))
    })
    .await
    .unwrap_or_else(|error| WeatherView {
        place: None,
        forecast: None,
        fetched_at: 0,
        error: Some(error.to_string()),
    })
}

/// The name is validated here and resolved by Open-Meteo; the coordinates are what get saved, so a rename
/// upstream never moves the card to another city.
#[tauri::command]
pub async fn weather_set_city(app: AppHandle, city: String) -> Result<WeatherView> {
    let city = weather::clean_city(&city).ok_or_else(|| AppError::Config("cidade inválida".into()))?;
    run(move || {
        let state = app.state::<WeatherState>();
        let place = weather::geocode(&city).map_err(AppError::Config)?;
        state.set_place(Some(place))?;
        let forecast = state.forecast(true, now_ms(), weather::forecast);
        Ok(view(&state, forecast))
    })
    .await
}

#[tauri::command]
pub async fn weather_clear(app: AppHandle) -> Result<WeatherView> {
    run(move || {
        let state = app.state::<WeatherState>();
        state.set_place(None)?;
        Ok(WeatherView { place: None, forecast: None, fetched_at: 0, error: None })
    })
    .await
}
