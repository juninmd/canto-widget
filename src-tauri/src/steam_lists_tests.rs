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
fn a_fetch_failure_becomes_the_message_the_user_reads() {
    let offline = failed(FetchError::Network("offline".into())).to_string();
    assert!(offline.contains("sem conexão com a Steam"), "{offline}");
    let http = failed(FetchError::Other("HTTP 500".into())).to_string();
    assert!(http.contains("HTTP 500"), "{http}");
}
