//! "Desejos": the whole wishlist with its prices, sorted and paged. The scan (ids and prices) is the
//! expensive half and is what the cache holds; a page only asks for its own titles and covers.
use std::collections::HashMap;

use serde::{Deserialize, Serialize};

use crate::steam::SteamRow;
use crate::steam_feed::Deal;
use crate::steam_parse::Price;

pub const PAGE: usize = 20;
/// The discount that rings, and that the pane sets on fire.
pub const HOT: u32 = 75;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct SteamWishlist {
    pub items: Vec<SteamRow>,
    pub total: u32,
    pub on_sale: u32,
    pub hot: u32,
    pub pages: u32,
    pub currency: String,
}

/// The wishlist in Steam's own order, each game with its price when the store sells it.
pub fn entries(ids: &[u32], mut prices: HashMap<u32, Price>) -> Vec<(u32, Option<Price>)> {
    ids.iter().map(|id| (*id, prices.remove(id))).collect()
}

/// `sort` is "discount" (default), "price" or "order" (the wishlist's own ranking). A game with no
/// price (unreleased, delisted) always goes last; Steam's order breaks every tie.
pub fn sorted(entries: &[(u32, Option<Price>)], sort: &str) -> Vec<(u32, Option<Price>)> {
    let mut indexed: Vec<(usize, &(u32, Option<Price>))> = entries.iter().enumerate().collect();
    if sort != "order" {
        indexed.sort_by(|(ia, (_, a)), (ib, (_, b))| {
            let key = |p: &Option<Price>| match p {
                None => (1, 0, 0),
                Some(p) if sort == "price" => (0, 0, p.final_cents),
                Some(p) => (0, -(p.discount as i64), p.final_cents),
            };
            key(a).cmp(&key(b)).then(ia.cmp(ib))
        });
    }
    indexed.into_iter().map(|(_, e)| e.clone()).collect()
}

pub fn summary(entries: &[(u32, Option<Price>)]) -> (u32, u32, u32) {
    let discount = |e: &&(u32, Option<Price>)| e.1.as_ref().map_or(0, |p| p.discount);
    let on_sale = entries.iter().filter(|e| discount(e) > 0).count() as u32;
    let hot = entries.iter().filter(|e| discount(e) >= HOT).count() as u32;
    (entries.len() as u32, on_sale, hot)
}

/// The ids of one page, in the chosen order.
pub fn page_ids(sorted: &[(u32, Option<Price>)], page: usize) -> Vec<(u32, Option<Price>)> {
    sorted.iter().skip(page * PAGE).take(PAGE).cloned().collect()
}

/// One row: the price when there is one, the title and cover the page fetched.
pub fn row(appid: u32, price: Option<&Price>, deal: Option<&Deal>) -> SteamRow {
    SteamRow {
        appid,
        name: deal.map(|d| d.name.clone()).unwrap_or_default(),
        price: price.map(Price::wording).unwrap_or_default(),
        original: price.filter(|p| p.discount > 0).map(|p| p.initial_formatted.clone()).unwrap_or_default(),
        discount: price.map_or(0, |p| p.discount),
        review: deal.and_then(|d| d.review),
        review_key: deal.map(|d| d.review_key.clone()).unwrap_or_default(),
        review_count: deal.map_or(0, |d| d.review_count),
        saved_cents: price.map_or(0, Price::saved_cents),
        art: crate::steam_url::header_url(appid),
    }
}

#[cfg(test)]
#[path = "steam_wish_tests.rs"]
mod tests;
