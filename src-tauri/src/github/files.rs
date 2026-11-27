//! The changed files of one PR for the peek view: name, counts and a capped patch. One read (`pulls/{n}/files`).
use serde::{Deserialize, Serialize};

use crate::error::Result;
use crate::github::detail::check_target;
use crate::github::{client, network, response, API};

pub const MAX_FILES: usize = 100;
pub const MAX_PATCH_LINES: usize = 400;

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct PrFile {
    pub name: String,
    /// `added`, `removed`, `renamed` or `modified`.
    pub status: String,
    pub additions: u64,
    pub deletions: u64,
    /// Unified diff starting at the first `@@`; empty for binary files or ones too large for the forge to show.
    pub patch: String,
    pub truncated: bool,
}

#[derive(Deserialize)]
struct Raw {
    filename: String,
    #[serde(default)]
    status: String,
    #[serde(default)]
    additions: u64,
    #[serde(default)]
    deletions: u64,
    #[serde(default)]
    patch: Option<String>,
}

/// Keeps the first `MAX_PATCH_LINES` lines; the flag says something was left out.
pub fn cap_patch(patch: &str) -> (String, bool) {
    let mut lines = patch.lines();
    let kept: Vec<&str> = lines.by_ref().take(MAX_PATCH_LINES).collect();
    (kept.join("\n"), lines.next().is_some())
}

fn convert(raw: Vec<Raw>) -> Vec<PrFile> {
    raw.into_iter()
        .take(MAX_FILES)
        .map(|r| {
            let (patch, truncated) = cap_patch(r.patch.as_deref().unwrap_or(""));
            let status = if r.status == "removed" || r.status == "added" || r.status == "renamed" {
                r.status
            } else {
                "modified".into()
            };
            PrFile { name: r.filename, status, additions: r.additions, deletions: r.deletions, patch, truncated }
        })
        .collect()
}

pub fn fetch(token: &str, repo: &str, number: u64) -> Result<Vec<PrFile>> {
    check_target(repo, number)?;
    let res = client()?
        .get(format!("{API}/repos/{repo}/pulls/{number}/files?per_page={MAX_FILES}"))
        .bearer_auth(token)
        .send()
        .map_err(network)?;
    Ok(convert(response(res)?))
}

#[cfg(test)]
#[path = "files_tests.rs"]
mod tests;
