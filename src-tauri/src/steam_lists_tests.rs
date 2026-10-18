use super::*;

fn br() -> Region {
    crate::steam_region::parse("br").unwrap()
}

#[test]
fn a_full_catalog_page_promises_more_and_a_short_one_ends_the_list() {
    let row = |appid: u32| SteamRow {
        appid,
        name: format!("jogo {appid}"),
        price: String::new(),
        original: String::new(),
        discount: 0,
        review: None,
        review_key: String::new(),
        review_count: 0,
        saved_cents: 0,
        art: String::new(),
    };
    let full: Vec<SteamRow> = (0..steam::CATALOG_PAGE as u32).map(row).collect();
    let page = paged(full.clone(), &br());
    assert_eq!((page.items.len(), page.has_more), (steam::CATALOG_PAGE, true));
    assert_eq!(page.currency, "BRL", "the prices it carries are the region's");

    let mut short = full;
    short.pop();
    let last = paged(short, &br());
    assert_eq!((last.items.len(), last.has_more), (steam::CATALOG_PAGE - 1, false));
    assert!(!paged(Vec::new(), &br()).has_more, "the store had nothing left");
}

#[test]
fn a_recent_list_without_a_key_says_so_instead_of_calling_out() {
    let view = recent(&SteamConfig::default(), &br()).unwrap();
    assert!(!view.has_key);
    assert!(view.items.is_empty());
}

#[test]
fn the_wishlist_deals_are_paged_twelve_at_a_time() {
    let scan: Vec<(u32, Price)> = (0..25u32).map(|id| (id, Price { discount: 50, ..Default::default() })).collect();
    let ids = |page: usize| page_of(&scan, page).0.iter().map(|(id, _)| *id).collect::<Vec<u32>>();

    assert_eq!(ids(0), (0..12).collect::<Vec<u32>>());
    assert_eq!(ids(1), (12..24).collect::<Vec<u32>>());
    assert_eq!(ids(2), vec![24], "the last page keeps what is left");
    assert!(page_of(&scan, 0).1);
    assert!(page_of(&scan, 1).1);
    assert!(!page_of(&scan, 2).1, "a short page ends the list");
    assert!(page_of(&scan, 3).0.is_empty());
    assert!(!page_of(&[], 0).1, "an empty wishlist promises nothing");
}

#[test]
fn an_empty_scan_asks_the_store_for_nothing() {
    // No title to fetch, so this never leaves the process.
    let page = deals_page(&[], 0, &br()).unwrap();
    assert!(page.items.is_empty() && !page.has_more);
    assert_eq!(page.currency, "BRL");
}

#[test]
fn a_fetch_failure_becomes_the_message_the_user_reads() {
    let offline = failed(FetchError::Network("offline".into())).to_string();
    assert!(offline.contains("sem conexão com a Steam"), "{offline}");
    let http = failed(FetchError::Other("HTTP 500".into())).to_string();
    assert!(http.contains("HTTP 500"), "{http}");
}
