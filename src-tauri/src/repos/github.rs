//! GitHub side: `/user/repos` and the GraphQL contribution calendar.
use serde::Deserialize;

use crate::error::{AppError, Result};
use crate::github::{client, network, response, API};
use crate::repos::{safe_url, sort_repos, Contributions, Day, Repo, MAX_PAGES, PER_PAGE};

#[derive(Deserialize)]
struct RawRepo {
    #[serde(default)]
    name: String,
    #[serde(default)]
    full_name: String,
    #[serde(default)]
    owner: Option<Owner>,
    #[serde(default)]
    description: Option<String>,
    #[serde(default)]
    html_url: String,
    #[serde(default)]
    private: bool,
    #[serde(default)]
    fork: bool,
    #[serde(default)]
    archived: bool,
    #[serde(default)]
    stargazers_count: u64,
    #[serde(default)]
    forks_count: u64,
    #[serde(default)]
    language: Option<String>,
    #[serde(default)]
    pushed_at: Option<String>,
    #[serde(default)]
    updated_at: String,
}

#[derive(Deserialize)]
struct Owner {
    login: String,
}

/// Every repository the token reaches (own, collaborator, organization member), most recent push first.
pub fn repos(token: &str, login: &str) -> Result<(Vec<Repo>, bool)> {
    let mut raw = Vec::new();
    let mut truncated = false;
    for page in 1..=MAX_PAGES {
        let url = url::Url::parse_with_params(
            &format!("{API}/user/repos"),
            [
                ("affiliation", "owner,collaborator,organization_member"),
                ("sort", "pushed"),
                ("per_page", &PER_PAGE.to_string()),
                ("page", &page.to_string()),
            ],
        )
        .map_err(|e| AppError::Github(e.to_string()))?;
        let res = client()?.get(url).bearer_auth(token).send().map_err(network)?;
        let got: Vec<RawRepo> = response(res)?;
        let full = got.len() as u32 >= PER_PAGE;
        raw.extend(got);
        if !full {
            break;
        }
        truncated = page == MAX_PAGES;
    }
    Ok((convert(raw, login), truncated))
}

fn convert(raw: Vec<RawRepo>, login: &str) -> Vec<Repo> {
    let mut out: Vec<Repo> = raw
        .into_iter()
        .filter(|r| safe_url(&r.html_url, "https://github.com/"))
        .map(|r| {
            let owner = r.owner.map(|o| o.login).unwrap_or_default();
            // The user's own repositories sit at the root; every other owner (organization or person) is a group.
            let group = if owner.eq_ignore_ascii_case(login) { String::new() } else { owner };
            Repo {
                name: r.name,
                full_name: r.full_name,
                group,
                description: r.description.unwrap_or_default(),
                url: r.html_url,
                private: r.private,
                fork: r.fork,
                archived: r.archived,
                stars: r.stargazers_count,
                forks: r.forks_count,
                language: r.language.unwrap_or_default(),
                updated_at: r.pushed_at.unwrap_or(r.updated_at),
            }
        })
        .collect();
    sort_repos(&mut out);
    out
}

const CALENDAR: &str = "query { viewer { contributionsCollection { contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } } } } }";

#[derive(Deserialize)]
struct Gql {
    #[serde(default)]
    data: Option<Data>,
    #[serde(default)]
    errors: Vec<GqlError>,
}

#[derive(Deserialize)]
struct GqlError {
    #[serde(default)]
    message: String,
}

#[derive(Deserialize)]
struct Data {
    viewer: Viewer,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Viewer {
    contributions_collection: Collection,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Collection {
    contribution_calendar: Calendar,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Calendar {
    total_contributions: u64,
    weeks: Vec<Week>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Week {
    contribution_days: Vec<RawDay>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct RawDay {
    date: String,
    contribution_count: u32,
}

/// The last year of contributions, the same squares github.com draws on the profile.
pub fn calendar(token: &str) -> Result<Contributions> {
    let body = serde_json::json!({ "query": CALENDAR });
    let res = client()?.post(format!("{API}/graphql")).bearer_auth(token).json(&body).send().map_err(network)?;
    parse_calendar(response(res)?)
}

fn parse_calendar(g: Gql) -> Result<Contributions> {
    if let Some(e) = g.errors.first() {
        return Err(AppError::Github(format!("o GitHub recusou o calendário: {}", e.message)));
    }
    let cal = g
        .data
        .ok_or_else(|| AppError::Github("resposta inesperada: sem dados do calendário".into()))?
        .viewer
        .contributions_collection
        .contribution_calendar;
    let days = cal
        .weeks
        .into_iter()
        .flat_map(|w| w.contribution_days)
        .map(|d| Day { date: d.date, count: d.contribution_count })
        .collect();
    Ok(Contributions { days, total: cal.total_contributions, ..Default::default() })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn raw(owner: &str, name: &str, url: &str) -> RawRepo {
        serde_json::from_value(serde_json::json!({
            "name": name, "full_name": format!("{owner}/{name}"), "owner": {"login": owner},
            "html_url": url, "pushed_at": "2026-11-01T10:00:00Z", "updated_at": "2026-10-01T10:00:00Z",
            "stargazers_count": 3, "language": "Rust", "description": null
        }))
        .unwrap()
    }

    #[test]
    fn own_repos_sit_at_the_root_and_other_owners_become_groups() {
        let out = convert(
            vec![
                raw("Ana", "dotfiles", "https://github.com/Ana/dotfiles"),
                raw("acme", "atlas", "https://github.com/acme/atlas"),
            ],
            "ana",
        );
        let group = |n: &str| out.iter().find(|r| r.name == n).unwrap().group.clone();
        assert_eq!((group("dotfiles").as_str(), group("atlas").as_str()), ("", "acme"));
        assert_eq!(out[0].updated_at, "2026-11-01T10:00:00Z");
        assert_eq!((out[0].description.as_str(), out[0].language.as_str(), out[0].stars), ("", "Rust", 3));
    }

    #[test]
    fn a_link_outside_github_is_dropped() {
        assert!(convert(vec![raw("acme", "x", "https://evil.example/acme/x")], "ana").is_empty());
    }

    #[test]
    fn the_calendar_flattens_weeks_into_days() {
        let g: Gql = serde_json::from_value(serde_json::json!({"data": {"viewer": {"contributionsCollection": {
            "contributionCalendar": {"totalContributions": 5, "weeks": [
                {"contributionDays": [{"date": "2026-11-01", "contributionCount": 2}]},
                {"contributionDays": [{"date": "2026-11-08", "contributionCount": 3}]}]}}}}}))
        .unwrap();
        let c = parse_calendar(g).unwrap();
        assert_eq!((c.total, c.days.len(), c.days[1].count), (5, 2, 3));
    }

    #[test]
    fn a_graphql_error_surfaces_its_message() {
        let g: Gql = serde_json::from_value(serde_json::json!({"errors": [{"message": "RATE_LIMITED"}]})).unwrap();
        assert!(parse_calendar(g).unwrap_err().to_string().contains("RATE_LIMITED"));
    }
}
