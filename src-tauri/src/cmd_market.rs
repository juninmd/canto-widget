//! Mercado tab command: the keyless quotes, cached for 15 min. Public data, no vault.
use serde::Serialize;
use tauri::{AppHandle, Manager};

use crate::blocking::run;
use crate::error::AppError;
use crate::market::{self, Quote};
use crate::market_state::MarketState;
use crate::model::now_ms;

#[derive(Serialize)]
pub struct MarketView {
    pub quotes: Vec<Quote>,
    pub fetched_at: i64,
    /// pt-BR text when this reading failed; the last good quotes still come through with it.
    pub error: Option<String>,
}

#[tauri::command]
pub async fn market_get(app: AppHandle, force: bool) -> MarketView {
    run(move || {
        let state = app.state::<MarketState>();
        let view = match state.read(force, now_ms(), market::quotes) {
            Ok(quotes) => MarketView { quotes, fetched_at: state.fetched_at(), error: None },
            // A failed reading keeps the last one on the card, just like the other feeds.
            Err(error) => MarketView { quotes: state.quotes(), fetched_at: state.fetched_at(), error: Some(error) },
        };
        Ok::<_, AppError>(view)
    })
    .await
    .unwrap_or_else(|error| MarketView { quotes: Vec::new(), fetched_at: 0, error: Some(error.to_string()) })
}
