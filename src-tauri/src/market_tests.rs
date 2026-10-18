use super::*;

const BCB_BODY: &str = r#"[{"data":"15/10/2026","valor":"5.0521"},{"data":"16/10/2026","valor":"5.0826"}]"#;

const CNBC_BODY: &str = r#"{"FormattedQuoteResult":{"FormattedQuote":[
  {"symbol":".SPX","name":"S&P 500 Index","last":"7,659.44","change":"-84.62","change_pct":"-1.09%"},
  {"symbol":".BVSP","name":"Sao Paulo Bovespa Index","last":"205,430.33","change":"1,103.2","change_pct":"+0.54%"}]}}"#;

#[test]
fn the_last_rate_and_the_variation_come_from_the_series() {
    let (value, change) = parse_rate(BCB_BODY.as_bytes()).unwrap();
    assert_eq!(value, 5.0826);
    assert!((change - 0.6038).abs() < 0.001, "variação: {change}");
}

#[test]
fn the_series_is_read_as_dates_not_as_the_order_the_api_happened_to_send() {
    let backwards = r#"[{"data":"16/10/2026","valor":"5.0826"},{"data":"15/10/2026","valor":"5.0521"}]"#;
    assert_eq!(parse_rate(backwards.as_bytes()), parse_rate(BCB_BODY.as_bytes()));
}

#[test]
fn a_rate_without_a_day_to_compare_or_with_zero_leaves_no_quote() {
    assert_eq!(parse_rate(br#"[{"data":"16/10/2026","valor":"5.0826"}]"#), None);
    assert_eq!(parse_rate(br#"[{"data":"15/10/2026","valor":"0"},{"data":"16/10/2026","valor":"5"}]"#), None);
    assert_eq!(parse_rate(b"nao json"), None);
    assert_eq!(parse_rate(br#"[{"data":"16/10/2026","valor":"abc"}]"#), None);
}

#[test]
fn the_bitcoin_reading_needs_the_price_and_the_variation() {
    let body = br#"{"bitcoin":{"brl":411553,"brl_24h_change":-0.51}}"#;
    assert_eq!(parse_crypto(body), Some((411553.0, -0.51)));
    assert_eq!(parse_crypto(br#"{"bitcoin":{"brl":411553}}"#), None);
    assert_eq!(parse_crypto(b"<html>"), None);
}

#[test]
fn every_index_the_response_carried_becomes_a_row_with_its_own_label() {
    let rows = parse_indexes(CNBC_BODY.as_bytes());
    // The order is the card's, not the API's: the Ibovespa leads for a Brazilian user whichever way CNBC answers.
    assert_eq!(rows.len(), 2);
    assert_eq!(
        rows[0],
        Quote { symbol: "IBOV".into(), label: "Ibovespa".into(), value: 205430.33, change: 0.54, decimals: 2 }
    );
    assert_eq!(
        rows[1],
        Quote { symbol: "SPX".into(), label: "S&P 500".into(), value: 7659.44, change: -1.09, decimals: 2 }
    );
}

#[test]
fn one_symbol_comes_back_as_an_object_and_is_still_read() {
    let single = br#"{"FormattedQuoteResult":{"FormattedQuote":
      {"symbol":".SPX","last":"7,659.44","change_pct":"-1.09%"}}}"#;
    let rows = parse_indexes(single);
    assert_eq!(rows.len(), 1);
    assert_eq!(rows[0].symbol, "SPX");
}

#[test]
fn an_index_without_a_reading_is_left_out_instead_of_printed_as_zero() {
    let partial = br#"{"FormattedQuoteResult":{"FormattedQuote":[
      {"symbol":".SPX","last":"7,659.44","change_pct":"-1.09%"},
      {"symbol":".DJI","last":"","change_pct":""}]}}"#;
    let rows = parse_indexes(partial);
    assert_eq!(rows.len(), 1);
    assert_eq!(rows[0].symbol, "SPX");
    assert_eq!(parse_indexes(br#"{"FormattedQuoteResult":{}}"#).len(), 0);
    assert_eq!(parse_indexes(b"nao json").len(), 0);
}

#[test]
fn a_thousands_separator_is_not_a_decimal_one() {
    assert_eq!(number("7,659.44"), Some(7659.44));
    assert_eq!(number("+0.54%"), Some(0.54));
    assert_eq!(number("-84.62"), Some(-84.62));
    assert_eq!(number("205,430.33"), Some(205430.33));
    assert_eq!(number(""), None);
    assert_eq!(number("n/a"), None);
}
