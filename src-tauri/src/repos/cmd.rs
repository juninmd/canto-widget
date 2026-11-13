//! Commands of the repositories subtab. Each forge's lists live in RAM under `forge|repos` and `forge|calendar`.
use tauri::Manager;

use crate::blocking::run;
use crate::error::{AppError, Result};
use crate::github::cmd::{valid_token, GithubState};
use crate::gitlab::cmd::to_account;
use crate::model::now_ms;
use crate::repos::{github, gitlab, Contributions, RepoList};
use crate::vault::AppState;

const GH: &str = "github";
const GL: &str = "gitlab";

/// Repositories the GitHub account reaches, grouped by the UI into organizations and the root.
#[tauri::command]
pub async fn github_repos(app: tauri::AppHandle, force: Option<bool>) -> Result<RepoList> {
    run(move || {
        let state = app.state::<AppState>();
        state.touch();
        let login = state.github_config()?.map(|c| c.login).filter(|l| !l.is_empty());
        let login = login.ok_or_else(|| AppError::Github("conecte sua conta do GitHub".into()))?;
        state.forges.repos.lists.get(&format!("{GH}|repos"), force.unwrap_or(false), now_ms(), || {
            let token = valid_token(&state, &app.state::<GithubState>(), now_ms())?;
            let (repos, truncated) = github::repos(&token, &login)?;
            Ok(RepoList { repos, truncated, ..Default::default() })
        })
    })
    .await
}

/// The year's contribution squares; only asked for when the user turns the statistics on.
#[tauri::command]
pub async fn github_contributions(app: tauri::AppHandle, force: Option<bool>) -> Result<Contributions> {
    run(move || {
        let state = app.state::<AppState>();
        state.touch();
        state.forges.repos.calendars.get(&format!("{GH}|calendar"), force.unwrap_or(false), now_ms(), || {
            let token = valid_token(&state, &app.state::<GithubState>(), now_ms())?;
            github::calendar(&token)
        })
    })
    .await
}

#[tauri::command]
pub async fn gitlab_repos(app: tauri::AppHandle, force: Option<bool>) -> Result<RepoList> {
    run(move || {
        let state = app.state::<AppState>();
        state.touch();
        let cfg = state.gitlab_config()?.ok_or_else(|| AppError::Gitlab("conecte sua conta do GitLab".into()))?;
        state.forges.repos.lists.get(&format!("{GL}|repos"), force.unwrap_or(false), now_ms(), || {
            let (repos, truncated) = gitlab::projects(&to_account(&cfg))?;
            Ok(RepoList { repos, truncated, ..Default::default() })
        })
    })
    .await
}

#[tauri::command]
pub async fn gitlab_contributions(app: tauri::AppHandle, force: Option<bool>) -> Result<Contributions> {
    run(move || {
        let state = app.state::<AppState>();
        state.touch();
        let cfg = state.gitlab_config()?.ok_or_else(|| AppError::Gitlab("conecte sua conta do GitLab".into()))?;
        state.forges.repos.calendars.get(&format!("{GL}|calendar"), force.unwrap_or(false), now_ms(), || {
            gitlab::calendar(&to_account(&cfg), &year_ago())
        })
    })
    .await
}

/// `YYYY-MM-DD` one year back (the events API takes `after` as a date).
fn year_ago() -> String {
    (chrono::Utc::now() - chrono::Duration::days(365)).format("%Y-%m-%d").to_string()
}
