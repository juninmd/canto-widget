//! Cotações keyless: câmbio no Banco Central, bitcoin no CoinGecko e as bolsas na CNBC. Dados públicos, sem cofre.
use std::time::Duration;

use serde::{Deserialize, Serialize};

const BCB: &str = "https://api.bcb.gov.br/dados/serie/bcdata.sgs";
const COINGECKO: &str = "https://api.coingecko.com/api/v3/simple/price";
const CNBC: &str = "https://quote.cnbc.com/quote-html-webservice/restQuote/symbolType/symbol";
const TIMEOUT_S: u64 = 15;

/// The two official daily rates the card shows, with the BCB series that carries each one.
const CURRENCIES: &[(&str, &str, &str)] = &[("1", "USD/BRL", "Dólar"), ("21619", "EUR/BRL", "Euro")];

/// The indexes, with the label a widget can fit and the symbol CNBC answers to.
const INDEXES: &[(&str, &str, &str)] = &[
    (".BVSP", "IBOV", "Ibovespa"),
    (".SPX", "SPX", "S&P 500"),
    (".IXIC", "IXIC", "Nasdaq"),
    (".DJI", "DJI", "Dow Jones"),
    (".N225", "N225", "Nikkei 225"),
    (".GDAXI", "DAX", "DAX"),
    (".FTSE", "FTSE", "FTSE 100"),
    (".FCHI", "CAC", "CAC 40"),
    (".HSI", "HSI", "Hang Seng"),
    (".SSEC", "SSEC", "Shanghai"),
];

/// One line of the card. `decimals` is what the UI needs to print the number in the user's locale.
#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct Quote {
    pub symbol: String,
    pub label: String,
    pub value: f64,
    pub change: f64,
    pub decimals: u8,
}

/// CNBC sends "7,659.44" and "-1.09%"; the comma is a thousands separator, so it goes.
fn number(text: &str) -> Option<f64> {
    let cleaned: String = text.chars().filter(|c| c.is_ascii_digit() || matches!(c, '.' | '-' | '+')).collect();
    cleaned.parse::<f64>().ok().filter(|value| value.is_finite())
}

#[derive(Deserialize)]
struct BcbPoint {
    data: String,
    valor: String,
}

/// The last two daily rates of a series: the value and the variation against the day before. The API answers in
/// date order, but the days are sorted here anyway so the reading never depends on that.
pub fn parse_rate(body: &[u8]) -> Option<(f64, f64)> {
    let points: Vec<BcbPoint> = serde_json::from_slice(body).ok()?;
    let mut dated: Vec<(String, f64)> = points
        .iter()
        .filter_map(|point| {
            // dd/mm/yyyy -> yyyy/mm/dd, which sorts as a string.
            let date = point.data.split('/').collect::<Vec<_>>();
            let key = (date.len() == 3).then(|| format!("{}/{}/{}", date[2], date[1], date[0]))?;
            Some((key, number(&point.valor)?))
        })
        .collect();
    dated.sort_by(|left, right| left.0.cmp(&right.0));
    let last = dated.last()?.1;
    let previous = dated.get(dated.len().checked_sub(2)?)?.1;
    (previous != 0.0).then(|| (last, (last / previous - 1.0) * 100.0))
}

#[derive(Deserialize)]
struct CoinGecko {
    bitcoin: Option<Coin>,
}

#[derive(Deserialize)]
struct Coin {
    brl: Option<f64>,
    brl_24h_change: Option<f64>,
}

pub fn parse_crypto(body: &[u8]) -> Option<(f64, f64)> {
    let body: CoinGecko = serde_json::from_slice(body).ok()?;
    let coin = body.bitcoin?;
    let value = coin.brl?;
    let change = coin.brl_24h_change?;
    (value.is_finite() && change.is_finite()).then_some((value, change))
}

#[derive(Deserialize)]
struct CnbcEnvelope {
    #[serde(rename = "FormattedQuoteResult")]
    result: Option<CnbcResult>,
}

#[derive(Deserialize)]
struct CnbcResult {
    #[serde(rename = "FormattedQuote", default)]
    quotes: Quotes,
}

/// One symbol comes back as an object and several as an array.
#[derive(Deserialize, Default)]
#[serde(untagged)]
enum Quotes {
    Many(Vec<CnbcQuote>),
    One(CnbcQuote),
    #[default]
    None,
}

impl Quotes {
    fn into_vec(self) -> Vec<CnbcQuote> {
        match self {
            Quotes::Many(quotes) => quotes,
            Quotes::One(quote) => vec![quote],
            Quotes::None => Vec::new(),
        }
    }
}

#[derive(Deserialize)]
struct CnbcQuote {
    symbol: String,
    #[serde(default)]
    last: String,
    #[serde(rename = "change_pct", default)]
    change_pct: String,
}

/// The rows the response actually carried: a market that closed without a reading is left out, not printed as zero.
pub fn parse_indexes(body: &[u8]) -> Vec<Quote> {
    let Ok(envelope) = serde_json::from_slice::<CnbcEnvelope>(body) else {
        return Vec::new();
    };
    let quotes = envelope.result.map(|result| result.quotes.into_vec()).unwrap_or_default();
    INDEXES
        .iter()
        .filter_map(|(from, symbol, label)| {
            let row = quotes.iter().find(|quote| quote.symbol == *from)?;
            Some(Quote {
                symbol: (*symbol).into(),
                label: (*label).into(),
                value: number(&row.last)?,
                change: number(&row.change_pct)?,
                decimals: 2,
            })
        })
        .collect()
}

pub fn client() -> Result<reqwest::blocking::Client, String> {
    crate::net::client_builder()
        .user_agent("canto-widget")
        .timeout(Duration::from_secs(TIMEOUT_S))
        // Nothing here needs a redirect, and one would be a way out of the API's host.
        .redirect(reqwest::redirect::Policy::none())
        .build()
        .map_err(|e| e.to_string())
}

fn body(client: &reqwest::blocking::Client, url: reqwest::Url) -> Result<Vec<u8>, String> {
    let res = client.get(url).send().map_err(|_| "sem resposta da fonte".to_string())?;
    match res.status().as_u16() {
        429 => Err("limite de consultas da fonte atingido".into()),
        s if !(200..300).contains(&s) => Err(format!("a fonte respondeu {s}")),
        _ => res.bytes().map(|b| b.to_vec()).map_err(|e| e.to_string()),
    }
}

fn get(client: &reqwest::blocking::Client, base: &str, query: &[(&str, &str)]) -> Result<Vec<u8>, String> {
    let url = reqwest::Url::parse_with_params(base, query).map_err(|e| e.to_string())?;
    body(client, url)
}

/// The dollar and the euro against the real, straight from the Central Bank's daily series.
pub fn exchange() -> Result<Vec<Quote>, String> {
    let client = client()?;
    let mut out = Vec::new();
    for (series, symbol, label) in CURRENCIES {
        let url = format!("{BCB}/{series}/dados/ultimos/2");
        let body = get(&client, &url, &[("formato", "json")])?;
        let (value, change) = parse_rate(&body).ok_or_else(|| format!("a série do {label} veio inesperada"))?;
        out.push(Quote { symbol: (*symbol).into(), label: (*label).into(), value, change, decimals: 4 });
    }
    Ok(out)
}

/// Bitcoin in reais, with the 24 h variation, in one call.
pub fn crypto() -> Result<Quote, String> {
    let client = client()?;
    let body =
        get(&client, COINGECKO, &[("ids", "bitcoin"), ("vs_currencies", "brl"), ("include_24hr_change", "true")])?;
    let (value, change) = parse_crypto(&body).ok_or_else(|| "a CoinGecko respondeu sem o bitcoin".to_string())?;
    Ok(Quote { symbol: "BTC/BRL".into(), label: "Bitcoin".into(), value, change, decimals: 0 })
}

/// Every index in one request: the widget can afford ten rows, not ten round trips.
pub fn indexes() -> Result<Vec<Quote>, String> {
    let client = client()?;
    let symbols = INDEXES.iter().map(|(from, _, _)| *from).collect::<Vec<_>>().join("|");
    let body = get(
        &client,
        CNBC,
        &[
            ("symbols", &symbols),
            ("requestMethod", "itv"),
            ("noform", "1"),
            ("partnerId", "2"),
            ("fund", "1"),
            ("exthrs", "1"),
            ("output", "json"),
            ("events", "1"),
        ],
    )?;
    let quotes = parse_indexes(&body);
    if quotes.is_empty() {
        return Err("a CNBC não devolveu nenhum índice".into());
    }
    Ok(quotes)
}

/// Everything the card shows. A source that fails takes the whole reading down: half a list would look like a
/// market that simply has fewer indexes, and the cache already keeps the last good one on screen.
pub fn quotes() -> Result<Vec<Quote>, String> {
    let mut out = exchange()?;
    out.push(crypto()?);
    out.extend(indexes()?);
    Ok(out)
}

#[cfg(test)]
#[path = "market_tests.rs"]
mod tests;
