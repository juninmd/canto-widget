//! Contact photos for the Contatos tab: downloaded from Google's CDN in Rust and handed over as `data:` URLs, so the
//! CSP keeps blocking remote images. The People API's `photos` field comes with `contacts.readonly`: no new scope.
use std::collections::HashMap;
use std::sync::Mutex;

use tauri::Manager;

use crate::account;
use crate::blocking::run;
use crate::error::{AppError, Result};
use crate::vault::AppState;

/// One screenful and then some; the UI asks in batches of this size.
pub const MAX_URLS: usize = 60;
const PARALLEL: usize = 6;
/// The tab lists at most 1000 contacts; a 96 px photo is a few KB.
const MAX_ENTRIES: usize = 1200;

/// Photos already embedded this session, by URL. RAM only, cleared on lock: a disk copy would need sealing.
#[derive(Default)]
pub struct ContactPhotos(Mutex<HashMap<String, String>>);

impl ContactPhotos {
    pub fn clear(&self) {
        self.0.lock().unwrap().clear();
    }

    fn get(&self, urls: &[String]) -> HashMap<String, String> {
        let known = self.0.lock().unwrap();
        urls.iter().filter_map(|u| Some((u.clone(), known.get(u)?.clone()))).collect()
    }

    fn put(&self, found: Vec<(String, String)>) {
        let mut known = self.0.lock().unwrap();
        if known.len() + found.len() > MAX_ENTRIES {
            known.clear();
        }
        known.extend(found);
    }
}

/// Only a short list of photo-CDN URLs gets through: the UI never makes Rust fetch anything else.
pub fn check_urls(urls: &[String]) -> Result<()> {
    if urls.len() > MAX_URLS || !urls.iter().all(|u| account::is_trusted_photo(u)) {
        return Err(AppError::Config("lista de fotos inválida".into()));
    }
    Ok(())
}

/// Best effort: a photo that fails to download is left out and the UI keeps the initials; it's retried next load.
#[tauri::command]
pub async fn contact_photos(app: tauri::AppHandle, urls: Vec<String>) -> Result<HashMap<String, String>> {
    check_urls(&urls)?;
    run(move || {
        let state = app.state::<AppState>();
        if !state.is_unlocked() {
            return Err(AppError::Locked);
        }
        let cache = &state.contact_photos;
        let known = cache.get(&urls);
        let missing: Vec<&String> = urls.iter().filter(|u| !known.contains_key(*u)).collect();
        for chunk in missing.chunks(PARALLEL) {
            let found: Vec<(String, String)> = std::thread::scope(|s| {
                let handles: Vec<_> =
                    chunk.iter().map(|u| s.spawn(|| Some(((*u).clone(), account::download_avatar(u)?)))).collect();
                handles.into_iter().filter_map(|h| h.join().ok().flatten()).collect()
            });
            cache.put(found);
        }
        Ok(cache.get(&urls))
    })
    .await
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn only_a_short_list_of_cdn_urls_is_fetched() {
        let ok = "https://lh3.googleusercontent.com/contacts/abc=s96-c".to_string();
        assert!(check_urls(std::slice::from_ref(&ok)).is_ok());
        assert!(check_urls(&[]).is_ok());
        assert!(check_urls(&[ok.clone(), "https://127.0.0.1/x".into()]).is_err());
        assert!(check_urls(&vec![ok; MAX_URLS + 1]).is_err());
    }

    #[test]
    fn the_cache_returns_what_it_holds_and_starts_over_when_full() {
        let cache = ContactPhotos::default();
        cache.put(vec![("a".into(), "data:image/png;base64,AA".into())]);
        assert_eq!(cache.get(&["a".into(), "b".into()]).len(), 1);
        cache.put((0..MAX_ENTRIES).map(|i| (i.to_string(), String::new())).collect());
        assert!(cache.get(&["a".into()]).is_empty());
        cache.clear();
        assert!(cache.get(&["0".into()]).is_empty());
    }
}
