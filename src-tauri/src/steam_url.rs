//! Every Steam URL the widget reads, and the one check that keeps a capsule on Steam's own CDNs.
use url::Url;

use crate::steam_region::Region;

const WEB_API: &str = "https://api.steampowered.com";
const STORE: &str = "https://store.steampowered.com";

/// The store is read in the chosen region's country and language, so prices and wording come
/// already localized to it.
fn store(path: &str, extra: &[(&str, &str)], region: &Region) -> Url {
    let mut url = Url::parse(&format!("{STORE}{path}")).expect("base do store");
    url.query_pairs_mut()
        .extend_pairs([("cc", region.country), ("l", region.language)].into_iter().chain(extra.iter().copied()));
    url
}

fn web(path: &str, query: &[(&str, &str)]) -> Url {
    let mut url = Url::parse(&format!("{WEB_API}/{path}")).expect("base da web api");
    url.query_pairs_mut().extend_pairs(query.iter().copied());
    url
}

pub fn joined(ids: &[u32]) -> String {
    ids.iter().map(|i| i.to_string()).collect::<Vec<_>>().join(",")
}

pub fn wishlist_url(steamid: &str) -> Url {
    web("IWishlistService/GetWishlist/v1", &[("steamid", steamid)])
}

pub fn price_url(ids: &[u32], region: &Region) -> Url {
    let mut url = store("/api/appdetails", &[("filters", "price_overview")], region);
    url.query_pairs_mut().append_pair("appids", &joined(ids));
    url
}

pub fn basic_url(id: u32, region: &Region) -> Url {
    let mut url = store("/api/appdetails", &[("filters", "basic")], region);
    url.query_pairs_mut().append_pair("appids", &id.to_string());
    url
}

/// The price feed carries no reviews, so a wishlist row asks the store's own summary for them: a
/// couple of hundred bytes with the percentage, the bucket and the count.
pub fn reviews_url(id: u32, region: &Region) -> Url {
    let mut url = store(&format!("/appreviews/{id}"), &[("language", "all")], region);
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

/// The whole library, free games included when they were played: the Web API omits them otherwise.
pub fn owned_url(key: &str, steamid: &str) -> Url {
    web(
        "IPlayerService/GetOwnedGames/v1",
        &[
            ("key", key),
            ("steamid", steamid),
            ("include_appinfo", "1"),
            ("include_played_free_games", "1"),
            ("skip_unvetted_apps", "0"),
        ],
    )
}

/// The store's own capsule path for an app. Deterministic, so a library of hundreds of games costs no
/// extra request; the one Steam has no capsule for keeps the initial where the art would be.
pub fn capsule_url(appid: u32) -> String {
    format!("https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/{appid}/capsule_231x87.jpg")
}

/// The wide header (460x215) the list and the cards show.
pub fn header_url(appid: u32) -> String {
    format!("https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/{appid}/header.jpg")
}

/// The vertical library cover (300x450) the grid shows.
pub fn portrait_url(appid: u32) -> String {
    format!("https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/{appid}/library_600x900.jpg")
}

/// Every update and announcement a game posts on Steam, newest first; public, no key.
pub fn news_url(appid: u32, count: usize) -> Url {
    let mut url = web("ISteamNews/GetNewsForApp/v2", &[("feeds", "steam_community_announcements"), ("maxlength", "0")]);
    url.query_pairs_mut().append_pair("appid", &appid.to_string()).append_pair("count", &count.to_string());
    url
}

/// The 100 games with the most people in them right now; public, no key.
pub fn charts_url() -> Url {
    web("ISteamChartsService/GetGamesByConcurrentPlayers/v1", &[])
}

/// Where an update opens when Steam gives no link of its own.
pub fn news_page(appid: u32) -> String {
    format!("https://store.steampowered.com/news/app/{appid}")
}

pub fn trending_url(region: &Region) -> Url {
    store("/search/", &[("filter", "globaltopsellers")], region)
}

/// The store's own sort tokens the catalog offers. "Biggest discount" is not one of Steam's sorts, so
/// the wishlist keeps that honour; these are the three the store does answer.
pub fn catalog_sort(sort: &str) -> Option<&'static str> {
    match sort {
        "reviews" => Some("Reviews_DESC"),
        "price" => Some("Price_ASC"),
        "new" => Some("Released_DESC"),
        _ => None,
    }
}

/// `only_sale` asks the store for what is discounted right now (`specials=1`).
pub fn catalog_url(term: &str, page: usize, region: &Region, sort: &str, only_sale: bool) -> Url {
    let mut extra: Vec<(&str, &str)> = vec![("sort_by", sort)];
    if only_sale {
        extra.push(("specials", "1"));
    }
    let mut url = store("/search/", &extra, region);
    let mut query = url.query_pairs_mut();
    if page > 0 {
        query.append_pair("start", &(page * crate::steam::CATALOG_PAGE).to_string());
    }
    if !term.trim().is_empty() {
        query.append_pair("term", term.trim());
    }
    drop(query);
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
