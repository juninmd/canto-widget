//! Steam commands: the connection (SteamID64 plus an optional Web API key), the four lists and the
//! capsules. The list shapes live in `steam_lists.rs`.
use std::sync::Mutex;

use tauri::{AppHandle, Manager};

use crate::error::{AppError, Result};
use crate::model::now_ms;
use crate::steam::{self, SteamConfig, SteamId, SteamList, SteamRecent, SteamStatus};
use crate::steam_feed as feed;
use crate::steam_lists as lists;
use crate::vault::AppState;

/// Serializes connects and disconnects against a list fetch, so a reply can't land after the account changed.
#[derive(Default)]
pub struct SteamLock(pub Mutex<()>);

fn connected(state: &AppState) -> Result<SteamConfig> {
    let cfg = state.steam_config()?.unwrap_or_default();
    if cfg.steamid.is_empty() {
        return Err(AppError::Config("conecte uma conta Steam primeiro".into()));
    }
    Ok(cfg)
}

#[tauri::command]
pub async fn steam_status(app: AppHandle) -> Result<SteamStatus> {
    crate::blocking::run(move || {
        let state = app.state::<AppState>();
        if !state.is_unlocked() {
            return Ok(steam::status(None));
        }
        Ok(steam::status(state.steam_config()?.as_ref()))
    })
    .await
}

#[tauri::command]
pub async fn steam_connect(app: AppHandle, steam_id: String, api_key: String) -> Result<SteamStatus> {
    crate::blocking::run(move || {
        let state = app.state::<AppState>();
        if !state.is_unlocked() {
            return Err(AppError::Locked);
        }
        let lock = app.state::<SteamLock>();
        let _guard = lock.0.lock().unwrap();
        let key = api_key.trim().to_string();
        let typed = steam::classify(&steam_id).ok_or_else(|| {
            AppError::Config("informe o SteamID64 (17 dígitos), o link do perfil ou o nome de perfil".into())
        })?;
        let steamid = match typed {
            SteamId::Id(id) => id,
            SteamId::Vanity(_) if key.is_empty() => {
                return Err(AppError::Config("um nome de perfil precisa da chave da Steam Web API".into()))
            }
            SteamId::Vanity(name) => feed::resolve(&key, &name).map_err(lists::failed)?,
        };
        // With a key the same call validates it and brings the persona name for the header.
        let name = if key.is_empty() { String::new() } else { feed::persona(&key, &steamid).map_err(lists::failed)? };
        let cfg = SteamConfig { steamid, api_key: key, name };
        state.save_steam(&cfg)?;
        state.steam.clear();
        state.touch();
        Ok(steam::status(Some(&cfg)))
    })
    .await
}

#[tauri::command(async)]
pub fn steam_disconnect(app: AppHandle) -> Result<SteamStatus> {
    let state = app.state::<AppState>();
    if !state.is_unlocked() {
        return Err(AppError::Locked);
    }
    let lock = app.state::<SteamLock>();
    let _guard = lock.0.lock().unwrap();
    state.save_steam(&SteamConfig::default())?;
    state.steam.clear();
    Ok(steam::status(None))
}

#[tauri::command]
pub async fn steam_deals(app: AppHandle, force: bool) -> Result<SteamList> {
    crate::blocking::run(move || {
        let state = app.state::<AppState>();
        let cfg = connected(&state)?;
        state.touch();
        let lock = app.state::<SteamLock>();
        let _guard = lock.0.lock().unwrap();
        state.steam.get_or(&format!("deals:{}", cfg.steamid), force, now_ms(), || lists::deals(&cfg))
    })
    .await
}

#[tauri::command]
pub async fn steam_trending(app: AppHandle, force: bool) -> Result<SteamList> {
    crate::blocking::run(move || {
        let state = app.state::<AppState>();
        connected(&state)?;
        state.touch();
        let lock = app.state::<SteamLock>();
        let _guard = lock.0.lock().unwrap();
        state.steam.get_or("trending", force, now_ms(), lists::trending)
    })
    .await
}

#[tauri::command]
pub async fn steam_catalog(app: AppHandle, term: String, page: usize, force: bool) -> Result<SteamList> {
    if term.chars().count() > 100 || page > 500 {
        return Err(AppError::Config("busca inválida".into()));
    }
    crate::blocking::run(move || {
        let state = app.state::<AppState>();
        connected(&state)?;
        state.touch();
        let lock = app.state::<SteamLock>();
        let _guard = lock.0.lock().unwrap();
        let key = format!("catalog:{page}:{}", term.trim().to_lowercase());
        state.steam.get_or(&key, force, now_ms(), || lists::catalog(&term, page))
    })
    .await
}

#[tauri::command]
pub async fn steam_recent(app: AppHandle, force: bool) -> Result<SteamRecent> {
    crate::blocking::run(move || {
        let state = app.state::<AppState>();
        let cfg = connected(&state)?;
        state.touch();
        let lock = app.state::<SteamLock>();
        let _guard = lock.0.lock().unwrap();
        state.steam.get_or(&format!("recent:{}", cfg.steamid), force, now_ms(), || lists::recent(&cfg))
    })
    .await
}

/// One capsule as a `data:` URL, kept in RAM. The webview asks per row, so the list stays light and
/// the images arrive as they become visible; a failure is cached too, so it isn't retried forever.
/// Deliberately not behind `SteamLock`: 25 rows must be able to load at once.
#[tauri::command]
pub async fn steam_image(app: AppHandle, url: String) -> Result<String> {
    crate::blocking::run(move || {
        let state = app.state::<AppState>();
        if !state.is_unlocked() {
            return Err(AppError::Locked);
        }
        if !crate::steam_url::is_steam_image(&url) {
            return Err(AppError::Config("endereço de imagem inválido".into()));
        }
        state.steam.get_or(&format!("art:{url}"), false, now_ms(), || Ok(feed::download_art(&url)))
    })
    .await
}
