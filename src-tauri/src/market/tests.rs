use super::*;

const BODY: &str = r#"{"chart":{"result":[{"meta":{"currency":"BRL","symbol":"USDBRL=X","regularMarketPrice":5.42,
"chartPreviousClose":5.40,"previousClose":5.39,"regularMarketDayLow":5.38,"regularMarketDayHigh":5.44,
"fiftyTwoWeekLow":4.9,"fiftyTwoWeekHigh":6.1,"regularMarketTime":4,
"currentTradingPeriod":{"pre":{"start":0,"end":1},"regular":{"start":1,"end":9}}},"timestamp":[1,2,3,4],
"indicators":{"quote":[{"close":[5.41,null,5.43,5.42],"open":[null,5.4,5.41,5.43]}]}}],"error":null}}"#;

#[test]
fn a_chart_becomes_a_quote_with_the_change_against_the_previous_close() {
    let quote = parse_chart("USD/BRL", "fx", BODY.as_bytes()).unwrap();
    assert_eq!(quote.symbol, "USD/BRL");
    assert_eq!(quote.group, "fx");
    assert_eq!(quote.price, 5.42);
    assert!((quote.change - 0.370_370).abs() < 1e-4);
    assert_eq!(quote.points, vec![5.41, 5.43, 5.42]);
    assert_eq!(quote.times, vec![1, 3, 4]);
}

#[test]
fn the_spotlight_numbers_come_from_the_same_answer() {
    let quote = parse_chart("USD/BRL", "fx", BODY.as_bytes()).unwrap();
    assert_eq!(quote.currency.as_deref(), Some("BRL"));
    assert_eq!(quote.prev_close, Some(5.40));
    assert_eq!(quote.open, Some(5.4));
    assert_eq!((quote.day_low, quote.day_high), (Some(5.38), Some(5.44)));
    assert_eq!((quote.year_low, quote.year_high), (Some(4.9), Some(6.1)));
    assert_eq!(quote.market_time, Some(4));
    assert_eq!(quote.session, Some((1, 9)));
}

#[test]
fn the_live_price_closes_the_curve_when_the_last_bar_lags() {
    let body = BODY.replace("\"regularMarketPrice\":5.42", "\"regularMarketPrice\":5.45");
    let quote = parse_chart("USD/BRL", "fx", body.as_bytes()).unwrap();
    assert_eq!(quote.points.last(), Some(&5.45));
    assert_eq!(quote.times.len(), quote.points.len());
}

#[test]
fn a_symbol_yahoo_does_not_know_yields_nothing() {
    let body = br#"{"chart":{"result":null,"error":{"code":"Not Found","description":"No data found"}}}"#;
    assert_eq!(parse_chart("IBOV", "index", body), None);
    assert_eq!(parse_chart("IBOV", "index", b"<html>"), None);
    assert_eq!(parse_history(body), None);
}

#[test]
fn without_a_previous_close_the_change_is_zero_and_the_day_range_falls_back_to_the_curve() {
    let body = br#"{"chart":{"result":[{"meta":{"regularMarketPrice":100.0}}]}}"#;
    let quote = parse_chart("IBOV", "index", body).unwrap();
    assert_eq!(quote.change, 0.0);
    assert_eq!(quote.points, vec![100.0]);
    assert_eq!((quote.day_low, quote.day_high), (Some(100.0), Some(100.0)));
    assert_eq!(quote.year_low, None);
    let body = br#"{"chart":{"result":[{"meta":{"chartPreviousClose":100.0}}]}}"#;
    assert_eq!(parse_chart("IBOV", "index", body), None);
}

#[test]
fn a_long_period_is_capped_to_the_latest_points() {
    let closes: Vec<String> = (0..200).map(|i| format!("{}.0", i + 1)).collect();
    let stamps: Vec<String> = (0..200).map(|i| i.to_string()).collect();
    let body = format!(
        r#"{{"chart":{{"result":[{{"meta":{{"regularMarketPrice":200.0}},"timestamp":[{}],"indicators":{{"quote":[{{"close":[{}]}}]}}}}]}}}}"#,
        stamps.join(","),
        closes.join(",")
    );
    let history = parse_history(body.as_bytes()).unwrap();
    assert_eq!(history.points.len(), MAX_POINTS);
    assert_eq!(history.points[0], 71.0);
    assert_eq!(history.times[0], 70);
    assert_eq!(parse_chart("IBOV", "index", body.as_bytes()).unwrap().points.len(), MAX_POINTS);
}

#[test]
fn every_symbol_has_a_known_group_and_the_ranges_start_with_the_day() {
    assert!(SYMBOLS.iter().all(|(_, _, group)| ["fx", "index", "crypto"].contains(group)));
    assert_eq!(RANGES[0].0, "1d");
}
