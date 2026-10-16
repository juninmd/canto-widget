use super::*;
use crate::steam_parse::Price;

fn query(url: &Url) -> Vec<(String, String)> {
    url.query_pairs().map(|(k, v)| (k.into_owned(), v.into_owned())).collect()
}

fn param(url: &Url, name: &str) -> Option<String> {
    query(url).into_iter().find(|(k, _)| k == name).map(|(_, v)| v)
}

#[test]
fn every_store_url_asks_for_brazilian_prices_in_portuguese() {
    for url in [trending_url(), catalog_url(""), price_url(&[620]), basic_url(620)] {
        assert_eq!(param(&url, "cc").as_deref(), Some("BR"), "{url}");
        assert_eq!(param(&url, "l").as_deref(), Some("portuguese"), "{url}");
    }
}

#[test]
fn the_trending_list_is_the_global_top_sellers() {
    let url = trending_url();
    assert!(url.path().ends_with("/search/"));
    assert_eq!(param(&url, "filter").as_deref(), Some("globaltopsellers"));
}

#[test]
fn the_catalog_sorts_by_reviews_and_takes_the_search_term() {
    assert_eq!(param(&catalog_url(""), "sort_by").as_deref(), Some("Reviews_DESC"));
    assert_eq!(param(&catalog_url(""), "term"), None, "an empty search is left out");
    assert_eq!(param(&catalog_url("  portal 2 "), "term").as_deref(), Some("portal 2"));
    assert!(param(&catalog_url(""), "start").is_none(), "the first page is the default");
}

#[test]
fn the_appdetails_batch_joins_the_appids_with_one_filter() {
    let url = price_url(&[620, 730, 400]);
    assert_eq!(param(&url, "appids").as_deref(), Some("620,730,400"));
    assert_eq!(param(&url, "filters").as_deref(), Some("price_overview"));
    assert_eq!(param(&basic_url(620), "filters").as_deref(), Some("basic"));
}

#[test]
fn the_web_api_urls_carry_the_key_and_the_account() {
    let recent = recent_url("chave", "76561190000000000", 5);
    assert_eq!(param(&recent, "key").as_deref(), Some("chave"));
    assert_eq!(param(&recent, "steamid").as_deref(), Some("76561190000000000"));
    assert_eq!(param(&recent, "count").as_deref(), Some("5"));
    assert_eq!(param(&wishlist_url("76561190000000000"), "steamid").as_deref(), Some("76561190000000000"));
    assert_eq!(param(&vanity_url("k", "gabe"), "vanityurl").as_deref(), Some("gabe"));
    assert_eq!(param(&summary_url("k", "76561190000000000"), "steamids").as_deref(), Some("76561190000000000"));
}

#[test]
fn only_discounted_games_survive_and_the_biggest_discount_leads() {
    let price = |discount: u32, cents: i64| Price { discount, final_cents: cents, ..Default::default() };
    let mut prices = HashMap::new();
    prices.insert(1u32, price(0, 100));
    prices.insert(2u32, price(50, 900));
    prices.insert(3u32, price(50, 300));
    prices.insert(4u32, price(80, 8000));
    let deals: Vec<u32> = best_deals(prices).into_iter().map(|(id, _)| id).collect();
    assert_eq!(deals, vec![4, 3, 2], "80% first, then the two 50% by price");
}

#[test]
fn two_identical_offers_keep_a_stable_order() {
    let same = || Price { discount: 50, final_cents: 500, ..Default::default() };
    let first: Vec<u32> =
        best_deals(HashMap::from([(9u32, same()), (4u32, same())])).into_iter().map(|(id, _)| id).collect();
    assert_eq!(first, vec![4, 9], "the appid breaks the tie, so the list never flips between runs");
}

#[test]
fn a_wishlist_with_nothing_on_sale_gives_no_deals() {
    let mut prices = HashMap::new();
    prices.insert(1u32, Price { discount: 0, final_cents: 100, ..Default::default() });
    assert!(best_deals(prices).is_empty());
}
