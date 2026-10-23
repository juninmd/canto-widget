//! The alert window's commands: what is pending, what it closes, and how it brings the widget up.
use tauri::{AppHandle, Manager};

use crate::calendar::AgendaItem;
use crate::error::{AppError, Result};
use crate::window;

#[tauri::command]
pub fn alert_open(app: AppHandle, event: AgendaItem) -> Result<()> {
    if !app.state::<crate::meeting_alert::Alerted>().first(&event) {
        return Ok(());
    }
    window::open_alert(&app, event).map_err(|e| AppError::Io(e.to_string()))
}

#[tauri::command]
pub fn alert_payload(app: AppHandle) -> Vec<AgendaItem> {
    window::alert_list(&app)
}

/// The overlay ran out of cards: hides its window unless an alert is still pending, which it then gets back.
#[tauri::command]
pub fn alert_settle(app: AppHandle) -> Vec<AgendaItem> {
    window::settle_alert(&app)
}

/// The card's measured height: the pop-up window takes it, so no empty, click-eating space stays on screen.
#[tauri::command]
pub fn alert_resize(app: AppHandle, height: f64) -> Result<()> {
    window::resize_alert(&app, height).map_err(|e| AppError::Io(e.to_string()))
}

/// The alert window's way to bring the widget up (e.g. "abrir aba Modelos"); an alert alone never does.
#[tauri::command]
pub fn main_show(app: AppHandle) -> Result<()> {
    window::show(&app).map_err(|e| AppError::Io(e.to_string()))
}

#[tauri::command]
pub fn alert_close(app: AppHandle, id: String, outcome: Option<crate::alert_log::Outcome>) {
    if let Some(item) = window::take_alert(&app, &id) {
        crate::alert_log::record(&app, item, outcome.unwrap_or(crate::alert_log::Outcome::Closed));
    }
}

/// The overlay's "fechar todos": one call drops the whole queue, and each alert still leaves its trace.
#[tauri::command]
pub fn alert_close_all(app: AppHandle, outcome: Option<crate::alert_log::Outcome>) {
    for item in window::take_all_alerts(&app) {
        crate::alert_log::record(&app, item, outcome.unwrap_or(crate::alert_log::Outcome::Closed));
    }
}
