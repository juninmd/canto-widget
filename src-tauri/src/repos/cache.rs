//! Repository lists and contribution calendars kept in RAM, like the issue lists: a second look costs no API call.
use std::collections::{BTreeMap, HashMap};

use serde::{Deserialize, Serialize};
use std::sync::Mutex;

use crate::error::{AppError, Result};
use crate::repos::{Contributions, Readme, Repo, RepoPage};
use crate::resilient::LockExt;

/// Repositories rarely change; the calendar changes once a day. "atualizar" bypasses it.
pub const TTL_MS: i64 = 10 * 60_000;
const MAX_ENTRIES: usize = 16;
/// READMEs are read on demand and a repository's changes rarely; a few dozen stay in RAM.
const README_TTL_MS: i64 = 30 * 60_000;
const README_ENTRIES: usize = 48;

/// A cached value that knows how to carry its freshness to the UI.
pub trait Stamped: Clone {
    fn stamp(self, fetched_at: i64, limited_until: Option<i64>) -> Self;
}

impl Stamped for Readme {
    fn stamp(self, fetched_at: i64, limited_until: Option<i64>) -> Self {
        Readme { fetched_at, limited_until, ..self }
    }
}

impl Stamped for Contributions {
    fn stamp(self, fetched_at: i64, limited_until: Option<i64>) -> Self {
        Contributions { fetched_at, limited_until, ..self }
    }
}

struct Inner<T> {
    entries: HashMap<String, (T, i64)>,
    /// Bumped by forget/clear: a reply that left before a disconnect or lock must not land afterwards.
    generation: u64,
}

pub struct Memo<T: Stamped> {
    inner: Mutex<Inner<T>>,
    ttl: i64,
    cap: usize,
}

impl<T: Stamped> Default for Memo<T> {
    fn default() -> Self {
        Memo::with(TTL_MS, MAX_ENTRIES)
    }
}

impl<T: Stamped> Memo<T> {
    pub fn with(ttl: i64, cap: usize) -> Self {
        Memo { inner: Mutex::new(Inner { entries: HashMap::new(), generation: 0 }), ttl, cap }
    }

    /// `key` is `forge|what`. A rate limit serves the last copy when there is one.
    pub fn get(&self, key: &str, force: bool, now: i64, fetch: impl FnOnce() -> Result<T>) -> Result<T> {
        let generation = {
            let g = self.inner.lock_safe();
            if let Some((v, at)) = g.entries.get(key).filter(|(_, at)| !force && now - at < self.ttl) {
                return Ok(v.clone().stamp(*at, None));
            }
            g.generation
        };
        match fetch() {
            Ok(v) => {
                let mut g = self.inner.lock_safe();
                if g.generation == generation {
                    g.entries.insert(key.to_string(), (v.clone(), now));
                    while g.entries.len() > self.cap {
                        let Some(old) = g.entries.iter().min_by_key(|(_, (_, at))| *at).map(|(k, _)| k.clone()) else {
                            break;
                        };
                        g.entries.remove(&old);
                    }
                }
                Ok(v.stamp(now, None))
            }
            Err(AppError::RateLimited { message, reset_at }) => {
                let g = self.inner.lock_safe();
                match g.entries.get(key).filter(|_| g.generation == generation) {
                    Some((v, at)) => Ok(v.clone().stamp(*at, Some(reset_at))),
                    None => Err(AppError::RateLimited { message, reset_at }),
                }
            }
            Err(e) => Err(e),
        }
    }

    pub fn forget(&self, forge: &str) {
        let prefix = format!("{forge}|");
        let mut g = self.inner.lock_safe();
        g.entries.retain(|k, _| !k.starts_with(&prefix));
        g.generation += 1;
    }

    pub fn clear(&self) {
        let mut g = self.inner.lock_safe();
        g.entries.clear();
        g.generation += 1;
    }
}

/// What one page of repositories looked like when it left the forge. `etag` lets the next look ask "changed?"
/// and get an empty 304 (which GitHub doesn't count against the rate limit).
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
pub struct CachedPage {
    pub repos: Vec<Repo>,
    pub has_next: bool,
    pub etag: String,
    pub fetched_at: i64,
}

/// What a fetch brings back for a page.
pub enum Fetched {
    NotModified,
    Page { repos: Vec<Repo>, has_next: bool, etag: String },
}

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct ForgePages {
    /// Who the pages belong to (login, or instance + user): another account never sees them.
    pub owner: String,
    pub pages: BTreeMap<u32, CachedPage>,
}

/// The sealed file: every forge's pages.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Saved {
    pub forges: HashMap<String, ForgePages>,
}

#[derive(Default)]
struct PagesInner {
    forges: HashMap<String, ForgePages>,
    /// The disk copy was read this session (a lock resets it: the plaintext leaves RAM).
    hydrated: bool,
    generation: u64,
}

/// Repository pages in RAM, seeded from the sealed disk copy and revalidated with ETags.
#[derive(Default)]
pub struct Pages {
    inner: Mutex<PagesInner>,
}

fn view(p: &CachedPage, page: u32, limited_until: Option<i64>) -> RepoPage {
    RepoPage {
        page,
        repos: p.repos.clone(),
        has_next: p.has_next,
        fetched_at: p.fetched_at,
        limited_until,
        ..Default::default()
    }
}

impl Pages {
    /// Loads the disk copy once per session; a failure to read it only means starting empty.
    pub fn hydrate(&self, load: impl FnOnce() -> Option<Saved>) {
        let mut g = self.inner.lock_safe();
        if g.hydrated {
            return;
        }
        g.hydrated = true;
        if let Some(saved) = load() {
            g.forges = saved.forges;
        }
    }

    /// The pages already held for `owner`, contiguous from page 1: what the UI paints before any request.
    pub fn cached(&self, forge: &str, owner: &str) -> Vec<RepoPage> {
        let g = self.inner.lock_safe();
        let Some(f) = g.forges.get(forge).filter(|f| f.owner == owner) else { return Vec::new() };
        let mut out = Vec::new();
        for (n, p) in &f.pages {
            if *n != out.len() as u32 + 1 {
                break;
            }
            out.push(view(p, *n, None));
        }
        out
    }

    /// One page: fresh enough is served as is; otherwise it is revalidated with the stored ETag. A rate limit serves
    /// the held copy when there is one. The `bool` says the page changed, i.e. the disk copy is worth rewriting.
    pub fn get(
        &self,
        forge: &str,
        owner: &str,
        page: u32,
        force: bool,
        now: i64,
        fetch: impl FnOnce(Option<&str>) -> Result<Fetched>,
    ) -> Result<(RepoPage, bool)> {
        let (held, generation) = {
            let mut g = self.inner.lock_safe();
            if g.forges.get(forge).is_some_and(|f| f.owner != owner) {
                g.forges.remove(forge);
            }
            let held = g.forges.get(forge).and_then(|f| f.pages.get(&page)).cloned();
            if let Some(p) = held.as_ref().filter(|p| !force && now - p.fetched_at < TTL_MS) {
                return Ok((view(p, page, None), false));
            }
            (held, g.generation)
        };
        let etag = held.as_ref().map(|p| p.etag.as_str()).filter(|e| !e.is_empty());
        match fetch(etag) {
            Ok(Fetched::NotModified) => {
                let Some(mut p) = held else {
                    return Err(AppError::Config("o GitHub/GitLab respondeu 'não modificado' sem cópia local".into()));
                };
                p.fetched_at = now;
                self.put(forge, owner, page, p.clone(), generation);
                Ok((RepoPage { revalidated: true, ..view(&p, page, None) }, true))
            }
            Ok(Fetched::Page { repos, has_next, etag }) => {
                let p = CachedPage { repos, has_next, etag, fetched_at: now };
                self.put(forge, owner, page, p.clone(), generation);
                Ok((view(&p, page, None), true))
            }
            Err(AppError::RateLimited { message, reset_at }) => match held {
                Some(p) => Ok((view(&p, page, Some(reset_at)), false)),
                None => Err(AppError::RateLimited { message, reset_at }),
            },
            Err(e) => Err(e),
        }
    }

    fn put(&self, forge: &str, owner: &str, page: u32, p: CachedPage, generation: u64) {
        let mut g = self.inner.lock_safe();
        if g.generation != generation {
            return;
        }
        let f = g.forges.entry(forge.to_string()).or_default();
        f.owner = owner.to_string();
        // The last page ends the list: anything past it is from a time the list was longer.
        if !p.has_next {
            f.pages.retain(|n, _| *n <= page);
        }
        f.pages.insert(page, p);
    }

    pub fn snapshot(&self) -> Saved {
        Saved { forges: self.inner.lock_safe().forges.clone() }
    }

    pub fn forget(&self, forge: &str) {
        let mut g = self.inner.lock_safe();
        g.forges.remove(forge);
        g.generation += 1;
    }

    /// Lock: nothing stays in RAM, and the next unlock reads the sealed copy again.
    pub fn clear(&self) {
        let mut g = self.inner.lock_safe();
        *g = PagesInner { generation: g.generation + 1, ..Default::default() };
    }
}

/// Group and repository icons as `data:` URLs (the CSP blocks remote images), by source URL.
#[derive(Default)]
pub struct Avatars(Mutex<HashMap<String, String>>);

/// Group icons repeat across a whole organization; a few hundred distinct ones is already a lot of scrolling.
const AVATAR_ENTRIES: usize = 400;

impl Avatars {
    pub fn get(&self, urls: &[String]) -> HashMap<String, String> {
        let known = self.0.lock_safe();
        urls.iter().filter_map(|u| Some((u.clone(), known.get(u)?.clone()))).collect()
    }

    pub fn put(&self, found: Vec<(String, String)>) {
        let mut known = self.0.lock_safe();
        if known.len() + found.len() > AVATAR_ENTRIES {
            known.clear();
        }
        known.extend(found);
    }

    pub fn clear(&self) {
        self.0.lock_safe().clear();
    }
}

/// The subtab's caches, dropped together on disconnect or lock.
pub struct RepoCache {
    pub pages: Pages,
    pub calendars: Memo<Contributions>,
    pub readmes: Memo<Readme>,
    pub avatars: Avatars,
}

impl Default for RepoCache {
    fn default() -> Self {
        RepoCache {
            pages: Pages::default(),
            calendars: Memo::default(),
            readmes: Memo::with(README_TTL_MS, README_ENTRIES),
            avatars: Avatars::default(),
        }
    }
}

impl RepoCache {
    pub fn forget(&self, forge: &str) {
        self.pages.forget(forge);
        self.calendars.forget(forge);
        self.readmes.forget(forge);
    }

    pub fn clear(&self) {
        self.pages.clear();
        self.calendars.clear();
        self.readmes.clear();
        self.avatars.clear();
    }
}
