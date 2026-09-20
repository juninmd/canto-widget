//! GitLab tab commands. Address and token stay sealed in `gitlab.json`; the token never reaches the webview.
use serde::{Deserialize, Serialize};
use tauri::{Manager, State};
use zeroize::{Zeroize, ZeroizeOnDrop, Zeroizing};

use crate::blocking::run;
use crate::error::{AppError, Result};
use crate::forge::{ForgeList, ForgeLists};
use crate::forge_filter::{cache_key, ForgeFilter, Section};
use crate::gitlab::{self, Account};
use crate::gitlab_query;
use crate::model::now_ms;
use crate::store::{self, SealedBlob, GITLAB_AAD};
use crate::vault::AppState;

const FORGE: &str = "gitlab";

#[derive(Clone, Default, PartialEq, Serialize, Deserialize, Zeroize, ZeroizeOnDrop)]
pub struct GitlabConfig {
    pub base_url: String,
    pub token: String,
    pub username: String,
}

impl AppState {
    pub fn gitlab_config(&self) -> Result<Option<GitlabConfig>> {
        let guard = self.session.lock().unwrap();
        let session = guard.as_ref().ok_or(AppError::Locked)?;
        match store::read_json::<SealedBlob>(&store::gitlab_path(&self.dir))? {
            None => Ok(None),
            Some(blob) => Ok(Some(serde_json::from_slice(&Zeroizing::new(blob.open(session.key(), GITLAB_AAD)?))?)),
        }
    }

    pub fn save_gitlab(&self, cfg: &GitlabConfig) -> Result<()> {
        let guard = self.session.lock().unwrap();
        let session = guard.as_ref().ok_or(AppError::Locked)?;
        let plain = Zeroizing::new(serde_json::to_vec(cfg)?);
        let blob = SealedBlob::seal(session.key(), session.salt(), &plain, GITLAB_AAD, now_ms())?;
        store::write_json_atomic(&store::gitlab_path(&self.dir), &blob)
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
pub async fn gitlab_lists(app: tauri::AppHandle, filter: Option<ForgeFilter>, force: Option<bool>) -> Result<ForgeLists> {
    run(move || {
        let (acc, f) = (account(&app)?, filter.unwrap_or_default());
        let cache = &app.state::<AppState>().forges;
        ForgeLists::collect(|s| cache.get(FORGE, &cache_key(s, 1, &f), force.unwrap_or(false), now_ms(), || gitlab::section(&acc, s, 1, &f)))
    })
    .await
}

#[tauri::command]
pub async fn gitlab_section(app: tauri::AppHandle, section: Section, page: u32, filter: Option<ForgeFilter>) -> Result<ForgeList> {
    run(move || {
        let (acc, f) = (account(&app)?, filter.unwrap_or_default());
        let cache = &app.state::<AppState>().forges;
        cache.get(FORGE, &cache_key(section, page, &f), false, now_ms(), || gitlab::section(&acc, section, page, &f))
    })
    .await
}

/// `None` when GitLab isn't connected: the day summary just leaves it out.
pub(crate) fn opened_since(state: &AppState, since: &str) -> Option<Result<ForgeList>> {
    let acc = match state.gitlab_config() {
        Ok(None) => return None,
        Ok(Some(c)) => to_account(&c),
        Err(e) => return Some(Err(e)),
    };
    Some(state.forges.get(FORGE, &format!("opened|{since}"), false, now_ms(), || gitlab::mrs_opened_since(&acc, since)))
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
