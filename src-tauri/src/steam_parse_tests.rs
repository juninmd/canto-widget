use super::*;

/// A slice of a real store search page: a discounted row, a plain one and one with no review yet.
fn page() -> String {
    let row = |appid: &str, name: &str, review: &str, price: &str| {
        format!(
            r#"<a href="https://store.steampowered.com/app/{appid}/{name}/" data-ds-appid="{appid}" class="search_result_row ">
                <span class="title">{name}</span>{review}
                <div class="search_price_discount_combined">{price}</div>
            </a>"#
        )
    };
    let discounted = r#"<span class="search_review_summary very_positive" data-tooltip-html="Muito positivas&lt;br&gt;91% das 12.345 an&aacute;lises de utilizadores s&atilde;o positivas."></span>"#;
    let plain = r#"<span class="search_review_summary positive" data-tooltip-html="Positivas&lt;br&gt;80% das 20 an&aacute;lises de utilizadores sobre este jogo s&atilde;o positivas."></span>"#;
    format!(
        "{}{}{}",
        row(
            "1055540",
            "A Short Hike",
            discounted,
            r#"<div class="discount_block" data-discount="60"><div class="discount_pct">-60%</div><div class="discount_original_price">R$24,99</div><div class="discount_final_price">R$9,99</div></div>"#
        ),
        row(
            "620",
            "Portal 2",
            plain,
            r#"<div class="discount_block no_discount"><div class="discount_final_price">R$33,99</div></div>"#
        ),
        row(
            "400",
            "Portal",
            "",
            r#"<div class="discount_block no_discount"><div class="discount_final_price">R$33,99</div></div>"#
        ),
    )
}

#[test]
fn a_search_page_gives_appid_title_price_discount_and_reviews() {
    let rows = parse_search(&page());
    assert_eq!(rows.len(), 3);
    assert_eq!(
        rows[0],
        SteamRow {
            appid: 1055540,
            name: "A Short Hike".into(),
            price: "R$9,99".into(),
            original: "R$24,99".into(),
            discount: 60,
            review: Some(91),
            review_label: "Muito positivas".into(),
        }
    );
}

#[test]
fn a_row_without_a_discount_or_a_review_summary_is_still_read() {
    let rows = parse_search(&page());
    assert_eq!(rows[1].discount, 0);
    assert_eq!(rows[1].original, "");
    assert_eq!(rows[1].review, Some(80));
    assert_eq!(rows[2].review, None);
    assert_eq!(rows[2].review_label, "");
    assert_eq!(rows[2].name, "Portal");
}

#[test]
fn an_empty_page_gives_no_rows() {
    assert!(parse_search("<html><body>nada</body></html>").is_empty());
    assert!(parse_search("").is_empty());
}

#[test]
fn entities_in_a_title_come_back_as_text() {
    let html = r#"<a data-ds-appid="700" ><span class="title">Tom &amp; Jerry</span></a>"#;
    assert_eq!(parse_search(html)[0].name, "Tom & Jerry");
    assert_eq!(unescape("&lt;br&gt; &quot;x&quot; &#39;y&#39;"), "<br> \"x\" 'y'");
    assert_eq!(unescape("Pok&#233;mon &#x41;"), "Pokémon A", "numeric entities decode");
    assert_eq!(unescape("&amp;lt;"), "&lt;", "one pass only, never twice");
    assert_eq!(unescape("100% & so"), "100% & so", "a stray ampersand is kept");
    assert_eq!(unescape("&naoexiste;"), "&naoexiste;", "an unknown entity is left alone");
}

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
}

#[test]
fn a_name_is_read_from_the_basic_answer() {
    let json = r#"{"620":{"success":true,"data":{"type":"game","name":"Portal 2"}}}"#;
    assert_eq!(parse_name(json).as_deref(), Some("Portal 2"));
    assert_eq!(parse_name(r#"{"620":{"success":false}}"#), None);
    assert_eq!(parse_name("nada"), None);
}

#[test]
fn recent_games_keep_both_playtimes_and_a_missing_one_reads_as_zero() {
    let json = r#"{"response":{"total_count":2,"games":[
        {"appid":620,"name":"Portal 2","playtime_2weeks":120,"playtime_forever":4000},
        {"appid":400,"name":"Portal","playtime_forever":900}
    ]}}"#;
    let games = parse_recent(json);
    assert_eq!(games.len(), 2);
    assert_eq!(games[0], RecentGame { appid: 620, name: "Portal 2".into(), recent_min: 120, total_min: 4000 });
    assert_eq!(games[1].recent_min, 0);
    assert!(parse_recent(r#"{"response":{}}"#).is_empty());
}

#[test]
fn a_vanity_name_resolves_only_when_steam_says_success() {
    assert_eq!(
        parse_vanity(r#"{"response":{"steamid":"76561190000000000","success":1}}"#).as_deref(),
        Some("76561190000000000")
    );
    assert_eq!(parse_vanity(r#"{"response":{"success":42,"message":"No match"}}"#), None);
    assert_eq!(parse_vanity("nada"), None);
}

#[test]
fn the_persona_name_doubles_as_the_key_check() {
    assert_eq!(parse_summary(r#"{"response":{"players":[{"personaname":"Ana"}]}}"#).as_deref(), Some("Ana"));
    assert_eq!(parse_summary(r#"{"response":{"players":[]}}"#), None);
}
