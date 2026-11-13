//! GitLab side: the projects the user is a member of and their recent events as a contribution calendar.
use serde::Deserialize;

use crate::error::{AppError, Result};
use crate::gitlab::{client, network, response, Account};
use crate::repos::{count_days, safe_url, sort_repos, Contributions, Repo, MAX_PAGES, PER_PAGE};

#[derive(Deserialize)]
struct RawProject {
    #[serde(default)]
    name: String,
    #[serde(default)]
    path_with_namespace: String,
    #[serde(default)]
    namespace: Option<Namespace>,
    #[serde(default)]
    description: Option<String>,
    #[serde(default)]
    web_url: String,
    #[serde(default)]
    visibility: String,
    #[serde(default)]
    archived: bool,
    #[serde(default)]
    star_count: u64,
    #[serde(default)]
    forks_count: u64,
    #[serde(default)]
    last_activity_at: String,
    #[serde(default)]
    forked_from_project: Option<serde_json::Value>,
}

#[derive(Deserialize)]
struct Namespace {
    #[serde(default)]
    full_path: String,
    #[serde(default)]
    kind: String,
}

fn get<T: for<'de> Deserialize<'de>>(acc: &Account, path: &str, params: &[(&str, String)]) -> Result<T> {
    let url = url::Url::parse_with_params(&format!("{}/api/v4/{path}", acc.base), params)
        .map_err(|e| AppError::Gitlab(e.to_string()))?;
    let res = client()?.get(url).bearer_auth(acc.token.as_str()).send().map_err(network)?;
    response(res)
}

/// Every project the user is a member of, most recent activity first.
pub fn projects(acc: &Account) -> Result<(Vec<Repo>, bool)> {
    let mut raw = Vec::new();
    let mut truncated = false;
    for page in 1..=MAX_PAGES {
        let got: Vec<RawProject> = get(
            acc,
            "projects",
            &[
                ("membership", "true".into()),
                ("order_by", "last_activity_at".into()),
                ("sort", "desc".into()),
                ("per_page", PER_PAGE.to_string()),
                ("page", page.to_string()),
            ],
        )?;
        let full = got.len() as u32 >= PER_PAGE;
        raw.extend(got);
        if !full {
            break;
        }
        truncated = page == MAX_PAGES;
    }
    Ok((convert(&acc.base, raw), truncated))
}

fn convert(base: &str, raw: Vec<RawProject>) -> Vec<Repo> {
    let prefix = format!("{base}/");
    let mut out: Vec<Repo> = raw
        .into_iter()
        .filter(|p| safe_url(&p.web_url, &prefix))
        .map(|p| {
            // Personal namespaces sit at the root; groups (and subgroups) keep their full path.
            let group = p.namespace.filter(|n| n.kind == "group").map(|n| n.full_path).unwrap_or_default();
            Repo {
                name: p.name,
                full_name: p.path_with_namespace,
                group,
                description: p.description.unwrap_or_default(),
                url: p.web_url,
                private: p.visibility != "public",
                fork: p.forked_from_project.is_some(),
                archived: p.archived,
                stars: p.star_count,
                forks: p.forks_count,
                language: String::new(),
                updated_at: p.last_activity_at,
            }
        })
        .collect();
    sort_repos(&mut out);
    out
}

#[derive(Deserialize)]
struct RawEvent {
    #[serde(default)]
    created_at: String,
}

const EVENT_PAGES: u32 = 10;

/// GitLab has no calendar endpoint for tokens: the user's own events of the last year, counted per day.
pub fn calendar(acc: &Account, since: &str) -> Result<Contributions> {
    let mut stamps = Vec::new();
    for page in 1..=EVENT_PAGES {
        let got: Vec<RawEvent> = get(
            acc,
            "events",
            &[("after", since.into()), ("per_page", PER_PAGE.to_string()), ("page", page.to_string())],
        )?;
        let full = got.len() as u32 >= PER_PAGE;
        stamps.extend(got.into_iter().map(|e| e.created_at));
        if !full {
            break;
        }
    }
    let days = count_days(stamps.iter().map(String::as_str));
    let total = days.iter().map(|d| d.count as u64).sum();
    Ok(Contributions { days, total, ..Default::default() })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn project(path: &str, kind: &str, url: &str) -> RawProject {
        serde_json::from_value(serde_json::json!({
            "name": path.rsplit('/').next().unwrap(), "path_with_namespace": path, "web_url": url,
            "namespace": {"full_path": path.rsplit_once('/').unwrap().0, "kind": kind},
            "visibility": "internal", "star_count": 2, "last_activity_at": "2026-11-02T10:00:00Z",
            "description": null
        }))
        .unwrap()
    }

    #[test]
    fn personal_namespaces_are_the_root_and_groups_keep_their_path() {
        let out = convert(
            "https://gitlab.acme.io",
            vec![
                project("ana/notes", "user", "https://gitlab.acme.io/ana/notes"),
                project("acme/infra/deploy", "group", "https://gitlab.acme.io/acme/infra/deploy"),
            ],
        );
        let group = |n: &str| out.iter().find(|r| r.name == n).unwrap().group.clone();
        assert_eq!((group("notes").as_str(), group("deploy").as_str()), ("", "acme/infra"));
        assert!(out.iter().all(|r| r.private));
    }

    #[test]
    fn a_link_outside_the_instance_is_dropped() {
        let out = convert("https://gitlab.acme.io", vec![project("a/b", "group", "https://evil.example/a/b")]);
        assert!(out.is_empty());
    }
}
