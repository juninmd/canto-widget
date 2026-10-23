//! Mercado tab: the symbols we follow and how a Yahoo Finance chart answer becomes a quote or a curve.
use serde::{Deserialize, Serialize};

/// Enough points for a curve: a session at 15 min, five days hourly, half a year daily.
const MAX_POINTS: usize = 130;

/// Our id (what the UI keys its label on), Yahoo's ticker and the group the UI filters by, in screen order.
pub const SYMBOLS: [(&str, &str, &str); 24] = [
    ("USD/BRL", "USDBRL=X", "fx"),
    ("EUR/BRL", "EURBRL=X", "fx"),
    ("GBP/BRL", "GBPBRL=X", "fx"),
    ("JPY/BRL", "JPYBRL=X", "fx"),
    ("CHF/BRL", "CHFBRL=X", "fx"),
    ("CAD/BRL", "CADBRL=X", "fx"),
    ("AUD/BRL", "AUDBRL=X", "fx"),
    ("CNY/BRL", "CNYBRL=X", "fx"),
    ("ARS/BRL", "ARSBRL=X", "fx"),
    ("EUR/USD", "EURUSD=X", "fx"),
    ("IBOV", "^BVSP", "index"),
    ("S&P 500", "^GSPC", "index"),
    ("NASDAQ", "^IXIC", "index"),
    ("DOW JONES", "^DJI", "index"),
    ("DAX", "^GDAXI", "index"),
    ("FTSE 100", "^FTSE", "index"),
    ("NIKKEI 225", "^N225", "index"),
    ("BTC/USD", "BTC-USD", "crypto"),
    ("ETH/USD", "ETH-USD", "crypto"),
    ("SOL/USD", "SOL-USD", "crypto"),
    ("XRP/USD", "XRP-USD", "crypto"),
    ("BNB/USD", "BNB-USD", "crypto"),
    ("DOGE/USD", "DOGE-USD", "crypto"),
    ("ADA/USD", "ADA-USD", "crypto"),
];

/// The periods the spotlight can switch to, as Yahoo's range and the interval that keeps the curve readable.
pub const RANGES: [(&str, &str); 5] = [("1d", "15m"), ("5d", "1h"), ("1mo", "1d"), ("6mo", "1d"), ("1y", "1wk")];

#[derive(Debug, Clone, Serialize, PartialEq, Default)]
pub struct Quote {
    pub symbol: String,
    pub group: String,
    pub price: f64,
    /// Percentage against the previous close; 0 when the API gives no close to compare with.
    pub change: f64,
    pub points: Vec<f64>,
    /// Unix seconds of each point, so the chart can say when a price was.
    pub times: Vec<i64>,
    pub currency: Option<String>,
    pub prev_close: Option<f64>,
    pub open: Option<f64>,
    pub day_low: Option<f64>,
    pub day_high: Option<f64>,
    pub year_low: Option<f64>,
    pub year_high: Option<f64>,
    /// Unix seconds of the last trade.
    pub market_time: Option<i64>,
    /// Today's regular session in unix seconds, for "open, closes at" on screen.
    pub session: Option<(i64, i64)>,
}

/// A spotlight period: just the curve, the quote itself comes with the day's reading.
#[derive(Debug, Clone, Serialize, PartialEq, Default)]
pub struct History {
    pub points: Vec<f64>,
    pub times: Vec<i64>,
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
    timestamp: Vec<Option<i64>>,
    #[serde(default)]
    indicators: Option<Indicators>,
}
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Meta {
    currency: Option<String>,
    regular_market_price: Option<f64>,
    chart_previous_close: Option<f64>,
    previous_close: Option<f64>,
    regular_market_day_low: Option<f64>,
    regular_market_day_high: Option<f64>,
    fifty_two_week_low: Option<f64>,
    fifty_two_week_high: Option<f64>,
    regular_market_time: Option<i64>,
    current_trading_period: Option<TradingPeriods>,
}
#[derive(Deserialize)]
struct TradingPeriods {
    regular: Option<Period>,
}
#[derive(Deserialize)]
struct Period {
    start: i64,
    end: i64,
}
#[derive(Deserialize)]
struct Indicators {
    #[serde(default)]
    quote: Vec<Bars>,
}
#[derive(Deserialize)]
struct Bars {
    #[serde(default)]
    close: Vec<Option<f64>>,
    #[serde(default)]
    open: Vec<Option<f64>>,
}

pub fn change_percent(price: f64, previous: Option<f64>) -> f64 {
    match previous {
        Some(prev) if prev.is_finite() && prev != 0.0 => (price - prev) / prev * 100.0,
        _ => 0.0,
    }
}

fn finite(value: Option<f64>) -> Option<f64> {
    value.filter(|v| v.is_finite() && *v > 0.0)
}

fn series(body: &[u8]) -> Option<Series> {
    let envelope: Envelope = serde_json::from_slice(body).ok()?;
    envelope.chart.result?.into_iter().next()
}

/// The closes paired with their times, without the gaps Yahoo leaves as `null`, capped to the latest.
fn curve(series: &Series) -> (Vec<f64>, Vec<i64>, Option<f64>) {
    let bars = series.indicators.as_ref().and_then(|i| i.quote.first());
    let closes = bars.map(|b| b.close.as_slice()).unwrap_or_default();
    let open = bars.and_then(|b| b.open.iter().copied().find_map(finite));
    let (mut points, mut times): (Vec<f64>, Vec<i64>) = closes
        .iter()
        .enumerate()
        .filter_map(|(i, close)| Some((finite(*close)?, series.timestamp.get(i).copied().flatten().unwrap_or(0))))
        .unzip();
    if points.len() > MAX_POINTS {
        points.drain(..points.len() - MAX_POINTS);
        times.drain(..times.len() - MAX_POINTS);
    }
    (points, times, open)
}

/// The day's reading: the session's curve ending on the live price, plus the numbers the spotlight lists.
pub fn parse_chart(symbol: &str, group: &str, body: &[u8]) -> Option<Quote> {
    let series = series(body)?;
    let meta = &series.meta;
    let price = finite(meta.regular_market_price)?;
    let previous = finite(meta.chart_previous_close.or(meta.previous_close));
    let (mut points, mut times, open) = curve(&series);
    if points.last() != Some(&price) {
        points.push(price);
        times.push(meta.regular_market_time.or(times.last().copied()).unwrap_or(0));
    }
    let (low, high) = points.iter().fold((f64::MAX, f64::MIN), |(lo, hi), p| (lo.min(*p), hi.max(*p)));
    Some(Quote {
        symbol: symbol.to_string(),
        group: group.to_string(),
        price,
        change: change_percent(price, previous),
        currency: meta.currency.clone(),
        prev_close: previous,
        open,
        day_low: finite(meta.regular_market_day_low).or(Some(low)),
        day_high: finite(meta.regular_market_day_high).or(Some(high)),
        year_low: finite(meta.fifty_two_week_low),
        year_high: finite(meta.fifty_two_week_high),
        market_time: meta.regular_market_time,
        session: meta.current_trading_period.as_ref().and_then(|p| p.regular.as_ref()).map(|p| (p.start, p.end)),
        points,
        times,
    })
}

/// A longer period's curve; it ends on the latest close Yahoo has for it.
pub fn parse_history(body: &[u8]) -> Option<History> {
    let series = series(body)?;
    let (points, times, _) = curve(&series);
    (!points.is_empty()).then_some(History { points, times })
}

#[cfg(test)]
#[path = "market_tests.rs"]
mod tests;
