//! Shared HTTP plumbing for Gmail, Google Tasks, Drive and Contacts: one client and one reading of Google's refusals.
use std::time::Duration;

use reqwest::blocking::{Client, RequestBuilder};
use serde::de::DeserializeOwned;

use crate::error::{AppError, Result};

pub fn client() -> Result<Client> {
    crate::net::client_builder()
        .timeout(Duration::from_secs(30))
        .build()
        .map_err(|e| AppError::Drive(crate::error::net_text(e)))
}

pub fn send<T: DeserializeOwned>(service: &str, request: RequestBuilder) -> Result<T> {
    let res = request.send().map_err(|e| AppError::Drive(crate::error::net_text(e)))?;
    let status = res.status().as_u16();
    if (200..300).contains(&status) {
        return res.json().map_err(|e| AppError::Drive(crate::error::net_text(e)));
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
                "reconecte o Google em Ajustes para liberar Gmail, Tarefas, Drive e Contatos",
                "reconnect Google in Settings to allow Gmail, Tasks, Drive and Contacts",
            )
            .into(),
        );
    }
    if status == 403 && (body.contains("SERVICE_DISABLED") || body.contains("accessNotConfigured")) {
        let what = crate::lang::tr(
            "API desativada no projeto do Google Cloud deste Client ID",
            "API disabled in this Client ID's Google Cloud project",
        );
        // Google names the console page that turns the API on; the tab offers it as a button.
        return AppError::Drive(match activation_url(body) {
            Some(url) => format!("{service}: {what}. {} {url}", crate::lang::tr("Ative em", "Enable it at")),
            None => format!("{service}: {what}"),
        });
    }
    let detail: String = body.chars().take(200).collect();
    AppError::Drive(format!("{service} respondeu {status}: {detail}"))
}

/// The Google Cloud console link a SERVICE_DISABLED refusal carries; only Google's own console hosts are kept.
fn activation_url(body: &str) -> Option<String> {
    ["https://console.developers.google.com/", "https://console.cloud.google.com/"].iter().find_map(|host| {
        let start = body.find(host)?;
        let url: String = body[start..]
            .chars()
            .take_while(|c| c.is_ascii_alphanumeric() || "/:.?=&_-%".contains(*c))
            .take(300)
            .collect();
        Some(url)
    })
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
    fn a_disabled_api_names_the_console_page_that_enables_it() {
        let body = r#"{"error":{"code":403,"status":"PERMISSION_DENIED","errors":[{"reason":"accessNotConfigured"}],
            "details":[{"reason":"SERVICE_DISABLED","metadata":{"activationUrl":"https://console.developers.google.com/apis/api/gmail.googleapis.com/overview?project=123"}}]}}"#;
        let text = refusal("gmail", 403, body).text("pt-BR");
        assert!(
            text.ends_with("https://console.developers.google.com/apis/api/gmail.googleapis.com/overview?project=123"),
            "{text}"
        );
        assert_eq!(activation_url(r#""x":"https://evil.example/console.cloud.google.com""#), None);
    }

    #[test]
    fn only_url_safe_ids_reach_a_url() {
        assert!(valid_id("18c2f1a9b3d4e5f6") && valid_id("MTIzNDU2Nzg5_-x"));
        assert!(!valid_id("") && !valid_id("../labels") && !valid_id("a b") && !valid_id("a?b=c"));
        assert!(!valid_id(&"a".repeat(201)));
    }
}
