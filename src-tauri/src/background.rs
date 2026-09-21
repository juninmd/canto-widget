//! The widget's four always-on watchers: auto-lock, window-position autosave, daily backup and
//! synced-folder polling. Each runs on its own thread for as long as the app is open.
use std::path::PathBuf;
use std::time::Duration;
use tauri::{AppHandle, Manager};

use crate::vault::AppState;
use crate::{autolock, backup, sync, window_state};

/// Frozen event name: the frontend listens for this literal in `App.tsx`.
pub const AUTO_LOCK_EVENT: &str = "canto://auto-lock";

const IDLE_POLL: Duration = Duration::from_secs(20);
const WINDOW_STATE_POLL: Duration = Duration::from_secs(2);
const BACKUP_POLL: Duration = Duration::from_secs(30 * 60);
const SYNC_POLL: Duration = Duration::from_secs(5 * 60);

/// Starts all four watchers; called once from `setup()`.
pub fn start(app: AppHandle, dir: PathBuf) {
    watch_idle(app.clone());
    watch_window_state(app.clone(), dir.clone());
    watch_backup(dir);
    watch_sync(app);
}

/// Without this, an unlocked vault would survive any amount of time away from the machine.
fn watch_idle(app: AppHandle) {
    std::thread::spawn(move || loop {
        std::thread::sleep(IDLE_POLL);
        let Some(state) = app.try_state::<AppState>() else {
            continue;
        };
        let limit_ms = autolock::minutes(&state.dir) * 60_000;
        if state.lock_if_idle(limit_ms) {
            let _ = tauri::Emitter::emit(&app, AUTO_LOCK_EVENT, limit_ms / 60_000);
        }
    });
}

/// Position and size hit disk at most every 2s, not on every dragged pixel.
fn watch_window_state(app: AppHandle, dir: PathBuf) {
    std::thread::spawn(move || loop {
        std::thread::sleep(WINDOW_STATE_POLL);
        if let Err(e) = app.state::<window_state::WindowState>().save_if_dirty(&dir) {
            eprintln!("posicao da janela nao gravou: {e}");
        }
    });
}

/// Daily copy of the encrypted envelope; doesn't need the vault unlocked.
fn watch_backup(dir: PathBuf) {
    std::thread::spawn(move || loop {
        if let Err(e) = backup::daily(&dir, &backup::today_utc()) {
            eprintln!("backup diario falhou: {e}");
        }
        std::thread::sleep(BACKUP_POLL);
    });
}

/// Merges in whatever showed up in a synced folder; a no-op without one configured or while locked.
fn watch_sync(app: AppHandle) {
    std::thread::spawn(move || loop {
        std::thread::sleep(SYNC_POLL);
        let Some(state) = app.try_state::<AppState>() else {
            continue;
        };
        if let Err(e) = sync::poll_and_merge(&state) {
            eprintln!("sincronizacao automatica falhou: {e}");
        }
    });
}
