//! What the user did with the mentions list: the ones they read and the threads and people they muted. Sealed with
//! the vault key (it names private repositories and people); nothing here works with the vault locked.
use crate::resilient::LockExt;
use std::collections::{BTreeMap, BTreeSet};
use std::sync::atomic::{AtomicU32, Ordering};
use std::sync::Mutex;

use serde::{Deserialize, Serialize};
use tauri::State;

use crate::error::Result;
use crate::model::now_ms;
use crate::store;
use crate::vault::AppState;

pub const AAD: &[u8] = b"canto.mentions.v1";
/// Read marks outlive the mention by a while (a todo id is never reused) but not for ever.
const KEEP_MS: i64 = 90 * 24 * 3_600_000;
const MAX_READ: usize = 500;

#[derive(Debug, Default, Clone, PartialEq, Serialize, Deserialize)]
pub struct Saved {
    /// Row id -> when it was marked read (ms).
    #[serde(default)]
    pub read: BTreeMap<String, i64>,
    /// Muted thread URL -> its title, so what was silenced can be told.
    #[serde(default)]
    pub threads: BTreeMap<String, String>,
    /// Muted logins, lowercase.
    #[serde(default)]
    pub authors: BTreeSet<String>,
}

impl Saved {
    pub fn is_unread(&self, id: &str) -> bool {
        !self.read.contains_key(id)
    }

    pub fn is_muted(&self, url: &str, login: &str) -> bool {
        self.threads.contains_key(url) || (!login.is_empty() && self.authors.contains(&login.to_lowercase()))
    }

    pub fn mark(&mut self, ids: &[String], read: bool, now: i64) {
        for id in ids {
            if read {
                self.read.insert(id.clone(), now);
            } else {
                self.read.remove(id);
            }
        }
        self.read.retain(|_, at| now - *at < KEEP_MS);
        while self.read.len() > MAX_READ {
            let Some(oldest) = self.read.iter().min_by_key(|(_, at)| **at).map(|(k, _)| k.clone()) else { break };
            self.read.remove(&oldest);
        }
    }

    pub fn mute_thread(&mut self, url: &str, title: &str, muted: bool) {
        if muted {
            self.threads.insert(url.to_string(), title.to_string());
        } else {
            self.threads.remove(url);
        }
    }

    pub fn mute_author(&mut self, login: &str, muted: bool) {
        let login = login.to_lowercase();
        if login.is_empty() {
            return;
        }
        if muted {
            self.authors.insert(login);
        } else {
            self.authors.remove(&login);
        }
    }
}

/// A row as far as the unread count is concerned.
#[derive(Debug, Clone, PartialEq)]
pub struct Light {
    pub id: String,
    pub url: String,
    pub login: String,
}

/// The last list each forge showed or watched, so a mark or a mute can recount without another request.
#[derive(Default)]
pub struct MentionsUnread {
    lists: Mutex<[Vec<Light>; 2]>,
    count: AtomicU32,
}

pub const GITHUB: usize = 0;
pub const GITLAB: usize = 1;

impl MentionsUnread {
    pub fn count(&self) -> u32 {
        self.count.load(Ordering::Relaxed)
    }

    pub fn set(&self, slot: usize, rows: Vec<Light>, saved: &Saved) -> u32 {
        let mut lists = self.lists.lock_safe();
        lists[slot] = rows;
        let n = recount(&lists, saved);
        self.count.store(n, Ordering::Relaxed);
        n
    }

    pub fn recount(&self, saved: &Saved) -> u32 {
        let lists = self.lists.lock_safe();
        let n = recount(&lists, saved);
        self.count.store(n, Ordering::Relaxed);
        n
    }

    /// Back to nothing: another account, or a disconnected forge, must not leave a stale number on the badge.
    pub fn clear(&self, slot: usize, saved: &Saved) {
        self.set(slot, Vec::new(), saved);
    }
}

fn recount(lists: &[Vec<Light>; 2], saved: &Saved) -> u32 {
    lists.iter().flatten().filter(|r| !saved.is_muted(&r.url, &r.login) && saved.is_unread(&r.id)).count() as u32
}

/// One writer at a time: the watcher and the commands both read-modify-write the same file.
static LOCK: Mutex<()> = Mutex::new(());

pub fn load(state: &AppState) -> Result<Saved> {
    Ok(state.sealed::<Saved>(&store::mentions_path(&state.dir), AAD)?.unwrap_or_default())
}

pub fn update<T>(state: &AppState, f: impl FnOnce(&mut Saved) -> T) -> Result<(T, Saved)> {
    let _guard = LOCK.lock_safe();
    let mut saved = load(state)?;
    let out = f(&mut saved);
    state.save_sealed(&store::mentions_path(&state.dir), AAD, &saved)?;
    Ok((out, saved))
}

#[tauri::command(async)]
pub fn mention_read(
    state: State<'_, AppState>,
    unread: State<'_, MentionsUnread>,
    ids: Vec<String>,
    read: bool,
) -> Result<u32> {
    state.touch();
    let (_, saved) = update(&state, |s| s.mark(&ids, read, now_ms()))?;
    Ok(unread.recount(&saved))
}

#[tauri::command(async)]
pub fn mention_mute_thread(
    state: State<'_, AppState>,
    unread: State<'_, MentionsUnread>,
    url: String,
    title: String,
    muted: bool,
) -> Result<u32> {
    state.touch();
    let (_, saved) = update(&state, |s| s.mute_thread(&url, &title, muted))?;
    Ok(unread.recount(&saved))
}

#[tauri::command(async)]
pub fn mention_mute_author(
    state: State<'_, AppState>,
    unread: State<'_, MentionsUnread>,
    login: String,
    muted: bool,
) -> Result<u32> {
    state.touch();
    let (_, saved) = update(&state, |s| s.mute_author(&login, muted))?;
    Ok(unread.recount(&saved))
}

#[tauri::command]
pub fn mentions_unread(unread: State<'_, MentionsUnread>) -> u32 {
    unread.count()
}

#[cfg(test)]
#[path = "mentions_state_tests.rs"]
mod tests;
