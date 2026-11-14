//! The teams the user belongs to (`org/slug`), for team-mention searches. Needs the `read:org` scope; without it
//! the answer is simply no teams, and the user keeps the direct mentions.
use crate::resilient::LockExt;
use std::sync::{LazyLock, Mutex};
use std::time::{Duration, Instant};

use serde::Deserialize;

use crate::github::{client, network, response, API};

/// Teams change rarely; one lookup an hour, also when it failed, so a missing scope costs nothing afterwards.
const TTL: Duration = Duration::from_secs(3600);
/// Each team is up to two searches of the 30 per minute.
pub const MAX_TEAMS: usize = 6;

#[derive(Deserialize)]
struct Team {
    slug: String,
    #[serde(default)]
    organization: Option<Org>,
}

#[derive(Deserialize)]
struct Org {
    login: String,
}

use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};

#[derive(Default)]
struct Cache {
    generation: u64,
    entry: Option<(u64, Instant, Vec<String>)>,
}

static CACHE: LazyLock<Mutex<Cache>> = LazyLock::new(Mutex::default);

fn token_key(token: &str) -> u64 {
    let mut h = DefaultHasher::new();
    token.hash(&mut h);
    h.finish()
}

pub fn clear() {
    let mut cache = CACHE.lock_safe();
    cache.generation = cache.generation.wrapping_add(1);
    cache.entry = None;
}

fn handles(teams: Vec<Team>) -> Vec<String> {
    teams.into_iter().filter_map(|t| Some(format!("{}/{}", t.organization?.login, t.slug))).take(MAX_TEAMS).collect()
}

pub fn lookup(token: &str) -> Vec<String> {
    let key = token_key(token);
    let generation = {
        let cache = CACHE.lock_safe();
        if let Some((k, at, teams)) = &cache.entry {
            if *k == key && at.elapsed() < TTL {
                return teams.clone();
            }
        }
        cache.generation
    };
    let fetched = client()
        .and_then(|c| c.get(format!("{API}/user/teams?per_page=30")).bearer_auth(token).send().map_err(network))
        .and_then(response::<Vec<Team>>)
        .map(handles)
        .unwrap_or_default();
    let mut cache = CACHE.lock_safe();
    if cache.generation == generation {
        cache.entry = Some((key, Instant::now(), fetched.clone()));
    }
    fetched
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn teams_become_org_slash_slug_and_are_capped() {
        let raw: Vec<Team> = serde_json::from_str(
            r#"[{"slug":"backend","organization":{"login":"acme"}},{"slug":"solo"},{"slug":"ops","organization":{"login":"acme"}}]"#,
        )
        .unwrap();
        assert_eq!(handles(raw), ["acme/backend", "acme/ops"], "a team without an organization is dropped");
        let many: Vec<Team> =
            (0..20).map(|i| Team { slug: format!("t{i}"), organization: Some(Org { login: "o".into() }) }).collect();
        assert_eq!(handles(many).len(), MAX_TEAMS);
    }

    #[test]
    fn token_keys_differ_by_account_and_clear_bumps_generation() {
        assert_ne!(token_key("ghp_one"), token_key("ghp_two"));
        clear();
        let before = CACHE.lock_safe().generation;
        clear();
        assert_ne!(CACHE.lock_safe().generation, before);
    }
}
