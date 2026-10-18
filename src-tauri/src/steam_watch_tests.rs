use super::*;

fn price(discount: u32, cents: i64) -> Price {
    Price { discount, final_cents: cents, final_formatted: "R$ 9,99".into(), ..Default::default() }
}

#[test]
fn the_first_scan_only_records_so_a_price_already_there_never_rings() {
    let prices = HashMap::from([(620u32, price(70, 999))]);
    let (fell, fresh) = drops(&HashMap::new(), &prices);
    assert!(fell.is_empty(), "the alerts do not start with a burst");
    assert_eq!(fresh, HashMap::from([(620u32, 999i64)]));
}

#[test]
fn a_price_that_fell_rings_once_and_the_new_one_is_what_next_scan_compares_against() {
    let seen = HashMap::from([(620u32, 2999i64), (730u32, 999i64)]);
    let prices = HashMap::from([(620u32, price(70, 999)), (730u32, price(70, 999))]);
    let (fell, fresh) = drops(&seen, &prices);
    assert_eq!(fell, vec![Drop { appid: 620, was: 2999, now: 999 }], "only the one that fell");
    assert_eq!(fresh, HashMap::from([(620u32, 999i64), (730u32, 999i64)]));
    // The very same prices again are not a drop.
    let (again, _) = drops(&fresh, &prices);
    assert!(again.is_empty());
}

#[test]
fn a_full_price_replaces_the_baseline_without_ringing() {
    let seen = HashMap::from([(620u32, 999i64)]);
    let (fell, fresh) = drops(&seen, &HashMap::from([(620u32, price(0, 5999))]));
    assert!(fell.is_empty(), "a sale ending is not a deal");
    assert_eq!(fresh[&620], 5999, "the next sale is measured against the full price");
}

#[test]
fn the_biggest_fall_leads_and_a_game_that_left_the_store_is_forgotten() {
    let seen = HashMap::from([(1u32, 5000i64), (2u32, 5000i64), (3u32, 5000i64)]);
    let prices = HashMap::from([(1u32, price(60, 2000)), (2u32, price(80, 1000))]);
    let (fell, fresh) = drops(&seen, &prices);
    assert_eq!(fell.iter().map(|d| d.appid).collect::<Vec<u32>>(), vec![2, 1], "3000 of fall leads");
    assert!(!fresh.contains_key(&3), "an app the store no longer prices leaves the baseline");
}

#[test]
fn the_tip_names_the_game_its_discount_and_the_stores_own_price() {
    let (title, body) = message("Portal 2", &price(70, 999));
    assert_eq!(title, "Ficou mais barato na lista de desejos");
    assert_eq!(body, "Portal 2 · -70% · R$ 9,99");
    let (_, free) = message("#620", &price(0, 0));
    assert_eq!(free, "#620 · R$ 9,99", "no discount attached means no percentage");
}
