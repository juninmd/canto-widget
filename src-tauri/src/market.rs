//! Mercado tab: keyless quotes from Yahoo Finance's chart endpoint, one request per symbol, read in parallel.
use std::time::Duration;

use serde::{Deserialize, Serialize};

const CHART: &str = "https://query1.finance.yahoo.com/v8/finance/chart/";
const TIMEOUT_S: u64 = 10;
/// Enough intraday points for a curve; the endpoint gives one every 15 min of the session.
const MAX_POINTS: usize = 96;

/// Our id (what the UI keys its label on) and Yahoo's ticker, in the order the tab shows them.
pub const SYMBOLS: [(&str, &str); 6] = [
    ("USD/BRL", "USDBRL=X"),
    ("EUR/BRL", "EURBRL=X"),
    ("BTC/USD", "BTC-USD"),
    ("IBOV", "^BVSP"),
    ("S&P 500", "^GSPC"),
    ("NASDAQ", "^IXIC"),
];

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct Quote {
    pub symbol: String,
    pub price: f64,
    /// Percentage against the previous close; 0 when the API gives no close to compare with.
    pub change: f64,
    pub points: Vec<f64>,
}

#[derive(Deserialize)]
struct Envelope {
    chart: Chart,
}
#[derive(Deserialize)]
struct Chart {
    #[serde(default)]
    result: Option<Vec<Series>>,
}
#[derive(Deserialize)]
struct Series {
    meta: Meta,
    #[serde(default)]
    indicators: Option<Indicators>,
}
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Meta {
    regular_market_price: Option<f64>,
    chart_previous_close: Option<f64>,
    previous_close: Option<f64>,
}
#[derive(Deserialize)]
struct Indicators {
    #[serde(default)]
    quote: Vec<Closes>,
}
#[derive(Deserialize)]
struct Closes {
    #[serde(default)]
    close: Vec<Option<f64>>,
}

pub fn change_percent(price: f64, previous: Option<f64>) -> f64 {
    match previous {
        Some(prev) if prev.is_finite() && prev != 0.0 => (price - prev) / prev * 100.0,
        _ => 0.0,
    }
}

/// The session's closes without the gaps Yahoo leaves as `null`, capped, ending on the live price.
pub fn parse_chart(symbol: &str, body: &[u8]) -> Option<Quote> {
    let envelope: Envelope = serde_json::from_slice(body).ok()?;
    let series = envelope.chart.result?.into_iter().next()?;
    let price = series.meta.regular_market_price.filter(|p| p.is_finite() && *p > 0.0)?;
    let previous = series.meta.chart_previous_close.or(series.meta.previous_close);
    let mut points: Vec<f64> = series
        .indicators
        .and_then(|i| i.quote.into_iter().next())
        .map(|q| q.close.into_iter().flatten().filter(|v| v.is_finite()).collect())
        .unwrap_or_default();
    if points.len() > MAX_POINTS {
        points.drain(..points.len() - MAX_POINTS);
    }
    if points.last() != Some(&price) {
        points.push(price);
    }
    if let Some(prev) = previous.filter(|p| p.is_finite()) {
        points.insert(0, prev);
    }
    Some(Quote { symbol: symbol.to_string(), price, change: change_percent(price, previous), points })
}

fn client() -> Result<reqwest::blocking::Client, String> {
    crate::net::client_builder()
        // Yahoo answers 429 to clients without a browser-like agent.
        .user_agent("Mozilla/5.0 (canto-widget)")
        .timeout(Duration::from_secs(TIMEOUT_S))
        .redirect(reqwest::redirect::Policy::none())
        .build()
        .map_err(|e| e.to_string())
}

fn fetch_one(client: &reqwest::blocking::Client, symbol: &str, ticker: &str) -> Option<Quote> {
    let url =
        reqwest::Url::parse_with_params(&format!("{CHART}{ticker}"), [("range", "1d"), ("interval", "15m")]).ok()?;
    let res = client.get(url).send().ok()?;
    if !res.status().is_success() {
        return None;
    }
    parse_chart(symbol, &res.bytes().ok()?)
}

/// Every symbol at once; one that fails is left out, and only an empty answer is an error.
pub fn quotes() -> Result<Vec<Quote>, String> {
    let client = client()?;
    let found: Vec<Quote> = std::thread::scope(|scope| {
        let handles: Vec<_> = SYMBOLS
            .iter()
            .map(|(symbol, ticker)| {
                let client = &client;
                scope.spawn(move || fetch_one(client, symbol, ticker))
            })
            .collect();
        handles.into_iter().filter_map(|h| h.join().ok().flatten()).collect()
    });
    if found.is_empty() {
        return Err(crate::lang::tr("sem resposta do Yahoo Finance", "no answer from Yahoo Finance").to_string());
    }
    Ok(found)
}

#[cfg(test)]
#[path = "market_tests.rs"]
mod tests;
