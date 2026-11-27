//! The conversation of one PR for the peek panel: its general comments and its inline review comments, oldest first.
//! Two reads (`issues/{n}/comments`, `pulls/{n}/comments`); nothing is written and no avatar is downloaded.
use serde::{Deserialize, Serialize};

use crate::error::Result;
use crate::forge::pr_meta::emoji_of;
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
    /// Who a reply goes to: the id of the thread's first comment (GitHub) or the discussion id (GitLab). Empty for a
    /// general comment, which has no thread.
    pub thread: String,
    pub resolved: bool,
    /// Only GitLab can resolve from here; GitHub needs a GraphQL thread id this panel does not read.
    pub resolvable: bool,
    /// How many people reacted with each emoji (GitHub only: GitLab's notes carry none). Counts, not people, so a
    /// reaction can be added but not taken back from here.
    pub reactions: Vec<ReactionCount>,
}

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct ReactionCount {
    pub emoji: String,
    pub count: u64,
}

/// GitHub's `reactions` rollup: `{"+1": 2, "heart": 1, "total_count": 3, "url": ...}`.
fn counts(raw: &std::collections::HashMap<String, serde_json::Value>) -> Vec<ReactionCount> {
    let mut out: Vec<ReactionCount> = raw
        .iter()
        .filter_map(|(k, v)| {
            Some(ReactionCount { emoji: emoji_of(true, k)?.into(), count: v.as_u64().filter(|n| *n > 0)? })
        })
        .collect();
    out.sort_by(|a, b| b.count.cmp(&a.count).then(a.emoji.cmp(&b.emoji)));
    out
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
    #[serde(default)]
    reactions: std::collections::HashMap<String, serde_json::Value>,
}

fn entry(r: Raw) -> Option<ConvEntry> {
    if !r.html_url.starts_with(PREFIX) {
        return None;
    }
    let reply = r.in_reply_to_id.is_some();
    let has_path = r.path.is_some();
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
        thread: if has_path { r.in_reply_to_id.unwrap_or(r.id).to_string() } else { String::new() },
        resolved: false,
        resolvable: false,
        reactions: counts(&r.reactions),
    })
}

pub(crate) fn tail(hunk: &str) -> String {
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
