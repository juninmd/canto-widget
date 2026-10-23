//! Gmail: the inbox's unread count and one view of it (important, unread, starred), optionally searched.
use serde::{Deserialize, Serialize};

use crate::error::Result;
use crate::google_api::{client, send};

pub(crate) const API: &str = "https://gmail.googleapis.com/gmail/v1/users/me";
const LIST_MAX: &str = "15";

#[derive(Debug, Clone, Default, Serialize, PartialEq)]
pub struct Mail {
    pub id: String,
    pub from: String,
    pub subject: String,
    pub snippet: String,
    /// Milliseconds since the epoch, from Gmail's `internalDate`.
    pub date: i64,
    pub link: String,
    pub unread: bool,
    pub starred: bool,
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
    #[serde(rename = "labelIds", default)]
    label_ids: Vec<String>,
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
        let has = |label: &str| self.label_ids.iter().any(|l| l == label);
        let (unread, starred) = (has("UNREAD"), has("STARRED"));
        let thread = if crate::google_api::valid_id(&self.thread_id) { &self.thread_id } else { &self.id };
        Mail {
            from: sender_name(&header("From").unwrap_or_default()),
            subject: header("Subject").unwrap_or_default(),
            snippet: decode_entities(&self.snippet),
            date: self.internal_date.parse().unwrap_or(0),
            link: format!("https://mail.google.com/mail/u/0/#inbox/{thread}"),
            unread,
            starred,
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
    list(token, "important", "")
}

/// The inbox's unread count and the newest mail of a view (`important`, `unread`, `starred`), narrowed by a search.
pub fn list(token: &str, view: &str, search: &str) -> Result<GmailSummary> {
    let q = crate::gmail_actions::view_query(view, search)?;
    let http = client()?;
    let inbox: Label = send("gmail", http.get(format!("{API}/labels/INBOX")).bearer_auth(token))?;
    let ids: IdList = send(
        "gmail",
        http.get(format!("{API}/messages")).bearer_auth(token).query(&[("q", q.as_str()), ("maxResults", LIST_MAX)]),
    )?;
    let wanted: Vec<&str> =
        ids.messages.iter().map(|m| m.id.as_str()).filter(|id| crate::google_api::valid_id(id)).collect();
    let important = fetch_all(&wanted, |id| {
        send::<RawMessage>(
            "gmail",
            http.get(format!("{API}/messages/{id}")).bearer_auth(token).query(&[
                ("format", "metadata"),
                ("metadataHeaders", "From"),
                ("metadataHeaders", "Subject"),
            ]),
        )
        .map(RawMessage::into_mail)
    })?;
    Ok(GmailSummary { unread: inbox.messages_unread, important })
}

/// Fetches every message at once, in list order. One that vanished or failed between the list and its fetch is
/// left out instead of failing the whole view; only when every fetch fails is the first error returned.
pub(crate) fn fetch_all<T: Send>(ids: &[&str], fetch: impl Fn(&str) -> Result<T> + Sync) -> Result<Vec<T>> {
    let results: Vec<Result<T>> = std::thread::scope(|scope| {
        let fetch = &fetch;
        let jobs: Vec<_> = ids.iter().map(|id| scope.spawn(move || fetch(id))).collect();
        jobs.into_iter()
            .map(|job| job.join().unwrap_or_else(|_| Err(crate::error::AppError::Drive("gmail: falha ao ler".into()))))
            .collect()
    });
    let mut first_error = None;
    let mut found = Vec::with_capacity(results.len());
    for result in results {
        match result {
            Ok(item) => found.push(item),
            Err(e) => first_error = first_error.or(Some(e)),
        }
    }
    match first_error {
        Some(e) if found.is_empty() => Err(e),
        _ => Ok(found),
    }
}

#[cfg(test)]
#[path = "gmail_tests.rs"]
mod tests;
