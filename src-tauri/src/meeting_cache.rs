//! The meeting watcher's last Calendar read, shared with the tray: one request every 3 minutes feeds both,
//! where the tray used to send its own every 90 s for the same events.
use std::sync::Mutex;

use crate::calendar::AgendaItem;
use crate::next_meeting;

#[derive(Default)]
pub struct Upcoming(Mutex<Vec<AgendaItem>>);

impl Upcoming {
    /// Called once per watcher step. The fetched list is kept whole, so a meeting already under way still offers
    /// "Entrar" until it ends; a lock empties it, since the tray shows nothing then and full events stay off memory.
    pub fn publish(&self, fresh: Option<&[AgendaItem]>, locked: bool) {
        let mut items = self.0.lock().unwrap();
        if locked {
            items.clear();
        } else if let Some(fresh) = fresh {
            *items = fresh.to_vec();
        }
    }

    pub fn next_with_meet(&self, now_ms: i64) -> Option<AgendaItem> {
        next_meeting::next_with_meet(&self.0.lock().unwrap(), now_ms).cloned()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const NOW: i64 = 1_789_700_400_000; // 2026-09-18T03:00:00Z

    fn meet(id: &str, end: &str) -> AgendaItem {
        AgendaItem { id: id.into(), end: end.into(), meet: "https://meet.google.com/abc".into(), ..Default::default() }
    }

    #[test]
    fn the_tray_reads_the_watchers_events_and_keeps_them_between_fetches() {
        let up = Upcoming::default();
        assert!(up.next_with_meet(NOW).is_none());
        up.publish(Some(&[meet("ongoing", "2026-09-18T03:20:00Z"), meet("later", "2026-09-18T05:00:00Z")]), false);
        assert_eq!(up.next_with_meet(NOW).unwrap().id, "ongoing", "a meeting under way can still be joined");
        up.publish(None, false);
        assert_eq!(up.next_with_meet(NOW + 30 * 60_000).unwrap().id, "later", "no fetch this step keeps the list");
    }

    #[test]
    fn a_lock_empties_it() {
        let up = Upcoming::default();
        up.publish(Some(&[meet("a", "2026-09-18T05:00:00Z")]), false);
        up.publish(None, true);
        assert!(up.next_with_meet(NOW).is_none());
    }

    #[test]
    fn the_tray_sends_no_calendar_request_of_its_own() {
        let tray = include_str!("tray_live.rs");
        assert!(!tray.contains("cmd_extras::agenda"), "the watcher's read is enough");
        let watcher = include_str!("meeting_alert.rs");
        assert!(watcher.contains("Upcoming>().publish("), "the watcher must share what it fetched");
    }
}
