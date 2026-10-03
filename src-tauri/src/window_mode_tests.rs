use super::*;

const SCREEN: Area = (0.0, 0.0, 1920.0, 1040.0);
const SECOND: Area = (1920.0, 0.0, 1280.0, 1000.0);

#[test]
fn dock_sits_flush_right_and_vertically_centered() {
    assert_eq!(dock_position(SCREEN, (24.0, 64.0)), (1896.0, 488.0));
    assert_eq!(dock_position(SECOND, (300.0, 200.0)), (2900.0, 400.0));
}

#[test]
fn growing_keeps_the_right_edge_and_the_center() {
    let small = dock_position(SCREEN, (24.0, 64.0));
    let big = dock_position(SCREEN, (300.0, 240.0));
    assert_eq!(small.0 + 24.0, big.0 + 300.0, "the right edge moved");
    assert_eq!(small.1 + 32.0, big.1 + 120.0, "the center moved");
}

#[test]
fn webview_sizes_are_clamped_at_the_boundary() {
    assert_eq!(clamp_mini((24.0, 64.0)), (24.0, 64.0));
    assert_eq!(clamp_mini((0.0, 0.0)), MINI_MIN);
    assert_eq!(clamp_mini((5000.0, 5000.0)), MINI_MAX);
    assert_eq!(clamp_mini((f64::NAN, f64::INFINITY)), MINI_DEFAULT);
}

#[test]
fn normal_limits_match_the_declared_window() {
    let conf: serde_json::Value = serde_json::from_str(include_str!("../tauri.conf.json")).unwrap();
    let main = conf["app"]["windows"].as_array().unwrap().iter().find(|w| w["label"] == "main").unwrap();
    assert_eq!(main["minWidth"].as_f64(), Some(NORMAL_MIN.0));
    assert_eq!(main["minHeight"].as_f64(), Some(NORMAL_MIN.1));
}

#[test]
fn mini_geometry_never_overwrites_the_saved_normal_one() {
    let src = include_str!("window_state.rs");
    let body = &src[src.find("pub fn record(").unwrap()..src.find("#[tauri::command]").unwrap()];
    assert!(body.contains("cfg().mini"), "a dock-sized window would be saved as the widget size");
}

#[test]
fn an_alert_in_mini_mode_goes_to_the_dock_instead_of_the_pop_up() {
    let src = include_str!("window.rs");
    let body = &src[src.find("pub fn open_alert(").unwrap()..src.find("/// Every pending alert").unwrap()];
    assert!(body.contains("mini_active"), "the pop-up would cover the dock the user chose");
}
