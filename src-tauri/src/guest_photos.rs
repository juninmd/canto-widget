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

/// Lookups done this session, `None` when the person has no directory photo. Lives in `AppState`: RAM only,
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

/// `Err(())` means the token lacks `directory.readonly` (connected before it was requested): worth telling the user,
/// not worth caching. Anything else that fails is "no photo".
fn lookup(token: &str, email: &str) -> std::result::Result<Option<String>, ()> {
    let Ok(client) = account::client() else { return Ok(None) };
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
    let Ok(res) = sent else { return Ok(None) };
    if res.status() == reqwest::StatusCode::FORBIDDEN {
        let header =
            res.headers().get(reqwest::header::WWW_AUTHENTICATE).and_then(|h| h.to_str().ok()).map(str::to_owned);
        let body = res.text().unwrap_or_default();
        // Personal Gmail accounts get a 403 too (no directory): only a missing scope is worth a reconnect.
        return if missing_scope(header.as_deref(), &body) { Err(()) } else { Ok(None) };
    }
    let Ok(search) = res.error_for_status().and_then(|r| r.json::<Search>()) else { return Ok(None) };
    Ok(photo_url(&search, email).and_then(|url| account::download_avatar(&url)))
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
                match outcome {
                    Ok(photo) => {
                        known.insert(email, photo);
                    }
                    Err(()) => needs_consent = true,
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
