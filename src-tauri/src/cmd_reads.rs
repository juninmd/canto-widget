//! Leituras tab commands: the feeds saved next to the vault, the merged list with a 15 min floor, and the
//! thumbnails/favicons as `data:` URLs — the webview has no permission to reach a remote origin.
use crate::resilient::LockExt;
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::Mutex;

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

use crate::blocking::run;
use crate::error::{AppError, Result};
use crate::model::now_ms;
use crate::reads::{self, Article, MAX_FEEDS, MAX_ITEMS, MAX_READ};

const FILE: &str = "leituras.json";
/// The list is served from RAM for this long; "atualizar" bypasses it.
const TTL_MS: i64 = 15 * 60_000;
/// What the whole web uses; a missing one leaves the initials avatar in the UI.
const FAVICON: &str = "/favicon.ico";

#[derive(Default, Serialize, Deserialize)]
struct Saved {
    #[serde(default)]
    feeds: Vec<String>,
    #[serde(default)]
    read: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct FeedView {
    pub url: String,
    pub label: String,
    /// Set when this feed alone failed; the others still show.
    pub error: Option<String>,
}

#[derive(Serialize)]
pub struct ReadsView {
    pub feeds: Vec<FeedView>,
    pub items: Vec<Article>,
    pub fetched_at: i64,
}

#[derive(Default)]
struct Cached {
    at: i64,
    feeds: Vec<FeedView>,
    items: Vec<Article>,
}

#[derive(Default)]
pub struct ReadsState {
    path: PathBuf,
    feeds: Mutex<Vec<String>>,
    /// Newest last, so the cap drops the oldest marks.
    read: Mutex<Vec<String>>,
    /// The last list, so a thumbnail request carries an id and nothing else.
    items: Mutex<Vec<Article>>,
    cached: Mutex<Option<Cached>>,
    thumbs: Mutex<HashMap<String, Option<String>>>,
    icons: Mutex<HashMap<String, Option<String>>>,
}

impl ReadsState {
    pub fn load(dir: &Path) -> Self {
        let path = dir.join(FILE);
        let saved: Saved = crate::store::read_json(&path).ok().flatten().unwrap_or_default();
        let feeds = saved.feeds.into_iter().filter(|url| reads::valid_feed_url(url)).take(MAX_FEEDS).collect();
        Self { path, feeds: Mutex::new(feeds), read: Mutex::new(saved.read), ..Default::default() }
    }

    fn save(&self) -> Result<()> {
        let saved = Saved { feeds: self.feeds.lock_safe().clone(), read: self.read.lock_safe().clone() };
        crate::store::write_json_atomic(&self.path, &saved)
    }

    /// What the UI gets: the cached list with the read marks applied at this instant.
    fn view(&self, at: i64) -> ReadsView {
        let read = self.read.lock_safe();
        let cached = self.cached.lock_safe();
        let Some(cached) = cached.as_ref() else {
            return ReadsView { feeds: Vec::new(), items: Vec::new(), fetched_at: at };
        };
        let mut items = cached.items.clone();
        for item in items.iter_mut() {
            item.unread = !read.contains(&item.id);
        }
        ReadsView { feeds: cached.feeds.clone(), items, fetched_at: cached.at }
    }

    fn refresh(&self) -> ReadsView {
        let feeds = self.feeds.lock_safe().clone();
        let found = std::thread::scope(|scope| {
            let handles: Vec<_> = feeds
                .iter()
                .map(|feed| {
                    scope.spawn(|| {
                        let result = reads::fetch(feed).and_then(|body| reads::parse_feed(&body, feed));
                        (feed.clone(), result)
                    })
                })
                .collect();
            handles
                .into_iter()
                .map(|handle| handle.join().unwrap_or_else(|_| (String::new(), Err("consulta interrompida".into()))))
                .collect::<Vec<_>>()
        });
        let mut views = Vec::new();
        let mut items: Vec<Article> = Vec::new();
        for (url, result) in found {
            match result {
                Ok(articles) => {
                    let label = articles
                        .first()
                        .map(|a| a.source.clone())
                        .filter(|label| !label.is_empty())
                        .or_else(|| reads::host_of(&url))
                        .unwrap_or_default();
                    views.push(FeedView { url, label, error: None });
                    items.extend(articles);
                }
                Err(error) => views.push(FeedView { url, label: String::new(), error: Some(error) }),
            }
        }
        items.sort_by_key(|article| std::cmp::Reverse(article.published_at));
        let mut seen = std::collections::HashSet::new();
        items.retain(|article| seen.insert(article.id.clone()));
        items.truncate(MAX_ITEMS);
        *self.items.lock_safe() = items.clone();
        let at = now_ms();
        *self.cached.lock_safe() = Some(Cached { at, feeds: views.clone(), items });
        self.view(at)
    }
}

#[tauri::command]
pub async fn reads_get(app: AppHandle, force: bool) -> ReadsView {
    run(move || {
        let state = app.state::<ReadsState>();
        if !force {
            let fresh = state.cached.lock_safe().as_ref().map(|cached| cached.at);
            if let Some(at) = fresh {
                if now_ms() - at < TTL_MS {
                    return Ok::<_, AppError>(state.view(at));
                }
            }
        }
        Ok(state.refresh())
    })
    .await
    .unwrap_or_else(|_| ReadsView { feeds: Vec::new(), items: Vec::new(), fetched_at: 0 })
}

/// The address is checked and the feed is parsed before it is saved: an address that is not a feed never
/// lands in the list, so the tab cannot be filled with error rows by a typo.
#[tauri::command]
pub async fn reads_add(app: AppHandle, feed: String) -> Result<ReadsView> {
    let feed = feed.trim().to_string();
    if !reads::valid_feed_url(&feed) {
        return Err(AppError::Config("endereço inválido: use http(s)".into()));
    }
    run(move || {
        let state = app.state::<ReadsState>();
        {
            let feeds = state.feeds.lock_safe();
            if feeds.contains(&feed) {
                drop(feeds);
                return Ok(state.refresh());
            }
            if feeds.len() >= MAX_FEEDS {
                return Err(AppError::Config(format!("limite de {MAX_FEEDS} feeds atingido")));
            }
        }
        let articles =
            reads::fetch(&feed).and_then(|body| reads::parse_feed(&body, &feed)).map_err(AppError::Config)?;
        if articles.is_empty() {
            return Err(AppError::Config("o feed não tem entradas".into()));
        }
        state.feeds.lock_safe().push(feed);
        state.save()?;
        Ok(state.refresh())
    })
    .await
}

#[tauri::command]
pub async fn reads_remove(app: AppHandle, feed: String) -> Result<ReadsView> {
    run(move || {
        let state = app.state::<ReadsState>();
        state.feeds.lock_safe().retain(|saved| saved != &feed);
        state.save()?;
        Ok(state.refresh())
    })
    .await
}

#[tauri::command(async)]
pub fn reads_mark(app: AppHandle, id: String, read: bool) -> Result<ReadsView> {
    let state = app.state::<ReadsState>();
    {
        let mut marks = state.read.lock_safe();
        marks.retain(|saved| saved != &id);
        if read {
            marks.push(id);
            while marks.len() > MAX_READ {
                marks.remove(0);
            }
        }
    }
    state.save()?;
    let at = state.cached.lock_safe().as_ref().map_or(0, |cached| cached.at);
    Ok(state.view(at))
}

/// Only by id: the image address stays in Rust, and an address off the host allowlist was already dropped.
#[tauri::command]
pub async fn reads_thumb(app: AppHandle, id: String) -> Option<String> {
    run(move || {
        let state = app.state::<ReadsState>();
        if let Some(hit) = state.thumbs.lock_safe().get(&id) {
            return Ok::<_, AppError>(hit.clone());
        }
        let url = state.items.lock_safe().iter().find(|article| article.id == id).and_then(|a| a.image.clone());
        let data = url.and_then(|url| crate::account::download_image(&url));
        state.thumbs.lock_safe().insert(id, data.clone());
        Ok(data)
    })
    .await
    .ok()
    .flatten()
}

/// `host` is shaped like a host and nothing else: no scheme, path or credential can ride along.
#[tauri::command]
pub async fn reads_favicon(app: AppHandle, host: String) -> Option<String> {
    run(move || {
        let state = app.state::<ReadsState>();
        if let Some(hit) = state.icons.lock_safe().get(&host) {
            return Ok::<_, AppError>(hit.clone());
        }
        let data = reads::is_public_host(&host)
            .then(|| format!("https://{host}{FAVICON}"))
            .and_then(|url| crate::account::download_image(&url));
        state.icons.lock_safe().insert(host, data.clone());
        Ok(data)
    })
    .await
    .ok()
    .flatten()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn dir(name: &str) -> PathBuf {
        let dir = std::env::temp_dir().join(format!("canto-reads-{}-{name}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        dir
    }

    #[test]
    fn unknown_addresses_are_dropped_and_marks_are_bounded() {
        let dir = dir("sanitized");
        std::fs::write(dir.join(FILE), r#"{"feeds":["https://ok.test/feed","file:///etc/passwd"],"read":["aaaa"]}"#)
            .unwrap();
        let state = ReadsState::load(&dir);
        assert_eq!(state.feeds.lock_safe().clone(), ["https://ok.test/feed"]);
        assert_eq!(state.read.lock_safe().clone(), ["aaaa"]);
        {
            let mut marks = state.read.lock_safe();
            for i in 0..MAX_READ + 5 {
                marks.push(format!("id{i}"));
            }
            while marks.len() > MAX_READ {
                marks.remove(0);
            }
        }
        assert_eq!(state.read.lock_safe().len(), MAX_READ);
        assert_eq!(state.read.lock_safe().first().map(String::as_str), Some("id5"));
        std::fs::remove_dir_all(&dir).unwrap();
    }

    #[test]
    fn a_mark_survives_a_restart_and_can_be_undone() {
        let dir = dir("marks");
        let state = ReadsState::load(&dir);
        state.read.lock_safe().push("abc".into());
        state.save().unwrap();
        assert_eq!(ReadsState::load(&dir).read.lock_safe().clone(), ["abc"]);
        let state = ReadsState::load(&dir);
        state.read.lock_safe().retain(|saved| saved != "abc");
        state.save().unwrap();
        assert!(ReadsState::load(&dir).read.lock_safe().is_empty());
        std::fs::remove_dir_all(&dir).unwrap();
    }
}
