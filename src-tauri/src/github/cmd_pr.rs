//! The peek panel's commands: one PR's details, and approve or comment from the widget.
use crate::blocking::run;
use crate::error::Result;
use crate::forge::pr_meta::{PrAction, PrLabel, PrMeta};
use crate::github::cmd_lists::token;
use crate::github::conversation::{self, ConvEntry};
use crate::github::detail::{self, PrDetail};
use crate::github::files::{self, PrFile};
use crate::github::manage;
use crate::github::profile::{self, Profile};

#[tauri::command]
pub async fn github_pr_detail(app: tauri::AppHandle, repo: String, number: u64) -> Result<PrDetail> {
    detail::check_target(&repo, number)?;
    run(move || detail::fetch(&token(&app)?, &repo, number)).await
}

/// The comments of one PR (general and inline), read only when the user opens the conversation in the peek panel.
#[tauri::command]
pub async fn github_pr_conversation(app: tauri::AppHandle, repo: String, number: u64) -> Result<Vec<ConvEntry>> {
    detail::check_target(&repo, number)?;
    run(move || conversation::fetch(&token(&app)?, &repo, number)).await
}

/// The changed files with their patches, read only when the user opens the Arquivos or Diff tab.
#[tauri::command]
pub async fn github_pr_files(app: tauri::AppHandle, repo: String, number: u64) -> Result<Vec<PrFile>> {
    detail::check_target(&repo, number)?;
    run(move || files::fetch(&token(&app)?, &repo, number)).await
}

/// A reply inside an inline review thread; `comment` is the thread's first comment.
#[tauri::command]
pub async fn github_pr_reply(
    app: tauri::AppHandle,
    repo: String,
    number: u64,
    comment: u64,
    body: String,
) -> Result<()> {
    let write = detail::plan_reply(&repo, number, comment, &body)?;
    run(move || detail::send(&token(&app)?, &write)).await
}

/// A user-triggered write (`approve`, `request_changes` or `comment`); validated before the token is even read.
#[tauri::command]
pub async fn github_pr_review(
    app: tauri::AppHandle,
    repo: String,
    number: u64,
    action: String,
    body: Option<String>,
) -> Result<()> {
    let write = detail::plan(&action, &repo, number, body.as_deref().unwrap_or(""))?;
    run(move || detail::send(&token(&app)?, &write)).await
}

/// The public card of a person on a PR; the login is validated before the token is read.
#[tauri::command]
pub async fn github_profile(app: tauri::AppHandle, login: String) -> Result<Profile> {
    if !profile::valid_login(&login) {
        return Err(crate::error::AppError::Github("usuário inválido".into()));
    }
    run(move || profile::fetch(&token(&app)?, &login)).await
}

/// State, labels, author and reactions of one PR, read when its view opens and again after every action.
#[tauri::command]
pub async fn github_pr_meta(app: tauri::AppHandle, repo: String, number: u64) -> Result<PrMeta> {
    detail::check_target(&repo, number)?;
    run(move || manage::fetch_meta(&token(&app)?, &repo, number)).await
}

/// The repository's labels, read only when the label picker opens.
#[tauri::command]
pub async fn github_repo_labels(app: tauri::AppHandle, repo: String) -> Result<Vec<PrLabel>> {
    detail::check_target(&repo, 1)?;
    run(move || manage::fetch_labels(&token(&app)?, &repo)).await
}

/// Merge, close, reopen, draft, label or react: planned and validated before the token is even read.
#[tauri::command]
pub async fn github_pr_act(app: tauri::AppHandle, repo: String, number: u64, action: PrAction) -> Result<()> {
    let step = manage::plan(&repo, number, &action)?;
    run(move || manage::run_step(&token(&app)?, &repo, number, &step)).await
}
