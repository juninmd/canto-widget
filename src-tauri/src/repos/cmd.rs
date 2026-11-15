//! Commands of the repositories subtab. Pages live in RAM (and sealed on disk), calendars and READMEs only in RAM.
use tauri::Manager;

use crate::blocking::run;
use crate::error::{AppError, Result};
use crate::github::cmd::{valid_token, GithubState};
use crate::gitlab::cmd::to_account;
use crate::model::now_ms;
use crate::repos::{github, gitlab, persist, valid_full_name, Contributions, Readme, RepoPage, MAX_PAGES};
use crate::vault::AppState;

const GH: &str = "github";
const GL: &str = "gitlab";

/// What the UI can paint before any request: the pages held in RAM or in the sealed disk copy, from page 1 on.
#[tauri::command]
pub async fn repos_cached(app: tauri::AppHandle, forge: String) -> Result<Vec<RepoPage>> {
    run(move || {
        let state = app.state::<AppState>();
        state.touch();
        let owner = match forge.as_str() {
            GH => github_owner(&state)?,
            GL => gitlab_owner(&state)?,
            _ => return Err(AppError::Config("forge desconhecida".into())),
        };
        persist::hydrate(&state);
        Ok(state.forges.repos.pages.cached(&forge, &owner))
    })
    .await
}

fn github_owner(state: &AppState) -> Result<String> {
    let login = state.github_config()?.map(|c| c.login).filter(|l| !l.is_empty());
    login.ok_or_else(|| AppError::Github("conecte sua conta do GitHub".into()))
}

fn gitlab_owner(state: &AppState) -> Result<String> {
    let cfg = state.gitlab_config()?.ok_or_else(|| AppError::Gitlab("conecte sua conta do GitLab".into()))?;
    Ok(format!("{}|{}", cfg.base_url, cfg.username))
}

/// The disk copy is rewritten when the list ends and every tenth page on the way: often enough to survive a quit
/// mid-sync, rare enough that 50 pages don't mean 50 writes of megabytes.
fn persist_due(page: &RepoPage, changed: bool) -> bool {
    changed && (!page.has_next || page.page % 10 == 0)
}

/// One page (100) of the repositories the GitHub account reaches; the UI builds the tree from all the pages.
#[tauri::command]
pub async fn github_repos_page(app: tauri::AppHandle, page: u32, force: Option<bool>) -> Result<RepoPage> {
    run(move || {
        let state = app.state::<AppState>();
        state.touch();
        let login = github_owner(&state)?;
        check_page(page)?;
        persist::hydrate(&state);
        let (got, changed) =
            state.forges.repos.pages.get(GH, &login, page, force.unwrap_or(false), now_ms(), |etag| {
                let token = valid_token(&state, &app.state::<GithubState>(), now_ms())?;
                github::page(&token, &login, page, etag)
            })?;
        if persist_due(&got, changed) {
            persist::save(&state);
        }
        Ok(got)
    })
    .await
}

/// A repository's README, read on demand and kept in RAM for half an hour.
#[tauri::command]
pub async fn github_readme(app: tauri::AppHandle, full_name: String, force: Option<bool>) -> Result<Readme> {
    if !valid_full_name(&full_name) {
        return Err(AppError::Config("nome de repositório inválido".into()));
    }
    run(move || {
        let state = app.state::<AppState>();
        state.touch();
        github_owner(&state)?;
        state.forges.repos.readmes.get(&format!("{GH}|{full_name}"), force.unwrap_or(false), now_ms(), || {
            let token = valid_token(&state, &app.state::<GithubState>(), now_ms())?;
            github::readme(&token, &full_name)
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
pub async fn gitlab_repos_page(app: tauri::AppHandle, page: u32, force: Option<bool>) -> Result<RepoPage> {
    run(move || {
        let state = app.state::<AppState>();
        state.touch();
        let owner = gitlab_owner(&state)?;
        let cfg = state.gitlab_config()?.ok_or_else(|| AppError::Gitlab("conecte sua conta do GitLab".into()))?;
        check_page(page)?;
        persist::hydrate(&state);
        let (got, changed) =
            state.forges.repos.pages.get(GL, &owner, page, force.unwrap_or(false), now_ms(), |etag| {
                gitlab::page(&to_account(&cfg), page, etag)
            })?;
        if persist_due(&got, changed) {
            persist::save(&state);
        }
        Ok(got)
    })
    .await
}

#[tauri::command]
pub async fn gitlab_readme(app: tauri::AppHandle, id: String, branch: String, force: Option<bool>) -> Result<Readme> {
    let id: u64 = id.parse().map_err(|_| AppError::Config("projeto inválido".into()))?;
    run(move || {
        let state = app.state::<AppState>();
        state.touch();
        let cfg = state.gitlab_config()?.ok_or_else(|| AppError::Gitlab("conecte sua conta do GitLab".into()))?;
        state.forges.repos.readmes.get(&format!("{GL}|{id}"), force.unwrap_or(false), now_ms(), || {
            gitlab::readme(&to_account(&cfg), id, &branch)
        })
    })
    .await
}

fn check_page(page: u32) -> Result<()> {
    if (1..=MAX_PAGES).contains(&page) {
        Ok(())
    } else {
        Err(AppError::Config("página fora do limite".into()))
    }
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
