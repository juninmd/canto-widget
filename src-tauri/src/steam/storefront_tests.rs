use super::*;

/// Real fragments captured from the store's search page (Search_results rows), kept as they come:
/// a bundle discount in front of the real one, a `no_discount` block, a free price and a review span
/// whose class says "positive" while its wording says "Extremamente positivas".
fn page() -> String {
    let row = |appid: &str, name: &str, review: &str, price: &str| {
        format!(
            r#"<a href="https://store.steampowered.com/app/{appid}/{name}/" data-ds-appid="{appid}" class="search_result_row ds_collapse_flag ">
                <div class="search_capsule"><img src="https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/{appid}/capsule_231x87.jpg?t=1790904544" ></div>
                <div class="responsive_search_name_combined"><div class="search_name ellipsis"><span class="title">{name}</span></div></div>
                <div class="search_reviewscore responsive_secondrow">{review}</div>
                <div class="search_price_discount_combined responsive_secondrow">{price}</div>
            </a>"#
        )
    };
    format!(
        "{}{}{}",
        row(
            "1040200",
            "A Nebula Tale",
            r#"<span class="search_review_summary positive" data-tooltip-html="Extremamente positivas&lt;br&gt;98% das 32,829 análises de utilizadores sobre este jogo são positivas.&lt;br&gt;&lt;br&gt;A Classificação Geral deste produto é calculada a partir de análises escritas no teu idioma."></span>"#,
            r#"<div class="search_discount_and_price responsive_secondrow">
                    <div class="discount_block search_discount_block" data-price-final="6559" data-bundlediscount="10" data-discount="51"><div class="bundle_base_discount" aria-hidden="true">-10%</div><div class="discount_pct" aria-hidden="true">-51%</div><div class="discount_prices" aria-hidden="true"><div class="discount_original_price">R$134,98</div><div class="discount_final_price">R$65,59</div></div><span class="discount_aria_label">51% de desconto.</span></div>
                </div>"#
        ),
        row(
            "620",
            "Portal 2",
            r#"<span class="search_review_summary positive" data-tooltip-html="Muito positivas&lt;br&gt;89% das 3,854 análises de utilizadores sobre este jogo são positivas."></span>"#,
            r#"<div class="discount_block no_discount search_discount_block" data-price-final="3399" data-bundlediscount="0" data-discount="0"><div class="discount_prices"><div class="discount_final_price">R$33,99</div></div></div>"#
        ),
        row(
            "400",
            "Portal",
            "",
            "<div class=\"discount_block no_discount search_discount_block\">\t<div class=\"discount_prices\">\t\t<div class=\"discount_final_price free\">Grátis</div>\t</div></div>"
        ),
    )
}

#[test]
fn a_row_is_read_the_way_the_store_prints_it() {
    let rows = parse_search(&page());
    assert_eq!(rows.len(), 3);
    assert_eq!(rows[0], SteamRow {
        appid: 1040200,
        name: "A Nebula Tale".into(),
        price: "R$65,59".into(),
        original: "R$134,98".into(),
        discount: 51,
        review: Some(98),
        review_key: "overwhelmingly_positive".into(),
        review_count: 32829,
        saved_cents: 6939,
        art: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1040200/capsule_231x87.jpg?t=1790904544".into(),
    });
}

#[test]
fn the_discount_comes_from_the_block_and_not_from_the_bundle_badge() {
    let rows = parse_search(&page());
    assert_eq!(rows[0].discount, 51, "the -10% bundle badge sits right before it");
    assert_eq!((rows[1].discount, rows[1].saved_cents), (0, 0), "a no_discount row carries data-discount=\"0\"");
}

#[test]
fn the_bucket_comes_from_the_wording_not_from_the_css_class() {
    let rows = parse_search(&page());
    // Both rows share class="search_review_summary positive"; the wording tells them apart.
    assert_eq!(rows[0].review_key, "overwhelmingly_positive");
    assert_eq!(rows[1].review_key, "very_positive");
    assert_eq!(rows[1].review, Some(89));
    assert_eq!(rows[1].review_count, 3854);
}

#[test]
fn a_free_row_keeps_its_word_and_a_row_without_reviews_has_none() {
    let rows = parse_search(&page());
    assert_eq!(rows[2].price, "Grátis", "the class is `discount_final_price free`");
    assert_eq!(rows[2].original, "");
    assert_eq!((rows[2].discount, rows[2].saved_cents), (0, 0));
    assert_eq!(rows[2].review, None);
    assert_eq!((rows[2].review_key.as_str(), rows[2].review_count), ("", 0));
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
fn a_thousands_separator_only_counts_between_digits() {
    assert_eq!(count_after_percent("98% das 32,829 análises"), 32829);
    assert_eq!(count_after_percent("91% of 1,350 reviews, 20 in your language"), 1350);
    assert_eq!(count_after_percent("80% das 20 análises"), 20);
    assert_eq!(count_after_percent("sem contagem aqui"), 0);
    assert_eq!(count_after_percent("99%"), 0);
}

#[test]
fn the_saved_amount_comes_from_the_two_printed_prices() {
    assert_eq!(savings("R$ 134,98", "R$ 65,59"), 6939);
    assert_eq!(savings("R$24,99", "R$24,99"), 0, "not discounted");
    assert_eq!(savings("Grátis", "R$9,99"), 0, "nothing to compare");
    assert_eq!(savings("R$9,99", "Grátis"), 0);
    assert_eq!(savings("", ""), 0);
    assert_eq!(cents("R$ 1.234,56"), Some(123456));
    assert_eq!(cents("Grátis"), None);
    assert_eq!(cents("¥ 1,980"), Some(198000), "the yen prints no decimals, so it is scaled to hundredths");
    assert_eq!(cents("₩ 22,000"), Some(2200000));
    assert_eq!(cents("CHF 12.50"), Some(1250));
    assert_eq!(cents("$9.99 USD"), Some(999));
    assert_eq!(savings("¥ 4,980", "¥ 1,245"), 373500);
}
