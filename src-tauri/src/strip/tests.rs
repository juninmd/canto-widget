use super::snapshot::next_event;
use super::*;
use crate::calendar::AgendaItem;

const NOW: i64 = 1_789_700_400_000; // 2026-09-18T03:00:00Z

fn event(title: &str, start: &str, end: &str, all_day: bool) -> AgendaItem {
    AgendaItem {
        id: title.into(),
        title: title.into(),
        start: start.into(),
        end: end.into(),
        all_day,
        ..Default::default()
    }
}

#[test]
fn old_or_empty_files_keep_the_pill_off_with_the_default_items() {
    let cfg: StripConfig = serde_json::from_str("{}").unwrap();
    assert_eq!(cfg, StripConfig::default());
    assert!(!cfg.enabled, "a new option never appears on the screen by itself");
    assert_eq!(cfg.edge, Edge::Top);
}

#[test]
fn an_empty_choice_stays_empty_and_unknown_names_go_away() {
    let cfg: StripConfig = serde_json::from_str(r#"{"enabled":true,"items":[]}"#).unwrap();
    assert!(cfg.items.is_empty(), "switching every item off is a choice, not a missing key");
    let raw = ["event".into(), "nope".into(), "cpu".into(), "cpu".into()];
    assert_eq!(known(&raw), ["cpu", "event"], "the pill's own order, no duplicates");
}

#[test]
fn the_choice_survives_a_restart() {
    let dir = std::env::temp_dir().join(format!("canto-strip-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&dir);
    std::fs::create_dir_all(&dir).unwrap();
    let state = StripState::load(&dir);
    let cfg = StripConfig { enabled: true, edge: Edge::Bottom, items: vec!["memory".into(), "x".into()] };
    assert_eq!(state.set(cfg).unwrap().items, ["memory"]);
    let back = StripState::load(&dir).cfg();
    assert!(back.enabled && back.edge == Edge::Bottom);
    assert_eq!(back.items, ["memory"]);
    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn the_pill_is_centered_and_flush_with_the_chosen_edge() {
    let area = (0.0, 40.0, 1920.0, 1000.0);
    assert_eq!(place::origin(area, (240.0, 32.0), Edge::Top), (840.0, 40.0));
    assert_eq!(place::origin(area, (240.0, 32.0), Edge::Bottom), (840.0, 1008.0));
    let second = (1920.0, 0.0, 1280.0, 1000.0);
    assert_eq!(place::origin(second, (200.0, 30.0), Edge::Top).0, 2460.0, "the second monitor's own work area");
}

#[test]
fn a_size_the_webview_cannot_have_is_clamped() {
    assert_eq!(place::clamp((f64::NAN, -5.0)), (place::DEFAULT.0, 20.0));
    assert_eq!(place::clamp((9999.0, 9999.0)), (420.0, 560.0));
    assert_eq!(place::clamp((300.0, 40.0)), (300.0, 40.0));
}

#[test]
fn a_full_screen_app_or_the_option_off_hides_it() {
    assert!(place::wanted(true, false));
    assert!(!place::wanted(true, true), "a game keeps the screen to itself");
    assert!(!place::wanted(false, false));
}

#[test]
fn the_next_event_counts_minutes_rounding_up_and_skips_all_day_and_past_ones() {
    let items = [
        event("holiday", "2026-09-18", "2026-09-19", true),
        event("done", "2026-09-18T01:00:00Z", "2026-09-18T02:00:00Z", false),
        event("daily", "2026-09-18T03:14:10Z", "2026-09-18T03:30:00Z", false),
    ];
    let next = next_event(&items, NOW).unwrap();
    assert_eq!((next.title.as_str(), next.in_min), ("daily", 15));
    assert!(!next.meet);
}

#[test]
fn an_event_under_way_reads_zero_and_an_unparsable_one_is_skipped() {
    let items = [event("bad", "x", "y", false), event("now", "2026-09-18T02:50:00Z", "2026-09-18T03:20:00Z", false)];
    assert_eq!(next_event(&items, NOW).unwrap().in_min, 0);
    assert!(next_event(&[], NOW).is_none());
}

#[test]
fn the_window_is_declared_hidden_unfocusable_and_allowed() {
    let conf: serde_json::Value = serde_json::from_str(include_str!("../../tauri.conf.json")).unwrap();
    let windows = conf["app"]["windows"].as_array().unwrap();
    let win = windows.iter().find(|w| w["label"] == WINDOW).expect("strip window in tauri.conf.json");
    assert_eq!(win["visible"], false, "hidden until the option is on");
    assert_eq!(win["focusable"], false, "the pill must never take focus from the app in use");
    assert_eq!(win["skipTaskbar"], true);
    assert!(include_str!("../../capabilities/default.json").contains("\"strip\""));
}

#[test]
fn the_pill_never_asks_the_network_or_the_disk_for_its_numbers() {
    let src = include_str!("snapshot.rs");
    let body = &src[src.find("pub fn build(").unwrap()..];
    for banned in ["review_requested_total", "forecast(", "read_json", "reqwest"] {
        assert!(!body.contains(banned), "{banned} would make a 2 s poll hit the network or the disk");
    }
}
