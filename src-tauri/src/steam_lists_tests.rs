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
    let view = recent(&SteamConfig::default()).unwrap();
    assert!(!view.has_key);
    assert!(view.items.is_empty());
}

/// One owned game, the way the Web API reports it (before the capsule is built).
fn owned(appid: u32, name: &str, total_min: u32) -> OwnedGame {
    OwnedGame { appid, name: name.into(), total_min, art: String::new() }
}

#[test]
fn the_library_puts_the_most_played_first_and_counts_everything_it_matched() {
    let games = library_games(vec![owned(1, "Alpha", 100), owned(2, "Beta", 900), owned(3, "Gama", 100)], "");
    assert_eq!(games.iter().map(|g| g.appid).collect::<Vec<u32>>(), vec![2, 1, 3], "900 first, then the tie by name");
    assert_eq!(games[0].art, crate::steam_url::capsule_url(2), "the capsule is built from the appid");
    assert!(crate::steam_url::is_steam_image(&games[0].art));
    assert_eq!(
        (library_page(&games, 0).total, library_page(&games, 0).minutes, library_page(&games, 0).has_key),
        (3, 1100, true)
    );

    let filtered = library_games(vec![owned(1, "Alpha", 100), owned(2, "Betamax", 900)], "BETA");
    assert_eq!(filtered.len(), 1, "the search is case-insensitive");
    assert_eq!(filtered[0].appid, 2);
    assert_eq!(library_page(&filtered, 0).minutes, 900, "the total follows the search");
}

#[test]
fn the_library_pages_by_hundred_keeping_the_most_played_in_front() {
    let many: Vec<OwnedGame> =
        (1..=steam::LIBRARY as u32 + 5).map(|id| owned(id, &format!("Jogo {id:04}"), id)).collect();
    let games = library_games(many, "");
    let first = library_page(&games, 0);
    assert_eq!(first.items.len(), steam::LIBRARY);
    assert_eq!(first.total as usize, steam::LIBRARY + 5, "the pane can always say how many there are");
    assert_eq!(first.items[0].appid, steam::LIBRARY as u32 + 5, "the most played leads the first page");
    assert_eq!(first.items.last().unwrap().appid, 6);

    let last = library_page(&games, 1);
    assert_eq!(last.items.len(), 5, "the rest is a short page");
    assert_eq!(last.items[0].appid, 5);
    assert!(library_page(&games, 9).items.is_empty());
}

#[test]
fn a_library_without_a_key_says_so_instead_of_calling_out() {
    let view = library_without_key();
    assert!(!view.has_key);
    assert_eq!((view.total, view.minutes), (0, 0));
    assert!(view.items.is_empty());
    // And the fetch never happens: an account with no key gets an empty list, without asking Steam.
    assert!(library(&SteamConfig::default(), "portal").unwrap().is_empty());
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
