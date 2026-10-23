//! Pure parsers for what the Steam Web API answers about a player: the games played, the library, a
//! vanity name resolved and the persona behind a SteamID64.
use serde::Deserialize;

use crate::steam::{OwnedGame, RecentGame};

#[derive(Deserialize, Default)]
struct RecentResponse {
    #[serde(default)]
    response: RecentItems,
}

#[derive(Deserialize, Default)]
struct RecentItems {
    #[serde(default)]
    games: Vec<RecentRaw>,
}

#[derive(Deserialize, Default)]
struct RecentRaw {
    #[serde(default)]
    appid: u32,
    #[serde(default)]
    name: String,
    #[serde(default, rename = "playtime_2weeks")]
    minutes_2weeks: u32,
    #[serde(default)]
    playtime_forever: u32,
}

pub fn parse_recent(json: &str) -> Vec<RecentGame> {
    let parsed: RecentResponse = serde_json::from_str(json).unwrap_or_default();
    parsed
        .response
        .games
        .into_iter()
        .filter(|g| !g.name.is_empty())
        .map(|g| RecentGame {
            appid: g.appid,
            name: g.name,
            recent_min: g.minutes_2weeks,
            total_min: g.playtime_forever,
            // The Web API reports no capsule; the command fills it from the store.
            art: String::new(),
        })
        .collect()
}

#[derive(Deserialize, Default)]
struct OwnedResponse {
    #[serde(default)]
    response: OwnedItems,
}

#[derive(Deserialize, Default)]
struct OwnedItems {
    #[serde(default)]
    games: Vec<OwnedRaw>,
}

#[derive(Deserialize, Default)]
struct OwnedRaw {
    #[serde(default)]
    appid: u32,
    #[serde(default)]
    name: String,
    #[serde(default)]
    playtime_forever: u32,
    #[serde(default)]
    rtime_last_played: i64,
}

/// `{"response":{}}` is a private profile, not an error: the library is then simply empty.
pub fn parse_owned(json: &str) -> Vec<OwnedGame> {
    let parsed: OwnedResponse = serde_json::from_str(json).unwrap_or_default();
    parsed
        .response
        .games
        .into_iter()
        .filter(|g| g.appid != 0 && !g.name.is_empty())
        .map(|g| OwnedGame {
            appid: g.appid,
            name: g.name,
            total_min: g.playtime_forever,
            // The command fills the capsule: it is built from the appid, not reported by the API.
            art: String::new(),
            last_played: g.rtime_last_played,
        })
        .collect()
}

#[derive(Deserialize, Default)]
struct Vanity {
    #[serde(default)]
    response: VanityInner,
}

#[derive(Deserialize, Default)]
struct VanityInner {
    #[serde(default)]
    success: u8,
    #[serde(default)]
    steamid: String,
}

pub fn parse_vanity(json: &str) -> Option<String> {
    let parsed: Vanity = serde_json::from_str(json).ok()?;
    (parsed.response.success == 1 && !parsed.response.steamid.is_empty()).then_some(parsed.response.steamid)
}

#[derive(Deserialize, Default)]
struct Summary {
    #[serde(default)]
    response: SummaryInner,
}

#[derive(Deserialize, Default)]
struct SummaryInner {
    #[serde(default)]
    players: Vec<Player>,
}

#[derive(Deserialize, Default)]
struct Player {
    #[serde(default)]
    personaname: String,
}

pub fn parse_summary(json: &str) -> Option<String> {
    let parsed: Summary = serde_json::from_str(json).ok()?;
    parsed.response.players.into_iter().map(|p| p.personaname).find(|n| !n.is_empty())
}

#[cfg(test)]
#[path = "steam_player_tests.rs"]
mod tests;
