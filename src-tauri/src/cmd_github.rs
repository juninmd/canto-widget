//! GitHub tab commands. The token stays encrypted in `github.json` and never reaches the webview.
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use std::time::Duration;
use tauri::{Manager, State};
use zeroize::Zeroizing;

use crate::blocking::run;
use crate::error::{AppError, Result};
use crate::github;
use crate::github_auth::{self as auth, embedded_client_id, PollResult, Tokens};
use crate::model::now_ms;
use crate::store::{self, GITHUB_AAD};
use crate::vault::AppState;

pub(crate) const FORGE: &str = "github";

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct GithubConfig {
    pub tokens: Tokens,
    pub login: String,
    /// "pat" (personal token) or "app" (device flow).
    pub source: String,
    /// Client id that issued the token: renewal must go through the same app.
    #[serde(default)]
    pub client_id: String,
}

impl AppState {
    pub fn github_config(&self) -> Result<Option<GithubConfig>> {
        self.sealed(&store::github_path(&self.dir), GITHUB_AAD)
    }

    pub fn save_github(&self, cfg: &GithubConfig) -> Result<()> {
        self.save_sealed(&store::github_path(&self.dir), GITHUB_AAD, cfg)
    }
}

struct Flow {
    device_code: String,
    interval: u64,
    expires_at: i64,
    client_id: &'static str,
}

/// Device flow in progress (RAM only) plus the lock stopping two renewals of the same refresh token, since GitHub invalidates it once used.
#[derive(Default)]
pub struct GithubState {
    flow: Mutex<Option<Flow>>,
    refreshing: Mutex<()>,
}

/// A ready-to-use token, refreshed first if it's about to expire.
pub fn valid_token(state: &AppState, gh: &GithubState, now: i64) -> Result<Zeroizing<String>> {
    let _one_at_a_time = gh.refreshing.lock().unwrap();
    let mut cfg = state.github_config()?.ok_or_else(|| AppError::Github("conecte sua conta do GitHub".into()))?;
    if cfg.tokens.expired(now) {
        if cfg.tokens.refresh_token.is_empty() || cfg.client_id.is_empty() {
            return Err(AppError::Github("a sessao do GitHub expirou; conecte de novo".into()));
        }
        cfg.tokens = auth::refresh(&cfg.client_id, &cfg.tokens.refresh_token)?;
        state.save_github(&cfg)?;
    }
    Ok(Zeroizing::new(cfg.tokens.access_token))
}

#[derive(Serialize)]
pub struct GithubStatus {
    connected: bool,
    login: String,
    source: String,
    /// The build carries a GitHub App client id: the device flow button shows up.
    device_flow: bool,
}

#[tauri::command(async)]
pub fn github_status(state: State<'_, AppState>) -> Result<GithubStatus> {
    let cfg = state.github_config()?.unwrap_or_default();
    Ok(GithubStatus { connected: !cfg.tokens.access_token.is_empty(), login: cfg.login, source: cfg.source, device_flow: embedded_client_id().is_some() })
}

#[tauri::command]
pub async fn github_save_token(app: tauri::AppHandle, token: String) -> Result<String> {
    let token = Zeroizing::new(auth::validate_pat(&Zeroizing::new(token))?);
    run(move || {
        let login = github::user(&token)?;
        let tokens = Tokens { access_token: token.to_string(), ..Default::default() };
        let state = app.state::<AppState>();
        state.save_github(&GithubConfig { tokens, login: login.clone(), source: "pat".into(), client_id: String::new() })?;
        state.forges.forget(FORGE);
        Ok(login)
    })
    .await
}

#[derive(Serialize)]
pub struct DeviceCode {
    user_code: String,
    url: String,
    expires_in_s: u64,
}

#[tauri::command]
pub async fn github_device_start(app: tauri::AppHandle) -> Result<DeviceCode> {
    let client_id = embedded_client_id().ok_or_else(|| AppError::Github("esta build nao traz um GitHub App; use um token pessoal".into()))?;
    if !app.state::<AppState>().is_unlocked() {
        return Err(AppError::Locked);
    }
    // A double click must not leave two watchers polling GitHub for 15 min.
    if app.state::<GithubState>().flow.lock().unwrap().as_ref().is_some_and(|f| now_ms() < f.expires_at) {
        return Err(AppError::Github("ja ha um login em andamento".into()));
    }
    run(move || {
        let d = auth::start(client_id)?;
        let expires_at = now_ms() + d.expires_in as i64 * 1000;
        *app.state::<GithubState>().flow.lock().unwrap() = Some(Flow { device_code: d.device_code, interval: d.interval, expires_at, client_id });
        Ok(DeviceCode { user_code: d.user_code, url: d.verification_uri, expires_in_s: d.expires_in })
    })
    .await
}

/// Waits for the user to type the code in the browser. Ends in success, error, expiry or cancellation.
#[tauri::command]
pub async fn github_device_finish(app: tauri::AppHandle) -> Result<String> {
    run(move || finish(&app.state::<AppState>(), &app.state::<GithubState>())).await
}

fn finish(state: &AppState, gh: &GithubState) -> Result<String> {
    let current = |gh: &GithubState| gh.flow.lock().unwrap().as_ref().map(|f| (f.device_code.clone(), f.interval, f.expires_at, f.client_id));
    let (code, mut interval, expires_at, client_id) = current(gh).ok_or_else(|| AppError::Github("nenhum login em andamento".into()))?;
    let end = |r: Result<String>| {
        *gh.flow.lock().unwrap() = None;
        r
    };
    loop {
        std::thread::sleep(Duration::from_secs(interval));
        if current(gh).map(|f| f.0) != Some(code.clone()) {
            return Err(AppError::Github("login cancelado".into()));
        }
        if now_ms() > expires_at {
            return end(Err(AppError::Github("o codigo expirou; comece de novo".into())));
        }
        match auth::poll(client_id, &code) {
            Ok(PollResult::Pending) => {}
            Ok(PollResult::SlowDown(n)) => interval = n,
            Ok(PollResult::Ready(tokens)) => {
                let saved = github::user(&tokens.access_token).and_then(|login| {
                    let cfg = GithubConfig { tokens, login: login.clone(), source: "app".into(), client_id: client_id.into() };
                    state.forges.forget(FORGE);
                    state.save_github(&cfg).map(|_| login)
                });
                return end(saved);
            }
            Err(e) => return end(Err(e)),
        }
    }
}

#[tauri::command]
pub fn github_device_cancel(gh: State<'_, GithubState>) {
    *gh.flow.lock().unwrap() = None;
}

/// Only forgets the token on this computer; revoking is done on GitHub (Settings → Applications/Tokens).
#[tauri::command]
pub fn github_disconnect(state: State<'_, AppState>) -> Result<()> {
    if !state.is_unlocked() {
        return Err(AppError::Locked);
    }
    state.forges.forget(FORGE);
    match std::fs::remove_file(store::github_path(&state.dir)) {
        Err(e) if e.kind() != std::io::ErrorKind::NotFound => Err(e.into()),
        _ => Ok(()),
    }
}

#[cfg(test)]
#[path = "cmd_github_tests.rs"]
mod tests;
