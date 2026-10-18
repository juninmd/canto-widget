//! Steam commands: the connection (SteamID64, an optional Web API key and the storefront), the four
//! lists and the capsules. The list shapes live in `steam_lists.rs`.
use std::sync::Mutex;

use tauri::{AppHandle, Manager};

use crate::error::{AppError, Result};
use crate::model::now_ms;
use crate::steam::{self, SteamConfig, SteamLibrary, SteamList, SteamRecent, SteamStatus};
use crate::steam_feed as feed;
use crate::steam_id::{self, SteamId};
use crate::steam_lists as lists;
use crate::steam_region;
use crate::vault::AppState;

/// Serializes connects and disconnects against a list fetch, so a reply can't land after the account changed.
#[derive(Default)]
pub struct SteamLock(pub Mutex<()>);

pub(crate) fn connected(state: &AppState) -> Result<SteamConfig> {
    let cfg = state.steam_config()?.unwrap_or_default();
    if cfg.steamid.is_empty() {
        return Err(AppError::Config("conecte uma conta Steam primeiro".into()));
    }
    Ok(cfg)
}

/// The account status plus the price-alert switch, which lives in its own sealed file.
pub fn status_with_watch(app: &AppHandle, state: &AppState, cfg: Option<&SteamConfig>) -> SteamStatus {
    let mut status = steam::status(cfg);
    status.watching = status.configured && app.state::<crate::steam_alert::SteamAlerts>().watching(state);
    status
}

#[tauri::command]
pub async fn steam_status(app: AppHandle) -> Result<SteamStatus> {
    crate::blocking::run(move || {
        let state = app.state::<AppState>();
        if !state.is_unlocked() {
            return Ok(steam::status(None));
        }
        let cfg = state.steam_config()?;
        Ok(status_with_watch(&app, &state, cfg.as_ref()))
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
        let typed = steam_id::classify(&steam_id).ok_or_else(|| {
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
        // The storefront outlives a reconnection: it is a preference, not part of the account.
        let previous = state.steam_config()?.unwrap_or_default();
        let region = steam::region_of(&previous);
        let cfg = SteamConfig { steamid, api_key: key, name, region: region.code.to_string() };
        state.save_steam(&cfg)?;
        state.steam.clear();
        state.touch();
        Ok(status_with_watch(&app, &state, Some(&cfg)))
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
    let previous = state.steam_config()?.unwrap_or_default();
    state.save_steam(&SteamConfig { region: previous.region, ..Default::default() })?;
    state.steam.clear();
    Ok(status_with_watch(&app, &state, None))
}

/// The storefront the prices, the wording and the currency come from. Every list is dropped, since
/// the cached ones belong to the store that answered before.
#[tauri::command(async)]
pub fn steam_region_set(app: AppHandle, region: String) -> Result<SteamStatus> {
    let state = app.state::<AppState>();
    if !state.is_unlocked() {
        return Err(AppError::Locked);
    }
    let chosen = steam_region::parse(&region).ok_or_else(|| AppError::Config("região da loja desconhecida".into()))?;
    let lock = app.state::<SteamLock>();
    let _guard = lock.0.lock().unwrap();
    let mut cfg = connected(&state)?;
    cfg.region = chosen.code.to_string();
    state.save_steam(&cfg)?;
    state.steam.clear();
    state.touch();
    Ok(status_with_watch(&app, &state, Some(&cfg)))
}

#[tauri::command]
pub async fn steam_deals(app: AppHandle, page: usize, force: bool) -> Result<SteamList> {
    if page > 500 {
        return Err(AppError::Config("busca inválida".into()));
    }
    crate::blocking::run(move || {
        let state = app.state::<AppState>();
        let cfg = connected(&state)?;
        let region = steam::region_of(&cfg);
        state.touch();
        let lock = app.state::<SteamLock>();
        let _guard = lock.0.lock().unwrap();
        let key = format!("deals:{}:{}", cfg.steamid, region.code);
        // The wishlist scan is the expensive half, so it is what the cache holds; the page is sliced
        // out of it, and only that page asks for titles, capsules and scores.
        let scan = state.steam.get_or(&key, force, now_ms(), || lists::scan(&cfg, &region))?;
        lists::deals_page(&scan, page, &region)
    })
    .await
}

#[tauri::command]
pub async fn steam_trending(app: AppHandle, force: bool) -> Result<SteamList> {
    crate::blocking::run(move || {
        let state = app.state::<AppState>();
        let region = steam::region_of(&connected(&state)?);
        state.touch();
        let lock = app.state::<SteamLock>();
        let _guard = lock.0.lock().unwrap();
        let key = format!("trending:{}", region.code);
        state.steam.get_or(&key, force, now_ms(), || lists::trending(&region))
    })
    .await
}

#[tauri::command]
pub async fn steam_catalog(
    app: AppHandle,
    term: String,
    page: usize,
    sort: String,
    only_sale: bool,
    force: bool,
) -> Result<SteamList> {
    if term.chars().count() > 100 || page > 500 {
        return Err(AppError::Config("busca inválida".into()));
    }
    let order =
        crate::steam_url::catalog_sort(&sort).ok_or_else(|| AppError::Config("ordenação desconhecida".into()))?;
    crate::blocking::run(move || {
        let state = app.state::<AppState>();
        let region = steam::region_of(&connected(&state)?);
        state.touch();
        let lock = app.state::<SteamLock>();
        let _guard = lock.0.lock().unwrap();
        let key = format!("catalog:{}:{page}:{sort}:{only_sale}:{}", region.code, term.trim().to_lowercase());
        state.steam.get_or(&key, force, now_ms(), || lists::catalog(&term, page, &region, order, only_sale))
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
        let key = format!("recent:{}", cfg.steamid);
        state.steam.get_or(&key, force, now_ms(), || lists::recent(&cfg))
    })
    .await
}

/// The library, filtered by `term` and paged in Rust: a big account is thousands of games, and the
/// pane cannot hold them.
#[tauri::command]
pub async fn steam_library(app: AppHandle, term: String, page: usize, force: bool) -> Result<SteamLibrary> {
    if term.chars().count() > 100 || page > 500 {
        return Err(AppError::Config("busca inválida".into()));
    }
    crate::blocking::run(move || {
        let state = app.state::<AppState>();
        let cfg = connected(&state)?;
        if cfg.api_key.is_empty() {
            return Ok(lists::library_without_key());
        }
        state.touch();
        let lock = app.state::<SteamLock>();
        let _guard = lock.0.lock().unwrap();
        let key = format!("library:{}:{}", cfg.steamid, term.trim().to_lowercase());
        let games = state.steam.get_or(&key, force, now_ms(), || lists::library(&cfg, &term))?;
        Ok(lists::library_page(&games, page))
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
