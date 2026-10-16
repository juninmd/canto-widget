//! Steam commands: the connection (SteamID64 plus an optional Web API key) and the four lists.
use std::sync::Mutex;

use tauri::{AppHandle, Manager};

use crate::error::{AppError, Result};
use crate::model::now_ms;
use crate::steam::{
    self, RecentGame, SteamConfig, SteamId, SteamList, SteamRecent, SteamRow, SteamStatus, CATALOG, DEALS, RECENT,
    TRENDING,
};
use crate::steam_feed::{self as feed, FetchError};
use crate::vault::AppState;

/// Serializes connects and disconnects against a list fetch, so a reply can't land after the account changed.
#[derive(Default)]
pub struct SteamLock(pub Mutex<()>);

fn failed(e: FetchError) -> AppError {
    AppError::Steam(e.message())
}

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
            SteamId::Vanity(name) => feed::resolve(&key, &name).map_err(failed)?,
        };
        // With a key the same call validates it and brings the persona name for the header.
        let name = if key.is_empty() { String::new() } else { feed::persona(&key, &steamid).map_err(failed)? };
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
        state.steam.get_or(&format!("deals:{}", cfg.steamid), force, now_ms(), || deals(&cfg))
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
        state.steam.get_or("trending", force, now_ms(), || list(&feed::trending_url(), TRENDING))
    })
    .await
}

#[tauri::command]
pub async fn steam_catalog(app: AppHandle, term: String, force: bool) -> Result<SteamList> {
    if term.chars().count() > 100 {
        return Err(AppError::Config("busca longa demais".into()));
    }
    crate::blocking::run(move || {
        let state = app.state::<AppState>();
        connected(&state)?;
        state.touch();
        let lock = app.state::<SteamLock>();
        let _guard = lock.0.lock().unwrap();
        let key = format!("catalog:{}", term.trim().to_lowercase());
        state.steam.get_or(&key, force, now_ms(), || list(&feed::catalog_url(&term), CATALOG))
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
        state.steam.get_or(&format!("recent:{}", cfg.steamid), force, now_ms(), || recent(&cfg))
    })
    .await
}

fn list(url: &url::Url, take: usize) -> Result<SteamList> {
    let mut items = feed::search(url).map_err(failed)?;
    let has_more = items.len() > take;
    items.truncate(take);
    Ok(SteamList { items, has_more })
}

/// The wishlist is scanned whole for discounts; only the best few get their name fetched.
fn deals(cfg: &SteamConfig) -> Result<SteamList> {
    let ids = feed::wishlist(&cfg.steamid).map_err(failed)?;
    if ids.is_empty() {
        return Ok(SteamList { items: Vec::new(), has_more: false });
    }
    let prices = feed::prices(&ids).map_err(failed)?;
    let on_sale = feed::best_deals(prices);
    let has_more = on_sale.len() > DEALS;
    let top: Vec<u32> = on_sale.iter().take(DEALS).map(|(id, _)| *id).collect();
    let names = feed::names(&top).map_err(failed)?;
    let items = on_sale
        .iter()
        .take(DEALS)
        .map(|(id, price)| SteamRow {
            appid: *id,
            name: names.get(id).cloned().unwrap_or_else(|| format!("jogo {id}")),
            price: price.final_formatted.clone(),
            original: price.initial_formatted.clone(),
            discount: price.discount,
            review: None,
            review_label: String::new(),
        })
        .collect();
    Ok(SteamList { items, has_more })
}

fn recent(cfg: &SteamConfig) -> Result<SteamRecent> {
    if cfg.api_key.is_empty() {
        return Ok(SteamRecent { items: Vec::new(), has_key: false });
    }
    let mut items: Vec<RecentGame> = feed::recent(&cfg.api_key, &cfg.steamid).map_err(failed)?;
    items.truncate(RECENT);
    Ok(SteamRecent { items, has_key: true })
}
