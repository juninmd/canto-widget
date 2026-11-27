//! What a PR/MR view needs beyond the tabs: state, labels, author, reactions and the actions that change them. The
//! types and the pure validation are shared by both forges; each forge builds its own requests.
use serde::{Deserialize, Serialize};

use crate::error::{AppError, Result};

/// The description is shown whole (the lists and the glance cut it much shorter).
pub const MAX_DESCRIPTION: usize = 20_000;
pub const MAX_LABEL: usize = 50;
pub const MAX_LABELS: usize = 100;

/// (what the UI shows, GitHub's `content`, GitLab's award name); GitHub has no flame or check.
const EMOJI: [(&str, &str, &str); 10] = [
    ("👍", "+1", "thumbsup"),
    ("👎", "-1", "thumbsdown"),
    ("😄", "laugh", "smile"),
    ("🎉", "hooray", "tada"),
    ("😕", "confused", "confused"),
    ("❤️", "heart", "heart"),
    ("🚀", "rocket", "rocket"),
    ("👀", "eyes", "eyes"),
    ("🔥", "", "fire"),
    ("✅", "", "white_check_mark"),
];

/// The forge's word for a UI emoji; `None` for one it can't store (and for anything the webview invents).
pub fn emoji_name(github: bool, emoji: &str) -> Option<&'static str> {
    EMOJI.iter().find(|e| e.0 == emoji).map(|e| if github { e.1 } else { e.2 }).filter(|n| !n.is_empty())
}

/// The UI emoji of a forge's name, `None` for one this view does not offer.
pub fn emoji_of(github: bool, name: &str) -> Option<&'static str> {
    EMOJI.iter().find(|e| (if github { e.1 } else { e.2 }) == name).map(|e| e.0)
}

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct PrLabel {
    pub name: String,
    /// Six hex digits without `#`, or empty when the forge sent anything else.
    pub color: String,
}

/// A color the UI may put in a style attribute: exactly six hex digits (a leading `#` is dropped).
pub fn clean_color(raw: &str) -> String {
    let c = raw.trim_start_matches('#');
    if c.len() == 6 && c.chars().all(|ch| ch.is_ascii_hexdigit()) {
        c.to_ascii_lowercase()
    } else {
        String::new()
    }
}

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct PrReaction {
    /// The forge's id, needed to take the reaction back.
    pub id: u64,
    pub emoji: String,
    pub user: String,
}

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct PrMeta {
    pub title: String,
    /// `open`, `closed` or `merged`.
    pub state: String,
    pub draft: bool,
    pub conflict: bool,
    pub author: String,
    /// The forge's own image host or empty; the UI trades it for a `data:` image through `forge_image`.
    pub author_avatar: String,
    pub created_at: String,
    pub body: String,
    pub labels: Vec<PrLabel>,
    pub assignees: Vec<String>,
    pub milestone: String,
    /// What the merge button may offer: any of `merge`, `squash`, `rebase`.
    pub merge_methods: Vec<String>,
    pub reactions: Vec<PrReaction>,
}

/// One thing a user can do to a PR/MR; the webview sends it as `{ "kind": "merge", ... }`.
#[derive(Debug, Clone, Deserialize, PartialEq)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum PrAction {
    /// `auto` waits for the checks (GitLab "merge when pipeline succeeds"; GitHub has no REST equivalent).
    Merge {
        method: String,
        #[serde(default)]
        auto: bool,
    },
    Close,
    Reopen,
    Draft {
        on: bool,
    },
    LabelAdd {
        name: String,
    },
    LabelRemove {
        name: String,
    },
    /// `target` is `pr`, `comment` (a general one) or `review` (an inline one); `id` is the comment's.
    React {
        target: String,
        #[serde(default)]
        id: u64,
        emoji: String,
    },
    Unreact {
        target: String,
        #[serde(default)]
        id: u64,
        reaction: u64,
    },
}

/// Text as one URL path segment: everything but unreserved characters is percent-encoded (a slash too).
pub fn encode_segment(text: &str) -> String {
    text.bytes().fold(String::new(), |mut s, b| {
        if b.is_ascii_alphanumeric() || matches!(b, b'-' | b'_' | b'.' | b'~') {
            s.push(b as char);
        } else {
            s.push_str(&format!("%{b:02X}"));
        }
        s
    })
}

pub fn valid_label(name: &str) -> Result<&str> {
    let name = name.trim();
    if name.is_empty() || name.chars().count() > MAX_LABEL || name.chars().any(char::is_control) {
        return Err(AppError::Format("etiqueta inválida".into()));
    }
    Ok(name)
}

pub fn valid_method(method: &str) -> Result<&str> {
    match method {
        "merge" | "squash" | "rebase" => Ok(method),
        _ => Err(AppError::Format("método de mesclagem desconhecido".into())),
    }
}

/// A target the reaction goes to: the PR itself needs no id, a comment does.
pub fn valid_target(target: &str, id: u64) -> Result<()> {
    match target {
        "pr" => Ok(()),
        "comment" | "review" if id > 0 => Ok(()),
        _ => Err(AppError::Format("alvo da reação inválido".into())),
    }
}

/// Strips the forges' "draft" markers off a title (`Draft:`, `[Draft]`, `(Draft)`, `WIP:`), case-insensitively.
pub fn plain_title(title: &str) -> String {
    let mut rest = title.trim();
    loop {
        let lower = rest.to_ascii_lowercase();
        let cut =
            ["draft:", "[draft]", "(draft)", "wip:", "[wip]"].iter().find(|p| lower.starts_with(**p)).map(|p| p.len());
        match cut {
            Some(n) => rest = rest[n..].trim_start(),
            None => return rest.to_string(),
        }
    }
}

pub fn drafted(title: &str, on: bool) -> String {
    let plain = plain_title(title);
    if on {
        format!("Draft: {plain}")
    } else {
        plain
    }
}

#[cfg(test)]
#[path = "pr_meta_tests.rs"]
mod tests;
