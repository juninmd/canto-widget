//! Pure picks from snapshots the app already holds, so each rule has a unit test.
use serde::Serialize;

use crate::health::Health;
use crate::market::Quote;
use crate::sysmon::{Disk, Snapshot as System};

#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct Ticker {
    pub symbol: String,
    pub price: f64,
    pub change: f64,
    pub currency: Option<String>,
}

#[derive(Debug, Clone, Default, PartialEq, Serialize)]
pub struct Endpoints {
    pub down: u32,
    pub total: u32,
}

/// Used % of the volume the system runs from; the first disk when none is marked, `None` without disks.
pub fn system_disk(disks: &[Disk]) -> Option<f32> {
    let d = disks.iter().find(|d| d.system).or(disks.first())?;
    (d.total > 0).then(|| crate::sysmon::percent(d.total.saturating_sub(d.available), d.total))
}

/// The busiest GPU; `None` when no driver reports usage.
pub fn gpu(sys: &System) -> Option<f32> {
    sys.gpus.iter().filter_map(|g| g.usage).reduce(f32::max)
}

/// The first quote of the Mercado tab, which is its spotlight.
pub fn ticker(quotes: &[Quote]) -> Option<Ticker> {
    quotes.first().map(|q| Ticker {
        symbol: q.symbol.clone(),
        price: q.price,
        change: q.change,
        currency: q.currency.clone(),
    })
}

pub fn endpoints(states: impl IntoIterator<Item = Health>) -> Endpoints {
    states.into_iter().fold(Endpoints::default(), |mut acc, h| {
        acc.total += 1;
        if h == Health::Down {
            acc.down += 1;
        }
        acc
    })
}

#[cfg(test)]
#[path = "readings_tests.rs"]
mod tests;
