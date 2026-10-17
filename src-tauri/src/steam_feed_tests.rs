use super::*;

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
