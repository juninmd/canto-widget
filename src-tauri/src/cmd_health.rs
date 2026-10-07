//! Commands of the "Meus endpoints" sub-tab. They read and write the sealed list, so they run off the main thread.
use tauri::State;

use crate::error::{AppError, Result};
use crate::health::Endpoint;
use crate::health_watch::{HealthState, View};
use crate::vault::AppState;

#[tauri::command(async)]
pub fn health_list(state: State<'_, AppState>, health: State<'_, HealthState>) -> Result<Vec<View>> {
    health.ensure_loaded(&state)?;
    Ok(health.views())
}

/// Adds the endpoint (empty `id`) or updates the one with that id.
#[tauri::command(async)]
pub fn health_save(
    state: State<'_, AppState>,
    health: State<'_, HealthState>,
    endpoint: Endpoint,
) -> Result<Vec<View>> {
    health.ensure_loaded(&state)?;
    health.save(&state, endpoint)?;
    Ok(health.views())
}

#[tauri::command(async)]
pub fn health_remove(state: State<'_, AppState>, health: State<'_, HealthState>, id: String) -> Result<Vec<View>> {
    health.ensure_loaded(&state)?;
    health.remove(&state, &id)?;
    Ok(health.views())
}

/// "Check now": one reading outside the schedule. Alerts it raises are delivered by the watcher's own path.
#[tauri::command(async)]
pub fn health_check_now(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    health: State<'_, HealthState>,
    id: String,
) -> Result<Vec<View>> {
    health.ensure_loaded(&state)?;
    let ep = health.find(&id).ok_or_else(|| AppError::Config("endpoint não encontrado".into()))?;
    let sample = crate::health_probe::probe(&ep, crate::model::now_ms());
    for alert in health.record(&ep, sample) {
        let _ = crate::window::open_alert(&app, crate::health_watch::alert_event(&ep, &alert));
    }
    Ok(health.views())
}
