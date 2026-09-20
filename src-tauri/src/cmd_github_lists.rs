//! GitHub lists behind the tab and the day summary, through the forge cache.
use tauri::Manager;
use zeroize::Zeroizing;

use crate::blocking::run;
use crate::cmd_github::{valid_token, GithubState, FORGE};
use crate::error::Result;
use crate::forge::{ForgeList, ForgeLists};
use crate::forge_filter::{cache_key, ForgeFilter, Section};
use crate::github;
use crate::model::now_ms;
use crate::vault::AppState;

/// Four sections cost up to six searches of the 30 per minute: served from the cache unless `force`.
#[tauri::command]
pub async fn github_lists(app: tauri::AppHandle, filter: Option<ForgeFilter>, force: Option<bool>) -> Result<ForgeLists> {
    run(move || {
        let (token, f) = (token(&app)?, filter.unwrap_or_default());
        let cache = &app.state::<AppState>().forges;
        ForgeLists::collect(|s| cache.get(FORGE, &cache_key(s, 1, &f), force.unwrap_or(false), now_ms(), || github::section(&token, s, 1, &f)))
    })
    .await
}

#[tauri::command]
pub async fn github_section(app: tauri::AppHandle, section: Section, page: u32, filter: Option<ForgeFilter>) -> Result<ForgeList> {
    run(move || {
        let (token, f) = (token(&app)?, filter.unwrap_or_default());
        let cache = &app.state::<AppState>().forges;
        cache.get(FORGE, &cache_key(section, page, &f), false, now_ms(), || github::section(&token, section, page, &f))
    })
    .await
}

/// `None` when GitHub isn't connected: the day summary just leaves it out.
pub(crate) fn opened_since(app: &tauri::AppHandle, since: &str) -> Option<Result<ForgeList>> {
    match app.state::<AppState>().github_config() {
        Ok(None) => return None,
        Err(e) => return Some(Err(e)),
        Ok(Some(_)) => {}
    }
    let fetch = || {
        let token = token(app)?;
        app.state::<AppState>().forges.get(FORGE, &format!("opened|{since}"), false, now_ms(), || github::prs_opened_since(&token, since))
    };
    Some(fetch())
}

fn token(app: &tauri::AppHandle) -> Result<Zeroizing<String>> {
    let state = app.state::<AppState>();
    state.touch();
    valid_token(&state, &app.state::<GithubState>(), now_ms())
}
