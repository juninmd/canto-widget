use tauri::Manager;

use crate::status::cache::StatusCache;
use crate::status::feed::{self, StatusResult};

/// Public incident feeds, no vault access: available even while the vault is locked.
#[tauri::command]
pub async fn api_status(app: tauri::AppHandle, force: bool) -> Vec<StatusResult> {
    crate::blocking::run(move || {
        let cache = app.state::<StatusCache>();
        Ok::<_, crate::error::AppError>(cache.get(force, crate::model::now_ms(), feed::fetch_all))
    })
    .await
    .unwrap_or_default()
}
