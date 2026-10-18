//! Opt-in OS notifications when a game on the wishlist gets cheaper. Rung from Rust so a hidden
//! webview still gets them, and only while the vault is open: the last prices are sealed. Off by
//! default, like the activity log.
use std::collections::HashMap;
use std::sync::Mutex;
use std::time::{Duration, Instant};

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

use crate::error::{AppError, Result};
use crate::model::now_ms;
use crate::steam::{region_of, SteamConfig};
use crate::steam_feed as feed;
use crate::steam_parse::Price;
use crate::steam_region::Region;
use crate::store;
use crate::vault::AppState;

/// The sealed file holding the choice and the last prices seen.
pub const AAD: &[u8] = b"canto.steam-deals.v1";
/// Short, so a scan happens soon after an unlock; the wishlist itself is read every `CHECK_MS`.
const POLL: Duration = Duration::from_secs(60);
pub const CHECK_MS: i64 = 30 * 60_000;
/// After a failure with no answer (offline), so the watcher doesn't retry every minute.
const RETRY: Duration = Duration::from_secs(15 * 60);

/// Deliberately not `Debug`: it travels sealed.
#[derive(Default, Clone, Serialize, Deserialize)]
pub struct SteamWatch {
    #[serde(default)]
    pub watching: bool,
    /// The last price seen for each wishlist app, in cents: what a later price is compared against.
    #[serde(default)]
    pub prices: HashMap<u32, i64>,
}

/// One game that got cheaper since the last scan.
#[derive(Debug, Clone, PartialEq)]
pub struct Drop {
    pub appid: u32,
    pub was: i64,
    pub now: i64,
}

/// What got cheaper since the last scan, and the prices to remember next time. The first scan only
/// records: nothing rings for a price the game already had before the alerts were turned on.
pub fn drops(seen: &HashMap<u32, i64>, prices: &HashMap<u32, Price>) -> (Vec<Drop>, HashMap<u32, i64>) {
    let mut fresh = HashMap::with_capacity(prices.len());
    let mut fell = Vec::new();
    for (id, price) in prices {
        fresh.insert(*id, price.final_cents);
        if let Some(was) = seen.get(id).copied().filter(|was| price.final_cents < *was) {
            fell.push(Drop { appid: *id, was, now: price.final_cents });
        }
    }
    // The biggest fall leads; the appid last so the order never flips between runs.
    fell.sort_by(|a, b| (b.was - b.now).cmp(&(a.was - a.now)).then_with(|| a.appid.cmp(&b.appid)));
    (fell, fresh)
}

/// The toast for one game: the store's own price string, so no money is reformatted here. The
/// title carries the wording, which Rust translates; a game has no wording to translate.
pub fn message(name: &str, price: &Price) -> (String, String) {
    let title = crate::lang::tr("Ficou mais barato na lista de desejos", "Cheaper on your wishlist");
    let body = if price.discount > 0 {
        format!("{name} · -{}% · {}", price.discount, price.final_formatted)
    } else {
        format!("{name} · {}", price.final_formatted)
    };
    (title.to_string(), body)
}

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
    pub fn forget(&self) {
        *self.0.lock().unwrap() = Inner::default();
    }

    fn with<T>(&self, state: &AppState, f: impl FnOnce(&mut SteamWatch) -> T) -> Result<T> {
        let mut inner = self.0.lock().unwrap();
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

    /// One scan: rings for what got cheaper and remembers the prices it saw. Answers whether the
    /// store answered at all, so a failure only pushes the next try back.
    fn scan(&self, app: &AppHandle, state: &AppState, cfg: &SteamConfig) -> bool {
        let region = region_of(cfg);
        let Ok(ids) = feed::wishlist(&cfg.steamid) else { return false };
        let Ok(prices) = feed::prices(&ids, &region) else { return false };
        let seen = self.0.lock().unwrap().watch.as_ref().map(|w| w.prices.clone()).unwrap_or_default();
        let (fell, fresh) = drops(&seen, &prices);
        // Always keep the new prices: otherwise the next scan would ring for what this one saw.
        if fresh != seen {
            let _ = self.with(state, |watch| watch.prices = fresh).and_then(|()| self.flush(state));
        }
        if !fell.is_empty() {
            self.ring(app, &region, &fell, &prices);
        }
        true
    }

    /// A drop is rare, so one extra request per game to name it is still cheap.
    fn ring(&self, app: &AppHandle, region: &Region, fell: &[Drop], prices: &HashMap<u32, Price>) {
        let ids: Vec<u32> = fell.iter().map(|drop| drop.appid).collect();
        let names = feed::basics(&ids, region).unwrap_or_default();
        for drop in fell {
            let Some(price) = prices.get(&drop.appid) else { continue };
            let name =
                names.get(&drop.appid).map(|(name, _)| name.clone()).unwrap_or_else(|| format!("#{}", drop.appid));
            let (title, body) = message(&name, price);
            crate::notification::notify_os(app, &title, &body);
        }
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
