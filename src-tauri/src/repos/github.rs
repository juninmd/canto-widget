//! GitHub side: `/user/repos` page by page, READMEs and the GraphQL contribution calendar.
use serde::Deserialize;

use crate::error::{AppError, Result};
use crate::github::{client, network, response, API};
use crate::repos::cache::Fetched;
use crate::repos::{
    cap_text, has_next_link, safe_url, Contributions, Day, Readme, Repo, MAX_PAGES, PER_PAGE, README_MAX_BYTES,
};

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
    open_issues_count: u64,
    #[serde(default)]
    language: Option<String>,
    #[serde(default)]
    pushed_at: Option<String>,
    #[serde(default)]
    updated_at: String,
    #[serde(default)]
    topics: Vec<String>,
    #[serde(default)]
    default_branch: String,
}

#[derive(Deserialize)]
struct Owner {
    login: String,
    #[serde(default)]
    avatar_url: String,
}

/// One page of the repositories the token reaches (own, collaborator, organization member). Sorted by name, not by
/// push: a list that reorders itself between two page requests would repeat some repositories and skip others.
/// `etag` is what the last look at this page returned; the forge answers 304 (free of rate limit) when nothing changed.
pub fn page(token: &str, login: &str, page: u32, etag: Option<&str>) -> Result<Fetched> {
    let url = url::Url::parse_with_params(
        &format!("{API}/user/repos"),
        [
            ("affiliation", "owner,collaborator,organization_member"),
            ("sort", "full_name"),
            ("direction", "asc"),
            ("per_page", &PER_PAGE.to_string()),
            ("page", &page.to_string()),
        ],
    )
    .map_err(|e| AppError::Github(e.to_string()))?;
    let mut req = client()?.get(url).bearer_auth(token);
    if let Some(e) = etag {
        req = req.header(reqwest::header::IF_NONE_MATCH, e);
    }
    let res = req.send().map_err(network)?;
    if res.status().as_u16() == 304 {
        return Ok(Fetched::NotModified);
    }
    let header = |n: &str| res.headers().get(n).and_then(|v| v.to_str().ok()).unwrap_or_default().to_string();
    let (etag, has_next) = (header("etag"), has_next_link(&header("link")));
    let got: Vec<RawRepo> = response(res)?;
    Ok(Fetched::Page { repos: convert(got, login), has_next: has_next && page < MAX_PAGES, etag })
}

fn convert(raw: Vec<RawRepo>, login: &str) -> Vec<Repo> {
    raw.into_iter()
        .filter(|r| safe_url(&r.html_url, "https://github.com/"))
        .map(|r| {
            let (owner, avatar) = r.owner.map(|o| (o.login, o.avatar_url)).unwrap_or_default();
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
                open_issues: r.open_issues_count,
                language: r.language.unwrap_or_default(),
                updated_at: r.pushed_at.unwrap_or(r.updated_at),
                topics: r.topics,
                avatar_url: avatar.clone(),
                group_avatar_url: avatar,
                default_branch: r.default_branch,
                ..Default::default()
            }
        })
        .collect()
}

/// The README as plain text (`application/vnd.github.raw+json`), or none when the repository has no README.
pub fn readme(token: &str, full_name: &str) -> Result<Readme> {
    let url = format!("{API}/repos/{full_name}/readme");
    let res = client()?
        .get(url)
        .bearer_auth(token)
        .header(reqwest::header::ACCEPT, "application/vnd.github.raw+json")
        .send()
        .map_err(network)?;
    let status = res.status().as_u16();
    match status {
        404 => Ok(Readme::default()),
        200..=299 => {
            let mut bytes = Vec::new();
            std::io::Read::read_to_end(&mut std::io::Read::take(res, README_MAX_BYTES + 1), &mut bytes)
                .map_err(|e| AppError::Github(format!("resposta inesperada: {e}")))?;
            let (text, truncated) = cap_text(&bytes, README_MAX_BYTES as usize);
            Ok(Readme { text, truncated, ..Default::default() })
        }
        // Rate limit, expired token and the rest keep their usual messages.
        _ => response::<serde_json::Value>(res).map(|_| Readme::default()),
    }
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
        let acme = owner == "acme";
        let topics: Vec<&str> = if acme { vec!["mapas"] } else { vec![] };
        let avatar = if acme { "https://avatars.githubusercontent.com/u/9" } else { "" };
        serde_json::from_value(serde_json::json!({
            "name": name, "full_name": format!("{owner}/{name}"),
            "html_url": url, "pushed_at": "2026-11-01T10:00:00Z", "updated_at": "2026-10-01T10:00:00Z",
            "stargazers_count": 3, "language": "Rust", "description": null,
            "topics": topics, "owner": {"login": owner, "avatar_url": avatar}
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
        let atlas = out.iter().find(|r| r.name == "atlas").unwrap();
        assert_eq!(
            (atlas.group_avatar_url.as_str(), atlas.topics.clone()),
            ("https://avatars.githubusercontent.com/u/9", vec!["mapas".to_string()])
        );
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
