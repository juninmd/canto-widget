//! What the price alerts decide, with no network and no vault: which games got cheaper since the last
//! look, and what the toast says. Pure, so `steam_watch_tests.rs` pins both.
use std::collections::HashMap;

use serde::{Deserialize, Serialize};

use crate::steam_parse::Price;

/// The sealed state of the alerts: the choice, the storefront those prices came from, and the last
/// price seen for each wishlist game. Deliberately not `Debug`: it travels sealed.
#[derive(Default, Clone, Serialize, Deserialize)]
pub struct SteamWatch {
    #[serde(default)]
    pub watching: bool,
    /// The storefront the prices were read from; empty for a state written before the picker existed.
    #[serde(default)]
    pub region: String,
    /// The account those prices belong to: another account's wishlist is another baseline.
    #[serde(default)]
    pub steamid: String,
    /// In cents, in that storefront's currency.
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

/// What a scan is allowed to write back: whose wishlist it read, from which storefront, and the
/// prices it has just seen. The switch belongs to the user and is never part of it, so a scan cannot
/// revert a click that happened while the wishlist was being fetched.
#[derive(Debug, Clone, PartialEq)]
pub struct Baseline {
    pub region: String,
    pub steamid: String,
    pub prices: HashMap<u32, i64>,
}

/// What got cheaper since the last scan, and the prices to remember next time. Cents from another
/// storefront are another currency, another account is another wishlist, and a first scan has nothing
/// to compare with: all three only record.
pub fn drops(state: &SteamWatch, prices: &HashMap<u32, Price>, region: &str, steamid: &str) -> (Vec<Drop>, Baseline) {
    // Switching store or account must not read one set of cents as if it were the other.
    let none = HashMap::new();
    let comparable = state.region == region && state.steamid == steamid;
    let seen = if comparable { &state.prices } else { &none };
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
    (fell, Baseline { region: region.to_string(), steamid: steamid.to_string(), prices: fresh })
}

/// The toast for one game: the store's own price string, so no money is reformatted here. The title
/// carries the wording, which Rust translates; a game has no wording to translate.
pub fn message(name: &str, price: &Price) -> (String, String) {
    let title = crate::lang::tr("Ficou mais barato na lista de desejos", "Cheaper on your wishlist");
    let body = if price.discount > 0 && !price.is_free {
        format!("{name} · -{}% · {}", price.discount, price.wording())
    } else {
        format!("{name} · {}", price.wording())
    };
    (title.to_string(), body)
}

#[cfg(test)]
#[path = "steam_watch_tests.rs"]
mod tests;
