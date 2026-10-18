//! HTTP for the Steam store and Web API. The URLs live in `steam_url.rs`; nothing here touches the vault.
use std::collections::HashMap;
use std::time::Duration;

use url::Url;

use crate::steam::{RecentGame, SteamRow};
use crate::steam_parse as parse;
use crate::steam_parse::Price;
use crate::steam_player as player;
use crate::steam_region::Region;
use crate::steam_store;
use crate::steam_url::{
    basic_url, is_steam_image, price_url, recent_url, reviews_url, summary_url, vanity_url, wishlist_url,
};

pub const TIMEOUT_S: u64 = 20;
/// `appdetails` takes a comma-separated list for one filter at a time; 40 keeps the URL sane.
const BATCH: usize = 40;
/// `basic`, the review summaries and the capsules have no batch form, so they go in small parallel waves.
const WAVE: usize = 6;
/// A 231x87 capsule is a few KB; the cap bounds what one cache entry can hold.
const ART_MAX_BYTES: usize = 96 * 1024;
const UA: &str = "Mozilla/5.0 (compatible; canto-widget)";

#[derive(Debug, PartialEq)]
pub enum FetchError {
    Network(String),
    Other(String),
}

impl FetchError {
    pub fn message(&self) -> String {
        match self {
            FetchError::Network(e) => format!("sem conexão com a Steam: {e}"),
            FetchError::Other(e) => e.clone(),
        }
    }
}

fn client() -> Result<reqwest::blocking::Client, FetchError> {
    crate::net::client_builder()
        .user_agent(UA)
        .timeout(Duration::from_secs(TIMEOUT_S))
        // The Web API key rides in the query string: a redirect would hand it to whatever host answers.
        .redirect(reqwest::redirect::Policy::none())
        .build()
        .map_err(|e| FetchError::Network(e.to_string()))
}

/// `without_url`: a reqwest error's Display carries the whole URL, and the Web API URL holds the key.
fn net(e: reqwest::Error) -> FetchError {
    FetchError::Network(e.without_url().to_string())
}

fn text(client: &reqwest::blocking::Client, url: &Url) -> Result<String, FetchError> {
    let res = client.get(url.clone()).send().map_err(net)?;
    match res.status().as_u16() {
        429 => Err(FetchError::Other("muitas requisições; tente de novo em alguns minutos".into())),
        s if (200..300).contains(&s) => res.text().map_err(net),
        // 404 is what a delisted app answers: not worth the same wording as a real failure.
        404 => Err(FetchError::Other("jogo não encontrado na loja".into())),
        s => Err(FetchError::Other(format!("HTTP {s}"))),
    }
}

fn get(url: &Url) -> Result<String, FetchError> {
    text(&client()?, url)
}

/// Runs `one` over `ids` in small waves, keeping what answered.
fn in_waves<T: Send>(
    ids: &[u32],
    one: impl Fn(&reqwest::blocking::Client, u32) -> Option<T> + Copy + Send + Sync,
) -> Result<HashMap<u32, T>, FetchError> {
    let client = client()?;
    let mut out = HashMap::new();
    for chunk in ids.chunks(WAVE) {
        let client = &client;
        let found: Vec<(u32, Option<T>)> = std::thread::scope(|scope| {
            let handles: Vec<_> = chunk.iter().map(|&id| scope.spawn(move || (id, one(client, id)))).collect();
            handles.into_iter().filter_map(|h| h.join().ok()).collect()
        });
        out.extend(found.into_iter().filter_map(|(id, value)| value.map(|v| (id, v))));
    }
    Ok(out)
}

pub fn wishlist(steamid: &str) -> Result<Vec<u32>, FetchError> {
    parse::parse_wishlist(&get(&wishlist_url(steamid))?).map_err(FetchError::Other)
}

/// Prices for the whole wishlist in chunks, so a long list still costs few requests.
pub fn prices(ids: &[u32], region: &Region) -> Result<HashMap<u32, Price>, FetchError> {
    let client = client()?;
    let mut out = HashMap::new();
    for chunk in ids.chunks(BATCH) {
        out.extend(parse::parse_prices(&text(&client, &price_url(chunk, region))?));
    }
    Ok(out)
}

/// The best deals on a wishlist: bigger discount first, cheaper price as the tie-break, and the
/// appid last so two identical offers don't swap places between runs.
pub fn best_deals(prices: HashMap<u32, Price>) -> Vec<(u32, Price)> {
    let mut on_sale: Vec<(u32, Price)> = prices.into_iter().filter(|(_, p)| p.discount > 0).collect();
    on_sale.sort_by(|a, b| {
        b.1.discount.cmp(&a.1.discount).then_with(|| a.1.final_cents.cmp(&b.1.final_cents)).then_with(|| a.0.cmp(&b.0))
    });
    on_sale
}

/// What a wishlist row needs beyond its price: the title, the capsule and the review summary.
#[derive(Debug, Clone, PartialEq)]
pub struct Deal {
    pub name: String,
    pub art: String,
    pub review: Option<u8>,
    pub review_key: String,
    pub review_count: u32,
}

/// Name and capsule per app, one request each in waves. A row Steam skipped simply has no title.
pub fn basics(ids: &[u32], region: &Region) -> Result<HashMap<u32, (String, String)>, FetchError> {
    in_waves(ids, |client, id| parse::parse_basic(&text(client, &basic_url(id, region)).ok()?))
}

/// The same, plus the review summary the price feed lacks: one task per app, two small requests.
pub fn deals_info(ids: &[u32], region: &Region) -> Result<HashMap<u32, Deal>, FetchError> {
    in_waves(ids, |client, id| {
        let (name, art) = parse::parse_basic(&text(client, &basic_url(id, region)).ok()?)?;
        let (review, review_key, review_count) = text(client, &reviews_url(id, region))
            .ok()
            .and_then(|body| parse::parse_reviews(&body))
            .map(|(percent, key, count)| (Some(percent), key, count))
            .unwrap_or((None, String::new(), 0));
        Some(Deal { name, art, review, review_key, review_count })
    })
}

pub fn search(url: &Url) -> Result<Vec<SteamRow>, FetchError> {
    Ok(steam_store::parse_search(&get(url)?))
}

/// One capsule as a `data:` URL, or an empty string when Steam has none or the download failed.
/// `account::as_data_url` is what keeps a surprise out: a known raster type, non-empty, within the cap.
pub fn download_art(url: &str) -> String {
    if !is_steam_image(url) {
        return String::new();
    }
    let Ok(client) = crate::account::client() else {
        return String::new();
    };
    let Ok(res) = client.get(url).send().and_then(reqwest::blocking::Response::error_for_status) else {
        return String::new();
    };
    let Some(kind) = res.headers().get(reqwest::header::CONTENT_TYPE).and_then(|v| v.to_str().ok()).map(str::to_owned)
    else {
        return String::new();
    };
    let mut bytes = Vec::new();
    if std::io::Read::read_to_end(&mut std::io::Read::take(res, ART_MAX_BYTES as u64 + 1), &mut bytes).is_err() {
        return String::new();
    }
    crate::account::as_data_url(&kind, &bytes).unwrap_or_default()
}

pub fn recent(key: &str, steamid: &str) -> Result<Vec<RecentGame>, FetchError> {
    Ok(player::parse_recent(&get(&recent_url(key, steamid, crate::steam::RECENT))?))
}

pub fn resolve(key: &str, name: &str) -> Result<String, FetchError> {
    let body = get(&vanity_url(key, name))?;
    player::parse_vanity(&body).ok_or_else(|| FetchError::Other("nome de perfil não encontrado no Steam".into()))
}

/// Doubles as the key check: an answer without a player means the key was refused.
pub fn persona(key: &str, steamid: &str) -> Result<String, FetchError> {
    let body = get(&summary_url(key, steamid))?;
    player::parse_summary(&body)
        .ok_or_else(|| FetchError::Other("chave da Steam Web API inválida ou conta não encontrada".into()))
}

#[cfg(test)]
#[path = "steam_feed_tests.rs"]
mod tests;
