use tauri::Manager;

use crate::cmd_extras::agenda;
use crate::error::Result;
use crate::gemini_docs::{self, GeminiDoc};
use crate::vault::AppState;

/// Two weeks of meetings stay far below this; it only bounds a very busy calendar.
const MAX_EVENTS: u32 = 500;

#[tauri::command]
pub async fn gemini_docs(app: tauri::AppHandle, time_min: String, time_max: String) -> Result<Vec<GeminiDoc>> {
    crate::blocking::run(move || {
        let events = agenda(&app.state::<AppState>(), &time_min, &time_max, MAX_EVENTS)?;
        Ok(gemini_docs::from_events(events))
    })
    .await
}
