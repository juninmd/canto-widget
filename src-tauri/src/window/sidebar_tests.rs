use super::*;

const AREA: Area = (0.0, 0.0, 1920.0, 1040.0);
const SECOND: Area = (1920.0, 40.0, 1280.0, 1000.0);
const EDGE_PX: f64 = 2.0;

#[test]
fn docked_is_flush_right_and_full_height() {
    assert_eq!(docked(AREA, 420.0), (1500.0, 0.0, 420.0, 1040.0));
    assert_eq!(docked(SECOND, 420.0), (2780.0, 40.0, 420.0, 1000.0));
}

#[test]
fn docked_width_never_exceeds_the_screen() {
    assert_eq!(docked(AREA, 5000.0), (0.0, 0.0, 1920.0, 1040.0));
}

#[test]
fn tucked_leaves_only_the_strip_inside_the_work_area() {
    assert_eq!(tucked_x(AREA, EDGE_PX), 1918.0);
    assert_eq!(tucked_x(SECOND, EDGE_PX), 3198.0);
}

#[test]
fn leaving_hides_only_after_the_delay() {
    let win = docked(AREA, 420.0);
    let away = (100.0, 500.0);
    assert_eq!(decide(false, away, AREA, win, EDGE_PX, Duration::ZERO), Step::Stay);
    assert_eq!(decide(false, away, AREA, win, EDGE_PX, LEAVE_DELAY - Duration::from_millis(1)), Step::Stay);
    assert_eq!(decide(false, away, AREA, win, EDGE_PX, LEAVE_DELAY), Step::Tuck);
}

#[test]
fn the_mouse_over_the_window_never_hides_it() {
    let win = docked(AREA, 420.0);
    assert_eq!(decide(false, (1700.0, 300.0), AREA, win, EDGE_PX, Duration::from_secs(60)), Step::Stay);
}

#[test]
fn a_dragged_window_counts_where_it_is_now() {
    let dragged = (600.0, 100.0, 420.0, 1040.0);
    assert_eq!(decide(false, (700.0, 300.0), AREA, dragged, EDGE_PX, Duration::from_secs(60)), Step::Stay);
}

#[test]
fn touching_the_right_edge_reveals_it() {
    let win = (1918.0, 0.0, 420.0, 1040.0);
    assert_eq!(decide(true, (1919.0, 500.0), AREA, win, EDGE_PX, Duration::ZERO), Step::Reveal);
    assert_eq!(decide(true, (1918.0, 0.0), AREA, win, EDGE_PX, Duration::ZERO), Step::Reveal);
}

#[test]
fn the_middle_of_the_screen_or_another_monitor_does_not_reveal_it() {
    let win = (1918.0, 0.0, 420.0, 1040.0);
    assert_eq!(decide(true, (1000.0, 500.0), AREA, win, EDGE_PX, Duration::ZERO), Step::Stay);
    assert_eq!(decide(true, (1919.0, 1200.0), AREA, win, EDGE_PX, Duration::ZERO), Step::Stay, "below the work area");
    assert_eq!(decide(true, (1925.0, 500.0), AREA, win, EDGE_PX, Duration::ZERO), Step::Stay, "next monitor");
}

#[test]
fn sidebar_geometry_is_never_saved_as_the_normal_one() {
    let src = include_str!("state.rs").replace('\r', "");
    let body = &src[src.find("pub fn record(").unwrap()..src.find("#[tauri::command]").unwrap()];
    assert!(body.contains("cfg.sidebar"), "the docked rectangle would be saved as the widget size");
}

#[test]
fn placing_the_widget_honors_the_sidebar() {
    let src = include_str!("state.rs").replace('\r', "");
    let body = &src[src.find("pub fn place(").unwrap()..src.find("pub fn record(").unwrap()];
    assert!(body.contains("cfg.sidebar"), "show and boot would put the window back on the normal corner");
}

#[test]
fn the_watcher_stands_down_for_mini_and_fullscreen() {
    let src = include_str!("sidebar.rs").replace('\r', "");
    let body = &src[src.find("fn tick(").unwrap()..src.find("pub fn watch(").unwrap()];
    assert!(body.contains("cfg.mini") && body.contains("is_max"), "the sidebar would fight the dock");
}
