use super::*;

fn price(discount: u32, cents: i64) -> Price {
    Price { discount, final_cents: cents, final_formatted: "R$ 9,99".into(), ..Default::default() }
}

/// A state that already watched the Brazilian store at the given prices.
fn watching_before(prices: HashMap<u32, i64>) -> SteamWatch {
    SteamWatch { watching: true, region: "br".into(), prices }
}

#[test]
fn the_first_scan_only_records_so_a_price_already_there_never_rings() {
    let prices = HashMap::from([(620u32, price(70, 999))]);
    let (fell, next) = drops(&SteamWatch::default(), &prices, "br");
    assert!(fell.is_empty(), "the alerts do not start with a burst");
    assert_eq!(next.prices, HashMap::from([(620u32, 999i64)]));
    assert_eq!(next.region, "br", "and the storefront is remembered with them");
}

#[test]
fn changing_the_storefront_only_records_because_cents_are_not_comparable() {
    // The same game in reais and in dollars: switching store must not read one as the other.
    let before = watching_before(HashMap::from([(620u32, 2999i64)]));
    let (fell, next) = drops(&before, &HashMap::from([(620u32, price(76, 1999))]), "us");
    assert!(fell.is_empty(), "every game would look cheaper when the currency changes");
    assert_eq!(next.prices[&620], 1999);
    assert_eq!(next.region, "us");

    // And from then on the dollar baseline is the one that counts.
    let us = SteamWatch { region: next.region, prices: next.prices, ..before };
    let (fell, _) = drops(&us, &HashMap::from([(620u32, price(80, 999))]), "us");
    assert_eq!(fell, vec![Drop { appid: 620, was: 1999, now: 999 }]);
}

#[test]
fn a_scan_can_only_write_back_the_storefront_and_the_prices() {
    // What protects the user's click is the shape: the scan has no way to write `watching`.
    let state = watching_before(HashMap::from([(620u32, 2999i64)]));
    let (_, next) = drops(&state, &HashMap::from([(620u32, price(70, 999))]), "br");
    assert_eq!(next, Baseline { region: "br".into(), prices: HashMap::from([(620u32, 999i64)]) });
}

#[test]
fn a_price_that_fell_rings_once_and_the_new_one_is_what_next_scan_compares_against() {
    let before = watching_before(HashMap::from([(620u32, 2999i64), (730u32, 999i64)]));
    let prices = HashMap::from([(620u32, price(70, 999)), (730u32, price(70, 999))]);
    let (fell, next) = drops(&before, &prices, "br");
    assert_eq!(fell, vec![Drop { appid: 620, was: 2999, now: 999 }], "only the one that fell");
    assert_eq!(next.prices, HashMap::from([(620u32, 999i64), (730u32, 999i64)]));
    // The very same prices again are not a drop.
    let after = SteamWatch { region: next.region, prices: next.prices, ..before.clone() };
    let (again, _) = drops(&after, &prices, "br");
    assert!(again.is_empty());
}

#[test]
fn a_full_price_replaces_the_baseline_without_ringing() {
    let before = watching_before(HashMap::from([(620u32, 999i64)]));
    let (fell, next) = drops(&before, &HashMap::from([(620u32, price(0, 5999))]), "br");
    assert!(fell.is_empty(), "a sale ending is not a deal");
    assert_eq!(next.prices[&620], 5999, "the next sale is measured against the full price");
}

#[test]
fn the_biggest_fall_leads_and_a_game_that_left_the_store_is_forgotten() {
    let before = watching_before(HashMap::from([(1u32, 5000i64), (2u32, 5000i64), (3u32, 5000i64)]));
    let prices = HashMap::from([(1u32, price(60, 2000)), (2u32, price(80, 1000))]);
    let (fell, next) = drops(&before, &prices, "br");
    assert_eq!(fell.iter().map(|d| d.appid).collect::<Vec<u32>>(), vec![2, 1], "3000 of fall leads");
    assert!(!next.prices.contains_key(&3), "an app the store no longer prices leaves the baseline");
}

#[test]
fn the_tip_names_the_game_its_discount_and_the_stores_own_price() {
    let (title, body) = message("Portal 2", &price(70, 999));
    assert_eq!(title, "Ficou mais barato na lista de desejos");
    assert_eq!(body, "Portal 2 · -70% · R$ 9,99");
    let (_, free) = message("#620", &price(0, 0));
    assert_eq!(free, "#620 · R$ 9,99", "no discount attached means no percentage");
}
