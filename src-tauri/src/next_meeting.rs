//! Which upcoming event the tray "entrar" item and the join shortcut point at.
use time::format_description::well_known::Rfc3339;

use crate::calendar::AgendaItem;

/// First item, in the API's own start-time order, that isn't all-day, carries a Meet link and
/// hasn't ended yet. Google already orders the window we fetch, so this is a single scan.
pub fn next_with_meet(items: &[AgendaItem], now_ms: i64) -> Option<&AgendaItem> {
    items.iter().find(|e| !e.all_day && !e.meet.is_empty() && ends_after(e, now_ms))
}

fn ends_after(e: &AgendaItem, now_ms: i64) -> bool {
    time::OffsetDateTime::parse(&e.end, &Rfc3339).map(|t| t.unix_timestamp() * 1000 > now_ms).unwrap_or(false)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn event(id: &str, end: &str, meet: &str, all_day: bool) -> AgendaItem {
        AgendaItem { id: id.into(), end: end.into(), meet: meet.into(), all_day, ..Default::default() }
    }

    const NOW: i64 = 1_789_700_400_000; // 2026-09-18 03:00 UTC

    #[test]
    fn picks_the_first_upcoming_event_with_a_meet_link() {
        let items = [
            event("no-meet", "2026-09-18T04:00:00Z", "", false),
            event("has-meet", "2026-09-18T04:30:00Z", "https://meet.google.com/abc", false),
        ];
        assert_eq!(next_with_meet(&items, NOW).map(|e| e.id.as_str()), Some("has-meet"));
    }

    #[test]
    fn skips_an_event_that_already_ended() {
        let items = [event("past", "2026-09-18T02:00:00Z", "https://meet.google.com/abc", false)];
        assert_eq!(next_with_meet(&items, NOW), None);
    }

    #[test]
    fn skips_an_all_day_event_even_with_a_meet_link() {
        let items = [event("all-day", "2026-09-19T00:00:00Z", "https://meet.google.com/abc", true)];
        assert_eq!(next_with_meet(&items, NOW), None);
    }

    #[test]
    fn an_unparsable_end_is_treated_as_already_over() {
        let items = [event("bad-date", "not-a-date", "https://meet.google.com/abc", false)];
        assert_eq!(next_with_meet(&items, NOW), None);
    }

    #[test]
    fn empty_agenda_has_no_next_meeting() {
        assert_eq!(next_with_meet(&[], NOW), None);
    }
}
