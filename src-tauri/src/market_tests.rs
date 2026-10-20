use super::*;

const BODY: &str = r#"{"chart":{"result":[{"meta":{"currency":"BRL","symbol":"USDBRL=X","regularMarketPrice":5.42,
"chartPreviousClose":5.40,"previousClose":5.39},"timestamp":[1,2,3,4],
"indicators":{"quote":[{"close":[5.41,null,5.43,5.42],"open":[5.4,null,5.41,5.43]}]}}],"error":null}}"#;

#[test]
fn a_chart_becomes_a_quote_with_the_change_against_the_previous_close() {
    let quote = parse_chart("USD/BRL", BODY.as_bytes()).unwrap();
    assert_eq!(quote.symbol, "USD/BRL");
    assert_eq!(quote.price, 5.42);
    assert!((quote.change - 0.370_370).abs() < 1e-4);
    assert_eq!(quote.points, vec![5.40, 5.41, 5.43, 5.42]);
}

#[test]
fn the_live_price_closes_the_curve_when_the_last_bar_lags() {
    let body = BODY.replace("\"regularMarketPrice\":5.42", "\"regularMarketPrice\":5.45");
    let quote = parse_chart("USD/BRL", body.as_bytes()).unwrap();
    assert_eq!(quote.points.last(), Some(&5.45));
}

#[test]
fn a_symbol_yahoo_does_not_know_yields_nothing() {
    let body = br#"{"chart":{"result":null,"error":{"code":"Not Found","description":"No data found"}}}"#;
    assert_eq!(parse_chart("IBOV", body), None);
    assert_eq!(parse_chart("IBOV", b"<html>"), None);
}

#[test]
fn without_a_previous_close_the_change_is_zero_and_without_a_price_there_is_no_quote() {
    let body = br#"{"chart":{"result":[{"meta":{"regularMarketPrice":100.0}}]}}"#;
    let quote = parse_chart("IBOV", body).unwrap();
    assert_eq!(quote.change, 0.0);
    assert_eq!(quote.points, vec![100.0]);
    let body = br#"{"chart":{"result":[{"meta":{"chartPreviousClose":100.0}}]}}"#;
    assert_eq!(parse_chart("IBOV", body), None);
}

#[test]
fn a_long_session_is_capped_to_the_latest_points() {
    let closes: Vec<String> = (0..200).map(|i| format!("{}.0", i + 1)).collect();
    let body = format!(
        r#"{{"chart":{{"result":[{{"meta":{{"regularMarketPrice":200.0,"chartPreviousClose":1.0}},"indicators":{{"quote":[{{"close":[{}]}}]}}}}]}}}}"#,
        closes.join(",")
    );
    let quote = parse_chart("IBOV", body.as_bytes()).unwrap();
    assert_eq!(quote.points.len(), MAX_POINTS + 1);
    assert_eq!(quote.points[1], 105.0);
}
