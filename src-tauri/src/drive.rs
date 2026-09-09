use serde::{Deserialize, Serialize};
use std::time::Duration;

use crate::error::{AppError, Result};
use crate::oauth::{Pkce, SCOPE, TOKEN_URL};

const FILE_NAME: &str = "vault.enc";
const API: &str = "https://www.googleapis.com/drive/v3/files";
const UPLOAD_API: &str = "https://www.googleapis.com/upload/drive/v3/files";
const BOUNDARY: &str = "canto-widget-boundary";

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct DriveTokens {
    pub refresh_token: String,
    #[serde(default)]
    pub access_token: String,
    #[serde(default)]
    pub expires_at: i64,
}

#[derive(Deserialize)]
struct TokenResponse {
    access_token: String,
    #[serde(default)]
    refresh_token: Option<String>,
    #[serde(default)]
    expires_in: i64,
}

#[derive(Deserialize)]
struct UserInfo {
    #[serde(default)]
    email: String,
}

#[derive(Deserialize)]
struct FileList {
    #[serde(default)]
    files: Vec<FileMeta>,
}

#[derive(Deserialize)]
pub struct FileMeta {
    pub id: String,
}

fn client() -> Result<reqwest::blocking::Client> {
    reqwest::blocking::Client::builder()
        .timeout(Duration::from_secs(30))
        .build()
        .map_err(|e| AppError::Drive(e.to_string()))
}

fn post_token(form: &[(&str, &str)]) -> Result<TokenResponse> {
    let res = client()?
        .post(TOKEN_URL)
        .form(form)
        .send()
        .map_err(|e| AppError::Drive(e.to_string()))?;
    if !res.status().is_success() {
        let status = res.status();
        return Err(AppError::Drive(format!(
            "token endpoint respondeu {status}: {}",
            res.text().unwrap_or_default()
        )));
    }
    res.json().map_err(|e| AppError::Drive(e.to_string()))
}

pub fn authorize_url(client_id: &str, redirect_uri: &str, pkce: &Pkce) -> String {
    let q = [
        ("client_id", client_id),
        ("redirect_uri", redirect_uri),
        ("response_type", "code"),
        ("scope", SCOPE),
        ("code_challenge", pkce.challenge.as_str()),
        ("code_challenge_method", "S256"),
        ("access_type", "offline"),
        ("prompt", "consent"),
        ("state", pkce.state.as_str()),
    ];
    let qs = q
        .iter()
        .map(|(k, v)| format!("{k}={}", urlencode(v)))
        .collect::<Vec<_>>()
        .join("&");
    format!("{}?{qs}", crate::oauth::AUTH_URL)
}

fn urlencode(s: &str) -> String {
    url::form_urlencoded::byte_serialize(s.as_bytes()).collect()
}

pub fn exchange_code(
    client_id: &str,
    client_secret: &str,
    redirect_uri: &str,
    code: &str,
    verifier: &str,
) -> Result<DriveTokens> {
    let mut form = vec![
        ("client_id", client_id),
        ("code", code),
        ("code_verifier", verifier),
        ("grant_type", "authorization_code"),
        ("redirect_uri", redirect_uri),
    ];
    if !client_secret.is_empty() {
        form.push(("client_secret", client_secret));
    }
    let res = post_token(&form)?;
    let refresh_token = res.refresh_token.ok_or_else(|| {
        AppError::Drive("Google nao devolveu refresh_token; revogue o acesso e conecte de novo".into())
    })?;
    Ok(DriveTokens {
        refresh_token,
        access_token: res.access_token,
        expires_at: crate::model::now_ms() + res.expires_in * 1000,
    })
}

/// Renova o access token quando faltam menos de 60s de validade.
pub fn fresh_access_token(
    tokens: &mut DriveTokens,
    client_id: &str,
    client_secret: &str,
) -> Result<String> {
    if !tokens.access_token.is_empty() && tokens.expires_at - crate::model::now_ms() > 60_000 {
        return Ok(tokens.access_token.clone());
    }
    let mut form = vec![
        ("client_id", client_id),
        ("refresh_token", tokens.refresh_token.as_str()),
        ("grant_type", "refresh_token"),
    ];
    if !client_secret.is_empty() {
        form.push(("client_secret", client_secret));
    }
    let res = post_token(&form)?;
    tokens.access_token = res.access_token.clone();
    tokens.expires_at = crate::model::now_ms() + res.expires_in * 1000;
    Ok(res.access_token)
}

/// Identidade da conta conectada, so para exibir no widget.
pub fn account_email(token: &str) -> Result<String> {
    let res = client()?
        .get("https://openidconnect.googleapis.com/v1/userinfo")
        .bearer_auth(token)
        .send()
        .map_err(|e| AppError::Drive(e.to_string()))?
        .error_for_status()
        .map_err(|e| AppError::Drive(e.to_string()))?;
    let info: UserInfo = res.json().map_err(|e| AppError::Drive(e.to_string()))?;
    Ok(info.email)
}

pub fn find_vault(token: &str) -> Result<Option<FileMeta>> {
    let res = client()?
        .get(API)
        .bearer_auth(token)
        .query(&[
            ("spaces", "appDataFolder"),
            ("q", &format!("name = '{FILE_NAME}' and trashed = false")),
            ("fields", "files(id)"),
            ("pageSize", "1"),
        ])
        .send()
        .map_err(|e| AppError::Drive(e.to_string()))?
        .error_for_status()
        .map_err(|e| AppError::Drive(e.to_string()))?;
    let list: FileList = res.json().map_err(|e| AppError::Drive(e.to_string()))?;
    Ok(list.files.into_iter().next())
}

pub fn download(token: &str, file_id: &str) -> Result<Vec<u8>> {
    let res = client()?
        .get(format!("{API}/{file_id}"))
        .bearer_auth(token)
        .query(&[("alt", "media")])
        .send()
        .map_err(|e| AppError::Drive(e.to_string()))?
        .error_for_status()
        .map_err(|e| AppError::Drive(e.to_string()))?;
    Ok(res.bytes().map_err(|e| AppError::Drive(e.to_string()))?.to_vec())
}

/// Sobe o envelope ja cifrado. O Google recebe apenas bytes opacos.
pub fn upload(token: &str, file_id: Option<&str>, body: &[u8]) -> Result<String> {
    let metadata = match file_id {
        Some(_) => serde_json::json!({ "name": FILE_NAME }),
        None => serde_json::json!({ "name": FILE_NAME, "parents": ["appDataFolder"] }),
    };
    let mut payload = Vec::new();
    payload.extend_from_slice(
        format!("--{BOUNDARY}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n{metadata}\r\n").as_bytes(),
    );
    payload.extend_from_slice(
        format!("--{BOUNDARY}\r\nContent-Type: application/octet-stream\r\n\r\n").as_bytes(),
    );
    payload.extend_from_slice(body);
    payload.extend_from_slice(format!("\r\n--{BOUNDARY}--\r\n").as_bytes());

    let http = client()?;
    let req = match file_id {
        Some(id) => http.patch(format!("{UPLOAD_API}/{id}?uploadType=multipart")),
        None => http.post(format!("{UPLOAD_API}?uploadType=multipart")),
    };
    let res = req
        .bearer_auth(token)
        .header("Content-Type", format!("multipart/related; boundary={BOUNDARY}"))
        .body(payload)
        .send()
        .map_err(|e| AppError::Drive(e.to_string()))?
        .error_for_status()
        .map_err(|e| AppError::Drive(e.to_string()))?;
    let meta: FileMeta = res.json().map_err(|e| AppError::Drive(e.to_string()))?;
    Ok(meta.id)
}
