//! Quem esta conectado ao Google: nome, e-mail e foto para o cartao da conta.
use base64::{engine::general_purpose::STANDARD as B64, Engine};
use serde::Deserialize;
use std::time::Duration;

use crate::error::{AppError, Result};

const USERINFO_URL: &str = "https://openidconnect.googleapis.com/v1/userinfo";
const REVOKE_URL: &str = "https://oauth2.googleapis.com/revoke";
/// Foto de perfil do Google tem poucos KB; o teto impede inchar o cofre com lixo.
const AVATAR_MAX_BYTES: usize = 256 * 1024;
const TIPOS_DE_IMAGEM: &[&str] = &["image/png", "image/jpeg", "image/webp", "image/gif"];

#[derive(Debug, Default, PartialEq, Deserialize)]
pub struct Perfil {
    #[serde(default)]
    pub email: String,
    #[serde(default, rename = "name")]
    pub nome: String,
    #[serde(default, rename = "picture")]
    pub foto: String,
}

fn client() -> Result<reqwest::blocking::Client> {
    reqwest::blocking::Client::builder()
        .timeout(Duration::from_secs(15))
        // Redirect levaria a foto "confiavel" para qualquer host, inclusive a rede local.
        .redirect(reqwest::redirect::Policy::none())
        .build()
        .map_err(|e| AppError::Drive(e.to_string()))
}

fn drive(e: reqwest::Error) -> AppError {
    AppError::Drive(e.to_string())
}

pub fn buscar_perfil(token: &str) -> Result<Perfil> {
    client()?.get(USERINFO_URL).bearer_auth(token).send().map_err(drive)?.error_for_status().map_err(drive)?.json().map_err(drive)
}

/// A URL vem da resposta do Google, mas so baixamos do CDN de fotos dele, por HTTPS.
pub fn foto_confiavel(url: &str) -> bool {
    reqwest::Url::parse(url).is_ok_and(|u| {
        u.scheme() == "https" && u.host_str().is_some_and(|h| h == "googleusercontent.com" || h.ends_with(".googleusercontent.com"))
    })
}

/// A CSP do widget so aceita imagens `data:`; tipo e tamanho sao checados antes de embutir.
pub fn como_data_url(tipo: &str, bytes: &[u8]) -> Option<String> {
    let tipo = tipo.split(';').next()?.trim().to_ascii_lowercase();
    (TIPOS_DE_IMAGEM.contains(&tipo.as_str()) && !bytes.is_empty() && bytes.len() <= AVATAR_MAX_BYTES)
        .then(|| format!("data:{tipo};base64,{}", B64.encode(bytes)))
}

/// Foto e enfeite: qualquer falha vira `None` e a UI mostra a inicial.
pub fn baixar_avatar(url: &str) -> Option<String> {
    if !foto_confiavel(url) {
        return None;
    }
    let res = client().ok()?.get(url).send().ok()?.error_for_status().ok()?;
    let tipo = res.headers().get(reqwest::header::CONTENT_TYPE)?.to_str().ok()?.to_string();
    // Sem Content-Length o corpo pode nao ter fim: le no maximo um byte alem do teto.
    let mut bytes = Vec::new();
    std::io::Read::read_to_end(&mut std::io::Read::take(res, AVATAR_MAX_BYTES as u64 + 1), &mut bytes).ok()?;
    como_data_url(&tipo, &bytes)
}

/// Sair de verdade: invalida o refresh token no Google, nao so esquece localmente.
pub fn revogar(token: &str) -> Result<()> {
    client()?.post(REVOKE_URL).form(&[("token", token)]).send().map_err(drive)?.error_for_status().map_err(drive)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn so_baixa_foto_do_cdn_do_google_por_https() {
        assert!(foto_confiavel("https://lh3.googleusercontent.com/a/abc=s96-c"));
        assert!(!foto_confiavel("http://lh3.googleusercontent.com/a/abc"), "sem TLS");
        assert!(!foto_confiavel("https://googleusercontent.com.evil.io/a"), "sufixo falso");
        assert!(!foto_confiavel("https://evilgoogleusercontent.com/a"), "sem ponto antes do dominio");
        assert!(!foto_confiavel("https://127.0.0.1/a"));
        assert!(!foto_confiavel("file:///C:/segredo.png"));
        assert!(!foto_confiavel(""));
    }

    #[test]
    fn so_embute_imagem_pequena_de_tipo_conhecido() {
        assert_eq!(como_data_url("image/png", b"png").as_deref(), Some("data:image/png;base64,cG5n"));
        assert!(como_data_url("Image/JPEG; charset=binary", b"x").unwrap().starts_with("data:image/jpeg;"));
        assert!(como_data_url("image/svg+xml", b"<svg onload=alert(1)>").is_none(), "svg carrega script");
        assert!(como_data_url("text/html", b"x").is_none());
        assert!(como_data_url("image/png", b"").is_none());
        assert!(como_data_url("image/png", &vec![0; AVATAR_MAX_BYTES + 1]).is_none());
    }

    #[test]
    fn perfil_sem_escopo_profile_vem_so_com_email() {
        let p: Perfil = serde_json::from_str(r#"{"sub":"1","email":"a@b.com"}"#).unwrap();
        assert_eq!(p, Perfil { email: "a@b.com".into(), ..Default::default() });
    }
}
