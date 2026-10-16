//! HTTP for the Steam store and Web API, plus the URLs each sub-tab reads.
use std::collections::HashMap;
use std::time::Duration;

use url::Url;

use crate::steam::{RecentGame, SteamRow, COUNTRY, LANGUAGE};
use crate::steam_parse as parse;
use crate::steam_parse::Price;

pub const TIMEOUT_S: u64 = 20;
/// `appdetails` takes a comma-separated list for one filter at a time; 40 keeps the URL sane.
const BATCH: usize = 40;
/// `basic` per app has no batch form, so names are fetched in small parallel waves.
const WAVE: usize = 6;
const WEB_API: &str = "https://api.steampowered.com";
const STORE: &str = "https://store.steampowered.com";
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

fn store(path: &str, extra: &[(&str, &str)]) -> Url {
    let mut url = Url::parse(&format!("{STORE}{path}")).expect("base do store");
    url.query_pairs_mut().extend_pairs([("cc", COUNTRY), ("l", LANGUAGE)].into_iter().chain(extra.iter().copied()));
    url
}

fn web(path: &str, query: &[(&str, &str)]) -> Url {
    let mut url = Url::parse(&format!("{WEB_API}/{path}")).expect("base da web api");
    url.query_pairs_mut().extend_pairs(query.iter().copied());
    url
}

fn joined(ids: &[u32]) -> String {
    ids.iter().map(|i| i.to_string()).collect::<Vec<_>>().join(",")
}

pub fn wishlist_url(steamid: &str) -> Url {
    web("IWishlistService/GetWishlist/v1", &[("steamid", steamid)])
}

pub fn price_url(ids: &[u32]) -> Url {
    let mut url = store("/api/appdetails", &[("filters", "price_overview")]);
    url.query_pairs_mut().append_pair("appids", &joined(ids));
    url
}

pub fn basic_url(id: u32) -> Url {
    let mut url = store("/api/appdetails", &[("filters", "basic")]);
    url.query_pairs_mut().append_pair("appids", &id.to_string());
    url
}

pub fn summary_url(key: &str, steamid: &str) -> Url {
    web("ISteamUser/GetPlayerSummaries/v2", &[("key", key), ("steamids", steamid)])
}

pub fn vanity_url(key: &str, name: &str) -> Url {
    web("ISteamUser/ResolveVanityURL/v1", &[("key", key), ("vanityurl", name)])
}

pub fn recent_url(key: &str, steamid: &str, count: usize) -> Url {
    let mut url = web("IPlayerService/GetRecentlyPlayedGames/v1", &[("key", key), ("steamid", steamid)]);
    url.query_pairs_mut().append_pair("count", &count.to_string());
    url
}

pub fn trending_url() -> Url {
    store("/search/", &[("filter", "globaltopsellers")])
}

pub fn catalog_url(term: &str) -> Url {
    let mut url = store("/search/", &[("sort_by", "Reviews_DESC")]);
    if !term.trim().is_empty() {
        url.query_pairs_mut().append_pair("term", term.trim());
    }
    url
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
        s if !(200..300).contains(&s) => Err(FetchError::Other(format!("HTTP {s}"))),
        _ => res.text().map_err(net),
    }
}

fn get(url: &Url) -> Result<String, FetchError> {
    text(&client()?, url)
}

pub fn wishlist(steamid: &str) -> Result<Vec<u32>, FetchError> {
    parse::parse_wishlist(&get(&wishlist_url(steamid))?).map_err(FetchError::Other)
}

/// Prices for the whole wishlist in chunks, so a long list still costs few requests.
pub fn prices(ids: &[u32]) -> Result<HashMap<u32, parse::Price>, FetchError> {
    let client = client()?;
    let mut out = HashMap::new();
    for chunk in ids.chunks(BATCH) {
        out.extend(parse::parse_prices(&text(&client, &price_url(chunk))?));
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

/// `basic` is one app per request, so a wave of six keeps a short list fast. A missing name only
/// costs that row its title: the list still loads.
pub fn names(ids: &[u32]) -> Result<HashMap<u32, String>, FetchError> {
    let client = client()?;
    let mut out = HashMap::new();
    for chunk in ids.chunks(WAVE) {
        let client = &client;
        let found: Vec<(u32, Option<String>)> = std::thread::scope(|scope| {
            let handles: Vec<_> = chunk.iter().map(|&id| scope.spawn(move || (id, name_of(client, id)))).collect();
            handles.into_iter().filter_map(|h| h.join().ok()).collect()
        });
        out.extend(found.into_iter().filter_map(|(id, name)| name.map(|n| (id, n))));
    }
    Ok(out)
}

fn name_of(client: &reqwest::blocking::Client, id: u32) -> Option<String> {
    parse::parse_name(&text(client, &basic_url(id)).ok()?)
}

pub fn search(url: &Url) -> Result<Vec<SteamRow>, FetchError> {
    Ok(parse::parse_search(&get(url)?))
}

pub fn recent(key: &str, steamid: &str) -> Result<Vec<RecentGame>, FetchError> {
    Ok(parse::parse_recent(&get(&recent_url(key, steamid, crate::steam::RECENT))?))
}

pub fn resolve(key: &str, name: &str) -> Result<String, FetchError> {
    let body = get(&vanity_url(key, name))?;
    parse::parse_vanity(&body).ok_or_else(|| FetchError::Other("nome de perfil não encontrado no Steam".into()))
}

/// Doubles as the key check: an answer without a player means the key was refused.
pub fn persona(key: &str, steamid: &str) -> Result<String, FetchError> {
    let body = get(&summary_url(key, steamid))?;
    parse::parse_summary(&body)
        .ok_or_else(|| FetchError::Other("chave da Steam Web API inválida ou conta não encontrada".into()))
}

#[cfg(test)]
#[path = "steam_feed_tests.rs"]
mod tests;
