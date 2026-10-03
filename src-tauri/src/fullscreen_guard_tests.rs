use super::*;

#[test]
fn a_full_screen_app_holds_and_a_normal_desktop_does_not() {
    for busy_state in [2, 3, 4, 7] {
        assert!(busy(Some(busy_state)), "state {busy_state} means something full screen is in front");
    }
    for free in [1, 5, 6] {
        assert!(!busy(Some(free)), "state {free} accepts alerts");
    }
}

#[test]
fn when_the_system_cannot_tell_alerts_ring_as_before() {
    assert!(!busy(None), "other systems and failed probes must never swallow an alert");
}

#[test]
fn it_rings_only_after_the_way_is_clear_and_only_if_something_still_waits() {
    assert!(should_ring(true, false, 2));
    assert!(!should_ring(true, true, 2), "still in the game");
    assert!(!should_ring(false, false, 2), "nothing was held");
    assert!(!should_ring(true, false, 0), "the alerts were closed from the dock meanwhile");
}

#[test]
fn it_is_on_in_old_files_and_remembers_the_choice() {
    let dir = std::env::temp_dir().join(format!("canto-tela-cheia-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&dir);
    assert!(FullscreenHold::load(&dir).enabled(), "no file yet means on");
    let hold = FullscreenHold::load(&dir);
    hold.set(false).unwrap();
    assert!(!FullscreenHold::load(&dir).enabled());
    assert!(serde_json::from_str::<Saved>("{}").unwrap().enabled, "a file without the key keeps the default");
    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn an_alert_in_a_game_waits_instead_of_taking_the_foreground() {
    let src = include_str!("window.rs");
    let body = &src[src.find("pub fn open_alert(").unwrap()..src.find("/// Every pending alert").unwrap()];
    let hold = body.find("fullscreen_guard::hold(app)").expect("open_alert must ask the guard");
    assert!(hold < body.find("present_pending(app)").unwrap(), "the pop-up would show before the guard speaks");
    assert!(hold > body.find("alert_queue::push").unwrap(), "a held alert must still be queued");
}

#[test]
fn toasts_wait_too_because_they_can_also_pull_a_game_out_of_full_screen() {
    let src = include_str!("notification.rs");
    let body = &src[src.find("pub fn notify_os(").unwrap()..src.find("#[cfg(test)]").unwrap()];
    assert!(body.contains("fullscreen_guard::holding(app)"));
    assert!(body.find("fullscreen_guard::holding(app)").unwrap() < body.find(".show()").unwrap());
}

#[test]
fn the_watcher_is_started_with_the_other_ones() {
    assert!(include_str!("lib.rs").contains("fullscreen_guard::watch("));
}
