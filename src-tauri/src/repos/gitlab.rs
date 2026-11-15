//! GitLab side: the projects the user is a member of (page by page), READMEs and recent events as a contribution calendar.
use serde::Deserialize;

use crate::error::{AppError, Result};
use crate::gitlab::{client, network, response, Account};
use crate::repos::cache::Fetched;
use crate::repos::{
    cap_text, count_days, safe_url, Contributions, Readme, Repo, MAX_PAGES, PER_PAGE, README_MAX_BYTES,
};

#[derive(Deserialize)]
struct RawProject {
    #[serde(default)]
    id: u64,
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
    open_issues_count: Option<u64>,
    #[serde(default)]
    last_activity_at: String,
    #[serde(default)]
    forked_from_project: Option<serde_json::Value>,
    #[serde(default)]
    topics: Vec<String>,
    #[serde(default)]
    avatar_url: Option<String>,
    #[serde(default)]
    default_branch: Option<String>,
}

#[derive(Deserialize)]
struct Namespace {
    #[serde(default)]
    full_path: String,
    #[serde(default)]
    kind: String,
    #[serde(default)]
    avatar_url: Option<String>,
}

fn request(
    acc: &Account,
    path: &str,
    params: &[(&str, String)],
    etag: Option<&str>,
) -> Result<reqwest::blocking::Response> {
    let url = url::Url::parse_with_params(&format!("{}/api/v4/{path}", acc.base), params)
        .map_err(|e| AppError::Gitlab(e.to_string()))?;
    let mut req = client()?.get(url).bearer_auth(acc.token.as_str());
    if let Some(e) = etag {
        req = req.header(reqwest::header::IF_NONE_MATCH, e);
    }
    req.send().map_err(network)
}

fn get<T: for<'de> Deserialize<'de>>(acc: &Account, path: &str, params: &[(&str, String)]) -> Result<T> {
    response(request(acc, path, params, None)?)
}

/// One page of the projects the user is a member of. Ordered by id, which never changes: a list that reorders itself
/// between two page requests would repeat some projects and skip others. `etag` is what the last look at this page
/// returned; GitLab answers 304 when nothing changed.
pub fn page(acc: &Account, page: u32, etag: Option<&str>) -> Result<Fetched> {
    let res = request(
        acc,
        "projects",
        &[
            ("membership", "true".into()),
            ("order_by", "id".into()),
            ("sort", "asc".into()),
            ("per_page", PER_PAGE.to_string()),
            ("page", page.to_string()),
        ],
        etag,
    )?;
    if res.status().as_u16() == 304 {
        return Ok(Fetched::NotModified);
    }
    let header = |n: &str| res.headers().get(n).and_then(|v| v.to_str().ok()).unwrap_or_default().to_string();
    let (etag, next) = (header("etag"), header("x-next-page"));
    let got: Vec<RawProject> = response(res)?;
    let has_next = (!next.is_empty() || got.len() as u32 >= PER_PAGE) && page < MAX_PAGES;
    Ok(Fetched::Page { repos: convert(&acc.base, got), has_next, etag })
}

fn convert(base: &str, raw: Vec<RawProject>) -> Vec<Repo> {
    let prefix = format!("{base}/");
    raw.into_iter()
        .filter(|p| safe_url(&p.web_url, &prefix))
        .map(|p| {
            // Personal namespaces sit at the root; groups (and subgroups) keep their full path.
            let ns = p.namespace.filter(|n| n.kind == "group");
            let group_avatar = ns.as_ref().and_then(|n| n.avatar_url.clone()).unwrap_or_default();
            let group = ns.map(|n| n.full_path).unwrap_or_default();
            Repo {
                id: p.id.to_string(),
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
                open_issues: p.open_issues_count.unwrap_or_default(),
                language: String::new(),
                updated_at: p.last_activity_at,
                topics: p.topics,
                avatar_url: p.avatar_url.filter(|u| !u.is_empty()).unwrap_or_else(|| group_avatar.clone()),
                group_avatar_url: group_avatar,
                default_branch: p.default_branch.unwrap_or_default(),
            }
        })
        .collect()
}

#[derive(Deserialize)]
struct TreeEntry {
    #[serde(default)]
    name: String,
    #[serde(default, rename = "type")]
    kind: String,
    #[serde(default)]
    path: String,
}

/// The root file that is the README: `README.md` first, then any other `readme*` (`README.rst`, `Readme.txt`...).
fn pick_readme(entries: &[TreeEntry]) -> Option<&str> {
    let readmes = || entries.iter().filter(|e| e.kind == "blob" && e.name.to_ascii_lowercase().starts_with("readme"));
    readmes().find(|e| e.name.eq_ignore_ascii_case("readme.md")).or_else(|| readmes().next()).map(|e| e.path.as_str())
}

/// The project's README as raw text, found by listing the root; none when the project has none (or is empty).
pub fn readme(acc: &Account, id: u64, branch: &str) -> Result<Readme> {
    let tree = match request(acc, &format!("projects/{id}/repository/tree"), &[("per_page", "100".into())], None)? {
        res if res.status().as_u16() == 404 => return Ok(Readme::default()),
        res => response::<Vec<TreeEntry>>(res)?,
    };
    let Some(path) = pick_readme(&tree) else { return Ok(Readme::default()) };
    let mut url = url::Url::parse(&format!("{}/api/v4/projects/{id}/repository/files/", acc.base))
        .map_err(|e| AppError::Gitlab(e.to_string()))?;
    // The path is one segment: slashes inside it are %2F, as the files API wants them.
    url.path_segments_mut()
        .map_err(|_| AppError::Gitlab("endereço inválido".into()))?
        .pop_if_empty()
        .push(path)
        .push("raw");
    url.query_pairs_mut().append_pair("ref", if branch.is_empty() { "HEAD" } else { branch });
    let res = client()?.get(url).bearer_auth(acc.token.as_str()).send().map_err(network)?;
    match res.status().as_u16() {
        404 => Ok(Readme::default()),
        200..=299 => {
            let mut bytes = Vec::new();
            std::io::Read::read_to_end(&mut std::io::Read::take(res, README_MAX_BYTES + 1), &mut bytes)
                .map_err(|e| AppError::Gitlab(format!("resposta inesperada: {e}")))?;
            let (text, truncated) = cap_text(&bytes, README_MAX_BYTES as usize);
            Ok(Readme { text, truncated, ..Default::default() })
        }
        _ => response::<serde_json::Value>(res).map(|_| Readme::default()),
    }
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
    fn the_readme_is_the_md_one_or_the_first_readme_file() {
        let e = |n: &str, k: &str| TreeEntry { name: n.into(), kind: k.into(), path: n.into() };
        let tree = [e("docs", "tree"), e("README.rst", "blob"), e("Readme.md", "blob"), e("src", "tree")];
        assert_eq!(pick_readme(&tree), Some("Readme.md"));
        assert_eq!(pick_readme(&[e("readme", "tree"), e("README.txt", "blob")]), Some("README.txt"));
        assert_eq!(pick_readme(&[e("main.rs", "blob")]), None);
    }

    #[test]
    fn a_project_icon_wins_over_its_groups_and_ids_become_text() {
        let mut p = project("acme/infra/deploy", "group", "https://gitlab.acme.io/acme/infra/deploy");
        p.id = 7;
        p.topics = vec!["ops".into()];
        p.namespace.as_mut().unwrap().avatar_url = Some("https://gitlab.acme.io/g.png".into());
        let own = convert("https://gitlab.acme.io", vec![p]);
        assert_eq!(
            (own[0].id.as_str(), own[0].avatar_url.as_str(), own[0].topics.clone()),
            ("7", "https://gitlab.acme.io/g.png", vec!["ops".to_string()])
        );
        assert_eq!(own[0].group_avatar_url, "https://gitlab.acme.io/g.png");
    }

    #[test]
    fn a_link_outside_the_instance_is_dropped() {
        let out = convert("https://gitlab.acme.io", vec![project("a/b", "group", "https://evil.example/a/b")]);
        assert!(out.is_empty());
    }
}
