//! Mapa tab readings: the live traffic, the departure forecast and the map tiles, kept in RAM. Every call
//! needs the vault open, since they reveal places; the settings live in `cmd_traffic_setup.rs`.
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

use crate::blocking::run;
use crate::error::{AppError, Result};
use crate::model::now_ms;
use crate::traffic::{self, Reading, RouteEta, Spot, TrafficConfig, TrafficStatus};
use crate::traffic_feed as feed;
use crate::traffic_tiles::{self as tiles, MapTiles};
use crate::vault::AppState;

/// Departures every 15 min over the next two hours, for "melhor hora para sair".
const DEPARTURES: i64 = 9;
const STEP_MS: i64 = 15 * 60_000;

pub(crate) fn config(app: &AppHandle) -> Result<TrafficConfig> {
    let state = app.state::<AppState>();
    if !state.is_unlocked() {
        return Err(AppError::Locked);
    }
    state.traffic_config()
}

pub(crate) fn save(app: &AppHandle, cfg: &TrafficConfig) -> Result<TrafficStatus> {
    let state = app.state::<AppState>();
    state.save_traffic(cfg)?;
    state.traffic.clear();
    state.touch();
    Ok(traffic::status(cfg))
}

pub(crate) fn tr(pt: &'static str, en: &'static str) -> AppError {
    AppError::Config(crate::lang::tr(pt, en).into())
}

#[derive(Serialize)]
pub struct TrafficView {
    pub status: TrafficStatus,
    /// The Clima tab's city, offered as the starting point while none is chosen.
    pub suggested: Option<Spot>,
    pub reading: Option<Reading>,
    pub fetched_at: i64,
    /// Today's slowdown readings, `[at_ms, percent]`.
    pub history: Vec<(i64, u8)>,
    pub error: Option<String>,
}

#[tauri::command]
pub async fn traffic_get(app: AppHandle, force: bool) -> Result<TrafficView> {
    run(move || {
        let cfg = config(&app)?;
        let state = app.state::<AppState>();
        let suggested = app.state::<crate::weather_state::WeatherState>().place().map(|p| Spot {
            name: p.city,
            detail: [p.admin1, p.country].into_iter().filter(|s| !s.is_empty()).collect::<Vec<_>>().join(", "),
            lat: p.lat,
            lon: p.lon,
        });
        let mut view = TrafficView {
            status: traffic::status(&cfg),
            suggested,
            reading: None,
            fetched_at: 0,
            history: state.traffic.history(),
            error: None,
        };
        let Some(origin) = cfg.origin.clone().filter(|_| !cfg.api_key.is_empty()) else { return Ok(view) };
        let ttl = if force { traffic::FLOOR_MS } else { traffic::TTL_MS };
        match state.traffic.get_or("reading", ttl, now_ms(), || read(&cfg, &origin).map_err(AppError::Config)) {
            Ok((reading, at)) => {
                if let Some(pct) = reading.slowdown {
                    view.history = state.traffic.record(at, pct);
                }
                view.reading = Some(reading);
                view.fetched_at = at;
            }
            Err(e) => view.error = Some(e.to_string()),
        }
        Ok(view)
    })
    .await
}

/// Flow around the point, the incidents and every trip, in parallel: one slow answer shouldn't add up.
fn read(cfg: &TrafficConfig, origin: &Spot) -> std::result::Result<Reading, String> {
    let client = &feed::client()?;
    let key = cfg.api_key.as_str();
    std::thread::scope(|s| {
        let flows: Vec<_> = traffic::sample_points(origin.lat, origin.lon)
            .into_iter()
            .map(|(lat, lon)| s.spawn(move || feed::flow(client, key, lat, lon)))
            .collect();
        let incidents = s.spawn(move || feed::incidents(client, key, origin));
        let routes: Vec<_> = cfg
            .trips
            .iter()
            .map(|trip| {
                s.spawn(move || match feed::route(client, key, origin, &trip.to, "now", true) {
                    Ok(r) => RouteEta { trip: trip.id.clone(), ..r },
                    Err(e) => RouteEta {
                        trip: trip.id.clone(),
                        minutes: 0,
                        free_minutes: 0,
                        km: 0.0,
                        points: vec![],
                        error: Some(e),
                    },
                })
            })
            .collect();
        let samples: Vec<(f64, f64)> = flows.into_iter().filter_map(|j| j.join().ok()?.ok().flatten()).collect();
        let routes: Vec<RouteEta> = routes.into_iter().filter_map(|j| j.join().ok()).collect();
        let incidents = incidents.join().map_err(|_| "incidents".to_string())?;
        // A refused key fails everything alike: say so instead of an empty, healthy-looking pane.
        let incidents = match incidents {
            Ok(list) => list,
            Err(e) if samples.is_empty() && routes.iter().all(|r| r.error.is_some()) => return Err(e),
            Err(_) => Vec::new(),
        };
        Ok(Reading { slowdown: traffic::slowdown(&samples), incidents, routes })
    })
}

#[derive(Serialize, Deserialize)]
pub struct Departure {
    pub at: i64,
    pub minutes: u32,
}

/// Predicted travel time leaving now and every 15 min after, so the tab can point at the best moment.
#[tauri::command]
pub async fn traffic_departures(app: AppHandle, trip: String) -> Result<Vec<Departure>> {
    run(move || {
        let cfg = config(&app)?;
        let origin = cfg.origin.clone().ok_or_else(|| tr("escolha o ponto de partida", "choose the starting point"))?;
        let to = cfg.trips.iter().find(|t| t.id == trip).ok_or(AppError::NotFound)?.to.clone();
        let now = now_ms();
        let state = app.state::<AppState>();
        let fetch = || {
            let client = feed::client().map_err(AppError::Config)?;
            let start = now - now % STEP_MS + STEP_MS;
            let list = std::thread::scope(|s| {
                let jobs: Vec<_> = (0..DEPARTURES)
                    .map(|i| {
                        let at = if i == 0 { now } else { start + (i - 1) * STEP_MS };
                        let (client, key, origin, to) = (&client, cfg.api_key.as_str(), &origin, &to);
                        s.spawn(move || {
                            let when = if i == 0 { "now".to_string() } else { rfc3339(at) };
                            feed::route(client, key, origin, to, &when, false)
                                .map(|r| Departure { at, minutes: r.minutes })
                        })
                    })
                    .collect();
                jobs.into_iter().map(|j| j.join().unwrap_or_else(|_| Err("route".into()))).collect::<Vec<_>>()
            });
            let ok: Vec<Departure> = list
                .iter()
                .filter_map(|r| r.as_ref().ok())
                .map(|d| Departure { at: d.at, minutes: d.minutes })
                .collect();
            match (ok.is_empty(), list.into_iter().find_map(|r| r.err())) {
                (true, Some(e)) => Err(AppError::Config(e)),
                _ => Ok(ok),
            }
        };
        Ok(state.traffic.get_or(&format!("leave:{trip}"), 10 * 60_000, now, fetch)?.0)
    })
    .await
}

fn rfc3339(ms: i64) -> String {
    use chrono::TimeZone;
    chrono::Local
        .timestamp_millis_opt(ms)
        .single()
        .map(|t| t.to_rfc3339_opts(chrono::SecondsFormat::Secs, false))
        .unwrap_or_else(|| "now".into())
}

#[tauri::command]
pub async fn traffic_map(app: AppHandle, zoom: u8, dark: bool) -> Result<MapTiles> {
    run(move || {
        let cfg = config(&app)?;
        let origin = cfg.origin.clone().ok_or_else(|| tr("escolha o ponto de partida", "choose the starting point"))?;
        let state = app.state::<AppState>();
        tiles::fetch(&state.traffic, &cfg.api_key, origin.lat, origin.lon, zoom, dark, now_ms())
            .map_err(AppError::Config)
    })
    .await
}
