//! An MR as a whole, for the full view: state, labels and award emoji (reads), and what a user does to them from the
//! widget. Writes need a token with the `api` scope; a refused one says so.
use serde::Deserialize;
use serde_json::{json, Value};

use crate::blocking::run;
use crate::error::{AppError, Result};
use crate::forge::pr_meta::{
    clean_color, drafted, emoji_name, emoji_of, valid_label, valid_method, valid_target, PrAction, PrLabel, PrMeta,
    PrReaction, MAX_DESCRIPTION, MAX_LABELS,
};
use crate::github::detail::clip;
use crate::gitlab::cmd::account;
use crate::gitlab::review::target;
use crate::gitlab::{client, network, response, Account};

#[derive(Deserialize)]
struct User {
    username: String,
    #[serde(default)]
    avatar_url: Option<String>,
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
struct Mr {
    #[serde(default)]
    title: String,
    #[serde(default)]
    state: String,
    #[serde(default, alias = "work_in_progress")]
    draft: bool,
    #[serde(default)]
    has_conflicts: bool,
    #[serde(default)]
    author: Option<User>,
    #[serde(default)]
    created_at: String,
    #[serde(default)]
    description: Option<String>,
    #[serde(default)]
    labels: Vec<RawLabel>,
    #[serde(default)]
    assignees: Vec<User>,
    #[serde(default)]
    milestone: Option<Milestone>,
}

#[derive(Deserialize)]
struct Award {
    id: u64,
    #[serde(default)]
    name: String,
    #[serde(default)]
    user: Option<User>,
}

fn get<T: for<'de> Deserialize<'de>>(acc: &Account, path: &str) -> Result<T> {
    response(
        client()?.get(format!("{}/api/v4/{path}", acc.base)).bearer_auth(acc.token.as_str()).send().map_err(network)?,
    )
}

fn labels_of(raw: Vec<RawLabel>) -> Vec<PrLabel> {
    raw.into_iter().take(MAX_LABELS).map(|l| PrLabel { color: clean_color(&l.color), name: l.name }).collect()
}

fn convert(base: &str, m: Mr, awards: Vec<Award>) -> PrMeta {
    let (author, avatar) =
        m.author.map_or((String::new(), String::new()), |u| (u.username, u.avatar_url.unwrap_or_default()));
    PrMeta {
        title: m.title,
        state: match m.state.as_str() {
            "merged" => "merged",
            "closed" | "locked" => "closed",
            _ => "open",
        }
        .into(),
        draft: m.draft,
        conflict: m.has_conflicts,
        author,
        author_avatar: if crate::forge::image::allowed("gitlab", base, &avatar) { avatar } else { String::new() },
        created_at: m.created_at,
        body: clip(m.description.as_deref().unwrap_or(""), MAX_DESCRIPTION),
        labels: labels_of(m.labels),
        assignees: m.assignees.into_iter().map(|u| u.username).collect(),
        milestone: m.milestone.map(|x| x.title).unwrap_or_default(),
        // `rebase` is a separate endpoint (and a project setting) on GitLab, so only these two are offered.
        merge_methods: vec!["merge".into(), "squash".into()],
        reactions: awards
            .into_iter()
            .filter_map(|a| {
                Some(PrReaction { id: a.id, emoji: emoji_of(false, &a.name)?.into(), user: a.user?.username })
            })
            .collect(),
    }
}

pub fn fetch_meta(acc: &Account, project: &str, iid: u64) -> Result<PrMeta> {
    let id = target(project, iid)?;
    let mr: Mr = get(acc, &format!("projects/{id}/merge_requests/{iid}?with_labels_details=true"))?;
    let awards: Vec<Award> = get(acc, &format!("projects/{id}/merge_requests/{iid}/award_emoji?per_page=100"))?;
    Ok(convert(&acc.base, mr, awards))
}

pub fn fetch_labels(acc: &Account, project: &str) -> Result<Vec<PrLabel>> {
    let id = target(project, 1)?;
    Ok(labels_of(get(acc, &format!("projects/{id}/labels?per_page=100"))?))
}

/// One planned write; a draft toggle first needs the current title, read when it runs.
#[derive(Debug, PartialEq)]
pub enum Step {
    Call { put: bool, delete: bool, path: String, json: Value },
    Draft { on: bool },
}

pub fn plan(project: &str, iid: u64, action: &PrAction) -> Result<Step> {
    let id = target(project, iid)?;
    let mr = format!("projects/{id}/merge_requests/{iid}");
    let call = |put, delete, path: String, json| Ok(Step::Call { put, delete, path, json });
    match action {
        PrAction::Merge { method, auto } => {
            let squash = valid_method(method)? == "squash";
            if method == "rebase" {
                return Err(AppError::Format("o GitLab só mescla por merge ou squash aqui".into()));
            }
            call(true, false, format!("{mr}/merge"), json!({ "squash": squash, "merge_when_pipeline_succeeds": auto }))
        }
        PrAction::Close => call(true, false, mr, json!({ "state_event": "close" })),
        PrAction::Reopen => call(true, false, mr, json!({ "state_event": "reopen" })),
        PrAction::Draft { on } => Ok(Step::Draft { on: *on }),
        PrAction::LabelAdd { name } => call(true, false, mr, json!({ "add_labels": valid_label(name)? })),
        PrAction::LabelRemove { name } => call(true, false, mr, json!({ "remove_labels": valid_label(name)? })),
        PrAction::React { target: t, id: note, emoji } => {
            valid_target(t, *note)?;
            let name =
                emoji_name(false, emoji).ok_or_else(|| AppError::Format("o GitLab não tem essa reação".into()))?;
            let path = if t == "pr" { format!("{mr}/award_emoji") } else { format!("{mr}/notes/{note}/award_emoji") };
            call(false, false, path, json!({ "name": name }))
        }
        PrAction::Unreact { target: t, id: note, reaction } => {
            valid_target(t, *note)?;
            if *reaction == 0 {
                return Err(AppError::Format("reação inválida".into()));
            }
            let path = if t == "pr" {
                format!("{mr}/award_emoji/{reaction}")
            } else {
                format!("{mr}/notes/{note}/award_emoji/{reaction}")
            };
            call(false, true, path, json!({}))
        }
    }
}

/// What a refused write means to the user; the shared handler keeps the rate-limit and sign-in cases.
pub fn refused(status: u16) -> Option<AppError> {
    let text = match status {
        403 | 404 => "o token não pode escrever neste MR: crie-o com o escopo api",
        405 | 406 => "o GitLab não deixa mesclar agora: confira o pipeline, as aprovações e os conflitos",
        409 => "o MR mudou enquanto você olhava: recarregue e tente de novo",
        422 => "o GitLab recusou: confira o estado do MR e o nome da etiqueta",
        _ => return None,
    };
    Some(AppError::Gitlab(text.into()))
}

fn send(acc: &Account, put: bool, delete: bool, path: &str, body: &Value) -> Result<()> {
    let url = format!("{}/api/v4/{path}", acc.base);
    let http = client()?;
    let req = if delete {
        http.delete(url)
    } else if put {
        http.put(url)
    } else {
        http.post(url)
    };
    let res = req.bearer_auth(acc.token.as_str()).json(body).send().map_err(network)?;
    let spent = res.headers().get("ratelimit-remaining").is_some_and(|v| v == "0");
    if res.status().is_success() {
        return Ok(());
    }
    match refused(res.status().as_u16()) {
        Some(e) if !spent => Err(e),
        _ => response::<Value>(res).map(|_| ()),
    }
}

pub fn run_step(acc: &Account, project: &str, iid: u64, step: &Step) -> Result<()> {
    match step {
        Step::Call { put, delete, path, json } => send(acc, *put, *delete, path, json),
        Step::Draft { on } => {
            let id = target(project, iid)?;
            let mr: Mr = get(acc, &format!("projects/{id}/merge_requests/{iid}"))?;
            send(
                acc,
                true,
                false,
                &format!("projects/{id}/merge_requests/{iid}"),
                &json!({ "title": drafted(&mr.title, *on) }),
            )
        }
    }
}

#[tauri::command]
pub async fn gitlab_mr_meta(app: tauri::AppHandle, project: String, iid: u64) -> Result<PrMeta> {
    target(&project, iid)?;
    run(move || fetch_meta(&account(&app)?, &project, iid)).await
}

#[tauri::command]
pub async fn gitlab_project_labels(app: tauri::AppHandle, project: String) -> Result<Vec<PrLabel>> {
    target(&project, 1)?;
    run(move || fetch_labels(&account(&app)?, &project)).await
}

/// Merge, close, reopen, draft, label or react: planned and validated before the token is even read.
#[tauri::command]
pub async fn gitlab_mr_act(app: tauri::AppHandle, project: String, iid: u64, action: PrAction) -> Result<()> {
    let step = plan(&project, iid, &action)?;
    run(move || run_step(&account(&app)?, &project, iid, &step)).await
}

#[cfg(test)]
#[path = "manage_tests.rs"]
mod tests;
