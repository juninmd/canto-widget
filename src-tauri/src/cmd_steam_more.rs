//! The Steam commands of the redesigned tab: "jogue agora" (and launching a game), the updates, the
//! most played chart and the whole wishlist. The shapes live in `steam_play.rs`, `steam_news.rs`,
//! `steam_top.rs` and `steam_wish.rs`; these only fetch, cache and page.
use std::collections::{HashMap, HashSet};
use std::sync::Mutex;

use tauri::{AppHandle, Manager};

use crate::cmd_steam::{connected, SteamLock};
use crate::error::{AppError, Result};
use crate::model::now_ms;
use crate::steam::{self, SteamConfig};
use crate::steam_feed as feed;
use crate::steam_lists::failed;
use crate::steam_news::{self as news, NewsItem, SteamNews};
use crate::steam_play::{self as play, PlayGame, SteamPlay};
use crate::steam_top::{self as top, Rank, SteamTop, TopGame};
use crate::steam_wish::{self as wish, SteamWishlist};
use crate::vault::AppState;

/// At most this many games are asked for their updates: the recent ones first, then the installed.
const NEWS_GAMES: usize = 40;
/// Updates older than this are not news any more.
const NEWS_DAYS: i64 = 60;

fn library(cfg: &SteamConfig) -> Result<Vec<PlayGame>> {
    let (owned, recent) = if cfg.api_key.is_empty() {
        (Vec::new(), Vec::new())
    } else {
        (
            feed::owned(&cfg.api_key, &cfg.steamid).map_err(failed)?,
            feed::recent(&cfg.api_key, &cfg.steamid).map_err(failed)?,
        )
    };
    Ok(play::merge(owned, &recent, &crate::steam_local::installed()))
}

#[tauri::command]
pub async fn steam_play(app: AppHandle, filter: String, term: String, page: usize, force: bool) -> Result<SteamPlay> {
    if term.chars().count() > 100 || page > 1000 {
        return Err(AppError::Config("busca inválida".into()));
    }
    crate::blocking::run(move || {
        let state = app.state::<AppState>();
        let cfg = connected(&state)?;
        state.touch();
        let lock = app.state::<SteamLock>();
        let _guard = lock.0.lock().unwrap();
        let games = state.steam.get_or(&format!("play:{}", cfg.steamid), force, now_ms(), || library(&cfg))?;
        Ok(play::page(&games, &filter, &term, page, !cfg.api_key.is_empty()))
    })
    .await
}

/// Opens the game through the Steam client. Only an appid crosses over, so the scheme can't be abused.
#[tauri::command(async)]
pub fn steam_launch(appid: u32) -> Result<()> {
    if appid == 0 {
        return Err(AppError::Config("jogo inválido".into()));
    }
    tauri_plugin_opener::open_url(format!("steam://rungameid/{appid}"), None::<&str>)
        .map_err(|_| AppError::Config("não foi possível abrir a Steam; ela está instalada?".into()))
}

/// The games whose updates matter: played in the last two weeks, then installed, last played first.
pub fn news_games(cfg: &SteamConfig) -> Vec<(u32, String)> {
    let mut games: Vec<(u32, String)> = Vec::new();
    if !cfg.api_key.is_empty() {
        if let Ok(recent) = feed::recent(&cfg.api_key, &cfg.steamid) {
            games.extend(recent.into_iter().map(|g| (g.appid, g.name)));
        }
    }
    let mut installed = crate::steam_local::installed();
    installed.sort_by_key(|g| std::cmp::Reverse(g.last_played));
    for game in installed {
        if !games.iter().any(|(id, _)| *id == game.appid) {
            games.push((game.appid, game.name));
        }
    }
    games.truncate(NEWS_GAMES);
    games
}

#[tauri::command]
pub async fn steam_news(app: AppHandle, filter: String, force: bool) -> Result<SteamNews> {
    crate::blocking::run(move || {
        let state = app.state::<AppState>();
        let cfg = connected(&state)?;
        state.touch();
        let lock = app.state::<SteamLock>();
        let _guard = lock.0.lock().unwrap();
        let now = now_ms();
        let items: Vec<NewsItem> = state.steam.get_or(&format!("news:{}", cfg.steamid), force, now, || {
            let oldest = now / 1000 - NEWS_DAYS * 86_400;
            Ok(feed::news(&news_games(&cfg)).map_err(failed)?.into_iter().filter(|i| i.date >= oldest).collect())
        })?;
        let kept: Vec<NewsItem> = if filter == "installed" {
            let here: HashSet<u32> = crate::steam_local::installed().iter().map(|g| g.appid).collect();
            items.into_iter().filter(|i| here.contains(&i.appid)).collect()
        } else {
            items
        };
        let read_at = app.state::<crate::steam_alert::SteamAlerts>().news_read_at(&state);
        Ok(news::combine(kept, read_at, now, 80))
    })
    .await
}

#[tauri::command(async)]
pub fn steam_news_read(app: AppHandle) -> Result<()> {
    let state = app.state::<AppState>();
    connected(&state)?;
    app.state::<crate::steam_alert::SteamAlerts>().mark_news_read(&state, now_ms())?;
    state.touch();
    Ok(())
}

/// The chart before the one on screen, for the arrows; RAM only, like every list.
#[derive(Default)]
pub struct TopHistory(Mutex<Charts>);

/// When Steam refreshed the chart on screen, its places, and the places of the chart before it.
type Charts = (i64, HashMap<u32, u32>, HashMap<u32, u32>);

impl TopHistory {
    /// Keeps the last two distinct charts and answers the older one.
    fn previous(&self, updated: i64, ranks: &[Rank]) -> HashMap<u32, u32> {
        let mut inner = self.0.lock().unwrap();
        if inner.0 != updated {
            let current: HashMap<u32, u32> = ranks.iter().map(|r| (r.appid, r.rank)).collect();
            inner.2 = std::mem::replace(&mut inner.1, current);
            inner.0 = updated;
        }
        inner.2.clone()
    }
}

#[tauri::command]
pub async fn steam_top(app: AppHandle, page: usize, only_mine: bool, force: bool) -> Result<SteamTop> {
    if page > 10 {
        return Err(AppError::Config("busca inválida".into()));
    }
    crate::blocking::run(move || {
        let state = app.state::<AppState>();
        let cfg = connected(&state)?;
        let region = steam::region_of(&cfg);
        state.touch();
        let lock = app.state::<SteamLock>();
        let _guard = lock.0.lock().unwrap();
        let now = now_ms();
        let (ranks, updated): (Vec<Rank>, i64) =
            state.steam.get_or("charts", force, now, || feed::charts().map_err(failed))?;
        let previous = app.state::<TopHistory>().previous(updated, &ranks);
        let mine: HashSet<u32> = state
            .steam
            .get_or(&format!("play:{}", cfg.steamid), false, now, || library(&cfg))
            .map(|games| games.iter().map(|g| g.appid).collect())
            .unwrap_or_default();
        let (slice, pages) = top::slice(&ranks, &mine, only_mine, page);
        let ids: Vec<u32> = slice.iter().map(|r| r.appid).collect();
        let names: HashMap<u32, (String, String)> = state.steam.get_or(
            &format!("topnames:{}:{}", region.code, crate::steam_url::joined(&ids)),
            false,
            now,
            || feed::basics(&ids, &region).map_err(failed),
        )?;
        let items = slice
            .iter()
            .map(|r| TopGame {
                rank: r.rank,
                appid: r.appid,
                name: names.get(&r.appid).map(|(name, _)| name.clone()).unwrap_or_default(),
                art: crate::steam_url::header_url(r.appid),
                players: r.players,
                peak: r.peak,
                moved: top::moved(&previous, r),
                mine: mine.contains(&r.appid),
            })
            .collect();
        Ok(SteamTop { items, players: top::total_players(&ranks), pages, updated })
    })
    .await
}

#[tauri::command]
pub async fn steam_wishlist(app: AppHandle, page: usize, sort: String, force: bool) -> Result<SteamWishlist> {
    if page > 100 {
        return Err(AppError::Config("busca inválida".into()));
    }
    crate::blocking::run(move || {
        let state = app.state::<AppState>();
        let cfg = connected(&state)?;
        let region = steam::region_of(&cfg);
        state.touch();
        let lock = app.state::<SteamLock>();
        let _guard = lock.0.lock().unwrap();
        let key = format!("wish:{}:{}", cfg.steamid, region.code);
        let entries = state.steam.get_or(&key, force, now_ms(), || {
            let ids = feed::wishlist(&cfg.steamid).map_err(failed)?;
            let ids = feed::scan_ids(&ids).to_vec();
            let prices = if ids.is_empty() { HashMap::new() } else { feed::prices(&ids, &region).map_err(failed)? };
            Ok(wish::entries(&ids, prices))
        })?;
        let sorted = wish::sorted(&entries, &sort);
        let slice = wish::page_ids(&sorted, page);
        let ids: Vec<u32> = slice.iter().map(|(id, _)| *id).collect();
        // The titles and scores of a page are the slow part of paging back and forth, so they are cached too.
        let info_key = format!("wishinfo:{}:{}", region.code, crate::steam_url::joined(&ids));
        let info: HashMap<u32, (String, Option<u8>, String, u32)> =
            state.steam.get_or(&info_key, force, now_ms(), || {
                let found = feed::deals_info(&ids, &region).map_err(failed)?;
                Ok(found.into_iter().map(|(id, d)| (id, (d.name, d.review, d.review_key, d.review_count))).collect())
            })?;
        let deal = |id: &u32| {
            info.get(id).map(|(name, review, review_key, review_count)| feed::Deal {
                name: name.clone(),
                art: String::new(),
                review: *review,
                review_key: review_key.clone(),
                review_count: *review_count,
            })
        };
        let (total, on_sale, hot) = wish::summary(&entries);
        Ok(SteamWishlist {
            items: slice.iter().map(|(id, price)| wish::row(*id, price.as_ref(), deal(id).as_ref())).collect(),
            total,
            on_sale,
            hot,
            pages: (total as usize).div_ceil(wish::PAGE).max(1) as u32,
            currency: region.currency.to_string(),
        })
    })
    .await
}
