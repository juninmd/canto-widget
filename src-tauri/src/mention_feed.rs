//! The mentions subtab: where the user was @-mentioned, by whom, with a preview of the text and the author's photo.
use std::collections::HashMap;
use std::sync::{LazyLock, Mutex};

use serde::Serialize;

use crate::account;
use crate::calendar::Sender;
use crate::forge::{ForgeItem, ForgeList};
use crate::gitlab_todos::Mention;
use crate::mention_sender::{self, excerpt, trusted_github_avatar, trusted_gitlab_avatar, Mentioned};

const PREVIEW_CHARS: usize = 280;
/// Comment lookups at once; each one is up to three GitHub calls.
const THREADS: usize = 6;
/// Looked up comments and photos live in RAM only; cleared when they outgrow these so they cannot grow for ever.
const FOUND_MAX: usize = 300;
const AVATARS_MAX: usize = 100;

static FOUND: LazyLock<Mutex<HashMap<String, Mentioned>>> = LazyLock::new(Mutex::default);
static AVATARS: LazyLock<Mutex<HashMap<String, String>>> = LazyLock::new(Mutex::default);

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct MentionRow {
    pub id: String,
    pub title: String,
    /// `owner/repo#12`, `group/project`.
    pub reference: String,
    pub url: String,
    pub is_pr: bool,
    /// RFC 3339; when the thread moved (GitHub) or the mention happened (GitLab).
    pub at: String,
    /// `None` when the comment that mentions the user could not be found.
    pub sender: Option<Sender>,
    pub preview: String,
}

pub fn github_rows(items: &[ForgeItem], found: &HashMap<String, Mentioned>) -> Vec<MentionRow> {
    items
        .iter()
        .map(|i| {
            let m = found.get(&i.reference);
            MentionRow {
                id: format!("github:{}", i.reference),
                title: i.title.clone(),
                reference: i.reference.clone(),
                url: i.url.clone(),
                is_pr: i.is_pr,
                at: i.updated_at.clone(),
                sender: m.map(|m| m.sender.clone()),
                preview: m.map(|m| m.excerpt.clone()).unwrap_or_default(),
            }
        })
        .collect()
}

pub fn gitlab_rows(mentions: &[Mention], login: &str) -> Vec<MentionRow> {
    mentions
        .iter()
        .map(|m| MentionRow {
            id: format!("gitlab:{}", m.id),
            title: m.title.clone(),
            reference: m.project.clone(),
            url: m.url.clone(),
            is_pr: m.is_pr,
            at: m.at.clone(),
            sender: mention_sender::gitlab_sender(m),
            preview: excerpt(&m.body, login, PREVIEW_CHARS),
        })
        .collect()
}

/// The threads that mention the user and the ones that mention a team of theirs, each listed once.
pub fn with_teams(mut direct: ForgeList, teams: ForgeList) -> ForgeList {
    let seen: std::collections::HashSet<String> = direct.items.iter().map(|i| i.url.clone()).collect();
    let fresh: Vec<ForgeItem> = teams.items.into_iter().filter(|i| !seen.contains(&i.url)).collect();
    direct.total += fresh.len() as u64;
    direct.items.extend(fresh);
    direct
}

/// The comment behind each thread, looked up in parallel; a thread unchanged since the last lookup costs nothing.
pub fn github_found(token: &str, names: &[String], items: &[ForgeItem]) -> HashMap<String, Mentioned> {
    // The names are part of the key: switching team mentions on must not reuse a lookup made without them.
    let key = |i: &ForgeItem| format!("{}|{}|{}", i.reference, i.updated_at, names.len());
    let todo: Vec<&ForgeItem> = {
        let cache = FOUND.lock().unwrap_or_else(|e| e.into_inner());
        items.iter().filter(|i| !cache.contains_key(&key(i))).collect()
    };
    let looked: Vec<(String, Mentioned)> = std::thread::scope(|s| {
        let size = todo.len().div_ceil(THREADS).max(1);
        let handles: Vec<_> = todo
            .chunks(size)
            .map(|chunk| {
                s.spawn(move || {
                    chunk
                        .iter()
                        .filter_map(|i| Some((key(i), mention_sender::github_mention(token, i, names, PREVIEW_CHARS)?)))
                        .collect::<Vec<_>>()
                })
            })
            .collect();
        handles.into_iter().flat_map(|h| h.join().unwrap_or_default()).collect()
    });
    let mut cache = FOUND.lock().unwrap_or_else(|e| e.into_inner());
    if cache.len() + looked.len() > FOUND_MAX {
        cache.clear();
    }
    cache.extend(looked);
    items.iter().filter_map(|i| Some((i.reference.clone(), cache.get(&key(i))?.clone()))).collect()
}

/// Photos become `data:` URLs (the CSP allows no remote image) and are remembered per URL.
pub fn resolve_photos(rows: &mut [MentionRow], trusted: impl Fn(&str) -> bool) {
    let mut cache = AVATARS.lock().unwrap_or_else(|e| e.into_inner());
    if cache.len() > AVATARS_MAX {
        cache.clear();
    }
    mention_sender::resolve_avatars(
        rows.iter_mut().filter_map(|r| r.sender.as_mut()),
        &mut cache,
        trusted,
        account::download_image,
    );
}

pub fn github_photos(rows: &mut [MentionRow]) {
    resolve_photos(rows, trusted_github_avatar);
}

pub fn gitlab_photos(rows: &mut [MentionRow], base: &str) {
    resolve_photos(rows, |u| trusted_gitlab_avatar(u, base));
}

#[cfg(test)]
#[path = "mention_feed_tests.rs"]
mod tests;
