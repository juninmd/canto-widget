use super::*;

#[test]
fn idle_users_are_not_sampled_and_unknown_idle_counts_as_active() {
    let app = || Some("Code".to_string());
    assert_eq!(sample(app, Some(5)), Sample::App("Code".into()));
    assert_eq!(sample(app, None), Sample::App("Code".into()));
    assert_eq!(sample(|| panic!("no need to ask"), Some(IDLE_LIMIT_SECS)), Sample::Idle);
    assert_eq!(sample(|| None, Some(5)), Sample::Unknown);
}

#[test]
fn an_unnamed_full_screen_app_is_recorded_generically_and_a_named_one_keeps_its_name() {
    assert_eq!(or_fullscreen(Some("cs2".into()), Some(3)).as_deref(), Some("cs2"));
    assert_eq!(or_fullscreen(None, Some(3)).as_deref(), Some(FULLSCREEN_APP));
    assert_eq!(or_fullscreen(None, Some(2)).as_deref(), Some(FULLSCREEN_APP));
    assert_eq!(or_fullscreen(None, Some(5)), None);
    assert_eq!(or_fullscreen(None, None), None);
}

#[test]
fn focus_time_reaches_the_log_only_when_the_activity_log_is_on() {
    let dir = std::env::temp_dir().join(format!("canto-activity-focus-{}-{}", std::process::id(), now_ms()));
    let _ = std::fs::remove_dir_all(&dir);
    let state = AppState::new(dir.clone());
    state.create("senha-mestra").unwrap();
    let act = ActivityState::load(&dir);
    act.record_focus(&state, "a", 60, 1000);
    assert_eq!(act.with_log(&state, |log| log.focus.len()).unwrap(), 0, "off: nothing is kept");
    act.enabled.store(true, Ordering::Relaxed);
    act.record_focus(&state, "a", 60, 1000);
    assert_eq!(act.with_log(&state, |log| log.focus.len()).unwrap(), 1);
    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn a_window_is_ordered_and_no_longer_than_the_log_keeps() {
    assert!(valid_window(0, 1000).is_ok());
    assert!(valid_window(1000, 1000).is_err());
    assert!(valid_window(0, MAX_WINDOW_MS + 1).is_err());
}

#[test]
fn missing_or_old_prefs_mean_off() {
    let dir = std::env::temp_dir().join(format!("canto-activity-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&dir);
    std::fs::create_dir_all(&dir).unwrap();
    assert!(!ActivityState::load(&dir).enabled());
    std::fs::write(dir.join(PREFS_FILE), "{}").unwrap();
    assert!(!ActivityState::load(&dir).enabled());
    std::fs::write(dir.join(PREFS_FILE), r#"{"enabled":true}"#).unwrap();
    assert!(ActivityState::load(&dir).enabled());
    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn the_log_survives_a_flush_and_a_reload_and_clear_empties_the_file() {
    let dir = std::env::temp_dir().join(format!("canto-activity-log-{}-{}", std::process::id(), now_ms()));
    let _ = std::fs::remove_dir_all(&dir);
    let state = AppState::new(dir.clone());
    state.create("senha-mestra").unwrap();
    let act = ActivityState::load(&dir);
    act.with_log(&state, |log| log.record(Some("Code"), 1000)).unwrap();
    act.flush(&state).unwrap();
    act.drop_log();
    let spans = act.with_log(&state, |log| log.spans.len()).unwrap();
    assert_eq!(spans, 1);
    act.with_log(&state, |log| log.spans.clear()).unwrap();
    act.flush(&state).unwrap();
    act.drop_log();
    assert_eq!(act.with_log(&state, |log| log.spans.len()).unwrap(), 0);
    let _ = std::fs::remove_dir_all(&dir);
}
