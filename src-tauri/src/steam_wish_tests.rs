use super::*;

fn price(discount: u32, final_cents: i64) -> Price {
    Price {
        discount,
        initial: final_cents * 2,
        final_cents,
        final_formatted: format!("R$ {final_cents}"),
        initial_formatted: format!("R$ {}", final_cents * 2),
        ..Default::default()
    }
}

fn list() -> Vec<(u32, Option<Price>)> {
    entries(
        &[1, 2, 3, 4, 5],
        HashMap::from([(1, price(0, 5000)), (2, price(80, 900)), (3, price(75, 1200)), (5, price(10, 300))]),
    )
}

fn ids(list: &[(u32, Option<Price>)]) -> Vec<u32> {
    list.iter().map(|(id, _)| *id).collect()
}

#[test]
fn the_whole_list_keeps_steams_order_and_games_without_a_price() {
    assert_eq!(ids(&list()), vec![1, 2, 3, 4, 5]);
    assert!(list()[3].1.is_none(), "an unreleased game is still on the wishlist");
}

#[test]
fn every_sort_puts_unpriced_games_last() {
    assert_eq!(ids(&sorted(&list(), "discount")), vec![2, 3, 5, 1, 4]);
    assert_eq!(ids(&sorted(&list(), "price")), vec![5, 2, 3, 1, 4]);
    assert_eq!(ids(&sorted(&list(), "order")), vec![1, 2, 3, 4, 5]);
    assert_eq!(ids(&sorted(&list(), "nonsense")), vec![2, 3, 5, 1, 4], "anything else is the default");
}

#[test]
fn the_summary_counts_sales_and_the_hot_ones() {
    assert_eq!(summary(&list()), (5, 3, 2), "75% counts as hot");
}

#[test]
fn a_row_carries_the_price_or_stays_empty() {
    let priced = row(2, list()[1].1.as_ref(), None);
    assert_eq!(
        (priced.price.as_str(), priced.original.as_str(), priced.discount, priced.saved_cents),
        ("R$ 900", "R$ 1800", 80, 900)
    );
    let none = row(4, None, None);
    assert_eq!((none.price.as_str(), none.discount, none.name.as_str()), ("", 0, ""));
    assert!(none.art.ends_with("/4/header.jpg"));
    assert_eq!(page_ids(&list(), 0).len(), 5);
    assert!(page_ids(&list(), 1).is_empty());
}
