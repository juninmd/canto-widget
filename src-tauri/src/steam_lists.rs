//! Building the four lists out of what the feeds answered. The commands in `cmd_steam.rs` are thin
//! wrappers around these, so the shapes can be read (and tested) without a Tauri handle.
use url::Url;

use crate::error::{AppError, Result};
use crate::steam::{self, RecentGame, SteamConfig, SteamList, SteamRecent, SteamRow, DEALS, TRENDING};
use crate::steam_feed::{self as feed, FetchError};
use crate::steam_region::Region;

pub fn failed(e: FetchError) -> AppError {
    AppError::Steam(e.message())
}

/// One search page, trimmed to what a pane shows.
pub fn list(url: &Url, take: usize, region: &Region) -> Result<SteamList> {
    let mut items = feed::search(url).map_err(failed)?;
    let has_more = items.len() > take;
    items.truncate(take);
    Ok(SteamList { items, has_more, currency: region.currency.to_string() })
}

/// A store search page: a full page means the store probably has more, a short one is the last.
pub fn paged(mut items: Vec<SteamRow>, region: &Region) -> SteamList {
    let has_more = items.len() >= steam::CATALOG_PAGE;
    items.truncate(steam::CATALOG_PAGE);
    SteamList { items, has_more, currency: region.currency.to_string() }
}

pub fn trending(region: &Region) -> Result<SteamList> {
    list(&crate::steam_url::trending_url(region), TRENDING, region)
}

pub fn catalog(term: &str, page: usize, region: &Region) -> Result<SteamList> {
    Ok(paged(feed::search(&crate::steam_url::catalog_url(term, page, region)).map_err(failed)?, region))
}

/// The wishlist is scanned whole for discounts; only the best few get their title, capsule and score.
pub fn deals(cfg: &SteamConfig, region: &Region) -> Result<SteamList> {
    let ids = feed::wishlist(&cfg.steamid).map_err(failed)?;
    if ids.is_empty() {
        return Ok(SteamList { items: Vec::new(), has_more: false, currency: region.currency.to_string() });
    }
    let prices = feed::prices(&ids, region).map_err(failed)?;
    let on_sale = feed::best_deals(prices);
    let has_more = on_sale.len() > DEALS;
    let top: Vec<u32> = on_sale.iter().take(DEALS).map(|(id, _)| *id).collect();
    let info = feed::deals_info(&top, region).map_err(failed)?;
    let items = on_sale
        .iter()
        .take(DEALS)
        .map(|(id, price)| {
            let deal = info.get(id).cloned().unwrap_or_else(|| feed::Deal {
                name: format!("jogo {id}"),
                art: String::new(),
                review: None,
                review_key: String::new(),
                review_count: 0,
            });
            SteamRow {
                appid: *id,
                name: deal.name,
                price: price.final_formatted.clone(),
                original: price.initial_formatted.clone(),
                discount: price.discount,
                review: deal.review,
                review_key: deal.review_key,
                review_count: deal.review_count,
                saved_cents: price.saved_cents(),
                art: deal.art,
            }
        })
        .collect();
    Ok(SteamList { items, has_more, currency: region.currency.to_string() })
}

pub fn recent(cfg: &SteamConfig, region: &Region) -> Result<SteamRecent> {
    if cfg.api_key.is_empty() {
        return Ok(SteamRecent { items: Vec::new(), has_key: false });
    }
    let mut games: Vec<RecentGame> = feed::recent(&cfg.api_key, &cfg.steamid).map_err(failed)?;
    games.truncate(steam::RECENT);
    // The Web API reports no capsule: it comes from the store, and a failure there only costs the art.
    let ids: Vec<u32> = games.iter().map(|g| g.appid).collect();
    let art = feed::basics(&ids, region).unwrap_or_default();
    for game in &mut games {
        game.art = art.get(&game.appid).map(|(_, url)| url.clone()).unwrap_or_default();
    }
    Ok(SteamRecent { items: games, has_key: true })
}

#[cfg(test)]
#[path = "steam_lists_tests.rs"]
mod tests;
