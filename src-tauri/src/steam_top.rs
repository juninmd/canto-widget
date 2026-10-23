//! "Mais jogados": Steam's own chart of the games with the most people in them right now, paged,
//! with how each one moved since the last look. Pure, so `steam_top_tests.rs` pins it.
use std::collections::{HashMap, HashSet};

use serde::{Deserialize, Serialize};

pub const PAGE: usize = 20;

/// One place on the chart, before the store names it.
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub struct Rank {
    pub rank: u32,
    pub appid: u32,
    pub players: u32,
    pub peak: u32,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct TopGame {
    pub rank: u32,
    pub appid: u32,
    pub name: String,
    pub art: String,
    pub players: u32,
    /// Today's peak.
    pub peak: u32,
    /// Places gained since the previous chart (negative: lost); 0 when unchanged or new.
    pub moved: i32,
    /// On the account or installed here.
    pub mine: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct SteamTop {
    pub items: Vec<TopGame>,
    /// Everyone in the top 100 right now.
    pub players: u64,
    pub pages: u32,
    /// Unix seconds of Steam's last refresh of the chart.
    pub updated: i64,
}

#[derive(Deserialize, Default)]
struct Response {
    #[serde(default)]
    response: Inner,
}

#[derive(Deserialize, Default)]
struct Inner {
    #[serde(default)]
    last_update: i64,
    #[serde(default)]
    ranks: Vec<RawRank>,
}

#[derive(Deserialize, Default)]
struct RawRank {
    #[serde(default)]
    rank: u32,
    #[serde(default)]
    appid: u32,
    #[serde(default)]
    concurrent_in_game: u32,
    #[serde(default)]
    peak_in_game: u32,
}

/// The chart and when Steam refreshed it; a broken answer is an empty chart.
pub fn parse(json: &str) -> (Vec<Rank>, i64) {
    let parsed: Response = serde_json::from_str(json).unwrap_or_default();
    let mut ranks: Vec<Rank> = parsed
        .response
        .ranks
        .into_iter()
        .filter(|r| r.appid != 0)
        .map(|r| Rank { rank: r.rank, appid: r.appid, players: r.concurrent_in_game, peak: r.peak_in_game })
        .collect();
    ranks.sort_by_key(|r| r.rank);
    (ranks, parsed.response.last_update)
}

/// Places gained against the previous chart, by appid.
pub fn moved(previous: &HashMap<u32, u32>, rank: &Rank) -> i32 {
    previous.get(&rank.appid).map_or(0, |was| *was as i32 - rank.rank as i32)
}

/// The ranks one page shows: "só os meus" filters before paging, so its pages are full too.
pub fn slice(ranks: &[Rank], mine: &HashSet<u32>, only_mine: bool, page: usize) -> (Vec<Rank>, u32) {
    let kept: Vec<Rank> = ranks.iter().filter(|r| !only_mine || mine.contains(&r.appid)).copied().collect();
    let pages = kept.len().div_ceil(PAGE).max(1) as u32;
    (kept.into_iter().skip(page * PAGE).take(PAGE).collect(), pages)
}

pub fn total_players(ranks: &[Rank]) -> u64 {
    ranks.iter().map(|r| r.players as u64).sum()
}

#[cfg(test)]
#[path = "steam_top_tests.rs"]
mod tests;
