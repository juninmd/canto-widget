use super::*;

const NOW: i64 = 1_789_700_400_000; // 2026-09-18T03:00:00Z

fn ev(title: &str, start: &str, end: &str) -> AgendaItem {
    AgendaItem { id: title.into(), title: title.into(), start: start.into(), end: end.into(), ..Default::default() }
}

#[test]
fn the_label_has_title_clock_and_minutes_left() {
    let items = [ev("Daily", "2026-09-18T03:12:00Z", "2026-09-18T03:30:00Z")];
    let lines = upcoming(&items, NOW, 1);
    assert_eq!(label(&lines[0]), "Daily 03:12 · em 12 min");
}

#[test]
fn hours_and_an_event_under_way_read_naturally() {
    let items = [
        ev("Atual", "2026-09-18T02:30:00Z", "2026-09-18T03:30:00Z"),
        ev("Almoço", "2026-09-18T05:00:00Z", "2026-09-18T06:00:00Z"),
        ev("Review", "2026-09-18T04:30:00Z", "2026-09-18T05:00:00Z"),
    ];
    let lines = upcoming(&items, NOW, 3);
    assert_eq!(label(&lines[0]), "Atual · agora");
    assert_eq!(label(&lines[1]), "Almoço 05:00 · em 2 h");
    assert_eq!(label(&lines[2]), "Review 04:30 · em 1 h 30");
}

#[test]
fn all_day_declined_over_and_far_events_are_skipped() {
    let mut all_day = ev("Feriado", "2026-09-18", "2026-09-19");
    all_day.all_day = true;
    let mut declined = ev("Recusada", "2026-09-18T03:10:00Z", "2026-09-18T03:40:00Z");
    declined.response = "declined".into();
    let items = [
        all_day,
        declined,
        ev("Passou", "2026-09-18T01:00:00Z", "2026-09-18T02:00:00Z"),
        ev("Longe", "2026-09-20T03:00:00Z", "2026-09-20T04:00:00Z"),
        ev("Quebrada", "ontem", "hoje"),
    ];
    assert!(upcoming(&items, NOW, 3).is_empty());
}

#[test]
fn only_the_asked_count_is_kept() {
    let items = [
        ev("A", "2026-09-18T03:10:00Z", "2026-09-18T03:20:00Z"),
        ev("B", "2026-09-18T03:30:00Z", "2026-09-18T03:40:00Z"),
        ev("C", "2026-09-18T03:50:00Z", "2026-09-18T04:00:00Z"),
    ];
    assert_eq!(upcoming(&items, NOW, 2).len(), 2);
    assert_eq!(headline(&upcoming(&items, NOW, 3)).unwrap(), "A 03:10 · em 10 min (+2)");
    assert_eq!(headline(&[]), None);
}

#[test]
fn a_long_title_is_cut_and_the_tooltip_stays_under_the_windows_limit() {
    let long = "Planejamento trimestral de produto e engenharia com todos".to_string();
    let items: Vec<_> =
        (0..3).map(|i| ev(&format!("{long} {i}"), "2026-09-18T03:10:00Z", "2026-09-18T04:00:00Z")).collect();
    let lines = upcoming(&items, NOW, 3);
    assert!(label(&lines[0]).contains('…'));
    assert!(tooltip(&lines).chars().count() <= TOOLTIP_CHARS);
    assert!(tooltip(&lines).starts_with("Canto\n"));
    assert_eq!(tooltip(&[]), "Canto");
}
