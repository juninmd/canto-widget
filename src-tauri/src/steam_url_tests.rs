use super::*;

fn query(url: &Url) -> Vec<(String, String)> {
    url.query_pairs().map(|(k, v)| (k.into_owned(), v.into_owned())).collect()
}

fn param(url: &Url, name: &str) -> Option<String> {
    query(url).into_iter().find(|(k, _)| k == name).map(|(_, v)| v)
}

fn br() -> Region {
    crate::steam_region::parse("br").unwrap()
}

fn us() -> Region {
    crate::steam_region::parse("us").unwrap()
}

#[test]
fn every_store_url_asks_for_the_country_and_language_of_the_chosen_region() {
    for (region, country, language) in [(br(), "BR", "portuguese"), (us(), "US", "english")] {
        for url in [
            trending_url(&region),
            catalog_url("", 0, &region),
            price_url(&[620], &region),
            basic_url(620, &region),
            reviews_url(620, &region),
        ] {
            assert_eq!(param(&url, "cc").as_deref(), Some(country), "{url}");
            assert_eq!(param(&url, "l").as_deref(), Some(language), "{url}");
        }
    }
}

#[test]
fn the_trending_list_is_the_global_top_sellers() {
    let url = trending_url(&br());
    assert!(url.path().ends_with("/search/"));
    assert_eq!(param(&url, "filter").as_deref(), Some("globaltopsellers"));
}

#[test]
fn the_catalog_sorts_by_reviews_and_pages_by_50() {
    assert_eq!(param(&catalog_url("", 0, &br()), "sort_by").as_deref(), Some("Reviews_DESC"));
    assert_eq!(param(&catalog_url("", 0, &br()), "term"), None, "an empty search is left out");
    assert_eq!(param(&catalog_url("  portal 2 ", 0, &br()), "term").as_deref(), Some("portal 2"));
    assert_eq!(param(&catalog_url("", 0, &br()), "start"), None, "the first page is the default");
    assert_eq!(param(&catalog_url("", 1, &br()), "start").as_deref(), Some("50"));
    assert_eq!(param(&catalog_url("", 3, &br()), "start").as_deref(), Some("150"));
}

#[test]
fn the_appdetails_batch_joins_the_appids_with_one_filter() {
    let url = price_url(&[620, 730, 400], &br());
    assert_eq!(param(&url, "appids").as_deref(), Some("620,730,400"));
    assert_eq!(param(&url, "filters").as_deref(), Some("price_overview"));
    assert_eq!(param(&basic_url(620, &br()), "filters").as_deref(), Some("basic"));
}

#[test]
fn the_review_summary_asks_for_the_summary_only_and_counts_every_language() {
    let url = reviews_url(620, &br());
    assert_eq!(param(&url, "num_per_page").as_deref(), Some("0"), "no review bodies, just the summary");
    assert_eq!(param(&url, "language").as_deref(), Some("all"));
    assert_eq!(param(&url, "json").as_deref(), Some("1"));
    assert!(url.path().ends_with("/appreviews/620"));
}

#[test]
fn the_web_api_urls_carry_the_key_and_the_account() {
    let recent = recent_url("chave", "76561190000000000", 5);
    assert_eq!(param(&recent, "key").as_deref(), Some("chave"));
    assert_eq!(param(&recent, "steamid").as_deref(), Some("76561190000000000"));
    assert_eq!(param(&recent, "count").as_deref(), Some("5"));
    assert!(param(&recent, "cc").is_none(), "the Web API has no storefront");
    assert_eq!(param(&wishlist_url("76561190000000000"), "steamid").as_deref(), Some("76561190000000000"));
    assert_eq!(param(&vanity_url("k", "gabe"), "vanityurl").as_deref(), Some("gabe"));
    assert_eq!(param(&summary_url("k", "76561190000000000"), "steamids").as_deref(), Some("76561190000000000"));
}

#[test]
fn the_library_asks_for_names_and_for_free_games_that_were_played() {
    let url = owned_url("chave", "76561190000000000");
    assert!(url.path().ends_with("/GetOwnedGames/v1"));
    assert_eq!(param(&url, "key").as_deref(), Some("chave"));
    assert_eq!(param(&url, "steamid").as_deref(), Some("76561190000000000"));
    assert_eq!(param(&url, "include_appinfo").as_deref(), Some("1"), "without it the names do not come");
    assert_eq!(param(&url, "include_played_free_games").as_deref(), Some("1"));
    assert_eq!(param(&url, "skip_unvetted_apps").as_deref(), Some("0"));
}

#[test]
fn the_capsule_path_is_deterministic_and_stays_on_steams_own_cdn() {
    let url = capsule_url(620);
    assert!(url.ends_with("/steam/apps/620/capsule_231x87.jpg"), "{url}");
    assert!(is_steam_image(&url), "a built URL still has to pass the check the webview's URLs pass");
}

#[test]
fn a_capsule_url_from_the_webview_only_ever_reaches_steams_own_cdns() {
    for ok in [
        "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/620/capsule_231x87.jpg?t=1",
        "https://cdn.cloudflare.steamstatic.com/steam/apps/620/header.jpg",
        "https://steamcdn-a.akamaihd.net/steam/apps/620/header.jpg",
        "https://steamstatic.com/a.jpg",
    ] {
        assert!(is_steam_image(ok), "{ok}");
    }
    for bad in [
        "http://shared.fastly.steamstatic.com/a.jpg",
        "https://steamstatic.com.evil.io/a.jpg",
        "https://evilsteamstatic.com/a.jpg",
        "https://127.0.0.1/a.jpg",
        "file:///C:/segredo.png",
        "https://steamcommunity.com/a.jpg",
        "",
    ] {
        assert!(!is_steam_image(bad), "{bad}");
    }
    assert!(!is_steam_image(&format!("https://steamstatic.com/{}.jpg", "a".repeat(600))), "a long URL is refused");
}
