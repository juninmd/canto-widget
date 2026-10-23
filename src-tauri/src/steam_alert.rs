//! Opt-in OS notifications for the Steam tab: a wishlist game on sale at 75% or more, and a new update
//! for a game installed here or played lately. Rung from Rust so a hidden webview still gets them, and
//! only while the vault is open: what was announced is sealed. Off by default, like the activity log.
//! What to ring about is decided in `steam_watch.rs`.
use std::collections::HashMap;
use std::sync::Mutex;
use std::time::{Duration, Instant};

use tauri::{AppHandle, Manager};

use crate::error::{AppError, Result};
use crate::model::now_ms;
use crate::steam::{region_of, SteamConfig};
use crate::steam_feed as feed;
use crate::steam_watch::{deal_message, hot_deals, new_updates, summary_message, update_message, SteamWatch, BURST};
use crate::store;
use crate::vault::AppState;

/// The sealed file holding the choice and the last prices seen.
pub const AAD: &[u8] = b"canto.steam-deals.v1";
/// Short, so a scan happens soon after an unlock; the wishlist itself is read every `CHECK_MS`.
const POLL: Duration = Duration::from_secs(60);
pub const CHECK_MS: i64 = 30 * 60_000;
/// After a failure with no answer (offline), so the watcher doesn't retry every minute.
const RETRY: Duration = Duration::from_secs(15 * 60);

#[derive(Default)]
struct Inner {
    watch: Option<SteamWatch>,
    checked_at: i64,
}

/// The RAM copy of the sealed state plus when the wishlist was last read. `None` while locked, so no
/// prices linger; the file is read again on the next unlock.
#[derive(Default)]
pub struct SteamAlerts(Mutex<Inner>);

impl SteamAlerts {
    /// Drops the RAM copy. Also called on every locked tick, so nothing lingers; the timer restarts
    /// with it, which is what makes an unlock look at the prices again.
    pub fn forget(&self) {
        *self.0.lock().unwrap() = Inner::default();
    }

    fn with<T>(&self, state: &AppState, f: impl FnOnce(&mut SteamWatch) -> T) -> Result<T> {
        let mut inner = self.0.lock().unwrap();
        if !state.is_unlocked() {
            // The key that opens the file is gone, so nothing of it may stay in RAM either.
            *inner = Inner::default();
            return Err(AppError::Locked);
        }
        if inner.watch.is_none() {
            let path = store::steam_deals_path(&state.dir);
            // An unreadable file is a lost baseline, not a reason to stop: the next scan rebuilds it.
            inner.watch = Some(state.sealed::<SteamWatch>(&path, AAD).ok().flatten().unwrap_or_default());
        }
        Ok(f(inner.watch.as_mut().expect("just loaded")))
    }

    pub fn watching(&self, state: &AppState) -> bool {
        self.with(state, |watch| watch.watching).unwrap_or(false)
    }

    pub fn set_watching(&self, state: &AppState, on: bool) -> Result<()> {
        self.with(state, |watch| watch.watching = on)?;
        self.flush(state)
    }

    fn flush(&self, state: &AppState) -> Result<()> {
        let inner = self.0.lock().unwrap();
        match inner.watch.as_ref() {
            Some(watch) => state.save_sealed(&store::steam_deals_path(&state.dir), AAD, watch),
            None => Ok(()),
        }
    }

    /// The first tick after an unlock, then one scan every `CHECK_MS`.
    fn due(&self, now: i64) -> bool {
        let inner = self.0.lock().unwrap();
        inner.checked_at == 0 || now - inner.checked_at >= CHECK_MS
    }

    fn checked(&self, now: i64) {
        self.0.lock().unwrap().checked_at = now;
    }

    /// Whether the alerts are on right now. The switch is the user's and can move while the wishlist
    /// is being fetched, so the scan re-reads it before ringing.
    fn on(&self) -> bool {
        self.0.lock().unwrap().watch.as_ref().is_some_and(|watch| watch.watching)
    }

    /// When the updates were last marked as read (ms), for the "new" dots in the pane.
    pub fn news_read_at(&self, state: &AppState) -> i64 {
        self.with(state, |watch| watch.news_read_at).unwrap_or(0)
    }

    pub fn mark_news_read(&self, state: &AppState, now: i64) -> Result<()> {
        self.with(state, |watch| watch.news_read_at = now)?;
        self.flush(state)
    }

    /// One scan: hot sales on the wishlist, then updates of the games at hand. Answers whether the
    /// store answered at all, so a failure only pushes the next try back.
    fn scan(&self, app: &AppHandle, state: &AppState, cfg: &SteamConfig) -> bool {
        let region = region_of(cfg);
        let Ok(ids) = feed::wishlist(&cfg.steamid) else { return false };
        let Ok(prices) = feed::prices(&ids, &region) else { return false };
        let current = self.0.lock().unwrap().watch.clone().unwrap_or_default();
        let (ring, next) = hot_deals(&current, &prices, region.code, &cfg.steamid);
        if next.hot != current.hot || next.region != current.region || next.steamid != current.steamid {
            let written = self.with(state, |watch| {
                watch.region = next.region;
                watch.steamid = next.steamid;
                watch.hot = next.hot;
            });
            let _ = written.and_then(|()| self.flush(state));
        }
        let mut toasts: Vec<(String, String)> = Vec::new();
        if !ring.is_empty() {
            let names = feed::basics(&ring, &region).unwrap_or_default();
            for id in &ring {
                let name = names.get(id).map(|(name, _)| name.clone()).unwrap_or_else(|| format!("#{id}"));
                toasts.push(deal_message(&name, &prices[id]));
            }
        }
        toasts.extend(self.scan_news(state, cfg));
        if self.on() {
            ring_all(app, &toasts);
        }
        true
    }

    /// The newest update of every game installed here or played in the last two weeks.
    fn scan_news(&self, state: &AppState, cfg: &SteamConfig) -> Vec<(String, String)> {
        let games = crate::cmd_steam_more::news_games(cfg);
        let Ok(items) = feed::news(&games) else { return Vec::new() };
        let mut latest: HashMap<u32, String> = HashMap::new();
        let mut titles: HashMap<u32, (String, String)> = HashMap::new();
        // Items come newest first per game, so the first one seen is that game's newest.
        for item in items {
            if let std::collections::hash_map::Entry::Vacant(slot) = latest.entry(item.appid) {
                slot.insert(item.gid.clone());
                titles.insert(item.appid, (item.game.clone(), item.title.clone()));
            }
        }
        let seen = self.0.lock().unwrap().watch.as_ref().map(|w| w.news.clone()).unwrap_or_default();
        let (ring, next) = new_updates(&seen, &latest);
        if next != seen {
            let _ = self.with(state, |watch| watch.news = next).and_then(|()| self.flush(state));
        }
        ring.iter().filter_map(|id| titles.get(id)).map(|(game, title)| update_message(game, title)).collect()
    }
}

/// A few toasts one by one, the rest folded into a summary, so a big sale day is not a burst.
fn ring_all(app: &AppHandle, toasts: &[(String, String)]) {
    for (title, body) in toasts.iter().take(BURST) {
        crate::notification::notify_os(app, title, body);
    }
    if toasts.len() > BURST {
        let (title, body) = summary_message(toasts.len() - BURST);
        crate::notification::notify_os(app, &title, &body);
    }
}

/// The switch in the tab. The choice outlives a disconnection, like the storefront.
#[tauri::command(async)]
pub fn steam_watch_set(app: AppHandle, enabled: bool) -> Result<bool> {
    let state = app.state::<AppState>();
    if !state.is_unlocked() {
        return Err(AppError::Locked);
    }
    crate::cmd_steam::connected(&state)?;
    let alerts = app.state::<SteamAlerts>();
    alerts.set_watching(&state, enabled)?;
    state.touch();
    Ok(enabled)
}

pub fn watch(app: AppHandle) {
    std::thread::spawn(move || {
        let mut failed: Option<Instant> = None;
        loop {
            std::thread::sleep(POLL);
            let (Some(state), Some(alerts)) = (app.try_state::<AppState>(), app.try_state::<SteamAlerts>()) else {
                continue;
            };
            if !state.is_unlocked() {
                alerts.forget();
                continue;
            }
            if failed.is_some_and(|since| since.elapsed() < RETRY) {
                continue;
            }
            // No `touch()`: a background read must not keep the vault from auto-locking.
            let Ok(Some(cfg)) = state.steam_config() else { continue };
            if cfg.steamid.is_empty() || !alerts.watching(&state) || !alerts.due(now_ms()) {
                continue;
            }
            let lock = app.state::<crate::cmd_steam::SteamLock>();
            let _guard = lock.0.lock().unwrap();
            if alerts.scan(&app, &state, &cfg) {
                failed = None;
                alerts.checked(now_ms());
            } else {
                failed = Some(Instant::now());
            }
        }
    });
}

#[cfg(test)]
#[path = "steam_alert_tests.rs"]
mod tests;
