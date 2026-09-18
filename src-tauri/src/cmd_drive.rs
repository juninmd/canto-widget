use tauri::{Manager, State};

use crate::drive;
use crate::error::{AppError, Result};
use crate::oauth::{Loopback, Pkce};
use crate::vault::AppState;

#[derive(serde::Serialize)]
pub struct DriveStatus {
    configured: bool,
    /// The build already carries an OAuth client: the UI doesn't need to ask for credentials.
    embedded: bool,
    connected: bool,
    email: String,
    name: String,
    avatar: String,
}

#[tauri::command(async)]
pub fn drive_status(state: State<'_, AppState>) -> Result<DriveStatus> {
    let cfg = state.drive_config()?;
    let embedded = crate::oauth::embedded_client().is_some();
    Ok(DriveStatus {
        configured: !cfg.client_id.is_empty() || embedded,
        embedded,
        connected: cfg.tokens.is_some(),
        email: cfg.email,
        name: cfg.name,
        avatar: cfg.avatar,
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
    cfg.owned_client = !cfg.client_id.is_empty();
    state.save_drive_config(&cfg)
}

#[tauri::command]
pub async fn drive_disconnect(app: tauri::AppHandle) -> Result<()> {
    crate::blocking::run(move || disconnect(&app.state::<AppState>())).await
}

fn disconnect(state: &AppState) -> Result<()> {
    let mut cfg = state.drive_config()?;
    // Revoking is best effort: without network, the account still leaves this computer.
    if let Some(t) = cfg.tokens.take() {
        let _ = crate::account::revoke(&t.refresh_token);
    }
    forget_account(&mut cfg);
    state.save_drive_config(&cfg)
}

#[tauri::command]
pub async fn drive_connect(app: tauri::AppHandle) -> Result<String> {
    crate::blocking::run(move || connect(&app.state::<AppState>())).await
}

fn connect(state: &AppState) -> Result<String> {
    let mut cfg = state.drive_config()?;
    if !use_client(&mut cfg, crate::oauth::embedded_client()) {
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
    let profile = crate::account::fetch_profile(&tokens.access_token).unwrap_or_default();
    cfg.avatar = crate::account::download_avatar(&profile.photo).unwrap_or_default();
    cfg.email = profile.email;
    cfg.name = profile.name;
    cfg.tokens = Some(tokens);
    let who = cfg.email.clone();
    state.save_drive_config(&cfg)?;
    Ok(who)
}

/// Switching accounts without a photo must not inherit the previous name and photo.
fn forget_account(cfg: &mut crate::vault::DriveConfig) {
    cfg.tokens = None;
    cfg.email.clear();
    cfg.name.clear();
    cfg.avatar.clear();
}

/// A credential saved in Settings wins, else login uses the embedded client and copies it into the vault, so refresh always uses the client that issued the tokens.
pub fn use_client(cfg: &mut crate::vault::DriveConfig, embedded: Option<(&str, &str)>) -> bool {
    if !cfg.owned_client {
        if let Some((id, secret)) = embedded {
            cfg.client_id = id.to_string();
            cfg.client_secret = secret.to_string();
        }
    }
    !cfg.client_id.is_empty()
}

fn open_in_browser(url: &str) -> Result<()> {
    tauri_plugin_opener::open_url(url, None::<&str>)
        .map_err(|e| AppError::Drive(format!("nao consegui abrir o navegador: {e}")))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::vault::DriveConfig;

    #[test]
    fn own_credential_wins_over_the_embedded_one() {
        let mut cfg = DriveConfig {
            client_id: "meu.apps.googleusercontent.com".into(),
            client_secret: "s1".into(),
            owned_client: true,
            ..Default::default()
        };
        assert!(use_client(&mut cfg, Some(("build.apps.googleusercontent.com", "s2"))));
        assert_eq!((cfg.client_id.as_str(), cfg.client_secret.as_str()), ("meu.apps.googleusercontent.com", "s1"));
    }

    /// A vault predating the embedded client stores a client_id that may no longer exist in Google, causing "Error 401: invalid_client" instead of using the build's client.
    #[test]
    fn legacy_credential_without_the_owned_flag_yields_to_the_embedded_one() {
        let legacy = r#"{"client_id":"apagado.apps.googleusercontent.com","client_secret":"velho","email":"a@b.com"}"#;
        let mut cfg: DriveConfig = serde_json::from_str(legacy).unwrap();
        assert!(use_client(&mut cfg, Some(("build.apps.googleusercontent.com", "s2"))));
        assert_eq!((cfg.client_id.as_str(), cfg.client_secret.as_str()), ("build.apps.googleusercontent.com", "s2"));
    }

    #[test]
    fn without_an_embedded_client_the_old_credential_still_counts() {
        let mut cfg = DriveConfig { client_id: "meu.apps.googleusercontent.com".into(), ..Default::default() };
        assert!(use_client(&mut cfg, None));
        assert_eq!(cfg.client_id, "meu.apps.googleusercontent.com");
    }

    #[test]
    fn without_an_owned_credential_uses_the_embedded_one_and_stores_it_for_the_refresh() {
        let mut cfg = DriveConfig::default();
        assert!(use_client(&mut cfg, Some(("build.apps.googleusercontent.com", "s2"))));
        assert_eq!(cfg.client_id, "build.apps.googleusercontent.com");
        assert_eq!(cfg.client_secret, "s2");
    }

    #[test]
    fn disconnecting_clears_tokens_and_identity_but_keeps_the_client() {
        let mut cfg = DriveConfig {
            client_id: "meu.apps.googleusercontent.com".into(),
            tokens: Some(Default::default()),
            email: "a@b.com".into(),
            name: "Ana".into(),
            avatar: "data:image/png;base64,AA==".into(),
            ..Default::default()
        };
        forget_account(&mut cfg);
        assert!(cfg.tokens.is_none() && cfg.email.is_empty() && cfg.name.is_empty() && cfg.avatar.is_empty());
        assert_eq!(cfg.client_id, "meu.apps.googleusercontent.com", "signing out must not require reconfiguring the client");
    }

    #[test]
    fn without_any_credential_connecting_is_refused() {
        let mut cfg = DriveConfig::default();
        assert!(!use_client(&mut cfg, None));
    }
}
