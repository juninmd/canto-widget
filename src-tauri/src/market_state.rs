//! The quote cache: RAM only, served for 15 min. No user choice to keep, so nothing goes to disk.
use std::sync::Mutex;

use crate::market::Quote;

pub const TTL_MS: i64 = 15 * 60_000;

#[derive(Default)]
pub struct MarketState {
    cached: Mutex<Option<(i64, Vec<Quote>)>>,
}

impl MarketState {
    pub fn new() -> Self {
        Self::default()
    }

    /// The last reading that worked, which is what the card keeps showing while a new one fails.
    pub fn quotes(&self) -> Vec<Quote> {
        self.cached.lock().unwrap().as_ref().map(|(_, quotes)| quotes.clone()).unwrap_or_default()
    }

    pub fn fetched_at(&self) -> i64 {
        self.cached.lock().unwrap().as_ref().map_or(0, |(at, _)| *at)
    }

    /// A fresh reading comes from RAM; `force` (or the floor) goes to the network. The lock is released while
    /// fetching, so a slow source never blocks another tab.
    pub fn read(
        &self,
        force: bool,
        now: i64,
        fetch: impl FnOnce() -> Result<Vec<Quote>, String>,
    ) -> Result<Vec<Quote>, String> {
        if !force {
            if let Some((at, quotes)) = self.cached.lock().unwrap().clone() {
                if now - at < TTL_MS {
                    return Ok(quotes);
                }
            }
        }
        let quotes = fetch()?;
        *self.cached.lock().unwrap() = Some((now, quotes.clone()));
        Ok(quotes)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn quote(value: f64) -> Quote {
        Quote { symbol: "SPX".into(), label: "S&P 500".into(), value, change: 0.0, decimals: 2 }
    }

    #[test]
    fn a_fresh_reading_is_served_without_calling_the_sources_again() {
        let state = MarketState::new();
        let mut calls = 0;
        let first = state.read(false, 1_000, || {
            calls += 1;
            Ok(vec![quote(1.0)])
        });
        let second = state.read(false, 1_000 + TTL_MS - 1, || {
            calls += 1;
            Ok(vec![quote(2.0)])
        });
        assert_eq!(calls, 1);
        assert_eq!(first.unwrap()[0].value, 1.0);
        assert_eq!(second.unwrap()[0].value, 1.0);
        assert_eq!(state.fetched_at(), 1_000);
    }

    #[test]
    fn the_floor_and_the_button_both_refetch() {
        let state = MarketState::new();
        state.read(false, 1_000, || Ok(vec![quote(1.0)])).unwrap();
        assert_eq!(state.read(false, 1_000 + TTL_MS, || Ok(vec![quote(2.0)])).unwrap()[0].value, 2.0);
        assert_eq!(state.read(true, 1_001, || Ok(vec![quote(3.0)])).unwrap()[0].value, 3.0);
    }

    #[test]
    fn a_failed_fetch_keeps_the_last_good_reading_and_is_not_remembered_as_fresh() {
        let state = MarketState::new();
        state.read(false, 1_000, || Ok(vec![quote(1.0)])).unwrap();
        assert!(state.read(true, 2_000, || Err("sem resposta".into())).is_err());
        assert_eq!(state.quotes()[0].value, 1.0, "a lista boa saiu da tela");
        assert_eq!(state.fetched_at(), 1_000, "a leitura que falhou passou a valer como nova");
    }
}
