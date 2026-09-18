//! GitHub login: a personal token pasted by the user, or a GitHub App device flow.
use serde::{Deserialize, Serialize};

use crate::error::{AppError, Result};
use crate::github::{client, network};
use crate::model::now_ms;

const DEVICE_URL: &str = "https://github.com/login/device/code";
const TOKEN_URL: &str = "https://github.com/login/oauth/access_token";
const GRANT_DEVICE: &str = "urn:ietf:params:oauth:grant-type:device_code";
/// Renews a little before expiry: the list can take several seconds.
const SLACK_MS: i64 = 60_000;

/// GitHub App client id comes from the build (`CANTO_GITHUB_CLIENT_ID`); it's public, no secret.
pub fn embedded_client_id() -> Option<&'static str> {
    option_env!("CANTO_GITHUB_CLIENT_ID").filter(|id| !id.is_empty() && id.chars().all(|c| c.is_ascii_alphanumeric() || c == '.'))
}

#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct Tokens {
    pub access_token: String,
    /// Empty when the app doesn't use expiring tokens (or it's a personal token).
    #[serde(default)]
    pub refresh_token: String,
    /// Epoch ms; 0 = doesn't expire.
    #[serde(default)]
    pub expires_at: i64,
}

impl Tokens {
    pub fn expired(&self, now: i64) -> bool {
        self.expires_at > 0 && now >= self.expires_at - SLACK_MS
    }
}

/// A personal token arrives trimmed; an unusual format never leaves the machine.
pub fn validate_pat(raw: &str) -> Result<String> {
    let t = raw.trim();
    let ok = !t.is_empty() && t.len() <= 255 && t.chars().all(|c| c.is_ascii_alphanumeric() || c == '_');
    if !ok {
        return Err(AppError::Github("isso nao parece um token do GitHub".into()));
    }
    Ok(t.to_string())
}

#[derive(Debug, Clone, Deserialize)]
pub struct DeviceRequest {
    pub device_code: String,
    pub user_code: String,
    pub verification_uri: String,
    #[serde(default = "fifteen_min")]
    pub expires_in: u64,
    #[serde(default = "five_s")]
    pub interval: u64,
}

fn fifteen_min() -> u64 {
    900
}
fn five_s() -> u64 {
    5
}

pub fn start(client_id: &str) -> Result<DeviceRequest> {
    let res = client()?
        .post(DEVICE_URL)
        .header(reqwest::header::ACCEPT, "application/json")
        .form(&[("client_id", client_id)])
        .send()
        .map_err(network)?;
    let v: serde_json::Value = res.json().map_err(network)?;
    if let Some(error) = v.get("error").and_then(|e| e.as_str()) {
        return Err(AppError::Github(message(error)));
    }
    let d: DeviceRequest = serde_json::from_value(v)?;
    if !d.verification_uri.starts_with("https://github.com/") {
        return Err(AppError::Github("endereco de verificacao inesperado".into()));
    }
    Ok(d)
}

#[derive(Debug, PartialEq)]
pub enum PollResult {
    Pending,
    SlowDown(u64),
    Ready(Tokens),
}

pub fn poll(client_id: &str, device_code: &str) -> Result<PollResult> {
    let v = request_token(&[("client_id", client_id), ("device_code", device_code), ("grant_type", GRANT_DEVICE)])?;
    interpret(&v, now_ms())
}

/// Device flow tokens renew without a client secret.
pub fn refresh(client_id: &str, refresh_token: &str) -> Result<Tokens> {
    let v = request_token(&[("client_id", client_id), ("grant_type", "refresh_token"), ("refresh_token", refresh_token)])?;
    match interpret(&v, now_ms())? {
        PollResult::Ready(t) => Ok(t),
        _ => Err(AppError::Github("a sessao do GitHub expirou; conecte de novo".into())),
    }
}

fn request_token(form: &[(&str, &str)]) -> Result<serde_json::Value> {
    let res = client()?
        .post(TOKEN_URL)
        .header(reqwest::header::ACCEPT, "application/json")
        .form(form)
        .send()
        .map_err(network)?;
    res.json().map_err(network)
}

/// GitHub responds 200 with `error` while the user hasn't typed the code yet.
pub fn interpret(v: &serde_json::Value, now: i64) -> Result<PollResult> {
    let text = |k: &str| v.get(k).and_then(|x| x.as_str()).unwrap_or_default().to_string();
    match v.get("error").and_then(|e| e.as_str()) {
        Some("authorization_pending") => return Ok(PollResult::Pending),
        Some("slow_down") => return Ok(PollResult::SlowDown(v.get("interval").and_then(|i| i.as_u64()).unwrap_or(10))),
        Some(error) => return Err(AppError::Github(message(error))),
        None => {}
    }
    let access_token = text("access_token");
    if access_token.is_empty() {
        return Err(AppError::Github("o GitHub nao devolveu token".into()));
    }
    let expires_at = v.get("expires_in").and_then(|x| x.as_i64()).map_or(0, |s| now + s * 1000);
    Ok(PollResult::Ready(Tokens { access_token, refresh_token: text("refresh_token"), expires_at }))
}

fn message(error: &str) -> String {
    match error {
        "expired_token" => "o codigo expirou; comece de novo".into(),
        "access_denied" => "acesso negado no GitHub".into(),
        "device_flow_disabled" => "o device flow esta desligado no GitHub App".into(),
        "incorrect_client_credentials" => "Client ID do GitHub App invalido".into(),
        "bad_refresh_token" => "a sessao do GitHub expirou; conecte de novo".into(),
        other => format!("login recusado ({other})"),
    }
}

#[cfg(test)]
#[path = "github_auth_tests.rs"]
mod tests;
