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
    let conf: serde_json::Value = serde_json::from_str(include_str!("../../tauri.conf.json")).unwrap();
    let main = conf["app"]["windows"].as_array().unwrap().iter().find(|w| w["label"] == "main").unwrap();
    assert_eq!(main["minWidth"].as_f64(), Some(NORMAL_MIN.0));
    assert_eq!(main["minHeight"].as_f64(), Some(NORMAL_MIN.1));
}

#[test]
fn mini_geometry_never_overwrites_the_saved_normal_one() {
    let src = include_str!("state.rs");
    let body = &src[src.find("pub fn record(").unwrap()..src.find("#[tauri::command]").unwrap()];
    assert!(body.contains("cfg.mini"), "a dock-sized window would be saved as the widget size");
}

#[test]
fn an_alert_in_mini_mode_goes_to_the_dock_instead_of_the_pop_up() {
    let src = include_str!("mod.rs");
    let body = &src[src.find("pub fn present_pending(").unwrap()..src.find("/// Every pending alert").unwrap()];
    assert!(body.contains("mini_active"), "the pop-up would cover the dock the user chose");
    let open = &src[src.find("pub fn open_alert(").unwrap()..src.find("pub fn present_pending(").unwrap()];
    assert!(open.contains("present_pending(app)"), "open_alert must go through the dock check");
}

#[test]
fn choosing_the_dock_from_the_tray_restores_a_minimized_window() {
    let src = include_str!("mode.rs");
    let body = &src[src.find("pub fn toggle_mini(").unwrap()..src.find("#[tauri::command]").unwrap()];
    assert!(body.contains("should_show("), "a minimized window counts as visible and would leave the dock off screen");
}

#[test]
fn macos_maximizes_without_the_native_fullscreen_that_brings_the_title_bar_back() {
    let src = include_str!("mode.rs");
    let body = &src[src.find("pub fn set_max(").unwrap()..src.find("/// Idempotent: boot").unwrap()];
    assert!(body.contains("set_simple_fullscreen"), "native fullscreen gives the borderless window a title bar");
    assert!(body.contains("strip_chrome"), "the bar must be taken off again after the transition");
    assert!(SIMPLE_FULLSCREEN == cfg!(target_os = "macos"));
}

#[test]
fn every_mode_change_asserts_the_window_has_no_native_bar() {
    let src = include_str!("mode.rs");
    let mini = &src[src.find("pub fn place_mini(").unwrap()..src.find("pub fn restore_limits(").unwrap()];
    assert!(mini.contains("strip_chrome"), "the dock would show the native bar on macOS");
    let set = &src[src.find("pub fn set_mini(").unwrap()..src.find("/// From the tray").unwrap()];
    assert!(set.contains("strip_chrome"));
}

#[test]
fn the_main_window_is_declared_without_decorations() {
    let conf: serde_json::Value = serde_json::from_str(include_str!("../../tauri.conf.json")).unwrap();
    let main = conf["app"]["windows"].as_array().unwrap().iter().find(|w| w["label"] == "main").unwrap();
    assert_eq!(main["decorations"].as_bool(), Some(false));
}
