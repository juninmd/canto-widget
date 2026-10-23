//! Mapa tab settings: the TomTom key, the place search, the starting point and the trips, all sealed.
use tauri::AppHandle;

use crate::blocking::run;
use crate::cmd_traffic::{config, save, tr};
use crate::error::{AppError, Result};
use crate::model::now_ms;
use crate::traffic::{self, Spot, TrafficStatus, Trip};
use crate::traffic_feed as feed;

#[tauri::command]
pub async fn traffic_set_key(app: AppHandle, key: String) -> Result<TrafficStatus> {
    run(move || {
        let mut cfg = config(&app)?;
        cfg.api_key = if key.trim().is_empty() {
            String::new()
        } else {
            let key = traffic::clean_key(&key)
                .ok_or_else(|| tr("essa não parece uma chave da TomTom", "that does not look like a TomTom key"))?;
            crate::traffic_search::check_key(&key).map_err(AppError::Config)?;
            key
        };
        save(&app, &cfg)
    })
    .await
}

/// With a key, TomTom finds streets and places near the starting point; without one, Open-Meteo finds cities.
#[tauri::command]
pub async fn traffic_search(app: AppHandle, query: String) -> Result<Vec<Spot>> {
    let query = crate::weather::clean_city(&query).ok_or_else(|| tr("busca inválida", "invalid search"))?;
    run(move || {
        let cfg = config(&app)?;
        if cfg.api_key.is_empty() {
            let places = crate::weather::search(&query).map_err(AppError::Config)?;
            return Ok(places
                .into_iter()
                .map(|p| Spot {
                    name: p.city,
                    detail: [p.admin1, p.country].into_iter().filter(|s| !s.is_empty()).collect::<Vec<_>>().join(", "),
                    lat: p.lat,
                    lon: p.lon,
                })
                .collect());
        }
        let client = feed::client().map_err(AppError::Config)?;
        crate::traffic_search::search(&client, &cfg.api_key, &query, cfg.origin.as_ref()).map_err(AppError::Config)
    })
    .await
}

#[tauri::command]
pub async fn traffic_set_origin(app: AppHandle, spot: Spot) -> Result<TrafficStatus> {
    let spot = traffic::clean_spot(spot).ok_or_else(|| tr("lugar inválido", "invalid place"))?;
    run(move || {
        let mut cfg = config(&app)?;
        cfg.origin = Some(spot);
        save(&app, &cfg)
    })
    .await
}

#[tauri::command]
pub async fn traffic_add_trip(app: AppHandle, name: String, icon: String, to: Spot) -> Result<TrafficStatus> {
    let to = traffic::clean_spot(to).ok_or_else(|| tr("lugar inválido", "invalid place"))?;
    let name = traffic::clean_trip_name(&name).ok_or_else(|| tr("dê um nome ao trajeto", "name the trip"))?;
    run(move || {
        let mut cfg = config(&app)?;
        if cfg.trips.len() >= traffic::MAX_TRIPS {
            return Err(tr("limite de trajetos atingido", "trip limit reached"));
        }
        cfg.trips.push(Trip { id: format!("t{}", now_ms()), name, icon: traffic::clean_icon(&icon), to });
        save(&app, &cfg)
    })
    .await
}

#[tauri::command]
pub async fn traffic_remove_trip(app: AppHandle, id: String) -> Result<TrafficStatus> {
    run(move || {
        let mut cfg = config(&app)?;
        cfg.trips.retain(|t| t.id != id);
        save(&app, &cfg)
    })
    .await
}
