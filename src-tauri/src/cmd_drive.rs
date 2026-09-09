use tauri::State;

use crate::drive;
use crate::error::{AppError, Result};
use crate::oauth::{Loopback, Pkce};
use crate::vault::AppState;

#[derive(serde::Serialize)]
pub struct DriveStatus {
    configured: bool,
    connected: bool,
    email: String,
}

#[tauri::command(async)]
pub fn drive_status(state: State<'_, AppState>) -> Result<DriveStatus> {
    let cfg = state.drive_config()?;
    Ok(DriveStatus {
        configured: !cfg.client_id.is_empty(),
        connected: cfg.tokens.is_some(),
        email: cfg.email,
    })
}

#[tauri::command(async)]
pub fn drive_configure(
    state: State<'_, AppState>,
    client_id: String,
    client_secret: String,
) -> Result<()> {
    let mut cfg = state.drive_config()?;
    cfg.client_id = client_id.trim().to_string();
    cfg.client_secret = client_secret.trim().to_string();
    state.save_drive_config(&cfg)
}

#[tauri::command(async)]
pub fn drive_disconnect(state: State<'_, AppState>) -> Result<()> {
    let mut cfg = state.drive_config()?;
    cfg.tokens = None;
    cfg.email = String::new();
    state.save_drive_config(&cfg)
}

#[tauri::command(async)]
pub fn drive_connect(state: State<'_, AppState>) -> Result<String> {
    let mut cfg = state.drive_config()?;
    if cfg.client_id.is_empty() {
        return Err(AppError::Config("informe o Client ID do Google antes de conectar".into()));
    }
    let pkce = Pkce::new();
    let server = Loopback::bind()?;
    let url = drive::authorize_url(&cfg.client_id, &server.redirect_uri, &pkce);
    open_in_browser(&url)?;
    let code = server.wait_for_code(&pkce.state)?;
    let tokens = drive::exchange_code(
        &cfg.client_id,
        &cfg.client_secret,
        &server.redirect_uri,
        &code,
        &pkce.verifier,
    )?;
    cfg.email = drive::account_email(&tokens.access_token).unwrap_or_default();
    cfg.tokens = Some(tokens);
    let quem = cfg.email.clone();
    state.save_drive_config(&cfg)?;
    Ok(quem)
}

#[tauri::command(async)]
pub fn drive_sync(state: State<'_, AppState>) -> Result<i64> {
    state.sync()
}

fn open_in_browser(url: &str) -> Result<()> {
    tauri_plugin_opener::open_url(url, None::<&str>)
        .map_err(|e| AppError::Drive(format!("nao consegui abrir o navegador: {e}")))
}
