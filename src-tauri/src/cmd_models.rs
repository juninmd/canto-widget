//! "Modelos IA" tab commands. The Artificial Analysis key stays sealed in `modelos_ia.json` and never reaches
//! the webview; every fetch goes through `models_state::refresh` and its 3 h floor.
use std::sync::Mutex;

use tauri::{AppHandle, Manager};
use zeroize::Zeroizing;

use crate::blocking::run;
use crate::error::{AppError, Result};
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
        let Some(cfg) = state.models_config()? else { return Ok(ModelsView::default()) };
        let (cfg, out) = refresh_and_save(&app, cfg, force)?;
        Ok(models_state::view(&cfg, now_ms(), out))
    })
    .await
}

/// A wrong key fails here and is not saved; a key equal to the saved one doesn't reset the 3 h floor.
#[tauri::command]
pub async fn models_set_key(app: AppHandle, key: String) -> Result<ModelsView> {
    let key = Zeroizing::new(key);
    let key = Zeroizing::new(models_feed::valid_key(&key)?.to_string());
    if !app.state::<AppState>().is_unlocked() {
        return Err(AppError::Locked);
    }
    run(move || {
        let lock = app.state::<ModelsLock>();
        let _guard = lock.0.lock().unwrap();
        let state = app.state::<AppState>();
        state.touch();
        let mut cfg = state.models_config()?.unwrap_or_default();
        if cfg.key != *key {
            cfg.key = key.to_string();
            cfg.tried_at = 0;
        }
        let out = models_state::refresh(&mut cfg, now_ms(), false, models_feed::fetch);
        if out.unauthorized {
            return Err(AppError::Config("chave inválida".into()));
        }
        state.save_models(&cfg)?;
        if cfg.alerts {
            crate::models_alert::notify(&app, &out.changes);
        }
        Ok(models_state::view(&cfg, now_ms(), out))
    })
    .await
}

/// Forgets the key and the cached ranking on this computer; revoking is done on artificialanalysis.ai.
#[tauri::command(async)]
pub fn models_remove_key(app: AppHandle) -> Result<()> {
    let lock = app.state::<ModelsLock>();
    let _guard = lock.0.lock().unwrap();
    let state = app.state::<AppState>();
    if !state.is_unlocked() {
        return Err(AppError::Locked);
    }
    state.touch();
    match std::fs::remove_file(crate::store::models_path(&state.dir)) {
        Err(e) if e.kind() != std::io::ErrorKind::NotFound => Err(e.into()),
        _ => Ok(()),
    }
}

#[tauri::command(async)]
pub fn models_alerts_set(app: AppHandle, enabled: bool) -> Result<bool> {
    let lock = app.state::<ModelsLock>();
    let _guard = lock.0.lock().unwrap();
    let state = app.state::<AppState>();
    state.touch();
    let mut cfg = state
        .models_config()?
        .ok_or_else(|| AppError::Config("cole a chave da Artificial Analysis primeiro".into()))?;
    cfg.alerts = enabled;
    state.save_models(&cfg)?;
    Ok(enabled)
}
