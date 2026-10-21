//! Gmail: the inbox's unread count and the unread messages Gmail itself marked as important.
use serde::{Deserialize, Serialize};

use crate::error::Result;
use crate::google_api::{check_id, client, send};

const API: &str = "https://gmail.googleapis.com/gmail/v1/users/me";
/// Gmail's own importance marker decides what alerts: the rest only counts.
pub const IMPORTANT_QUERY: &str = "in:inbox is:unread is:important";
const IMPORTANT_MAX: &str = "10";

#[derive(Debug, Clone, Default, Serialize, PartialEq)]
pub struct Mail {
    pub id: String,
    pub from: String,
    pub subject: String,
    pub snippet: String,
    /// Milliseconds since the epoch, from Gmail's `internalDate`.
    pub date: i64,
    pub link: String,
}

#[derive(Debug, Clone, Default, Serialize)]
pub struct GmailSummary {
    pub unread: u32,
    pub important: Vec<Mail>,
}

#[derive(Deserialize)]
struct Label {
    #[serde(rename = "messagesUnread", default)]
    messages_unread: u32,
}

#[derive(Deserialize)]
struct IdList {
    #[serde(default)]
    messages: Vec<MessageId>,
}

#[derive(Deserialize)]
struct MessageId {
    id: String,
}

#[derive(Deserialize, Default)]
pub(crate) struct RawMessage {
    id: String,
    #[serde(rename = "threadId", default)]
    thread_id: String,
    #[serde(default)]
    snippet: String,
    #[serde(rename = "internalDate", default)]
    internal_date: String,
    #[serde(default)]
    payload: Payload,
}

#[derive(Deserialize, Default)]
struct Payload {
    #[serde(default)]
    headers: Vec<Header>,
}

#[derive(Deserialize)]
struct Header {
    name: String,
    value: String,
}

impl RawMessage {
    pub(crate) fn into_mail(self) -> Mail {
        let header = |name: &str| {
            self.payload.headers.iter().find(|h| h.name.eq_ignore_ascii_case(name)).map(|h| h.value.clone())
        };
        let thread = if crate::google_api::valid_id(&self.thread_id) { &self.thread_id } else { &self.id };
        Mail {
            from: sender_name(&header("From").unwrap_or_default()),
            subject: header("Subject").unwrap_or_default(),
            snippet: decode_entities(&self.snippet),
            date: self.internal_date.parse().unwrap_or(0),
            link: format!("https://mail.google.com/mail/u/0/#inbox/{thread}"),
            id: self.id,
        }
    }
}

/// `"Ana Souza" <ana@exemplo.com>` becomes `Ana Souza`; a bare address stays as it is.
pub fn sender_name(from: &str) -> String {
    let from = from.trim();
    match from.find('<') {
        Some(i) if i > 0 => from[..i].trim().trim_matches('"').trim().to_string(),
        _ => from.trim_matches(|c| c == '<' || c == '>').to_string(),
    }
}

/// Gmail's snippet arrives HTML-escaped (`&#39;`, `&quot;`); the webview prints it as plain text.
fn decode_entities(text: &str) -> String {
    text.replace("&#39;", "'").replace("&quot;", "\"").replace("&lt;", "<").replace("&gt;", ">").replace("&amp;", "&")
}

pub fn summary(token: &str) -> Result<GmailSummary> {
    let http = client()?;
    let inbox: Label = send("gmail", http.get(format!("{API}/labels/INBOX")).bearer_auth(token))?;
    let ids: IdList = send(
        "gmail",
        http.get(format!("{API}/messages"))
            .bearer_auth(token)
            .query(&[("q", IMPORTANT_QUERY), ("maxResults", IMPORTANT_MAX)]),
    )?;
    let mut important = Vec::with_capacity(ids.messages.len());
    for message in ids.messages.iter().filter(|m| crate::google_api::valid_id(&m.id)) {
        let raw: RawMessage = send(
            "gmail",
            http.get(format!("{API}/messages/{}", message.id)).bearer_auth(token).query(&[
                ("format", "metadata"),
                ("metadataHeaders", "From"),
                ("metadataHeaders", "Subject"),
            ]),
        )?;
        important.push(raw.into_mail());
    }
    Ok(GmailSummary { unread: inbox.messages_unread, important })
}

pub fn mark_read(token: &str, id: &str) -> Result<()> {
    check_id(id)?;
    let body = serde_json::json!({ "removeLabelIds": ["UNREAD"] });
    let _: serde::de::IgnoredAny =
        send("gmail", client()?.post(format!("{API}/messages/{id}/modify")).bearer_auth(token).json(&body))?;
    Ok(())
}

#[cfg(test)]
#[path = "gmail_tests.rs"]
mod tests;
