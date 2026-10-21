//! Opt-in OS notification for each new unread message Gmail marks as important. The choice lives next to the
//! vault (not secret); the messages are only held in RAM to tell new from already seen.
use std::collections::HashSet;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::Duration;

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, State};

use crate::error::Result;
use crate::gmail::Mail;
use crate::vault::AppState;

const TICK: Duration = Duration::from_secs(2 * 60);
const FILE: &str = "gmail_alertas.json";

#[derive(Default, Serialize, Deserialize)]
struct Saved {
    on: bool,
}

pub struct GmailAlerts {
    path: PathBuf,
    on: AtomicBool,
}

impl GmailAlerts {
    pub fn load(dir: &Path) -> Self {
        let saved: Saved = crate::store::read_json(&dir.join(FILE)).ok().flatten().unwrap_or_default();
        Self { path: dir.join(FILE), on: AtomicBool::new(saved.on) }
    }

    pub fn on(&self) -> bool {
        self.on.load(Ordering::Relaxed)
    }

    fn set(&self, on: bool) -> Result<bool> {
        crate::store::write_json_atomic(&self.path, &Saved { on })?;
        self.on.store(on, Ordering::Relaxed);
        Ok(on)
    }
}

/// Messages not seen on the previous reading. The first reading only learns the inbox: no burst of old mail.
pub fn fresh<'a>(seen: Option<&HashSet<String>>, current: &'a [Mail]) -> Vec<&'a Mail> {
    match seen {
        None => Vec::new(),
        Some(seen) => current.iter().filter(|m| !seen.contains(&m.id)).collect(),
    }
}

#[tauri::command]
pub fn gmail_alerts_get(alerts: State<'_, GmailAlerts>) -> bool {
    alerts.on()
}

#[tauri::command(async)]
pub fn gmail_alerts_set(alerts: State<'_, GmailAlerts>, on: bool) -> Result<bool> {
    alerts.set(on)
}

pub fn watch(app: AppHandle) {
    std::thread::spawn(move || {
        let mut seen: Option<HashSet<String>> = None;
        loop {
            if !app.state::<GmailAlerts>().on() {
                seen = None;
            } else if let Ok(token) = crate::google_token::fresh(&app.state::<AppState>()) {
                // A failed reading (locked vault, offline) keeps what was seen: no repeat when it comes back.
                if let Ok(summary) = crate::gmail::summary(&token) {
                    for mail in fresh(seen.as_ref(), &summary.important) {
                        let title = crate::lang::tr("E-mail importante", "Important email");
                        crate::notification::notify_os(&app, title, &format!("{}: {}", mail.from, mail.subject));
                    }
                    seen = Some(summary.important.into_iter().map(|m| m.id).collect());
                }
            }
            std::thread::sleep(TICK);
        }
    });
}

#[cfg(test)]
mod tests {
    use super::*;

    fn mail(id: &str) -> Mail {
        Mail { id: id.into(), ..Default::default() }
    }

    #[test]
    fn only_messages_after_the_first_reading_ring() {
        let inbox = [mail("a"), mail("b")];
        assert!(fresh(None, &inbox).is_empty(), "the first reading only learns the inbox");
        let seen: HashSet<String> = ["a".to_string()].into();
        let new: Vec<&str> = fresh(Some(&seen), &inbox).iter().map(|m| m.id.as_str()).collect();
        assert_eq!(new, ["b"]);
    }

    #[test]
    fn the_choice_survives_a_restart() {
        let dir = std::env::temp_dir().join(format!("canto-gmail-alerts-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        assert!(!GmailAlerts::load(&dir).on(), "off until the user turns it on");
        GmailAlerts::load(&dir).set(true).unwrap();
        assert!(GmailAlerts::load(&dir).on());
        std::fs::remove_dir_all(&dir).unwrap();
    }
}
