//! Alerts that ring while another is on screen wait here in arrival order instead of replacing it.
use std::collections::VecDeque;
use std::sync::Mutex;

use crate::calendar::AgendaItem;

/// Bounds a backlog built up over a long absence; the oldest waiting alert is the least useful one.
pub const MAX_PENDING: usize = 20;

#[derive(Default)]
pub struct AlertQueue(pub Mutex<VecDeque<AgendaItem>>);

/// Shows `event` when nothing is on screen, otherwise queues it; true when it became the current alert.
/// An alert already shown or waiting (a snooze firing twice, the UI and the watcher) isn't queued again.
pub fn push(current: &mut Option<AgendaItem>, pending: &mut VecDeque<AgendaItem>, event: AgendaItem) -> bool {
    let Some(shown) = current else {
        *current = Some(event);
        return true;
    };
    if shown.id == event.id {
        *shown = event;
        return false;
    }
    if let Some(waiting) = pending.iter_mut().find(|e| e.id == event.id) {
        *waiting = event;
        return false;
    }
    if pending.len() >= MAX_PENDING {
        pending.pop_front();
    }
    pending.push_back(event);
    false
}

/// Drops the current alert and promotes the next one; returns the dropped alert and whether a new one is shown.
pub fn advance(current: &mut Option<AgendaItem>, pending: &mut VecDeque<AgendaItem>) -> (Option<AgendaItem>, bool) {
    let dropped = current.take();
    *current = pending.pop_front();
    (dropped, current.is_some())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn event(id: &str) -> AgendaItem {
        AgendaItem { id: id.into(), title: id.into(), ..Default::default() }
    }

    fn ids(pending: &VecDeque<AgendaItem>) -> Vec<&str> {
        pending.iter().map(|e| e.id.as_str()).collect()
    }

    #[test]
    fn a_second_alert_waits_instead_of_replacing_the_first() {
        let (mut current, mut pending) = (None, VecDeque::new());
        assert!(push(&mut current, &mut pending, event("a")));
        assert!(!push(&mut current, &mut pending, event("b")));
        assert!(!push(&mut current, &mut pending, event("c")));
        assert_eq!(current.as_ref().unwrap().id, "a");
        assert_eq!(ids(&pending), ["b", "c"]);
    }

    #[test]
    fn closing_shows_the_next_in_arrival_order() {
        let (mut current, mut pending) = (None, VecDeque::new());
        for id in ["a", "b", "c"] {
            push(&mut current, &mut pending, event(id));
        }
        let (dropped, shown) = advance(&mut current, &mut pending);
        assert_eq!((dropped.unwrap().id.as_str(), shown), ("a", true));
        assert_eq!(current.as_ref().unwrap().id, "b");
        advance(&mut current, &mut pending);
        let (dropped, shown) = advance(&mut current, &mut pending);
        assert_eq!((dropped.unwrap().id.as_str(), shown), ("c", false));
        assert!(current.is_none());
        let (dropped, shown) = advance(&mut current, &mut pending);
        assert!(dropped.is_none() && !shown);
    }

    #[test]
    fn the_same_alert_is_not_queued_twice() {
        let (mut current, mut pending) = (None, VecDeque::new());
        push(&mut current, &mut pending, event("a"));
        push(&mut current, &mut pending, event("b"));
        assert!(!push(&mut current, &mut pending, event("a")));
        assert!(!push(&mut current, &mut pending, event("b")));
        assert_eq!(ids(&pending), ["b"]);
    }

    #[test]
    fn the_backlog_is_bounded_dropping_the_oldest() {
        let (mut current, mut pending) = (None, VecDeque::new());
        for i in 0..=MAX_PENDING + 1 {
            push(&mut current, &mut pending, event(&i.to_string()));
        }
        assert_eq!(pending.len(), MAX_PENDING);
        assert_eq!(pending.front().unwrap().id, "2");
    }
}
