use super::*;

fn at(day: u32, h: u32, m: u32) -> NaiveDateTime {
    // 2026-10-12 is a Monday.
    NaiveDate::from_ymd_opt(2026, 10, day).unwrap().and_hms_opt(h, m, 0).unwrap()
}

fn on() -> Config {
    Config { enabled: true, ..Config::default() }
}

#[test]
fn it_rings_once_inside_the_window_after_the_chosen_hour_on_a_working_day() {
    let cfg = on();
    assert!(!due(at(12, 8, 59), &cfg, ""), "before the hour");
    assert!(due(at(12, 9, 0), &cfg, ""));
    assert!(due(at(12, 12, 59), &cfg, ""), "late, but still the morning's window");
    assert!(!due(at(12, 13, 0), &cfg, ""), "past the window the day is skipped");
    assert!(!due(at(12, 9, 30), &cfg, "2026-10-12"), "already rung today");
    assert!(due(at(13, 9, 30), &cfg, "2026-10-12"), "and again tomorrow");
    assert!(!due(at(12, 10, 0), &Config::default(), ""), "off by default");
}

#[test]
fn weekends_are_skipped_unless_asked_for() {
    let cfg = on();
    assert!(!due(at(17, 9, 30), &cfg, ""), "a Saturday");
    assert!(!due(at(18, 9, 30), &cfg, ""), "a Sunday");
    assert!(due(at(17, 9, 30), &Config { weekdays_only: false, ..cfg }, ""));
}

fn counts() -> Counts {
    Counts { meetings: 3, first_meeting: Some("10:30".into()), tasks: 1, reviews: 2, mentions: 0 }
}

#[test]
fn the_summary_says_only_what_has_something_and_agrees_in_number() {
    assert_eq!(lines(&counts(), false), ["3 reuniões, a primeira às 10:30", "1 tarefa aberta", "2 revisões pedidas"]);
    assert_eq!(lines(&counts(), true), ["3 meetings, first at 10:30", "1 open task", "2 reviews requested"]);
    let one = Counts { meetings: 1, first_meeting: None, tasks: 0, reviews: 1, mentions: 4 };
    assert_eq!(lines(&one, false), ["1 reunião", "1 revisão pedida", "4 menções não lidas"]);
    assert_eq!(lines(&one, true)[2], "4 unread mentions");
}

#[test]
fn an_empty_day_rings_nothing_and_a_full_one_becomes_one_alert() {
    assert!(event("2026-10-12", &Counts::default(), false).is_none());
    let e = event("2026-10-12", &counts(), false).expect("an alert");
    assert_eq!(
        (e.id.as_str(), e.title.as_str(), e.tag.as_str()),
        ("digest:morning:2026-10-12", "Resumo do dia", "digest")
    );
    assert_eq!(e.description.lines().count(), 3);
    assert_eq!(event("2026-10-12", &counts(), true).unwrap().title, "Day summary");
}

fn meeting(start: &str, end: &str, response: &str, all_day: bool) -> AgendaItem {
    AgendaItem {
        id: start.into(),
        start: start.into(),
        end: end.into(),
        response: response.into(),
        all_day,
        ..Default::default()
    }
}

#[test]
fn meetings_leave_out_all_day_and_declined_ones_and_name_the_next_to_come() {
    let t = |s: &str| chrono::DateTime::parse_from_rfc3339(s).unwrap().timestamp_millis();
    let items = [
        meeting("2026-10-12T13:00:00Z", "2026-10-12T14:00:00Z", "accepted", false),
        meeting("2026-10-12T17:00:00Z", "2026-10-12T17:30:00Z", "", false),
        meeting("2026-10-12T18:00:00Z", "2026-10-12T19:00:00Z", "declined", false),
        meeting("2026-10-12", "2026-10-13", "", true),
    ];
    let (n, first) = meetings(&items, t("2026-10-12T12:00:00Z"));
    assert_eq!(n, 2, "the declined and the all-day ones do not count");
    let expected = chrono::DateTime::parse_from_rfc3339("2026-10-12T13:00:00Z")
        .unwrap()
        .with_timezone(&Local)
        .format("%H:%M")
        .to_string();
    assert_eq!(first, Some(expected));
    let (_, none_left) = meetings(&items[..1], t("2026-10-12T15:00:00Z"));
    assert!(none_left.is_none(), "a meeting already over is not the next one");
}

#[test]
fn the_settings_and_the_day_it_rang_survive_a_restart_and_the_hour_is_clamped() {
    let dir = std::env::temp_dir().join(format!("canto-digest-{}", std::process::id()));
    std::fs::create_dir_all(&dir).unwrap();
    let _ = std::fs::remove_file(dir.join(FILE));
    let d = MorningDigest::load(&dir);
    assert_eq!(d.get(), Config::default());
    assert_eq!(d.set(Config { enabled: true, hour: 99, weekdays_only: false }).unwrap().hour, 23);
    d.rang("2026-10-12").unwrap();
    let again = MorningDigest::load(&dir);
    assert_eq!(
        (again.get(), again.last_day()),
        (Config { enabled: true, hour: 23, weekdays_only: false }, "2026-10-12".to_string())
    );
    d.set(Config { enabled: false, hour: 8, weekdays_only: true }).unwrap();
    assert_eq!(MorningDigest::load(&dir).last_day(), "2026-10-12", "changing the settings keeps the day it rang");
    std::fs::write(dir.join(FILE), r#"{"enabled":true}"#).unwrap();
    assert_eq!(MorningDigest::load(&dir).get(), Config { enabled: true, ..Config::default() });
    let _ = std::fs::remove_dir_all(&dir);
}
