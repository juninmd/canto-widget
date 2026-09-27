use super::*;

const NOW: i64 = 1_790_000_000_000;

fn tmpdir(name: &str) -> PathBuf {
    let dir = std::env::temp_dir().join(format!("canto-dnd-{name}-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&dir);
    std::fs::create_dir_all(&dir).unwrap();
    dir
}

#[test]
fn a_timed_period_ends_on_its_own() {
    let q = Quiet { until_ms: Some(NOW + 1000) };
    assert!(q.active_at(NOW));
    assert!(q.active_at(NOW + 999));
    assert!(!q.active_at(NOW + 1000));
    assert!(Quiet { until_ms: None }.active_at(i64::MAX), "until turned off never expires");
}

#[test]
fn the_choice_survives_a_restart() {
    let dir = tmpdir("restart");
    DoNotDisturb::load(&dir).set(Some(Quiet { until_ms: Some(NOW + 60_000) })).unwrap();
    let reloaded = DoNotDisturb::load(&dir);
    assert_eq!(reloaded.state_at(NOW), DndState { active: true, until_ms: Some(NOW + 60_000) });
    reloaded.set(Some(Quiet { until_ms: None })).unwrap();
    assert_eq!(DoNotDisturb::load(&dir).state_at(NOW), DndState { active: true, until_ms: None });
    std::fs::remove_dir_all(&dir).unwrap();
}

#[test]
fn expiring_or_turning_off_removes_the_file() {
    let dir = tmpdir("expire");
    let dnd = DoNotDisturb::load(&dir);
    dnd.set(Some(Quiet { until_ms: Some(NOW + 1000) })).unwrap();
    assert!(dir.join(FILE).exists());
    assert_eq!(dnd.state_at(NOW + 1000), OFF);
    assert!(!dir.join(FILE).exists(), "an expired period must not come back after a restart");
    dnd.set(Some(Quiet { until_ms: None })).unwrap();
    dnd.set(None).unwrap();
    assert!(!dir.join(FILE).exists());
    dnd.set(None).unwrap();
    std::fs::remove_dir_all(&dir).unwrap();
}

#[test]
fn a_corrupt_file_means_off() {
    let dir = tmpdir("corrupt");
    std::fs::write(dir.join(FILE), "{nope").unwrap();
    assert_eq!(DoNotDisturb::load(&dir).state_at(NOW), OFF);
    std::fs::remove_dir_all(&dir).unwrap();
}

#[test]
fn the_end_from_the_ui_is_validated() {
    assert!(validate(Some(NOW), NOW).is_err(), "already over");
    assert!(validate(Some(NOW - 1), NOW).is_err());
    assert!(validate(Some(NOW + MAX_AHEAD_MS + 1), NOW).is_err());
    assert_eq!(validate(Some(NOW + MAX_AHEAD_MS), NOW).unwrap().until_ms, Some(NOW + MAX_AHEAD_MS));
    assert_eq!(validate(None, NOW).unwrap(), Quiet { until_ms: None });
}

#[test]
fn the_gate_silences_only_while_active() {
    let dir = tmpdir("gate");
    let dnd = DoNotDisturb::load(&dir);
    assert!(!silenced(None, NOW), "no state yet (boot) rings as usual");
    assert!(!silenced(Some(&dnd), NOW));
    dnd.set(Some(Quiet { until_ms: Some(NOW + 1000) })).unwrap();
    assert!(silenced(Some(&dnd), NOW));
    assert!(!silenced(Some(&dnd), NOW + 1000));
    std::fs::remove_dir_all(&dir).unwrap();
}

fn source(file: &str) -> String {
    std::fs::read_to_string(Path::new(env!("CARGO_MANIFEST_DIR")).join("src").join(file)).unwrap()
}

fn body_of(src: &str, signature: &str) -> String {
    let start = src.find(signature).unwrap_or_else(|| panic!("{signature} not found"));
    let rest = &src[start..];
    rest[..rest.find("\n}\n").unwrap()].to_string()
}

#[test]
fn every_os_notification_goes_through_the_gate() {
    let dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("src");
    for entry in std::fs::read_dir(dir).unwrap() {
        let path = entry.unwrap().path();
        let name = path.file_name().unwrap().to_string_lossy().to_string();
        if name == "notification.rs" || name.ends_with("_tests.rs") {
            continue;
        }
        let src = std::fs::read_to_string(&path).unwrap();
        assert!(!src.contains(".notification()"), "{name} notifies around notify_os and do not disturb");
    }
    let notify_os = body_of(&source("notification.rs"), "pub fn notify_os(");
    assert!(notify_os.contains("do_not_disturb::quiet(app)"));
    assert!(body_of(&source("notification.rs"), "pub fn send(").contains("notify_os("), "meetings and tasks");
    assert!(body_of(&source("status_alert.rs"), "fn notify(").contains("notify_os("), "status outages");
}

#[test]
fn every_alert_pop_up_goes_through_the_gate() {
    let open_alert = body_of(&source("window.rs"), "pub fn open_alert(");
    let gate = open_alert.find("do_not_disturb::quiet(app)").expect("open_alert must check do not disturb");
    assert!(gate < open_alert.find("state.alert").unwrap(), "gate before the overlay payload is stored");
    // Meeting alerts, task reminders, snoozes and the UI's alert_open all ring through open_alert.
    for entry in std::fs::read_dir(Path::new(env!("CARGO_MANIFEST_DIR")).join("src")).unwrap() {
        let path = entry.unwrap().path();
        let name = path.file_name().unwrap().to_string_lossy().to_string();
        if name != "window.rs" && !name.ends_with("_tests.rs") {
            assert!(!std::fs::read_to_string(&path).unwrap().contains("ALERT_EVENT"), "{name} bypasses open_alert");
        }
    }
}
