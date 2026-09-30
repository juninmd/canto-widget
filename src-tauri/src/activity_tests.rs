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
    let mut log = Log { spans: vec![Span { app: "Velho".into(), start: 0, end: 10 }] };
    log.record(Some("Code"), RETENTION_SECS + 100);
    assert_eq!(spans(&log), vec![("Code", RETENTION_SECS + 95, RETENTION_SECS + 100)]);
    let mut big = Log {
        spans: (0..MAX_SPANS as i64 + 5)
            .map(|i| Span { app: format!("a{i}"), start: i * 10, end: i * 10 + 5 })
            .collect(),
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
    };
    let s = summarize(&log, 0, i64::MAX / 2);
    assert_eq!(s.spans.len(), SPANS_MAX);
    assert_eq!(s.spans.last().unwrap().start, (SPANS_MAX as i64 + 2) * 10);
    assert_eq!(s.total_secs, (SPANS_MAX as i64 + 3) * 5, "totals count what was cut too");
}
