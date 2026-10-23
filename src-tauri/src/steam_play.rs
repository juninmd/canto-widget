//! "Jogue agora": every game the player can reach, the library (with the key) and what is installed
//! on this machine, merged into one list, last played first, then filtered and paged. Pure.
use serde::{Deserialize, Serialize};

use crate::steam::{OwnedGame, RecentGame};
use crate::steam_local::Installed;
use crate::steam_url::{header_url, portrait_url};

/// A page holds 24: two columns of cards or three of covers both end on a full row.
pub const PAGE: usize = 24;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct PlayGame {
    pub appid: u32,
    pub name: String,
    /// The wide header, for the list and the cards.
    pub art: String,
    /// The vertical library cover, for the grid.
    pub cover: String,
    pub total_min: u32,
    pub recent_min: u32,
    /// Unix seconds; 0 when Steam never saw it run.
    pub last_played: i64,
    pub installed: bool,
    pub size_bytes: u64,
}

#[derive(Debug, Clone, Copy, Default, PartialEq, Serialize, Deserialize)]
pub struct PlayCounts {
    pub all: u32,
    pub recent: u32,
    pub installed: u32,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct SteamPlay {
    pub items: Vec<PlayGame>,
    /// How many matched the filter and the search, and how long they add up to.
    pub total: u32,
    pub minutes: u32,
    pub pages: u32,
    pub counts: PlayCounts,
    /// The last game played, whatever the filter: the banner on top.
    pub hero: Option<PlayGame>,
    pub has_key: bool,
}

fn game(appid: u32, name: String) -> PlayGame {
    PlayGame {
        appid,
        name,
        art: header_url(appid),
        cover: portrait_url(appid),
        total_min: 0,
        recent_min: 0,
        last_played: 0,
        installed: false,
        size_bytes: 0,
    }
}

/// One entry per appid: the library brings the playtime, the recent list the two weeks, the disk
/// what is installed. Last played first, then most played, then the name, so a page never shuffles.
pub fn merge(owned: Vec<OwnedGame>, recent: &[RecentGame], installed: &[Installed]) -> Vec<PlayGame> {
    let mut games: Vec<PlayGame> = owned
        .into_iter()
        .map(|o| PlayGame { total_min: o.total_min, last_played: o.last_played, ..game(o.appid, o.name) })
        .collect();
    for r in recent {
        let at = position(&mut games, r.appid, &r.name);
        games[at].recent_min = r.recent_min;
        games[at].total_min = games[at].total_min.max(r.total_min);
    }
    for i in installed {
        let at = position(&mut games, i.appid, &i.name);
        let g = &mut games[at];
        g.installed = true;
        g.size_bytes = i.size_bytes;
        g.last_played = g.last_played.max(i.last_played);
    }
    games.sort_by(|a, b| {
        b.last_played
            .cmp(&a.last_played)
            .then_with(|| (b.recent_min > 0).cmp(&(a.recent_min > 0)))
            .then_with(|| b.total_min.cmp(&a.total_min))
            .then_with(|| a.name.to_lowercase().cmp(&b.name.to_lowercase()))
    });
    games
}

fn position(games: &mut Vec<PlayGame>, appid: u32, name: &str) -> usize {
    match games.iter().position(|g| g.appid == appid) {
        Some(at) => at,
        None => {
            games.push(game(appid, name.to_string()));
            games.len() - 1
        }
    }
}

pub fn counts(games: &[PlayGame]) -> PlayCounts {
    PlayCounts {
        all: games.len() as u32,
        recent: games.iter().filter(|g| g.recent_min > 0).count() as u32,
        installed: games.iter().filter(|g| g.installed).count() as u32,
    }
}

/// `filter` is "all", "recent" or "installed"; an unknown one reads as "all".
pub fn page(games: &[PlayGame], filter: &str, term: &str, page: usize, has_key: bool) -> SteamPlay {
    let needle = term.trim().to_lowercase();
    let matching: Vec<&PlayGame> = games
        .iter()
        .filter(|g| match filter {
            "recent" => g.recent_min > 0,
            "installed" => g.installed,
            _ => true,
        })
        .filter(|g| needle.is_empty() || g.name.to_lowercase().contains(&needle))
        .collect();
    let total = matching.len();
    SteamPlay {
        items: matching.iter().skip(page * PAGE).take(PAGE).map(|g| (*g).clone()).collect(),
        total: total as u32,
        minutes: matching.iter().map(|g| g.total_min).sum(),
        pages: total.div_ceil(PAGE).max(1) as u32,
        counts: counts(games),
        hero: games.iter().find(|g| g.last_played > 0 || g.recent_min > 0).or(games.first()).cloned(),
        has_key,
    }
}

#[cfg(test)]
#[path = "steam_play_tests.rs"]
mod tests;
