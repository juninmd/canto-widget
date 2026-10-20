//! Mercado tab command: every quote at once, cached for 15 min in RAM. Public data, nothing saved.
use std::sync::Mutex;

use serde::Serialize;
use tauri::{AppHandle, Manager};

use crate::blocking::run;
use crate::error::AppError;
use crate::market::{self, Quote};
use crate::model::now_ms;

pub const TTL_MS: i64 = 15 * 60_000;

#[derive(Default)]
pub struct MarketState {
    cached: Mutex<Option<(i64, Vec<Quote>)>>,
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
        let cached = self.cached.lock().unwrap().clone();
        if let Some((at, quotes)) = &cached {
            if !force && now - at < TTL_MS {
                return MarketView { quotes: quotes.clone(), fetched_at: *at, error: None };
            }
        }
        match fetch() {
            Ok(quotes) => {
                *self.cached.lock().unwrap() = Some((now, quotes.clone()));
                MarketView { quotes, fetched_at: now, error: None }
            }
            Err(error) => {
                let (at, quotes) = cached.unwrap_or_default();
                MarketView { quotes, fetched_at: at, error: Some(error) }
            }
        }
    }
}

#[tauri::command]
pub async fn market_get(app: AppHandle, force: bool) -> MarketView {
    run(move || Ok::<_, AppError>(app.state::<MarketState>().view(force, now_ms(), market::quotes)))
        .await
        .unwrap_or_else(|error| MarketView { quotes: Vec::new(), fetched_at: 0, error: Some(error.to_string()) })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn quote(price: f64) -> Quote {
        Quote { symbol: "IBOV".into(), price, change: 0.0, points: vec![price] }
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
}
