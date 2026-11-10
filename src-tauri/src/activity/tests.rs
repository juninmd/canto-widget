use super::*;

fn spans(log: &Log) -> Vec<(&str, i64, i64)> {
    log.spans.iter().map(|s| (s.app.as_str(), s.start, s.end)).collect()
}

#[test]
fn consecutive_samples_of_one_app_grow_a_single_span() {
    let mut log = Log::default();
    for now in [1005, 1010, 1015] {
        log.record(Some("Code"), now);
    }
    assert_eq!(spans(&log), vec![("Code", 1000, 1015)]);
}

#[test]
fn switching_app_or_going_idle_starts_a_new_span() {
    let mut log = Log::default();
    log.record(Some("Code"), 1005);
    log.record(Some("Slack"), 1010);
    log.record(None, 1015);
    log.record(None, 1020);
    log.record(Some("Slack"), 1100);
    assert_eq!(spans(&log), vec![("Code", 1000, 1005), ("Slack", 1005, 1010), ("Slack", 1095, 1100)]);
}

#[test]
fn the_same_second_twice_never_shrinks_or_duplicates_a_span() {
    let mut log = Log::default();
    log.record(Some("Code"), 1005);
    log.record(Some("Code"), 1005);
    assert_eq!(spans(&log), vec![("Code", 1000, 1005)]);
}

#[test]
fn the_app_name_is_one_trimmed_bounded_line() {
    let mut log = Log::default();
    log.record(Some("  Code \nsegunda linha com título de janela"), 1005);
    log.record(Some(&"x".repeat(200)), 2000);
    log.record(Some("   "), 3000);
    assert_eq!(log.spans[0].app, "Code");
    assert_eq!(log.spans[1].app.chars().count(), APP_CHARS);
    assert_eq!(log.spans.len(), 2);
}

#[test]
fn old_spans_are_dropped_and_the_log_has_a_ceiling() {
    let mut log = Log { spans: vec![Span { app: "Velho".into(), start: 0, end: 10 }], ..Default::default() };
    log.record(Some("Code"), RETENTION_SECS + 100);
    assert_eq!(spans(&log), vec![("Code", RETENTION_SECS + 95, RETENTION_SECS + 100)]);
    let mut big = Log {
        spans: (0..MAX_SPANS as i64 + 5)
            .map(|i| Span { app: format!("a{i}"), start: i * 10, end: i * 10 + 5 })
            .collect(),
        ..Default::default()
    };
    big.record(Some("novo"), MAX_SPANS as i64 * 10 + 100);
    assert_eq!(big.spans.len(), MAX_SPANS);
    assert_eq!(big.spans.last().unwrap().app, "novo");
}

#[test]
fn a_summary_clips_spans_to_the_window_and_ranks_apps_by_time() {
    let log = Log {
        spans: vec![
            Span { app: "Code".into(), start: 0, end: 100 },
            Span { app: "Slack".into(), start: 100, end: 130 },
            Span { app: "Code".into(), start: 200, end: 260 },
            Span { app: "Fora".into(), start: 500, end: 600 },
        ],
        ..Default::default()
    };
    let s = summarize(&log, 50, 250);
    assert_eq!(s.spans.len(), 3);
    assert_eq!((s.spans[0].start, s.spans[2].end), (50, 250));
    assert_eq!(s.apps, vec![AppTotal { app: "Code".into(), secs: 100 }, AppTotal { app: "Slack".into(), secs: 30 }]);
    assert_eq!(s.total_secs, 130);
}

#[test]
fn an_old_log_file_with_no_spans_key_still_loads() {
    let log: Log = serde_json::from_str("{}").unwrap();
    assert!(log.spans.is_empty());
}

#[test]
fn a_summary_keeps_the_newest_spans_when_it_has_to_cut() {
    let log = Log {
        spans: (0..SPANS_MAX as i64 + 3).map(|i| Span { app: "Code".into(), start: i * 10, end: i * 10 + 5 }).collect(),
        ..Default::default()
    };
    let s = summarize(&log, 0, i64::MAX / 2);
    assert_eq!(s.spans.len(), SPANS_MAX);
    assert_eq!(s.spans.last().unwrap().start, (SPANS_MAX as i64 + 2) * 10);
    assert_eq!(s.total_secs, (SPANS_MAX as i64 + 3) * 5, "totals count what was cut too");
}

#[test]
fn idle_samples_grow_one_away_stretch_and_a_gap_starts_another() {
    let mut log = Log::default();
    for now in [1005, 1010, 1015] {
        log.record_idle(now);
    }
    log.record_idle(1100);
    assert_eq!(log.idle, vec![Away { start: 1000, end: 1015 }, Away { start: 1095, end: 1100 }]);
    assert!(log.spans.is_empty(), "idle never counts as an application");
}

#[test]
fn a_summary_clips_the_away_time_and_a_log_without_the_key_has_none() {
    let log = Log { idle: vec![Away { start: 0, end: 100 }, Away { start: 300, end: 400 }], ..Default::default() };
    let s = summarize(&log, 50, 350);
    assert_eq!(s.idle, vec![Away { start: 50, end: 100 }, Away { start: 300, end: 350 }]);
    assert_eq!(s.idle_secs, 100);
    let old: Log = serde_json::from_str(r#"{"spans":[{"app":"Code","start":1,"end":2}]}"#).unwrap();
    assert_eq!((old.spans.len(), old.idle.len()), (1, 0));
}

#[test]
fn old_away_time_is_dropped_and_clear_forgets_both() {
    let mut log = Log { idle: vec![Away { start: 0, end: 10 }], ..Default::default() };
    log.record_idle(RETENTION_SECS + 100);
    assert_eq!(log.idle, vec![Away { start: RETENTION_SECS + 95, end: RETENTION_SECS + 100 }]);
    log.record(Some("Code"), RETENTION_SECS + 105);
    log.clear();
    assert!(log.spans.is_empty() && log.idle.is_empty());
}

#[test]
fn focus_flushes_of_one_task_grow_a_stretch_and_another_task_or_a_long_gap_starts_a_new_one() {
    let mut log = Log::default();
    log.record_focus("a", 60, 1060);
    log.record_focus("a", 60, 1121);
    log.record_focus("b", 30, 1151);
    log.record_focus("b", 30, 1500);
    let spans: Vec<_> = log.focus.iter().map(|f| (f.task.as_str(), f.start, f.end)).collect();
    assert_eq!(spans, vec![("a", 1000, 1121), ("b", 1121, 1151), ("b", 1470, 1500)]);
    assert!(log.spans.is_empty() && log.idle.is_empty(), "task time never counts as an application");
}

#[test]
fn focus_ignores_empty_input_keeps_only_the_id_and_forgets_old_time() {
    let mut log = Log::default();
    log.record_focus("", 60, 1000);
    log.record_focus("a", 0, 1000);
    assert!(log.focus.is_empty());
    log.record_focus(&"x".repeat(300), 60, 1000);
    assert_eq!(log.focus[0].task.chars().count(), TASK_ID_CHARS);
    log.record_focus("a", 60, RETENTION_SECS + 2000);
    assert_eq!(log.focus.len(), 1, "the old stretch fell out of the retention window");
    log.clear();
    assert!(log.focus.is_empty());
}

#[test]
fn a_summary_adds_focus_per_task_inside_the_window_most_first_and_old_logs_have_none() {
    let log = Log {
        focus: vec![
            FocusSpan { task: "a".into(), start: 0, end: 100 },
            FocusSpan { task: "b".into(), start: 100, end: 400 },
            FocusSpan { task: "a".into(), start: 500, end: 560 },
            FocusSpan { task: "fora".into(), start: 900, end: 950 },
        ],
        ..Default::default()
    };
    let s = summarize(&log, 50, 530);
    assert_eq!(
        s.focus,
        vec![
            FocusTotal { task: "b".into(), title: None, secs: 300 },
            FocusTotal { task: "a".into(), title: None, secs: 80 },
        ]
    );
    let old: Log = serde_json::from_str(r#"{"spans":[],"idle":[]}"#).unwrap();
    assert!(old.focus.is_empty());
}
