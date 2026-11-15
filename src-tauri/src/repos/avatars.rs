//! Group and repository icons: downloaded in Rust and handed over as `data:` URLs, so the CSP keeps blocking remote
//! images. Only the forge's own image hosts are fetched; anything else the UI sends is refused.
use std::collections::HashMap;

use tauri::Manager;

use crate::account;
use crate::blocking::run;
use crate::error::{AppError, Result};
use crate::vault::AppState;

/// One screenful of rows and then some; the UI asks in batches of this size.
pub const MAX_URLS: usize = 60;
const PARALLEL: usize = 6;
const GITHUB_HOST: &str = "avatars.githubusercontent.com";

/// Whether `url` is an image host of the forge: GitHub's avatar CDN, or the GitLab instance itself.
pub fn allowed(forge: &str, base: &str, url: &str) -> bool {
    let Ok(u) = reqwest::Url::parse(url) else { return false };
    match forge {
        "github" => u.scheme() == "https" && u.host_str() == Some(GITHUB_HOST),
        "gitlab" => url.starts_with(&format!("{base}/")) && u.scheme() == "https",
        _ => false,
    }
}

/// GitHub serves avatars at any size: 64 px covers the 20 px row icon on a 3x display and keeps the `data:` URL tiny.
pub fn sized(forge: &str, url: &str) -> String {
    if forge == "github" && !url.contains("s=") {
        format!("{url}{}s=64", if url.contains('?') { '&' } else { '?' })
    } else {
        url.to_string()
    }
}

/// Best effort: an icon that fails to download is left out and the UI keeps the initial.
#[tauri::command]
pub async fn repo_avatars(app: tauri::AppHandle, forge: String, urls: Vec<String>) -> Result<HashMap<String, String>> {
    run(move || {
        let state = app.state::<AppState>();
        if !state.is_unlocked() {
            return Err(AppError::Locked);
        }
        let base = match forge.as_str() {
            "gitlab" => state.gitlab_config()?.map(|c| c.base_url.clone()).unwrap_or_default(),
            _ => String::new(),
        };
        if urls.len() > MAX_URLS || !urls.iter().all(|u| allowed(&forge, &base, u)) {
            return Err(AppError::Config("lista de ícones inválida".into()));
        }
        let cache = &state.forges.repos.avatars;
        let known = cache.get(&urls);
        let missing: Vec<&String> = urls.iter().filter(|u| !known.contains_key(*u)).collect();
        for chunk in missing.chunks(PARALLEL) {
            let found: Vec<(String, String)> = std::thread::scope(|s| {
                let handles: Vec<_> = chunk
                    .iter()
                    .map(|u| s.spawn(|| Some(((*u).clone(), account::download_image(&sized(&forge, u))?))))
                    .collect();
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
    fn only_the_forges_own_image_hosts_pass() {
        assert!(allowed("github", "", "https://avatars.githubusercontent.com/u/1?v=4"));
        assert!(!allowed("github", "", "http://avatars.githubusercontent.com/u/1"));
        assert!(!allowed("github", "", "https://127.0.0.1/u/1"));
        assert!(!allowed("github", "", "https://avatars.githubusercontent.com.evil.io/u/1"));
        assert!(allowed("gitlab", "https://gitlab.acme.io", "https://gitlab.acme.io/uploads/a.png"));
        assert!(!allowed("gitlab", "https://gitlab.acme.io", "https://gitlab.acme.io.evil.io/a.png"));
        assert!(!allowed("steam", "", "https://avatars.githubusercontent.com/u/1"));
    }

    #[test]
    fn github_icons_are_asked_small() {
        assert_eq!(
            sized("github", "https://avatars.githubusercontent.com/u/1?v=4"),
            "https://avatars.githubusercontent.com/u/1?v=4&s=64"
        );
        assert_eq!(
            sized("github", "https://avatars.githubusercontent.com/u/1"),
            "https://avatars.githubusercontent.com/u/1?s=64"
        );
        assert_eq!(sized("gitlab", "https://gitlab.acme.io/a.png"), "https://gitlab.acme.io/a.png");
    }
}
