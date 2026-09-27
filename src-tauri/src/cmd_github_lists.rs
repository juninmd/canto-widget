//! GitHub lists behind the tab and the day summary, through the forge cache.
use tauri::Manager;
use zeroize::Zeroizing;

use crate::blocking::run;
use crate::cmd_github::{valid_token, GithubState, FORGE};
use crate::error::{AppError, Result};
use crate::forge::{self, ChecksStatus, Forge, ForgeList, ForgeLists};
use crate::forge_cache::Quota;
use crate::forge_filter::{Activity, ForgeFilter, Section, Window};
use crate::github;
use crate::github_checks::{self, GithubChecks, PrChecks, PrRef};
use crate::model::now_ms;
use crate::vault::AppState;

/// The GitHub side of the `Forge` trait: a bearer token.
pub struct Github;

impl Forge for Github {
    const NAME: &'static str = FORGE;
    type Credential = Zeroizing<String>;

    fn fetch_section(
        cred: &Self::Credential,
        section: Section,
        page: u32,
        f: &ForgeFilter,
    ) -> Result<(ForgeList, Option<Quota>)> {
        github::section(cred, section, page, f)
    }

    fn fetch_activity(cred: &Self::Credential, activity: Activity, w: &Window) -> Result<(ForgeList, Option<Quota>)> {
        github::prs_since(cred, activity, w)
    }
}

/// Four sections cost up to six searches of the 30 per minute: served from the cache unless `force`.
#[tauri::command]
pub async fn github_lists(
    app: tauri::AppHandle,
    filter: Option<ForgeFilter>,
    force: Option<bool>,
) -> Result<ForgeLists> {
    run(move || {
        let cred = token(&app)?;
        let cache = &app.state::<AppState>().forges;
        forge::list_all::<Github>(cache, &cred, &filter.unwrap_or_default(), force.unwrap_or(false))
    })
    .await
}

#[tauri::command]
pub async fn github_section(
    app: tauri::AppHandle,
    section: Section,
    page: u32,
    filter: Option<ForgeFilter>,
) -> Result<ForgeList> {
    run(move || {
        let cred = token(&app)?;
        let cache = &app.state::<AppState>().forges;
        forge::list_page::<Github>(cache, &cred, section, page, &filter.unwrap_or_default(), false)
    })
    .await
}

/// One click on a PR row the batch below left out; same cache, so a second click costs nothing.
#[tauri::command]
pub async fn github_pr_checks(app: tauri::AppHandle, repo: String, number: u64) -> Result<ChecksStatus> {
    let Some(pr) = github_checks::pick(vec![PrRef { repo, number }]).pop() else {
        return Err(AppError::Format("repositório inválido".into()));
    };
    run(move || {
        let cred = token(&app)?;
        let cache = &app.state::<AppState>().forges.checks;
        github_checks::status_for(cache, &GithubChecks::new(&cred)?, &pr, now_ms())
    })
    .await
}

/// CI badges for the PRs on screen, bounded to `MAX_PRS` and cached per head sha.
#[tauri::command]
pub async fn github_prs_checks(app: tauri::AppHandle, prs: Vec<PrRef>) -> Result<Vec<PrChecks>> {
    let prs = github_checks::pick(prs);
    run(move || {
        if prs.is_empty() {
            return Ok(Vec::new());
        }
        let cred = token(&app)?;
        let cache = &app.state::<AppState>().forges.checks;
        Ok(github_checks::statuses(cache, &GithubChecks::new(&cred)?, &prs, now_ms()))
    })
    .await
}

/// `None` when GitHub isn't connected: the summary just leaves it out.
pub(crate) fn activity_since(app: &tauri::AppHandle, activity: Activity, w: &Window) -> Option<Result<ForgeList>> {
    match app.state::<AppState>().github_config() {
        Ok(None) => return None,
        Err(e) => return Some(Err(e)),
        Ok(Some(_)) => {}
    }
    let fetch = || {
        let cred = token(app)?;
        let cache = &app.state::<AppState>().forges;
        forge::activity_since::<Github>(cache, &cred, activity, w)
    };
    Some(fetch())
}

/// `None` when GitHub isn't connected: the badge simply doesn't count it.
pub(crate) fn review_requested(app: &tauri::AppHandle) -> Option<Result<u64>> {
    match app.state::<AppState>().github_config() {
        Ok(None) => return None,
        Err(e) => return Some(Err(e)),
        Ok(Some(_)) => {}
    }
    let fetch = || {
        let cred = token(app)?;
        let cache = &app.state::<AppState>().forges;
        forge::review_requested::<Github>(cache, &cred)
    };
    Some(fetch())
}

fn token(app: &tauri::AppHandle) -> Result<Zeroizing<String>> {
    let state = app.state::<AppState>();
    state.touch();
    valid_token(&state, &app.state::<GithubState>(), now_ms())
}
