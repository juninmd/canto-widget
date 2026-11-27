//! A PR as a whole, for the full view: its state, labels and reactions (reads), and what a user does to them from the
//! widget (merge, close, draft, labels, reactions). A write is planned and validated before the token is read.
use reqwest::blocking::RequestBuilder;
use serde::Deserialize;
use serde_json::{json, Value};

use crate::error::{AppError, Result};
use crate::forge::pr_meta::{
    clean_color, emoji_name, emoji_of, encode_segment, valid_label, valid_method, valid_target, PrAction, PrLabel,
    PrMeta, PrReaction, MAX_DESCRIPTION, MAX_LABELS,
};
use crate::github::detail::{check_target, clip};
use crate::github::{client, network, response, API};

#[derive(Deserialize)]
struct User {
    login: String,
    #[serde(default)]
    avatar_url: String,
}

#[derive(Deserialize)]
struct RawLabel {
    name: String,
    #[serde(default)]
    color: String,
}

#[derive(Deserialize)]
struct Milestone {
    #[serde(default)]
    title: String,
}

#[derive(Deserialize)]
struct Pull {
    #[serde(default)]
    title: String,
    #[serde(default)]
    state: String,
    #[serde(default)]
    merged: bool,
    #[serde(default)]
    draft: bool,
    #[serde(default)]
    mergeable_state: Option<String>,
    #[serde(default)]
    user: Option<User>,
    #[serde(default)]
    created_at: String,
    #[serde(default)]
    body: Option<String>,
    #[serde(default)]
    labels: Vec<RawLabel>,
    #[serde(default)]
    assignees: Vec<User>,
    #[serde(default)]
    milestone: Option<Milestone>,
    #[serde(default)]
    node_id: String,
}

#[derive(Deserialize)]
struct RepoRules {
    #[serde(default = "yes")]
    allow_merge_commit: bool,
    #[serde(default = "yes")]
    allow_squash_merge: bool,
    #[serde(default = "yes")]
    allow_rebase_merge: bool,
}

fn yes() -> bool {
    true
}

#[derive(Deserialize)]
struct RawReaction {
    id: u64,
    #[serde(default)]
    content: String,
    #[serde(default)]
    user: Option<User>,
}

fn labels_of(raw: Vec<RawLabel>) -> Vec<PrLabel> {
    raw.into_iter().take(MAX_LABELS).map(|l| PrLabel { color: clean_color(&l.color), name: l.name }).collect()
}

fn convert(p: Pull, rules: RepoRules, reactions: Vec<RawReaction>) -> PrMeta {
    let methods = [
        ("merge", rules.allow_merge_commit),
        ("squash", rules.allow_squash_merge),
        ("rebase", rules.allow_rebase_merge),
    ];
    let (author, avatar) = p.user.map_or((String::new(), String::new()), |u| (u.login, u.avatar_url));
    PrMeta {
        title: p.title,
        state: if p.merged {
            "merged"
        } else if p.state == "closed" {
            "closed"
        } else {
            "open"
        }
        .into(),
        draft: p.draft,
        conflict: p.mergeable_state.as_deref() == Some("dirty"),
        author,
        author_avatar: if crate::forge::image::allowed("github", "", &avatar) { avatar } else { String::new() },
        created_at: p.created_at,
        body: clip(p.body.as_deref().unwrap_or(""), MAX_DESCRIPTION),
        labels: labels_of(p.labels),
        assignees: p.assignees.into_iter().map(|u| u.login).collect(),
        milestone: p.milestone.map(|m| m.title).unwrap_or_default(),
        merge_methods: methods.iter().filter(|m| m.1).map(|m| m.0.to_string()).collect(),
        reactions: reactions
            .into_iter()
            .filter_map(|r| {
                Some(PrReaction { id: r.id, emoji: emoji_of(true, &r.content)?.into(), user: r.user?.login })
            })
            .collect(),
    }
}

pub fn fetch_meta(token: &str, repo: &str, number: u64) -> Result<PrMeta> {
    check_target(repo, number)?;
    let http = client()?;
    let get = |url: String| http.get(url).bearer_auth(token).send().map_err(network);
    let pull: Pull = response(get(format!("{API}/repos/{repo}/pulls/{number}"))?)?;
    let rules: RepoRules = response(get(format!("{API}/repos/{repo}"))?)?;
    let reactions: Vec<RawReaction> =
        response(get(format!("{API}/repos/{repo}/issues/{number}/reactions?per_page=100"))?)?;
    Ok(convert(pull, rules, reactions))
}

/// Every label the repository has, for the picker.
pub fn fetch_labels(token: &str, repo: &str) -> Result<Vec<PrLabel>> {
    check_target(repo, 1)?;
    let res =
        client()?.get(format!("{API}/repos/{repo}/labels?per_page=100")).bearer_auth(token).send().map_err(network)?;
    Ok(labels_of(response(res)?))
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Verb {
    Post,
    Put,
    Patch,
    Delete,
}

/// One planned write: nothing here has touched the network or the token yet.
#[derive(Debug, PartialEq)]
pub enum Step {
    Rest {
        verb: Verb,
        path: String,
        json: Option<Value>,
    },
    /// Marking ready or converting back needs the PR's GraphQL id, read when the step runs.
    Draft {
        on: bool,
    },
}

fn reactions_path(repo: &str, number: u64, target: &str, id: u64) -> String {
    match target {
        "comment" => format!("repos/{repo}/issues/comments/{id}/reactions"),
        "review" => format!("repos/{repo}/pulls/comments/{id}/reactions"),
        _ => format!("repos/{repo}/issues/{number}/reactions"),
    }
}

pub fn plan(repo: &str, number: u64, action: &PrAction) -> Result<Step> {
    check_target(repo, number)?;
    let pull = format!("repos/{repo}/pulls/{number}");
    let rest = |verb, path: String, json| Ok(Step::Rest { verb, path, json });
    match action {
        PrAction::Merge { method, .. } => {
            rest(Verb::Put, format!("{pull}/merge"), Some(json!({ "merge_method": valid_method(method)? })))
        }
        PrAction::Close => rest(Verb::Patch, pull, Some(json!({ "state": "closed" }))),
        PrAction::Reopen => rest(Verb::Patch, pull, Some(json!({ "state": "open" }))),
        PrAction::Draft { on } => Ok(Step::Draft { on: *on }),
        PrAction::LabelAdd { name } => rest(
            Verb::Post,
            format!("repos/{repo}/issues/{number}/labels"),
            Some(json!({ "labels": [valid_label(name)?] })),
        ),
        PrAction::LabelRemove { name } => rest(
            Verb::Delete,
            format!("repos/{repo}/issues/{number}/labels/{}", encode_segment(valid_label(name)?)),
            None,
        ),
        PrAction::React { target, id, emoji } => {
            valid_target(target, *id)?;
            let content =
                emoji_name(true, emoji).ok_or_else(|| AppError::Format("o GitHub não tem essa reação".into()))?;
            rest(Verb::Post, reactions_path(repo, number, target, *id), Some(json!({ "content": content })))
        }
        PrAction::Unreact { target, id, reaction } => {
            // GitHub only lists the reactions of the PR itself here; a comment's can be added, not taken back.
            if target != "pr" || *reaction == 0 || *id != 0 {
                return Err(AppError::Format("só dá para desfazer a reação do próprio PR".into()));
            }
            rest(Verb::Delete, format!("repos/{repo}/issues/{number}/reactions/{reaction}"), None)
        }
    }
}

/// What a refused write means to the user; a rate limit is left to the shared handler.
pub fn refused(status: u16) -> Option<AppError> {
    let text = match status {
        403 | 404 => "o token não pode escrever neste PR: crie-o com permissão de escrita em Pull requests (e Issues, para etiquetas e reações)",
        405 => "o GitHub não deixa mesclar agora: confira os checks, as aprovações e os conflitos",
        409 => "o PR mudou enquanto você olhava: recarregue e tente de novo",
        422 => "o GitHub recusou: confira o estado do PR, o nome da etiqueta e o método de mesclagem",
        _ => return None,
    };
    Some(AppError::Github(text.into()))
}

fn done(res: reqwest::blocking::Response) -> Result<()> {
    let spent = res.headers().get("x-ratelimit-remaining").is_some_and(|v| v == "0");
    if res.status().is_success() {
        return Ok(());
    }
    match refused(res.status().as_u16()) {
        Some(e) if !spent => Err(e),
        _ => response::<Value>(res).map(|_| ()),
    }
}

fn request(verb: Verb, url: String) -> Result<RequestBuilder> {
    let http = client()?;
    Ok(match verb {
        Verb::Post => http.post(url),
        Verb::Put => http.put(url),
        Verb::Patch => http.patch(url),
        Verb::Delete => http.delete(url),
    })
}

fn draft(token: &str, repo: &str, number: u64, on: bool) -> Result<()> {
    let http = client()?;
    let res = http.get(format!("{API}/repos/{repo}/pulls/{number}")).bearer_auth(token).send().map_err(network)?;
    let pull: Pull = response(res)?;
    let field = if on { "convertPullRequestToDraft" } else { "markPullRequestReadyForReview" };
    let query = format!("mutation($id: ID!) {{ {field}(input: {{ pullRequestId: $id }}) {{ pullRequest {{ id }} }} }}");
    let res = http
        .post(format!("{API}/graphql"))
        .bearer_auth(token)
        .json(&json!({ "query": query, "variables": { "id": pull.node_id } }))
        .send()
        .map_err(network)?;
    let answer: Value = response(res)?;
    match answer.get("errors").and_then(Value::as_array).and_then(|e| e.first()) {
        Some(e) => Err(AppError::Github(
            e.get("message").and_then(Value::as_str).unwrap_or("o GitHub recusou a mudança de rascunho").to_string(),
        )),
        None => Ok(()),
    }
}

pub fn run_step(token: &str, repo: &str, number: u64, step: &Step) -> Result<()> {
    match step {
        Step::Draft { on } => draft(token, repo, number, *on),
        Step::Rest { verb, path, json } => {
            let mut req = request(*verb, format!("{API}/{path}"))?.bearer_auth(token);
            if let Some(body) = json {
                req = req.json(body);
            }
            done(req.send().map_err(network)?)
        }
    }
}

#[cfg(test)]
#[path = "manage_tests.rs"]
mod tests;
