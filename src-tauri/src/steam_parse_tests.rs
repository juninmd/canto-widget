use super::*;

#[test]
fn the_wishlist_gives_appids_and_a_private_one_gives_none() {
    let json = r#"{"response":{"items":[{"appid":620,"priority":0},{"appid":730,"priority":1}]}}"#;
    assert_eq!(parse_wishlist(json).unwrap(), vec![620, 730]);
    assert_eq!(parse_wishlist(r#"{"response":{}}"#).unwrap(), Vec::<u32>::new());
    assert!(parse_wishlist("não é json").is_err());
}

#[test]
fn prices_keep_the_discount_and_skip_free_or_failed_apps() {
    let json = r#"{
        "620":{"success":true,"data":{"price_overview":{"currency":"BRL","initial":3399,"final":1699,"discount_percent":50,"final_formatted":"R$ 16,99"}}},
        "730":{"success":true,"data":[]},
        "400":{"success":false}
    }"#;
    let prices = parse_prices(json);
    assert_eq!(prices.len(), 1);
    let price = &prices[&620];
    assert_eq!((price.discount, price.final_cents, price.final_formatted.as_str()), (50, 1699, "R$ 16,99"));
    assert_eq!(price.saved_cents(), 1700);
}

#[test]
fn a_price_that_did_not_drop_saves_nothing() {
    let price = Price { discount: 0, initial: 3399, final_cents: 3399, ..Default::default() };
    assert_eq!(price.saved_cents(), 0);
    let malformed = Price { discount: 10, initial: 100, final_cents: 200, ..Default::default() };
    assert_eq!(malformed.saved_cents(), 0, "a final above the original never saves");
    let absurd = Price { discount: 90, initial: i64::MAX, final_cents: i64::MIN, ..Default::default() };
    assert_eq!(absurd.saved_cents(), u32::MAX, "the savings never wrap");
}

#[test]
fn the_basic_answer_gives_the_name_and_the_smallest_image() {
    let both = r#"{"620":{"success":true,"data":{"name":"Portal 2","capsule_image":"https://cdn/capsule.jpg","header_image":"https://cdn/header.jpg"}}}"#;
    assert_eq!(parse_basic(both), Some(("Portal 2".into(), "https://cdn/capsule.jpg".into())));
    let header_only = r#"{"620":{"success":true,"data":{"name":"Portal 2","header_image":"https://cdn/header.jpg"}}}"#;
    assert_eq!(parse_basic(header_only), Some(("Portal 2".into(), "https://cdn/header.jpg".into())));
    assert_eq!(parse_basic(r#"{"620":{"success":false}}"#), None);
    assert_eq!(parse_basic(r#"{"620":{"success":true,"data":{"name":""}}}"#), None);
    assert_eq!(parse_basic("nada"), None);
}

#[test]
fn the_store_summary_gives_the_percentage_the_bucket_and_the_count() {
    // Captured from the reviews endpoint the deals use, with the store read in Portuguese.
    let json = r#"{"success":1,"query_summary":{"num_reviews":0,"review_score":8,"review_score_desc":"Muito positivas","total_positive":34124,"total_negative":661,"total_reviews":34785},"reviews":[]}"#;
    assert_eq!(parse_reviews(json), Some((98, "very_positive".into(), 34785)));
    assert_eq!(parse_reviews(r#"{"success":1,"query_summary":{"total_reviews":0}}"#), None, "no reviews yet");
    assert_eq!(parse_reviews(r#"{"success":0}"#), None);
    assert_eq!(parse_reviews("nada"), None);
}
