//! Every Steam URL the widget reads, and the one check that keeps a capsule on Steam's own CDNs.
use url::Url;

use crate::steam::{COUNTRY, LANGUAGE};

const WEB_API: &str = "https://api.steampowered.com";
const STORE: &str = "https://store.steampowered.com";

/// The store is always read in BRL and Portuguese, so prices and wording come already localized.
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

/// The price feed carries no reviews, so a wishlist row asks the store's own summary for them: a
/// couple of hundred bytes with the percentage, the bucket and the count.
pub fn reviews_url(id: u32) -> Url {
    let mut url = store(&format!("/appreviews/{id}"), &[("language", "all")]);
    let mut query = url.query_pairs_mut();
    query.append_pair("json", "1");
    query.append_pair("purchase_type", "all");
    query.append_pair("num_per_page", "0");
    drop(query);
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

/// The capsule URL comes back from the webview, so it is untrusted: HTTPS and Steam's own CDNs only.
pub fn is_steam_image(url: &str) -> bool {
    url.len() <= 512
        && Url::parse(url).is_ok_and(|u| {
            u.scheme() == "https"
                && u.host_str().is_some_and(|h| {
                    let host = h.to_ascii_lowercase();
                    host == "steamstatic.com" || host.ends_with(".steamstatic.com") || host == "steamcdn-a.akamaihd.net"
                })
        })
}

#[cfg(test)]
#[path = "steam_url_tests.rs"]
mod tests;
