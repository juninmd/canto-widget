//! Shared HTTP plumbing for Gmail, Google Tasks and Drive: one client and one reading of Google's refusals.
use std::time::Duration;

use reqwest::blocking::{Client, RequestBuilder};
use serde::de::DeserializeOwned;

use crate::error::{AppError, Result};

pub fn client() -> Result<Client> {
    crate::net::client_builder().timeout(Duration::from_secs(30)).build().map_err(|e| AppError::Drive(e.to_string()))
}

pub fn send<T: DeserializeOwned>(service: &str, request: RequestBuilder) -> Result<T> {
    let res = request.send().map_err(|e| AppError::Drive(e.to_string()))?;
    let status = res.status().as_u16();
    if (200..300).contains(&status) {
        return res.json().map_err(|e| AppError::Drive(e.to_string()));
    }
    Err(refusal(service, status, &res.text().unwrap_or_default()))
}

/// A grant from before these integrations lacks their scopes: the fix is reconnecting, so say that instead of the raw 403.
pub fn refusal(service: &str, status: u16, body: &str) -> AppError {
    if status == 403
        && (body.contains("ACCESS_TOKEN_SCOPE_INSUFFICIENT") || body.contains("insufficient authentication"))
    {
        return AppError::Config(
            crate::lang::tr(
                "reconecte o Google em Ajustes para liberar Gmail, Tarefas e Drive",
                "reconnect Google in Settings to allow Gmail, Tasks and Drive",
            )
            .into(),
        );
    }
    if status == 403 && body.contains("SERVICE_DISABLED") {
        return AppError::Drive(format!(
            "{service}: {}",
            crate::lang::tr(
                "API desativada no projeto do Google Cloud deste Client ID",
                "API disabled in this Client ID's Google Cloud project",
            )
        ));
    }
    let detail: String = body.chars().take(200).collect();
    AppError::Drive(format!("{service} respondeu {status}: {detail}"))
}

/// Ids Google hands out (messages, tasks, files) are URL-safe tokens; anything else from the webview is refused.
pub fn valid_id(id: &str) -> bool {
    (1..=200).contains(&id.len()) && id.bytes().all(|b| b.is_ascii_alphanumeric() || b == b'-' || b == b'_')
}

pub fn check_id(id: &str) -> Result<()> {
    if valid_id(id) {
        Ok(())
    } else {
        Err(AppError::Config(crate::lang::tr("id inválido", "invalid id").into()))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn a_grant_without_the_new_scopes_asks_for_a_reconnect() {
        let body = r#"{"error":{"code":403,"details":[{"reason":"ACCESS_TOKEN_SCOPE_INSUFFICIENT"}]}}"#;
        let text = refusal("gmail", 403, body).text("pt-BR");
        assert!(text.starts_with("reconecte o Google") || text.starts_with("reconnect Google"), "{text}");
    }

    #[test]
    fn other_refusals_keep_the_service_and_status() {
        let text = refusal("drive", 500, "boom").text("pt-BR");
        assert!(text.contains("drive respondeu 500: boom"), "{text}");
        assert!(refusal("tasks", 403, "SERVICE_DISABLED").text("pt-BR").contains("Google Cloud"));
    }

    #[test]
    fn only_url_safe_ids_reach_a_url() {
        assert!(valid_id("18c2f1a9b3d4e5f6") && valid_id("MTIzNDU2Nzg5_-x"));
        assert!(!valid_id("") && !valid_id("../labels") && !valid_id("a b") && !valid_id("a?b=c"));
        assert!(!valid_id(&"a".repeat(201)));
    }
}
