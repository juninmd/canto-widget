//! The peek panel's commands: one PR's details, and approve or comment from the widget.
use crate::blocking::run;
use crate::error::Result;
use crate::github::cmd_lists::token;
use crate::github::detail::{self, PrDetail};

#[tauri::command]
pub async fn github_pr_detail(app: tauri::AppHandle, repo: String, number: u64) -> Result<PrDetail> {
    detail::check_target(&repo, number)?;
    run(move || detail::fetch(&token(&app)?, &repo, number)).await
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
