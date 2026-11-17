use super::*;

/// 2026-11-16 is a Monday. Offset -180 (UTC-3): 12:00 UTC is 09:00 local.
const MON_NOON_UTC: i64 = 1_794_830_400_000;
const HOUR: i64 = 3_600_000;

fn cfg() -> Config {
    Config {
        schedule: true,
        start_min: 9 * 60,
        end_min: 12 * 60,
        weekdays_only: true,
        in_meeting: false,
        offset_min: -180,
    }
}

fn meet(start: &str, end: &str, link: &str, all_day: bool) -> AgendaItem {
    AgendaItem {
        id: "e".into(),
        start: start.into(),
        end: end.into(),
        meet: link.into(),
        all_day,
        ..Default::default()
    }
}

fn tmpdir(name: &str) -> PathBuf {
    let dir = std::env::temp_dir().join(format!("canto-focus-{name}-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&dir);
    std::fs::create_dir_all(&dir).unwrap();
    dir
}

#[test]
fn the_schedule_follows_the_local_clock() {
    assert!(schedule_active(&cfg(), MON_NOON_UTC), "09:00 local is the start");
    assert!(schedule_active(&cfg(), MON_NOON_UTC + 2 * HOUR + 59 * 60_000));
    assert!(!schedule_active(&cfg(), MON_NOON_UTC + 3 * HOUR), "12:00 local is the end");
    assert!(!schedule_active(&cfg(), MON_NOON_UTC - 1), "08:59 local is before");
}

#[test]
fn a_disabled_schedule_never_silences() {
    assert!(!schedule_active(&Config { schedule: false, ..cfg() }, MON_NOON_UTC));
}

#[test]
fn weekends_are_skipped_only_when_asked() {
    let saturday = MON_NOON_UTC + 5 * 24 * HOUR;
    assert!(!schedule_active(&cfg(), saturday));
    assert!(schedule_active(&Config { weekdays_only: false, ..cfg() }, saturday));
}

#[test]
fn a_window_that_crosses_midnight_belongs_to_the_day_it_started() {
    let night = Config { start_min: 22 * 60, end_min: 6 * 60, ..cfg() };
    let fri_23 = MON_NOON_UTC + 4 * 24 * HOUR + 14 * HOUR; // Friday 23:00 local
    let sat_02 = fri_23 + 3 * HOUR; // Saturday 02:00 local, still Friday's window
    let sat_23 = fri_23 + 24 * HOUR; // Saturday 23:00 local, a weekend start
    assert!(schedule_active(&night, fri_23));
    assert!(schedule_active(&night, sat_02));
    assert!(!schedule_active(&night, sat_23));
}

#[test]
fn only_a_timed_event_with_a_call_link_that_is_running_counts_as_a_meeting() {
    let now = MON_NOON_UTC;
    let running = meet("2026-11-16T11:30:00Z", "2026-11-16T12:30:00Z", "https://meet.google.com/x", false);
    assert!(meeting_under_way(&[running], now));
    let later = meet("2026-11-16T12:30:00Z", "2026-11-16T13:00:00Z", "https://meet.google.com/x", false);
    assert!(!meeting_under_way(&[later], now));
    let ended = meet("2026-11-16T11:00:00Z", "2026-11-16T12:00:00Z", "https://meet.google.com/x", false);
    assert!(!meeting_under_way(&[ended], now), "the end is exclusive");
    let no_link = meet("2026-11-16T11:30:00Z", "2026-11-16T12:30:00Z", "", false);
    assert!(!meeting_under_way(&[no_link], now));
    let all_day = meet("2026-11-16", "2026-11-17", "https://meet.google.com/x", true);
    assert!(!meeting_under_way(&[all_day], now));
}

#[test]
fn the_meeting_rule_is_opt_in() {
    let dir = tmpdir("rule");
    let focus = FocusMode::load(&dir);
    let items = [meet("2026-11-16T11:30:00Z", "2026-11-16T12:30:00Z", "https://meet.google.com/x", false)];
    assert!(!focus.rule_active(&items, MON_NOON_UTC));
    focus.set(Config { in_meeting: true, ..Config::default() }).unwrap();
    assert!(focus.rule_active(&items, MON_NOON_UTC));
    std::fs::remove_dir_all(&dir).unwrap();
}

#[test]
fn bad_values_are_refused_and_the_choice_survives_a_restart() {
    let dir = tmpdir("persist");
    let focus = FocusMode::load(&dir);
    assert!(focus.set(Config { start_min: 1440, ..cfg() }).is_err());
    assert!(focus.set(Config { end_min: 9 * 60, ..cfg() }).is_err(), "an empty window is a mistake");
    assert!(focus.set(Config { offset_min: 20 * 60, ..cfg() }).is_err());
    focus.set(cfg()).unwrap();
    assert_eq!(FocusMode::load(&dir).config(), cfg());
    std::fs::remove_dir_all(&dir).unwrap();
}

#[test]
fn the_summary_is_bounded_and_shown_once() {
    let dir = tmpdir("held");
    let focus = FocusMode::load(&dir);
    for i in 0..(MAX_HELD + 5) {
        focus.hold(&format!("alerta {i}"), i as i64);
    }
    let held = focus.take_held();
    assert_eq!(held.len(), MAX_HELD);
    assert_eq!(held[0].title, "alerta 5", "the oldest fall off");
    assert!(focus.take_held().is_empty());
    std::fs::remove_dir_all(&dir).unwrap();
}
