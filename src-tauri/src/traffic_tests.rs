use super::*;

#[test]
fn the_slowdown_weighs_each_road_by_its_free_flow_speed() {
    assert_eq!(slowdown(&[(60.0, 60.0), (20.0, 40.0)]), Some(20));
    assert_eq!(slowdown(&[(0.0, 50.0)]), Some(100), "a closed road is fully slow");
    assert_eq!(slowdown(&[(90.0, 60.0)]), Some(0), "faster than free flow is not negative");
    assert_eq!(slowdown(&[]), None);
}

#[test]
fn the_box_and_the_samples_surround_the_point() {
    let (a, b, c, d) = bbox(-23.5, -46.6, 5.0);
    assert!(a < -46.6 && c > -46.6 && b < -23.5 && d > -23.5);
    let km = km_between((-23.5, -46.6), (d, -46.6));
    assert!((km - 5.0).abs() < 0.1, "the edge is 5 km away, got {km}");
    assert_eq!(sample_points(-23.5, -46.6).len(), 5);
}

#[test]
fn incident_categories_become_the_five_kinds_the_tab_draws() {
    assert_eq!(incident_kind(1), IncidentKind::Accident);
    assert_eq!(incident_kind(6), IncidentKind::Jam);
    assert_eq!(incident_kind(8), IncidentKind::Closed);
    assert_eq!(incident_kind(9), IncidentKind::Works);
    assert_eq!(incident_kind(11), IncidentKind::Hazard);
}

#[test]
fn a_long_route_is_decimated_but_still_ends_at_the_destination() {
    let points: Vec<[f64; 2]> = (0..1000).map(|i| [f64::from(i), 0.0]).collect();
    let out = decimate(points, 100);
    assert!(out.len() <= 101);
    assert_eq!(out.first(), Some(&[0.0, 0.0]));
    assert_eq!(out.last(), Some(&[999.0, 0.0]));
}

#[test]
fn what_comes_from_the_webview_is_validated() {
    let ok = Spot { name: " Casa ".into(), detail: "".into(), lat: 1.0, lon: 2.0 };
    assert_eq!(clean_spot(ok).unwrap().name, "Casa");
    assert!(clean_spot(Spot { name: "x".into(), detail: "".into(), lat: 91.0, lon: 0.0 }).is_none());
    assert!(clean_spot(Spot { name: " ".into(), detail: "".into(), lat: 0.0, lon: 0.0 }).is_none());
    assert!(clean_trip_name(&"a".repeat(MAX_NAME + 1)).is_none());
    assert_eq!(clean_icon("rocket"), "pin");
    assert_eq!(clean_key(" abcDEF0123456789abcDEF0123456789 ").as_deref(), Some("abcDEF0123456789abcDEF0123456789"));
    assert!(clean_key("https://api.tomtom.com/?key=abc").is_none());
}

#[test]
fn a_config_without_the_newer_fields_still_loads() {
    let cfg: TrafficConfig = serde_json::from_str(r#"{"api_key":"k"}"#).unwrap();
    assert!(cfg.origin.is_none() && cfg.trips.is_empty());
}

#[test]
fn the_cache_serves_fresh_entries_and_keeps_one_reading_per_refresh() {
    let cache = crate::traffic_cache::TrafficCache::default();
    let (v, at) = cache.get_or("k", 1000, 10, || Ok(1u8)).unwrap();
    assert_eq!((v, at), (1, 10));
    let (v, _) = cache.get_or("k", 1000, 500, || Ok(2u8)).unwrap();
    assert_eq!(v, 1, "still fresh");
    let (v, _) = cache.get_or("k", 1000, 2000, || Ok(3u8)).unwrap();
    assert_eq!(v, 3, "stale entries are fetched again");
    cache.record(5, 10);
    assert_eq!(cache.record(5, 10).len(), 1, "the same reading is not recorded twice");
    cache.clear();
    assert!(cache.history().is_empty());
}
