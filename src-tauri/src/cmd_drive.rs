use tauri::{Manager, State};

use crate::drive;
use crate::error::{AppError, Result};
use crate::oauth::{Loopback, Pkce};
use crate::vault::AppState;

#[derive(serde::Serialize)]
pub struct DriveStatus {
    configured: bool,
    /// Build ja traz o cliente OAuth: a UI nao precisa pedir credenciais.
    embutido: bool,
    connected: bool,
    email: String,
    nome: String,
    avatar: String,
}

#[tauri::command(async)]
pub fn drive_status(state: State<'_, AppState>) -> Result<DriveStatus> {
    let cfg = state.drive_config()?;
    let embutido = crate::oauth::cliente_embutido().is_some();
    Ok(DriveStatus {
        configured: !cfg.client_id.is_empty() || embutido,
        embutido,
        connected: cfg.tokens.is_some(),
        email: cfg.email,
        nome: cfg.nome,
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
    cfg.cliente_proprio = !cfg.client_id.is_empty();
    state.save_drive_config(&cfg)
}

#[tauri::command]
pub async fn drive_disconnect(app: tauri::AppHandle) -> Result<()> {
    crate::bloqueante::rodar(move || sair(&app.state::<AppState>())).await
}

fn sair(state: &AppState) -> Result<()> {
    let mut cfg = state.drive_config()?;
    // Revogar e melhor esforco: sem rede, ainda assim a conta sai deste computador.
    if let Some(t) = cfg.tokens.take() {
        let _ = crate::conta::revogar(&t.refresh_token);
    }
    esquecer_conta(&mut cfg);
    state.save_drive_config(&cfg)
}

#[tauri::command]
pub async fn drive_connect(app: tauri::AppHandle) -> Result<String> {
    crate::bloqueante::rodar(move || conectar(&app.state::<AppState>())).await
}

fn conectar(state: &AppState) -> Result<String> {
    let mut cfg = state.drive_config()?;
    if !usar_cliente(&mut cfg, crate::oauth::cliente_embutido()) {
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
    let perfil = crate::conta::buscar_perfil(&tokens.access_token).unwrap_or_default();
    cfg.avatar = crate::conta::baixar_avatar(&perfil.foto).unwrap_or_default();
    cfg.email = perfil.email;
    cfg.nome = perfil.nome;
    cfg.tokens = Some(tokens);
    let quem = cfg.email.clone();
    state.save_drive_config(&cfg)?;
    Ok(quem)
}

/// Trocar de conta sem foto nao pode herdar nome e foto da anterior.
fn esquecer_conta(cfg: &mut crate::vault::DriveConfig) {
    cfg.tokens = None;
    cfg.email.clear();
    cfg.nome.clear();
    cfg.avatar.clear();
}

/// Credencial salva de proposito em Ajustes vence; senao, o login usa o cliente embutido e o
/// copia para o cofre. Gravar junto com os tokens garante que o refresh use o mesmo cliente
/// que os emitiu, mesmo que uma build futura embuta outro.
pub fn usar_cliente(cfg: &mut crate::vault::DriveConfig, embutido: Option<(&str, &str)>) -> bool {
    if !cfg.cliente_proprio {
        if let Some((id, secret)) = embutido {
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
    fn credencial_propria_vence_a_embutida() {
        let mut cfg = DriveConfig {
            client_id: "meu.apps.googleusercontent.com".into(),
            client_secret: "s1".into(),
            cliente_proprio: true,
            ..Default::default()
        };
        assert!(usar_cliente(&mut cfg, Some(("build.apps.googleusercontent.com", "s2"))));
        assert_eq!((cfg.client_id.as_str(), cfg.client_secret.as_str()), ("meu.apps.googleusercontent.com", "s1"));
    }

    /// Cofre de antes do cliente embutido guarda um client_id que pode nem existir mais no
    /// Google: o login dava "Error 401: invalid_client" em vez de usar o cliente da build.
    #[test]
    fn credencial_antiga_sem_marca_de_propria_cede_ao_embutido() {
        let legado = r#"{"client_id":"apagado.apps.googleusercontent.com","client_secret":"velho","email":"a@b.com"}"#;
        let mut cfg: DriveConfig = serde_json::from_str(legado).unwrap();
        assert!(usar_cliente(&mut cfg, Some(("build.apps.googleusercontent.com", "s2"))));
        assert_eq!((cfg.client_id.as_str(), cfg.client_secret.as_str()), ("build.apps.googleusercontent.com", "s2"));
    }

    #[test]
    fn sem_embutido_a_credencial_antiga_continua_valendo() {
        let mut cfg = DriveConfig { client_id: "meu.apps.googleusercontent.com".into(), ..Default::default() };
        assert!(usar_cliente(&mut cfg, None));
        assert_eq!(cfg.client_id, "meu.apps.googleusercontent.com");
    }

    #[test]
    fn sem_credencial_propria_usa_a_embutida_e_guarda_para_o_refresh() {
        let mut cfg = DriveConfig::default();
        assert!(usar_cliente(&mut cfg, Some(("build.apps.googleusercontent.com", "s2"))));
        assert_eq!(cfg.client_id, "build.apps.googleusercontent.com");
        assert_eq!(cfg.client_secret, "s2");
    }

    #[test]
    fn sair_apaga_tokens_e_identidade_mas_mantem_o_cliente() {
        let mut cfg = DriveConfig {
            client_id: "meu.apps.googleusercontent.com".into(),
            tokens: Some(Default::default()),
            email: "a@b.com".into(),
            nome: "Ana".into(),
            avatar: "data:image/png;base64,AA==".into(),
            ..Default::default()
        };
        esquecer_conta(&mut cfg);
        assert!(cfg.tokens.is_none() && cfg.email.is_empty() && cfg.nome.is_empty() && cfg.avatar.is_empty());
        assert_eq!(cfg.client_id, "meu.apps.googleusercontent.com", "sair nao pode exigir reconfigurar o cliente");
    }

    #[test]
    fn sem_nenhuma_credencial_recusa_conectar() {
        let mut cfg = DriveConfig::default();
        assert!(!usar_cliente(&mut cfg, None));
    }
}
