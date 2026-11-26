//! The conversation of one PR for the peek panel: its general comments and its inline review comments, oldest first.
//! Two reads (`issues/{n}/comments`, `pulls/{n}/comments`); nothing is written and no avatar is downloaded.
use serde::{Deserialize, Serialize};

use crate::error::Result;
use crate::github::detail::{check_target, clip};
use crate::github::{client, network, response, API};

pub const MAX_BODY: usize = 1500;
const MAX_HUNK_LINES: usize = 6;
const PREFIX: &str = "https://github.com/";

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct ConvEntry {
    pub id: u64,
    pub author: String,
    pub bot: bool,
    pub body: String,
    pub created_at: String,
    pub url: String,
    /// Empty for a general comment; the file of an inline review comment.
    pub path: String,
    /// 0 when the comment is not tied to a line.
    pub line: u64,
    /// The last lines of the diff around an inline comment; empty for a reply, which shares its thread's.
    pub hunk: String,
    pub reply: bool,
}

#[derive(Deserialize)]
struct RawUser {
    login: String,
    #[serde(default, rename = "type")]
    kind: Option<String>,
}

#[derive(Deserialize)]
struct Raw {
    id: u64,
    #[serde(default)]
    html_url: String,
    #[serde(default)]
    body: String,
    #[serde(default)]
    created_at: String,
    #[serde(default)]
    user: Option<RawUser>,
    #[serde(default)]
    path: Option<String>,
    #[serde(default)]
    line: Option<u64>,
    #[serde(default)]
    original_line: Option<u64>,
    #[serde(default)]
    diff_hunk: Option<String>,
    #[serde(default)]
    in_reply_to_id: Option<u64>,
}

fn entry(r: Raw) -> Option<ConvEntry> {
    if !r.html_url.starts_with(PREFIX) {
        return None;
    }
    let reply = r.in_reply_to_id.is_some();
    let hunk = if reply { String::new() } else { tail(r.diff_hunk.as_deref().unwrap_or("")) };
    let (author, bot) = match r.user {
        Some(u) => (u.login.clone(), u.kind.as_deref() == Some("Bot") || u.login.ends_with("[bot]")),
        None => (String::new(), false),
    };
    Some(ConvEntry {
        id: r.id,
        author,
        bot,
        body: clip(&r.body, MAX_BODY),
        created_at: r.created_at,
        url: r.html_url,
        path: r.path.unwrap_or_default(),
        line: r.line.or(r.original_line).unwrap_or(0),
        hunk,
        reply,
    })
}

fn tail(hunk: &str) -> String {
    let lines: Vec<&str> = hunk.lines().collect();
    lines[lines.len().saturating_sub(MAX_HUNK_LINES)..].iter().map(|l| clip(l, 160)).collect::<Vec<_>>().join("\n")
}

/// Both lists merged, links outside github.com dropped, oldest first (ISO timestamps sort as text).
fn merge(general: Vec<Raw>, inline: Vec<Raw>) -> Vec<ConvEntry> {
    let mut all: Vec<ConvEntry> = general.into_iter().chain(inline).filter_map(entry).collect();
    all.sort_by(|a, b| a.created_at.cmp(&b.created_at).then(a.id.cmp(&b.id)));
    all
}

pub fn fetch(token: &str, repo: &str, number: u64) -> Result<Vec<ConvEntry>> {
    check_target(repo, number)?;
    let http = client()?;
    let get = |path: &str| -> Result<Vec<Raw>> {
        response(
            http.get(format!("{API}/repos/{repo}/{path}/{number}/comments?per_page=100"))
                .bearer_auth(token)
                .send()
                .map_err(network)?,
        )
    };
    Ok(merge(get("issues")?, get("pulls")?))
}

#[cfg(test)]
#[path = "conversation_tests.rs"]
mod tests;
