//! The peek panel's commands: one PR's details, and approve or comment from the widget.
use crate::blocking::run;
use crate::error::Result;
use crate::github::cmd_lists::token;
use crate::github::conversation::{self, ConvEntry};
use crate::github::detail::{self, PrDetail};
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

/// A user-triggered write (`approve` or `comment`); validated before the token is even read.
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
