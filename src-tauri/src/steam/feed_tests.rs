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

#[test]
fn only_a_rate_limit_is_worth_trying_again() {
    assert!(retryable(&FetchError::Busy("muitas requisições".into())));
    assert!(!retryable(&FetchError::Network("offline".into())));
    assert!(!retryable(&FetchError::Other("jogo não encontrado na loja".into())));
    assert!(!retryable(&FetchError::Other("HTTP 500".into())));
    // And the wording the user reads does not change with the new variant.
    assert!(FetchError::Busy("muitas requisições".into()).message().contains("muitas requisições"));
}

#[test]
fn a_wishlist_past_the_bound_is_scanned_up_to_it() {
    let many: Vec<u32> = (0..crate::steam::WISHLIST_SCAN as u32 + 250).collect();
    assert_eq!(scan_ids(&many).len(), crate::steam::WISHLIST_SCAN);
    assert_eq!(scan_ids(&many)[0], 0, "the scan keeps the head of the list, not a random slice");
    let small = vec![1, 2, 3];
    assert_eq!(scan_ids(&small), &small[..], "a list inside the bound is untouched");
}
