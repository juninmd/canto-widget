//! The teams the user belongs to (`org/slug`), for team-mention searches. Needs the `read:org` scope; without it
//! the answer is simply no teams, and the user keeps the direct mentions.
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

type Cached = Option<(Instant, Vec<String>)>;

static CACHE: LazyLock<Mutex<Cached>> = LazyLock::new(Mutex::default);

fn handles(teams: Vec<Team>) -> Vec<String> {
    teams.into_iter().filter_map(|t| Some(format!("{}/{}", t.organization?.login, t.slug))).take(MAX_TEAMS).collect()
}

pub fn lookup(token: &str) -> Vec<String> {
    let mut cache = CACHE.lock().unwrap_or_else(|e| e.into_inner());
    if let Some((_, teams)) = cache.as_ref().filter(|(at, _)| at.elapsed() < TTL) {
        return teams.clone();
    }
    let fetched = client()
        .and_then(|c| c.get(format!("{API}/user/teams?per_page=30")).bearer_auth(token).send().map_err(network))
        .and_then(response::<Vec<Team>>)
        .map(handles)
        .unwrap_or_default();
    *cache = Some((Instant::now(), fetched.clone()));
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
}
