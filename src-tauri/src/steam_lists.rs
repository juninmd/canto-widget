//! Building the four lists out of what the feeds answered. The commands in `cmd_steam.rs` are thin
//! wrappers around these, so the shapes can be read (and tested) without a Tauri handle.
use url::Url;

use crate::error::{AppError, Result};
use crate::steam::{
    self, OwnedGame, RecentGame, SteamConfig, SteamLibrary, SteamList, SteamRecent, SteamRow, DEALS, TRENDING,
};
use crate::steam_feed::{self as feed, FetchError};
use crate::steam_parse::Price;
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

/// The whole wishlist scan for discounts, best deal first. Cached as one list so paging through the
/// deals never scans the wishlist twice.
pub fn scan(cfg: &SteamConfig, region: &Region) -> Result<Vec<(u32, Price)>> {
    let ids = feed::wishlist(&cfg.steamid).map_err(failed)?;
    if ids.is_empty() {
        return Ok(Vec::new());
    }
    Ok(feed::best_deals(feed::prices(&ids, region).map_err(failed)?))
}

/// One page of the scan, and whether anything is left after it.
pub fn page_of(scan: &[(u32, Price)], page: usize) -> (Vec<(u32, Price)>, bool) {
    let start = page * DEALS;
    let slice: Vec<(u32, Price)> = scan.iter().skip(start).take(DEALS).cloned().collect();
    (slice, scan.len() > start + DEALS)
}

/// One page of that scan. A row Steam has no title for keeps its price and its link: only the title
/// is missing, and the interface falls back to the appid.
pub fn deals_page(scan: &[(u32, Price)], page: usize, region: &Region) -> Result<SteamList> {
    let (slice, has_more) = page_of(scan, page);
    let top: Vec<u32> = slice.iter().map(|(id, _)| *id).collect();
    let info = feed::deals_info(&top, region).map_err(failed)?;
    let items = slice
        .into_iter()
        .map(|(id, price)| {
            let deal = info.get(&id).cloned().unwrap_or_else(|| feed::Deal {
                name: String::new(),
                art: String::new(),
                review: None,
                review_key: String::new(),
                review_count: 0,
            });
            SteamRow {
                appid: id,
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

pub fn recent(cfg: &SteamConfig) -> Result<SteamRecent> {
    if cfg.api_key.is_empty() {
        return Ok(SteamRecent { items: Vec::new(), has_key: false });
    }
    let mut games: Vec<RecentGame> = feed::recent(&cfg.api_key, &cfg.steamid).map_err(failed)?;
    games.truncate(steam::RECENT);
    // The Web API reports no capsule; the store's own path is deterministic, so no request is needed.
    for game in &mut games {
        game.art = crate::steam_url::capsule_url(game.appid);
    }
    Ok(SteamRecent { items: games, has_key: true })
}

/// The library, filtered by name and most played first. The whole match comes back, so the command
/// can page it; the capsule is built here, from the appid, so no request per game.
pub fn library_games(games: Vec<OwnedGame>, term: &str) -> Vec<OwnedGame> {
    let needle = term.trim().to_lowercase();
    let mut matching: Vec<OwnedGame> =
        games.into_iter().filter(|game| needle.is_empty() || game.name.to_lowercase().contains(&needle)).collect();
    // Most played first; the name breaks the tie so the page never shuffles between runs.
    matching.sort_by(|a, b| b.total_min.cmp(&a.total_min).then_with(|| a.name.cmp(&b.name)));
    for game in &mut matching {
        game.art = crate::steam_url::capsule_url(game.appid);
    }
    matching
}

/// One page of that list. `total` and `minutes` cover every match, so the pane can say what it shows.
pub fn library_page(games: &[OwnedGame], page: usize) -> SteamLibrary {
    let items: Vec<OwnedGame> = games.iter().skip(page * steam::LIBRARY).take(steam::LIBRARY).cloned().collect();
    SteamLibrary {
        items,
        total: games.len() as u32,
        minutes: games.iter().map(|game| game.total_min).sum(),
        has_key: true,
    }
}

/// Without a Web API key the library is unavailable, exactly like the recent games. The command
/// answers with this instead of an error, so the pane can explain.
pub fn library_without_key() -> SteamLibrary {
    SteamLibrary { items: Vec::new(), total: 0, minutes: 0, has_key: false }
}

/// The whole filtered library. A keyless account gets an empty list; the command answers with
/// `library_without_key` in that case, so the interface never sees an empty list as an error.
pub fn library(cfg: &SteamConfig, term: &str) -> Result<Vec<OwnedGame>> {
    if cfg.api_key.is_empty() {
        return Ok(Vec::new());
    }
    Ok(library_games(feed::owned(&cfg.api_key, &cfg.steamid).map_err(failed)?, term))
}

#[cfg(test)]
#[path = "steam_lists_tests.rs"]
mod tests;
