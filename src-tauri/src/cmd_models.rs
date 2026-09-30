//! "Modelos IA" tab commands: the Artificial Analysis ranking from its public page, no account or key. Every
//! fetch goes through `models_state::refresh` and its 3 h floor.
use std::sync::Mutex;

use tauri::{AppHandle, Manager};

use crate::blocking::run;
use crate::error::Result;
use crate::model::now_ms;
use crate::models_feed;
use crate::models_state::{self, ModelsConfig, ModelsView, Outcome};
use crate::vault::AppState;

/// Serializes load-fetch-save: the tab and the watcher must not both spend a call, or undo a removed key.
#[derive(Default)]
pub struct ModelsLock(pub Mutex<()>);

/// Refreshes `cfg` (within the floor), saves when the API answered and rings alerts for top-10 changes.
pub(crate) fn refresh_and_save(app: &AppHandle, mut cfg: ModelsConfig, force: bool) -> Result<(ModelsConfig, Outcome)> {
    let tried = cfg.tried_at;
    let out = models_state::refresh(&mut cfg, now_ms(), force, models_feed::fetch);
    if cfg.tried_at != tried {
        app.state::<AppState>().save_models(&cfg)?;
    }
    if cfg.alerts {
        crate::models_alert::notify(app, &out.changes);
    }
    Ok((cfg, out))
}

#[tauri::command]
pub async fn models_get(app: AppHandle, force: bool) -> Result<ModelsView> {
    run(move || {
        let lock = app.state::<ModelsLock>();
        let _guard = lock.0.lock().unwrap();
        let state = app.state::<AppState>();
        state.touch();
        let cfg = state.models_config()?.unwrap_or_default();
        let (cfg, out) = refresh_and_save(&app, cfg, force)?;
        Ok(models_state::view(&cfg, now_ms(), out))
    })
    .await
}

#[tauri::command(async)]
pub fn models_alerts_set(app: AppHandle, enabled: bool) -> Result<bool> {
    let lock = app.state::<ModelsLock>();
    let _guard = lock.0.lock().unwrap();
    let state = app.state::<AppState>();
    state.touch();
    let mut cfg = state.models_config()?.unwrap_or_default();
    cfg.alerts = enabled;
    state.save_models(&cfg)?;
    Ok(enabled)
}
