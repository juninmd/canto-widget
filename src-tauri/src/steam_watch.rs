//! What the Steam alerts decide, with no network and no vault: which wishlist games reached a hot
//! sale (75% or more) and which games got an update since the last look, plus what each toast says.
//! Pure, so `steam_watch_tests.rs` pins every rule.
use std::collections::HashMap;

use serde::{Deserialize, Serialize};

use crate::steam_parse::Price;
use crate::steam_wish::HOT;

/// The sealed state of the alerts. Deliberately not `Debug`: it travels sealed. A state written by an
/// older version (with a `prices` baseline) still opens: unknown fields are ignored.
#[derive(Default, Clone, Serialize, Deserialize)]
pub struct SteamWatch {
    #[serde(default)]
    pub watching: bool,
    /// The storefront and the account the sales below were seen on.
    #[serde(default)]
    pub region: String,
    #[serde(default)]
    pub steamid: String,
    /// Each wishlist game already announced, with the discount it was announced at.
    #[serde(default)]
    pub hot: HashMap<u32, u32>,
    /// The last update seen per game (its news gid); a game first seen only records.
    #[serde(default)]
    pub news: HashMap<u32, String>,
    /// When the user last marked the updates as read, in ms.
    #[serde(default)]
    pub news_read_at: i64,
}

/// What a deals scan writes back: never the switch, so a click during the fetch survives.
#[derive(Debug, Clone, PartialEq)]
pub struct HotBaseline {
    pub region: String,
    pub steamid: String,
    pub hot: HashMap<u32, u32>,
}

/// The wishlist games to announce now and what to remember. A game rings once per sale: again only
/// when the discount grows, and after the sale ends (below 75%) the next one rings anew. Another
/// store or account starts from nothing, since its sales were never announced.
pub fn hot_deals(
    state: &SteamWatch,
    prices: &HashMap<u32, Price>,
    region: &str,
    steamid: &str,
) -> (Vec<u32>, HotBaseline) {
    let none = HashMap::new();
    let known = if state.region == region && state.steamid == steamid { &state.hot } else { &none };
    let mut next = HashMap::new();
    let mut ring = Vec::new();
    for (id, price) in prices {
        if price.discount < HOT || price.is_free {
            continue;
        }
        if known.get(id).is_none_or(|was| price.discount > *was) {
            ring.push(*id);
        }
        next.insert(*id, price.discount.max(known.get(id).copied().unwrap_or(0)));
    }
    // The deepest discount leads; the appid last so the order never flips between runs.
    ring.sort_by(|a, b| prices[b].discount.cmp(&prices[a].discount).then_with(|| a.cmp(b)));
    (ring, HotBaseline { region: region.to_string(), steamid: steamid.to_string(), hot: next })
}

/// The games whose newest update changed since the last look, and the map to remember. A game seen
/// for the first time only records, so turning the bell on never rings for old patches.
pub fn new_updates(seen: &HashMap<u32, String>, latest: &HashMap<u32, String>) -> (Vec<u32>, HashMap<u32, String>) {
    let mut ring: Vec<u32> =
        latest.iter().filter(|(id, gid)| seen.get(id).is_some_and(|was| was != *gid)).map(|(id, _)| *id).collect();
    ring.sort_unstable();
    let mut next = seen.clone();
    next.extend(latest.iter().map(|(id, gid)| (*id, gid.clone())));
    (ring, next)
}

/// The toast for a hot sale: the store's own price strings, so no money is reformatted here.
pub fn deal_message(name: &str, price: &Price) -> (String, String) {
    let title = crate::lang::tr("Promoção na lista de desejos", "Wishlist sale").to_string();
    let mut body = format!("{name} · -{}% · {}", price.discount, price.wording());
    if !price.initial_formatted.is_empty() {
        body.push_str(&format!(" ({} {})", crate::lang::tr("era", "was"), price.initial_formatted));
    }
    (title, body)
}

/// The toast for an update: the game names itself, the post's title says what changed.
pub fn update_message(game: &str, title: &str) -> (String, String) {
    (format!("{game} · {}", crate::lang::tr("nova atualização", "new update")), title.to_string())
}

/// Past this many at once, the rest become one summary toast instead of a burst.
pub const BURST: usize = 3;

pub fn summary_message(more: usize) -> (String, String) {
    ("Steam".to_string(), format!("+{more} {}", crate::lang::tr("avisos na aba Steam", "more alerts in the Steam tab")))
}

#[cfg(test)]
#[path = "steam_watch_tests.rs"]
mod tests;
