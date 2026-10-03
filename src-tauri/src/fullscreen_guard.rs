//! Holds alerts while a full-screen app (a game, a video, a presentation) is in front, and rings them when it
//! leaves. Whatever shows up over such an app can pull it out of full screen: a game minimizes the moment
//! something takes the foreground, and a toast can do the same. Windows says when it is busy (the same signal it
//! uses to hold its own notifications); other systems report nothing here, so alerts ring as before.
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::Duration;

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, State};

use crate::error::Result;

const FILE: &str = "avisos_tela_cheia.json";
const TICK: Duration = Duration::from_secs(2);

#[cfg(windows)]
#[link(name = "shell32")]
extern "system" {
    fn SHQueryUserNotificationState(state: *mut i32) -> i32;
}

/// `QUERY_USER_NOTIFICATION_STATE` as Windows reports it; `None` when it cannot tell (or on another OS).
#[cfg(windows)]
pub fn user_notification_state() -> Option<i32> {
    let mut state = 0i32;
    // SAFETY: the documented out-pointer to a 32-bit enum; shell32 is always loaded.
    let hr = unsafe { SHQueryUserNotificationState(&mut state) };
    (hr >= 0).then_some(state)
}

#[cfg(not(windows))]
pub fn user_notification_state() -> Option<i32> {
    None
}

/// 2 busy (a full-screen app), 3 running D3D full screen, 4 presentation mode, 7 a full-screen Store app.
/// Not present (1) and quiet time (6) are the user's own choices, and 5 accepts notifications.
pub fn busy(state: Option<i32>) -> bool {
    matches!(state, Some(2 | 3 | 4 | 7))
}

#[derive(Serialize, Deserialize)]
struct Saved {
    #[serde(default = "on")]
    enabled: bool,
}

fn on() -> bool {
    true
}

/// On by default: ringing over a game is the only behavior anyone would be surprised by.
pub struct FullscreenHold {
    path: PathBuf,
    enabled: AtomicBool,
    /// An alert arrived while holding and the pop-up has not rung yet.
    waiting: AtomicBool,
}

impl FullscreenHold {
    pub fn load(dir: &Path) -> Self {
        let path = dir.join(FILE);
        let saved: Option<Saved> = crate::store::read_json(&path).ok().flatten();
        Self { path, enabled: AtomicBool::new(saved.is_none_or(|s| s.enabled)), waiting: AtomicBool::new(false) }
    }

    pub fn enabled(&self) -> bool {
        self.enabled.load(Ordering::Relaxed)
    }

    fn set(&self, enabled: bool) -> Result<()> {
        crate::store::write_json_atomic(&self.path, &Saved { enabled })?;
        self.enabled.store(enabled, Ordering::Relaxed);
        Ok(())
    }
}

/// Whether anything that takes the foreground has to wait right now.
pub fn holding(app: &AppHandle) -> bool {
    app.try_state::<FullscreenHold>().is_some_and(|h| h.enabled() && busy(user_notification_state()))
}

/// For `open_alert`: `true` means the pop-up waits for the full-screen app to leave.
pub fn hold(app: &AppHandle) -> bool {
    let waiting = holding(app);
    if waiting {
        if let Some(h) = app.try_state::<FullscreenHold>() {
            h.waiting.store(true, Ordering::Relaxed);
        }
    }
    waiting
}

/// Rings once the way is clear. Pure so the rule is tested without a window or a game.
pub fn should_ring(waiting: bool, holding: bool, pending: usize) -> bool {
    waiting && !holding && pending > 0
}

pub fn watch(app: AppHandle) {
    std::thread::spawn(move || loop {
        std::thread::sleep(TICK);
        let Some(h) = app.try_state::<FullscreenHold>() else { continue };
        if !h.waiting.load(Ordering::Relaxed) || holding(&app) {
            continue;
        }
        h.waiting.store(false, Ordering::Relaxed);
        if should_ring(true, false, crate::window::alert_list(&app).len()) {
            let _ = crate::window::present_pending(&app);
        }
    });
}

#[tauri::command]
pub fn fullscreen_hold_get(hold: State<'_, FullscreenHold>) -> bool {
    hold.enabled()
}

#[tauri::command(async)]
pub fn fullscreen_hold_set(hold: State<'_, FullscreenHold>, enabled: bool) -> Result<bool> {
    hold.set(enabled)?;
    Ok(enabled)
}

#[cfg(test)]
#[path = "fullscreen_guard_tests.rs"]
mod tests;
