//! The user's GitLab to-dos: what GitLab itself decided to tell them about (mentions, assignments, failed pipelines).
use serde::Deserialize;

use crate::error::{AppError, Result};
use crate::gitlab::{client, network, response, Account, User};

/// A to-do GitLab raised because someone mentioned the user.
#[derive(Debug, Clone, Default, PartialEq)]
pub struct Mention {
    /// GitLab's `action_name`: `mentioned`, `assigned`, `build_failed`...
    pub action: String,
    pub id: u64,
    pub title: String,
    pub url: String,
    pub author: String,
    pub author_name: String,
    pub avatar_url: String,
    pub body: String,
    /// `group/project`, for the alert's heading.
    pub project: String,
    pub at: String,
    pub is_pr: bool,
}

#[derive(Deserialize)]
struct RawTodo {
    id: u64,
    #[serde(default)]
    action_name: String,
    #[serde(default)]
    target_url: String,
    #[serde(default)]
    body: String,
    #[serde(default)]
    created_at: String,
    #[serde(default)]
    target_type: String,
    #[serde(default)]
    author: Option<User>,
    #[serde(default)]
    target: Option<TodoTarget>,
    #[serde(default)]
    project: Option<TodoProject>,
}

#[derive(Deserialize)]
struct TodoTarget {
    #[serde(default)]
    title: String,
}

#[derive(Deserialize)]
struct TodoProject {
    #[serde(default)]
    path_with_namespace: String,
}

/// Every pending to-do on the configured instance, newest first; a link outside it is dropped like in the lists.
pub fn pending(acc: &Account) -> Result<Vec<Mention>> {
    let url = url::Url::parse_with_params(
        &format!("{}/api/v4/todos", acc.base),
        [("state", "pending"), ("per_page", "50"), ("page", "1")],
    )
    .map_err(|e| AppError::Gitlab(e.to_string()))?;
    let res = client()?.get(url).bearer_auth(acc.token.as_str()).send().map_err(network)?;
    Ok(todos_in(response(res)?, &acc.base))
}

/// "Mentioned" and "directly addressed" are the to-dos GitLab creates for an @-mention (a group mention included).
pub fn is_mention(m: &Mention) -> bool {
    matches!(m.action.as_str(), "mentioned" | "directly_addressed")
}

pub fn mentions(acc: &Account) -> Result<Vec<Mention>> {
    Ok(pending(acc)?.into_iter().filter(is_mention).collect())
}

fn todos_in(raw: Vec<RawTodo>, base: &str) -> Vec<Mention> {
    raw.into_iter()
        .filter(|t| t.target_url.starts_with(&format!("{base}/")))
        .map(|t| Mention {
            id: t.id,
            action: t.action_name,
            at: t.created_at,
            is_pr: t.target_type == "MergeRequest",
            author_name: t.author.as_ref().map(|u| u.name.clone()).unwrap_or_default(),
            avatar_url: t.author.as_ref().and_then(|u| u.avatar_url.clone()).unwrap_or_default(),
            title: t.target.map(|x| x.title).unwrap_or_default(),
            url: t.target_url,
            author: t.author.map(|u| u.username).unwrap_or_default(),
            body: t.body,
            project: t.project.map(|p| p.path_with_namespace).unwrap_or_default(),
        })
        .collect()
}

#[cfg(test)]
#[path = "gitlab_todos_tests.rs"]
mod tests;
