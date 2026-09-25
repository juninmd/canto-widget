//! GitLab tab commands. Address and token stay sealed in `gitlab.json`; the token never reaches the webview.
use serde::{Deserialize, Serialize};
use tauri::{Manager, State};
use zeroize::{Zeroize, ZeroizeOnDrop, Zeroizing};

use crate::blocking::run;
use crate::error::{AppError, Result};
use crate::forge::{self, ChecksStatus, Forge, ForgeList, ForgeLists};
use crate::forge_cache::Quota;
use crate::forge_filter::{Activity, ForgeFilter, Section};
use crate::gitlab::{self, Account};
use crate::gitlab_query;
use crate::store::{self, GITLAB_AAD};
use crate::vault::AppState;

const FORGE: &str = "gitlab";

/// The GitLab side of the `Forge` trait: base URL + token + username.
pub struct Gitlab;

impl Forge for Gitlab {
    const NAME: &'static str = FORGE;
    type Credential = Account;

    fn fetch_section(
        cred: &Self::Credential,
        section: Section,
        page: u32,
        f: &ForgeFilter,
    ) -> Result<(ForgeList, Option<Quota>)> {
        gitlab::section(cred, section, page, f)
    }

    fn fetch_activity(cred: &Self::Credential, activity: Activity, since: &str) -> Result<(ForgeList, Option<Quota>)> {
        gitlab::mrs_since(cred, activity, since)
    }
}

#[derive(Clone, Default, PartialEq, Serialize, Deserialize, Zeroize, ZeroizeOnDrop)]
pub struct GitlabConfig {
    pub base_url: String,
    pub token: String,
    pub username: String,
}

impl AppState {
    pub fn gitlab_config(&self) -> Result<Option<GitlabConfig>> {
        self.sealed(&store::gitlab_path(&self.dir), GITLAB_AAD)
    }

    pub fn save_gitlab(&self, cfg: &GitlabConfig) -> Result<()> {
        self.save_sealed(&store::gitlab_path(&self.dir), GITLAB_AAD, cfg)
    }
}

#[derive(Serialize)]
pub struct GitlabStatus {
    connected: bool,
    username: String,
    base_url: String,
}

#[tauri::command(async)]
pub fn gitlab_status(state: State<'_, AppState>) -> Result<GitlabStatus> {
    Ok(match state.gitlab_config()? {
        Some(c) => GitlabStatus { connected: true, username: c.username.clone(), base_url: c.base_url.clone() },
        None => GitlabStatus { connected: false, username: String::new(), base_url: String::new() },
    })
}

/// Checks the token against the instance before saving, so a typo fails here and not on every list.
#[tauri::command]
pub async fn gitlab_connect(app: tauri::AppHandle, base_url: String, token: String) -> Result<String> {
    let token = Zeroizing::new(token);
    let base = gitlab_query::base_url(&base_url)?;
    let token = Zeroizing::new(gitlab_query::token(&token)?.to_string());
    if !app.state::<AppState>().is_unlocked() {
        return Err(AppError::Locked);
    }
    run(move || {
        let username = gitlab::user(&base, &token)?;
        let state = app.state::<AppState>();
        state.save_gitlab(&GitlabConfig { base_url: base, token: token.to_string(), username: username.clone() })?;
        state.forges.forget(FORGE);
        Ok(username)
    })
    .await
}

/// Only forgets the token on this computer; revoking is done on GitLab (Preferences → Access tokens).
#[tauri::command]
pub fn gitlab_disconnect(state: State<'_, AppState>) -> Result<()> {
    if !state.is_unlocked() {
        return Err(AppError::Locked);
    }
    state.forges.forget(FORGE);
    match std::fs::remove_file(store::gitlab_path(&state.dir)) {
        Err(e) if e.kind() != std::io::ErrorKind::NotFound => Err(e.into()),
        _ => Ok(()),
    }
}

#[tauri::command]
pub async fn gitlab_lists(
    app: tauri::AppHandle,
    filter: Option<ForgeFilter>,
    force: Option<bool>,
) -> Result<ForgeLists> {
    run(move || {
        let acc = account(&app)?;
        let cache = &app.state::<AppState>().forges;
        forge::list_all::<Gitlab>(cache, &acc, &filter.unwrap_or_default(), force.unwrap_or(false))
    })
    .await
}

#[tauri::command]
pub async fn gitlab_section(
    app: tauri::AppHandle,
    section: Section,
    page: u32,
    filter: Option<ForgeFilter>,
) -> Result<ForgeList> {
    run(move || {
        let acc = account(&app)?;
        let cache = &app.state::<AppState>().forges;
        forge::list_page::<Gitlab>(cache, &acc, section, page, &filter.unwrap_or_default(), false)
    })
    .await
}

/// One click on one MR row, not a list: a single call, never cached.
#[tauri::command]
pub async fn gitlab_mr_checks(app: tauri::AppHandle, project: String, iid: u64) -> Result<ChecksStatus> {
    run(move || gitlab::mr_checks(&account(&app)?, &project, iid)).await
}

/// `None` when GitLab isn't connected: the day summary just leaves it out.
pub(crate) fn activity_since(state: &AppState, activity: Activity, since: &str) -> Option<Result<ForgeList>> {
    let acc = match state.gitlab_config() {
        Ok(None) => return None,
        Ok(Some(c)) => to_account(&c),
        Err(e) => return Some(Err(e)),
    };
    Some(forge::activity_since::<Gitlab>(&state.forges, &acc, activity, since))
}

/// `None` when GitLab isn't connected: the badge simply doesn't count it.
pub(crate) fn review_requested(state: &AppState) -> Option<Result<u64>> {
    let acc = match state.gitlab_config() {
        Ok(None) => return None,
        Ok(Some(c)) => to_account(&c),
        Err(e) => return Some(Err(e)),
    };
    Some(forge::review_requested::<Gitlab>(&state.forges, &acc))
}

fn account(app: &tauri::AppHandle) -> Result<Account> {
    let state = app.state::<AppState>();
    state.touch();
    let cfg = state.gitlab_config()?.ok_or_else(|| AppError::Gitlab("conecte sua conta do GitLab".into()))?;
    Ok(to_account(&cfg))
}

fn to_account(c: &GitlabConfig) -> Account {
    Account { base: c.base_url.clone(), token: Zeroizing::new(c.token.clone()), username: c.username.clone() }
}

#[cfg(test)]
#[path = "cmd_gitlab_tests.rs"]
mod tests;
