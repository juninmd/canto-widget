//! Pop-up for each new invite waiting for an answer. The Agenda tab polls only what is on screen, so a
//! watcher reads the next weeks and rings once per event; what was seen lives in RAM only.
use std::collections::HashSet;
use std::time::Duration;

use tauri::{AppHandle, Manager};
use time::format_description::well_known::Rfc3339;

use crate::calendar::AgendaItem;
use crate::model::now_ms;
use crate::notification::INVITE_PREFIX;
use crate::vault::AppState;
use crate::window;

const TICK: Duration = Duration::from_secs(3 * 60);
const HORIZON_MS: i64 = 30 * 24 * 60 * 60 * 1000;
const MAX_EVENTS: usize = 200;
/// Bounds the set over a long session; losing it only risks ringing an invite that was already shown.
const MAX_SEEN: usize = 1000;

/// Invites not seen before. The first reading only learns what is pending: no burst of old invites at startup.
pub fn fresh<'a>(seen: Option<&HashSet<String>>, current: &'a [AgendaItem]) -> Vec<&'a AgendaItem> {
    let Some(seen) = seen else { return Vec::new() };
    current.iter().filter(|e| e.response == "needsAction" && !seen.contains(&e.id)).collect()
}

/// The alert for an invite: the event itself, under an id the UI recognizes (`alerts.ts` `INVITE_PREFIX`).
pub fn alert_for(e: &AgendaItem) -> AgendaItem {
    AgendaItem { id: format!("{INVITE_PREFIX}{}", e.id), ..e.clone() }
}

fn horizon() -> Option<(String, String)> {
    let at = |ms: i64| time::OffsetDateTime::from_unix_timestamp(ms.div_euclid(1000)).ok()?.format(&Rfc3339).ok();
    let now = now_ms();
    Some((at(now)?, at(now + HORIZON_MS)?))
}

pub fn watch(app: AppHandle) {
    crate::resilient::supervise("invites", move || {
        let mut seen: Option<(String, HashSet<String>)> = None;
        loop {
            let state = app.state::<AppState>();
            if let (Ok(token), Some((min, max))) = (crate::google::token::fresh(&state), horizon()) {
                let account = state.drive_config().ok().map(|c| c.email).unwrap_or_default();
                // A failed reading (offline, locked) keeps what was seen: no repeat when it comes back.
                if let Ok(events) = crate::calendar::events_all(&token, &min, &max, MAX_EVENTS) {
                    let prev = seen.as_ref().filter(|(a, _)| *a == account).map(|(_, s)| s);
                    for invite in fresh(prev, &events) {
                        let _ = window::open_alert(&app, alert_for(invite));
                    }
                    let mut known = prev.cloned().unwrap_or_default();
                    if known.len() >= MAX_SEEN {
                        known.clear();
                    }
                    known.extend(events.into_iter().filter(|e| e.response == "needsAction").map(|e| e.id));
                    seen = Some((account, known));
                }
            }
            std::thread::sleep(TICK);
        }
    });
}

#[cfg(test)]
mod tests {
    use super::*;

    fn event(id: &str, response: &str) -> AgendaItem {
        AgendaItem { id: id.into(), response: response.into(), ..Default::default() }
    }

    #[test]
    fn the_first_reading_only_learns_what_is_pending() {
        assert!(fresh(None, &[event("a", "needsAction")]).is_empty());
    }

    #[test]
    fn only_unanswered_invites_not_seen_before_ring() {
        let seen: HashSet<String> = ["a".to_string()].into();
        let now = [event("a", "needsAction"), event("b", "needsAction"), event("c", "accepted"), event("d", "")];
        let ids: Vec<&str> = fresh(Some(&seen), &now).iter().map(|e| e.id.as_str()).collect();
        assert_eq!(ids, vec!["b"]);
    }

    #[test]
    fn the_alert_keeps_the_event_under_the_invite_id() {
        let alert = alert_for(&AgendaItem { title: "Planning".into(), ..event("e1", "needsAction") });
        assert_eq!((alert.id.as_str(), alert.title.as_str()), ("invite:e1", "Planning"));
    }
}
