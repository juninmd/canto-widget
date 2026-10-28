use super::*;
use std::cell::Cell;

fn task(id: &str, context: TaskContext) -> Task {
    Task {
        id: id.into(),
        title: "mandar o relatório".into(),
        day: "2026-09-09".into(),
        context: Some(context),
        ..Default::default()
    }
}

fn app(name: &str) -> TaskContext {
    TaskContext::App { name: name.into() }
}

fn wifi(name: &str) -> TaskContext {
    TaskContext::Wifi { name: name.into() }
}

fn in_app(name: &str) -> Seen {
    Seen { app: Some(name.into()), wifi: None }
}

const TODAY: &str = "2026-09-09";

#[test]
fn rings_when_the_app_comes_to_the_front_and_only_once_a_day() {
    let tasks = [task("t1", app("Slack"))];
    let mut rung = Rung::default();
    assert!(rung.take_due(&tasks, &in_app("Code"), TODAY).is_empty());
    assert_eq!(rung.take_due(&tasks, &in_app("slack"), TODAY).len(), 1, "case never matters");
    assert!(rung.take_due(&tasks, &in_app("Slack"), TODAY).is_empty(), "already rung today");
    assert_eq!(rung.take_due(&tasks, &in_app("Slack"), "2026-09-10").len(), 1, "a new day rings again if still open");
}

#[test]
fn rings_when_the_wifi_matches_and_ignores_an_unknown_network() {
    let tasks = [task("t1", wifi("Escritorio"))];
    let mut rung = Rung::default();
    assert!(rung.take_due(&tasks, &Seen::default(), TODAY).is_empty(), "no adapter reads as unknown, never a match");
    assert!(rung.take_due(&tasks, &Seen { wifi: Some("Casa".into()), ..Default::default() }, TODAY).is_empty());
    assert_eq!(rung.take_due(&tasks, &Seen { wifi: Some("Escritorio".into()), ..Default::default() }, TODAY).len(), 1);
}

#[test]
fn an_app_name_ignores_the_exe_suffix() {
    let mut rung = Rung::default();
    assert_eq!(rung.take_due(&[task("t1", app("Slack.exe"))], &in_app("Slack"), TODAY).len(), 1);
}

#[test]
fn a_wifi_task_does_not_ring_for_an_app_with_the_same_name() {
    let mut rung = Rung::default();
    assert!(rung.take_due(&[task("t1", wifi("Slack"))], &in_app("Slack"), TODAY).is_empty());
}

#[test]
fn done_future_and_context_free_tasks_stay_quiet() {
    let done = Task { done: true, ..task("done", app("Slack")) };
    let future = Task { day: "2026-09-10".into(), ..task("future", app("Slack")) };
    let plain = Task { context: None, ..task("plain", app("Slack")) };
    let overdue = Task { day: "2026-09-01".into(), ..task("overdue", app("Slack")) };
    let mut rung = Rung::default();
    let rang: Vec<String> =
        rung.take_due(&[done, future, plain, overdue], &in_app("Slack"), TODAY).into_iter().map(|t| t.id).collect();
    assert_eq!(rang, ["overdue"]);
}

#[test]
fn only_the_probes_the_tasks_need_are_run() {
    let (apps, wifis) = (Cell::new(0), Cell::new(0));
    let probe_app = || {
        apps.set(apps.get() + 1);
        Some("Slack".to_string())
    };
    let probe_wifi = || {
        wifis.set(wifis.get() + 1);
        Some("Casa".to_string())
    };
    let seen = observe(&[task("t1", app("Slack"))], probe_app, probe_wifi);
    assert_eq!((apps.get(), wifis.get()), (1, 0));
    assert_eq!(seen, in_app("Slack"));
    observe(&[task("t1", wifi("Casa"))], probe_app, probe_wifi);
    assert_eq!((apps.get(), wifis.get()), (1, 1));
    observe(&[Task { context: None, ..task("t1", app("x")) }], probe_app, probe_wifi);
    assert_eq!((apps.get(), wifis.get()), (1, 1), "no context, no probe");
}

#[test]
fn the_alert_is_a_task_alert_the_overlay_can_complete() {
    let e = to_event(&task("t1", app("Slack")));
    assert_eq!(e.id, "task:t1");
    assert_eq!(e.title, "mandar o relatório");
    assert!(chrono::DateTime::parse_from_rfc3339(&e.start).is_ok());
}
