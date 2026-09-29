//! Guests' photos for the agenda: Calendar sends none, so they come from the Workspace directory (People API,
//! `directory.readonly`). Only domain colleagues have one there; everyone else keeps the initials avatar.
use std::collections::HashMap;
use std::sync::Mutex;

use serde::Deserialize;
use tauri::Manager;

use crate::account;
use crate::error::{AppError, Result};
use crate::vault::AppState;

const SEARCH_URL: &str = "https://people.googleapis.com/v1/people:searchDirectoryPeople";
/// Same cap as the guest list Rust sends to the UI.
const MAX_EMAILS: usize = 50;
const PARALLEL: usize = 6;
/// Directory photos are served at any size by suffix; 96 px covers the 28 px avatar on a 3x display.
const SIZE_SUFFIX: &str = "=s96-c";

/// Definitive lookups done this session, `None` when the person has no directory photo. Lives in `AppState`: RAM only,
/// cleared on lock.
#[derive(Default)]
pub struct GuestPhotos(Mutex<HashMap<String, Option<String>>>);

impl GuestPhotos {
    pub fn clear(&self) {
        self.0.lock().unwrap().clear();
    }
}

#[derive(Deserialize, Default)]
struct Search {
    #[serde(default)]
    people: Vec<Person>,
}

#[derive(Deserialize, Default)]
struct Person {
    #[serde(default, rename = "emailAddresses")]
    emails: Vec<Email>,
    #[serde(default)]
    photos: Vec<Photo>,
}

#[derive(Deserialize, Default)]
struct Email {
    #[serde(default)]
    value: String,
}

#[derive(Deserialize, Default)]
struct Photo {
    #[serde(default)]
    url: String,
    /// Google's generated placeholder: the initials avatar looks better and costs no download.
    #[serde(default)]
    default: bool,
}

pub fn valid_email(email: &str) -> bool {
    let at = email.find('@');
    email.len() <= 254 && at.is_some_and(|i| i > 0 && i < email.len() - 1) && !email.contains(char::is_whitespace)
}

/// The photo URL of the directory entry whose e-mail is exactly `email`: a prefix query can match others.
fn photo_url(search: &Search, email: &str) -> Option<String> {
    let person = search.people.iter().find(|p| p.emails.iter().any(|e| e.value.eq_ignore_ascii_case(email)))?;
    let photo = person.photos.iter().find(|p| !p.default && !p.url.is_empty())?;
    let base = photo.url.split('=').next().unwrap_or(&photo.url);
    Some(format!("{base}{SIZE_SUFFIX}"))
}

/// What one directory lookup found out.
#[derive(Debug, PartialEq)]
enum Lookup {
    Photo(String),
    /// Definitive: the person has no directory photo, or there's no directory at all.
    NoPhoto,
    /// Network error, rate limit, server error: worth asking again later, not worth remembering.
    Transient,
    /// The token lacks `directory.readonly` (connected before it was requested): worth telling the user.
    NeedsConsent,
}

/// What goes in the session cache: transient failures and a missing scope are never remembered.
fn cache_entry(outcome: Lookup) -> Option<Option<String>> {
    match outcome {
        Lookup::Photo(url) => Some(Some(url)),
        Lookup::NoPhoto => Some(None),
        Lookup::Transient | Lookup::NeedsConsent => None,
    }
}

/// `None` for a success, whose body decides; 403 needs the body too and is handled by the caller.
fn by_status(status: reqwest::StatusCode) -> Option<Lookup> {
    if status.is_success() {
        None
    } else if status.is_server_error()
        || status == reqwest::StatusCode::TOO_MANY_REQUESTS
        || status == reqwest::StatusCode::REQUEST_TIMEOUT
        || status == reqwest::StatusCode::UNAUTHORIZED
    {
        Some(Lookup::Transient)
    } else {
        Some(Lookup::NoPhoto)
    }
}

fn lookup(token: &str, email: &str) -> Lookup {
    let Ok(client) = account::client() else { return Lookup::Transient };
    let sent = client
        .get(SEARCH_URL)
        .query(&[
            ("query", email),
            ("readMask", "emailAddresses,photos"),
            ("sources", "DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE"),
            ("pageSize", "5"),
        ])
        .bearer_auth(token)
        .send();
    let Ok(res) = sent else { return Lookup::Transient };
    if res.status() == reqwest::StatusCode::FORBIDDEN {
        let header =
            res.headers().get(reqwest::header::WWW_AUTHENTICATE).and_then(|h| h.to_str().ok()).map(str::to_owned);
        let body = res.text().unwrap_or_default();
        // Personal Gmail accounts get a 403 too (no directory): only a missing scope is worth a reconnect.
        return if missing_scope(header.as_deref(), &body) { Lookup::NeedsConsent } else { Lookup::NoPhoto };
    }
    if let Some(outcome) = by_status(res.status()) {
        return outcome;
    }
    let Ok(search) = res.json::<Search>() else { return Lookup::Transient };
    let Some(url) = photo_url(&search, email) else { return Lookup::NoPhoto };
    // The person has a photo: a failed download is retried on the next agenda load.
    account::download_avatar(&url).map_or(Lookup::Transient, Lookup::Photo)
}

/// Google's two ways of saying the token lacks a scope: RFC 6750's header and its own error reason.
fn missing_scope(www_authenticate: Option<&str>, body: &str) -> bool {
    www_authenticate.is_some_and(|h| h.contains("insufficient_scope"))
        || body.contains("ACCESS_TOKEN_SCOPE_INSUFFICIENT")
}

#[derive(serde::Serialize, Default)]
pub struct Photos {
    /// `data:` URLs by e-mail, only for guests that have a directory photo.
    pub photos: HashMap<String, String>,
    /// The Google connection predates the directory scope: reconnecting in Settings brings the photos.
    pub needs_consent: bool,
}

/// Best effort: outside Workspace, or for people without a directory photo, the initials avatar stays.
#[tauri::command(async)]
pub fn guest_photos(app: tauri::AppHandle, emails: Vec<String>) -> Result<Photos> {
    if emails.len() > MAX_EMAILS || !emails.iter().all(|e| valid_email(e)) {
        return Err(AppError::Config("lista de convidados inválida".into()));
    }
    let state = app.state::<AppState>();
    if !state.is_unlocked() {
        return Err(AppError::Locked);
    }
    let cache = &state.guest_photos;
    let missing: Vec<String> = {
        let known = cache.0.lock().unwrap();
        emails.iter().filter(|e| !known.contains_key(e.as_str())).cloned().collect()
    };
    let mut needs_consent = false;
    if !missing.is_empty() {
        let token = crate::cmd_extras::google_token(&state)?;
        for chunk in missing.chunks(PARALLEL) {
            let found: Vec<_> = std::thread::scope(|s| {
                let handles: Vec<_> = chunk.iter().map(|e| s.spawn(|| (e.clone(), lookup(&token, e)))).collect();
                handles.into_iter().filter_map(|h| h.join().ok()).collect()
            });
            let mut known = cache.0.lock().unwrap();
            for (email, outcome) in found {
                needs_consent |= outcome == Lookup::NeedsConsent;
                if let Some(entry) = cache_entry(outcome) {
                    known.insert(email, entry);
                }
            }
            if needs_consent {
                break;
            }
        }
    }
    let known = cache.0.lock().unwrap();
    let photos = emails.iter().filter_map(|e| Some((e.clone(), known.get(e)?.clone()?))).collect();
    Ok(Photos { photos, needs_consent })
}

#[cfg(test)]
#[path = "guest_photos_tests.rs"]
mod tests;
