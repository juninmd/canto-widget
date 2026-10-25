//! Mercado tab commands: every quote at once, and one asset over a longer period, cached for 15 min in RAM.
//! Public data, nothing saved.
use crate::resilient::LockExt;
use std::collections::HashMap;
use std::sync::Mutex;

use serde::Serialize;
use tauri::{AppHandle, Manager};

use crate::blocking::run;
use crate::error::AppError;
use crate::market::{History, Quote};
use crate::market_net;
use crate::model::now_ms;

pub const TTL_MS: i64 = 15 * 60_000;

#[derive(Default)]
pub struct MarketState {
    cached: Mutex<Option<(i64, Vec<Quote>)>>,
    history: Mutex<HashMap<(String, String), (i64, History)>>,
}

#[derive(Serialize)]
pub struct MarketView {
    pub quotes: Vec<Quote>,
    pub fetched_at: i64,
    /// Set when this reading failed; the last good quotes still come through with it.
    pub error: Option<String>,
}

impl MarketState {
    /// Fresh quotes come from RAM; `force` (or the floor) goes to the network. A failure keeps the old quotes.
    pub fn view(&self, force: bool, now: i64, fetch: impl FnOnce() -> Result<Vec<Quote>, String>) -> MarketView {
        let cached = self.cached.lock_safe().clone();
        if let Some((at, quotes)) = &cached {
            if !force && now - at < TTL_MS {
                return MarketView { quotes: quotes.clone(), fetched_at: *at, error: None };
            }
        }
        match fetch() {
            Ok(quotes) => {
                *self.cached.lock_safe() = Some((now, quotes.clone()));
                MarketView { quotes, fetched_at: now, error: None }
            }
            Err(error) => {
                let (at, quotes) = cached.unwrap_or_default();
                MarketView { quotes, fetched_at: at, error: Some(error) }
            }
        }
    }

    /// A period's curve from RAM while fresh; a failure is only an error when nothing was read before.
    pub fn history(
        &self,
        key: (String, String),
        now: i64,
        fetch: impl FnOnce() -> Result<History, String>,
    ) -> Result<History, String> {
        let cached = self.history.lock_safe().get(&key).cloned();
        if let Some((at, history)) = &cached {
            if now - at < TTL_MS {
                return Ok(history.clone());
            }
        }
        match fetch() {
            Ok(history) => {
                self.history.lock_safe().insert(key, (now, history.clone()));
                Ok(history)
            }
            Err(error) => cached.map(|(_, history)| history).ok_or(error),
        }
    }
}

#[tauri::command]
pub async fn market_history(app: AppHandle, symbol: String, range: String) -> Result<History, String> {
    run(move || {
        let key = (symbol.clone(), range.clone());
        Ok::<_, AppError>(app.state::<MarketState>().history(key, now_ms(), || market_net::history(&symbol, &range)))
    })
    .await
    .map_err(|error| error.to_string())?
}

#[tauri::command]
pub async fn market_get(app: AppHandle, force: bool) -> MarketView {
    run(move || Ok::<_, AppError>(app.state::<MarketState>().view(force, now_ms(), market_net::quotes)))
        .await
        .unwrap_or_else(|error| MarketView { quotes: Vec::new(), fetched_at: 0, error: Some(error.to_string()) })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn quote(price: f64) -> Quote {
        Quote { symbol: "IBOV".into(), price, points: vec![price], ..Quote::default() }
    }

    #[test]
    fn quotes_are_served_from_ram_until_the_floor_or_a_forced_refresh() {
        let state = MarketState::default();
        assert_eq!(state.view(false, 1_000, || Ok(vec![quote(1.0)])).quotes[0].price, 1.0);
        let cached = state.view(false, 1_000 + TTL_MS - 1, || panic!("não devia buscar"));
        assert_eq!(cached.fetched_at, 1_000);
        assert_eq!(state.view(true, 2_000, || Ok(vec![quote(2.0)])).quotes[0].price, 2.0);
        assert_eq!(state.view(false, 2_000 + TTL_MS, || Ok(vec![quote(3.0)])).quotes[0].price, 3.0);
    }

    #[test]
    fn a_failed_reading_keeps_the_last_quotes_and_says_why() {
        let state = MarketState::default();
        state.view(false, 1_000, || Ok(vec![quote(1.0)]));
        let view = state.view(true, 2_000, || Err("sem resposta".into()));
        assert_eq!(view.error.as_deref(), Some("sem resposta"));
        assert_eq!(view.quotes[0].price, 1.0);
        assert_eq!(view.fetched_at, 1_000);
        let empty = MarketState::default().view(false, 1_000, || Err("sem resposta".into()));
        assert!(empty.quotes.is_empty());
    }

    #[test]
    fn a_period_is_read_once_per_floor_and_survives_a_failure() {
        let state = MarketState::default();
        let key = || ("IBOV".to_string(), "1mo".to_string());
        let curve = |p: f64| History { points: vec![p], times: vec![1] };
        assert_eq!(state.history(key(), 1_000, || Ok(curve(1.0))).unwrap().points, vec![1.0]);
        assert_eq!(state.history(key(), 2_000, || panic!("não devia buscar")).unwrap().points, vec![1.0]);
        assert_eq!(state.history(key(), 1_000 + TTL_MS, || Err("sem resposta".into())).unwrap().points, vec![1.0]);
        let other = state.history(("IBOV".into(), "1y".into()), 1_000, || Err("sem resposta".into()));
        assert_eq!(other, Err("sem resposta".to_string()));
    }
}
