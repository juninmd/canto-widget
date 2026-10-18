use super::*;

/// The account the fixtures watch.
const ACCOUNT: &str = "76561190000000000";

fn price(discount: u32, cents: i64) -> Price {
    Price { discount, final_cents: cents, final_formatted: "R$ 9,99".into(), ..Default::default() }
}

/// A state that already watched the Brazilian store, for `ACCOUNT`, at the given prices.
fn watching_before(prices: HashMap<u32, i64>) -> SteamWatch {
    SteamWatch { watching: true, region: "br".into(), steamid: ACCOUNT.into(), prices }
}

/// The same account and storefront, so only the prices matter.
fn scan(from: &SteamWatch, prices: &[(u32, Price)]) -> (Vec<Drop>, Baseline) {
    drops(from, &prices.iter().cloned().collect(), "br", ACCOUNT)
}

#[test]
fn the_first_scan_only_records_so_a_price_already_there_never_rings() {
    let (fell, next) = scan(&SteamWatch::default(), &[(620, price(70, 999))]);
    assert!(fell.is_empty(), "the alerts do not start with a burst");
    assert_eq!(next.prices, HashMap::from([(620u32, 999i64)]));
    assert_eq!((next.region.as_str(), next.steamid.as_str()), ("br", ACCOUNT), "and the next scan knows what it read");
}

#[test]
fn changing_the_storefront_only_records_because_cents_are_not_comparable() {
    // The same game in reais and in dollars: switching store must not read one as the other.
    let before = watching_before(HashMap::from([(620u32, 2999i64)]));
    let (fell, next) = drops(&before, &HashMap::from([(620u32, price(76, 1999))]), "us", ACCOUNT);
    assert!(fell.is_empty(), "every game would look cheaper when the currency changes");
    assert_eq!((next.prices[&620], next.region.as_str()), (1999, "us"));

    // And from then on the dollar baseline is the one that counts.
    let us = SteamWatch { region: next.region, steamid: next.steamid, prices: next.prices, ..before };
    let (fell, _) = drops(&us, &HashMap::from([(620u32, price(80, 999))]), "us", ACCOUNT);
    assert_eq!(fell, vec![Drop { appid: 620, was: 1999, now: 999 }]);
}

#[test]
fn another_account_is_another_wishlist_and_only_records() {
    let before = watching_before(HashMap::from([(620u32, 2999i64)]));
    let other = "76561190000000001";
    let (fell, next) = drops(&before, &HashMap::from([(620u32, price(76, 1999))]), "br", other);
    assert!(fell.is_empty(), "the second account is not measured against the first one's prices");
    assert_eq!((next.steamid.as_str(), next.prices[&620]), (other, 1999));

    // Coming back to the first account is a fresh baseline too, since the stored one is the second's.
    let back = SteamWatch { steamid: next.steamid, prices: next.prices, ..before };
    let (fell, _) = drops(&back, &HashMap::from([(620u32, price(70, 999))]), "br", ACCOUNT);
    assert!(fell.is_empty());
}

#[test]
fn a_scan_can_only_write_back_whose_wishlist_and_the_prices() {
    // What protects the user's click is the shape: the scan has no way to write `watching`.
    let state = watching_before(HashMap::from([(620u32, 2999i64)]));
    let (_, next) = scan(&state, &[(620, price(70, 999))]);
    let expected = Baseline { region: "br".into(), steamid: ACCOUNT.into(), prices: HashMap::from([(620u32, 999i64)]) };
    assert_eq!(next, expected);
}

#[test]
fn a_price_that_fell_rings_once_and_the_new_one_is_what_next_scan_compares_against() {
    let before = watching_before(HashMap::from([(620u32, 2999i64), (730u32, 999i64)]));
    let prices = [(620, price(70, 999)), (730, price(70, 999))];
    let (fell, next) = scan(&before, &prices);
    assert_eq!(fell, vec![Drop { appid: 620, was: 2999, now: 999 }], "only the one that fell");
    assert_eq!(next.prices, HashMap::from([(620u32, 999i64), (730u32, 999i64)]));

    // The very same prices again are not a drop.
    let after = SteamWatch { region: next.region, steamid: next.steamid, prices: next.prices, ..before.clone() };
    let (again, _) = scan(&after, &prices);
    assert!(again.is_empty());
}

#[test]
fn a_full_price_replaces_the_baseline_without_ringing() {
    let before = watching_before(HashMap::from([(620u32, 999i64)]));
    let (fell, next) = scan(&before, &[(620, price(0, 5999))]);
    assert!(fell.is_empty(), "a sale ending is not a deal");
    assert_eq!(next.prices[&620], 5999, "the next sale is measured against the full price");
}

#[test]
fn the_biggest_fall_leads_and_a_game_that_left_the_store_is_forgotten() {
    let before = watching_before(HashMap::from([(1u32, 5000i64), (2u32, 5000i64), (3u32, 5000i64)]));
    let (fell, next) = scan(&before, &[(1, price(60, 2000)), (2, price(80, 1000))]);
    assert_eq!(fell.iter().map(|d| d.appid).collect::<Vec<u32>>(), vec![2, 1], "3000 of fall leads");
    assert!(!next.prices.contains_key(&3), "an app the store no longer prices leaves the baseline");
}

#[test]
fn a_free_price_is_announced_with_a_word_and_not_with_an_empty_string() {
    // Steam sends no formatted price for a free app, so the tip cannot lean on `final_formatted`.
    let (_, body) = message("Portal 2", &Price { is_free: true, ..Default::default() });
    assert_eq!(body, "Portal 2 · Grátis");
    // And a giveaway (100% off, still priced) keeps the percentage it came with.
    let giveaway =
        Price { discount: 100, initial: 3399, final_cents: 0, final_formatted: "R$ 0,00".into(), ..Default::default() };
    assert_eq!(message("Portal 2", &giveaway).1, "Portal 2 · -100% · R$ 0,00");
}

#[test]
fn a_game_that_becomes_free_is_the_biggest_drop_of_all() {
    let before = watching_before(HashMap::from([(620u32, 2999i64)]));
    let (fell, next) = scan(&before, &[(620, Price { is_free: true, ..Default::default() })]);
    assert_eq!(fell, vec![Drop { appid: 620, was: 2999, now: 0 }]);
    assert_eq!(next.prices[&620], 0, "and the free price is the new baseline");
}

#[test]
fn the_tip_names_the_game_its_discount_and_the_stores_own_price() {
    let (title, body) = message("Portal 2", &price(70, 999));
    assert_eq!(title, "Ficou mais barato na lista de desejos");
    assert_eq!(body, "Portal 2 · -70% · R$ 9,99");
    let (_, plain) = message("#620", &price(0, 0));
    assert_eq!(plain, "#620 · R$ 9,99", "no discount attached means no percentage");
}
