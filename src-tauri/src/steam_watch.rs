//! What the price alerts decide, with no network and no vault: which games got cheaper since the last
//! look, and what the toast says. Pure, so `steam_watch_tests.rs` pins both.
use std::collections::HashMap;

use serde::{Deserialize, Serialize};

use crate::steam_parse::Price;

/// The sealed state of the alerts: the choice and the last price seen for each wishlist game.
/// Deliberately not `Debug`: it travels sealed.
#[derive(Default, Clone, Serialize, Deserialize)]
pub struct SteamWatch {
    #[serde(default)]
    pub watching: bool,
    /// In cents, so a later price is compared against what the game actually cost.
    #[serde(default)]
    pub prices: HashMap<u32, i64>,
}

/// One game that got cheaper since the last scan.
#[derive(Debug, Clone, PartialEq)]
pub struct Drop {
    pub appid: u32,
    pub was: i64,
    pub now: i64,
}

/// What got cheaper since the last scan, and the prices to remember next time. The first scan only
/// records: nothing rings for a price the game already had before the alerts were turned on.
pub fn drops(seen: &HashMap<u32, i64>, prices: &HashMap<u32, Price>) -> (Vec<Drop>, HashMap<u32, i64>) {
    let mut fresh = HashMap::with_capacity(prices.len());
    let mut fell = Vec::new();
    for (id, price) in prices {
        fresh.insert(*id, price.final_cents);
        if let Some(was) = seen.get(id).copied().filter(|was| price.final_cents < *was) {
            fell.push(Drop { appid: *id, was, now: price.final_cents });
        }
    }
    // The biggest fall leads; the appid last so the order never flips between runs.
    fell.sort_by(|a, b| (b.was - b.now).cmp(&(a.was - a.now)).then_with(|| a.appid.cmp(&b.appid)));
    (fell, fresh)
}

/// The toast for one game: the store's own price string, so no money is reformatted here. The title
/// carries the wording, which Rust translates; a game has no wording to translate.
pub fn message(name: &str, price: &Price) -> (String, String) {
    let title = crate::lang::tr("Ficou mais barato na lista de desejos", "Cheaper on your wishlist");
    let body = if price.discount > 0 {
        format!("{name} · -{}% · {}", price.discount, price.final_formatted)
    } else {
        format!("{name} · {}", price.final_formatted)
    };
    (title.to_string(), body)
}

#[cfg(test)]
#[path = "steam_watch_tests.rs"]
mod tests;
