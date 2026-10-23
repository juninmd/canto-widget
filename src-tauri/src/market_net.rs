//! Mercado network: Yahoo Finance's chart endpoint, keyless, one request per symbol and period.
use std::time::Duration;

use crate::market::{parse_chart, parse_history, History, Quote, RANGES, SYMBOLS};

const CHART: &str = "https://query1.finance.yahoo.com/v8/finance/chart/";
const TIMEOUT_S: u64 = 10;

fn client() -> Result<reqwest::blocking::Client, String> {
    crate::net::client_builder()
        // Yahoo answers 429 to clients without a browser-like agent.
        .user_agent("Mozilla/5.0 (canto-widget)")
        .timeout(Duration::from_secs(TIMEOUT_S))
        .redirect(reqwest::redirect::Policy::none())
        .build()
        .map_err(|e| e.to_string())
}

fn fetch(client: &reqwest::blocking::Client, ticker: &str, range: &str, interval: &str) -> Option<Vec<u8>> {
    let url = reqwest::Url::parse_with_params(&format!("{CHART}{ticker}"), [("range", range), ("interval", interval)])
        .ok()?;
    let res = client.get(url).send().ok()?;
    if !res.status().is_success() {
        return None;
    }
    res.bytes().ok().map(|b| b.to_vec())
}

fn no_answer() -> String {
    crate::lang::tr("sem resposta do Yahoo Finance", "no answer from Yahoo Finance").to_string()
}

/// Every symbol at once; one that fails is left out, and only an empty answer is an error.
pub fn quotes() -> Result<Vec<Quote>, String> {
    let client = client()?;
    let found: Vec<Quote> = std::thread::scope(|scope| {
        let handles: Vec<_> = SYMBOLS
            .iter()
            .map(|(symbol, ticker, group)| {
                let client = &client;
                scope.spawn(move || parse_chart(symbol, group, &fetch(client, ticker, "1d", "15m")?))
            })
            .collect();
        handles.into_iter().filter_map(|h| h.join().ok().flatten()).collect()
    });
    if found.is_empty() {
        return Err(no_answer());
    }
    Ok(found)
}

/// One symbol over a longer period; only symbols and ranges from our lists reach the network.
pub fn history(symbol: &str, range: &str) -> Result<History, String> {
    let ticker = SYMBOLS.iter().find(|(id, _, _)| *id == symbol).map(|(_, ticker, _)| *ticker);
    let interval = RANGES.iter().find(|(r, _)| *r == range).map(|(_, interval)| *interval);
    let (Some(ticker), Some(interval)) = (ticker, interval) else {
        return Err(crate::lang::tr("ativo ou período desconhecido", "unknown asset or period").to_string());
    };
    fetch(&client()?, ticker, range, interval).and_then(|body| parse_history(&body)).ok_or_else(no_answer)
}
