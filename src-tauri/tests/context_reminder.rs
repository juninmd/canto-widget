use canto_widget_lib::context_reminder::{tick, Rung};
use canto_widget_lib::model::{now_ms, Repeat, Task};
use canto_widget_lib::task_context::{set_context, TaskContext};
use canto_widget_lib::vault::AppState;

const TODAY: &str = "2026-09-09";

fn vault(name: &str) -> AppState {
    let dir = std::env::temp_dir().join(format!("canto-contexto-{name}-{}-{}", std::process::id(), now_ms()));
    let st = AppState::new(dir);
    st.create("1234").unwrap();
    st
}

fn task(id: &str, day: &str) -> Task {
    Task {
        id: id.into(),
        title: format!("tarefa {id}"),
        day: day.into(),
        created_at: 1,
        updated_at: 1,
        ..Default::default()
    }
}

fn app(name: &str) -> Option<TaskContext> {
    Some(TaskContext::App { name: name.into() })
}

fn ids(tasks: Vec<Task>) -> Vec<String> {
    tasks.into_iter().map(|t| t.id).collect()
}

#[test]
fn a_context_survives_the_sealed_vault_and_rings_after_an_unlock() {
    let st = vault("selado");
    st.mutate(|d| d.tasks.push(task("t1", TODAY))).unwrap();
    st.mutate(|d| set_context(d, "t1", app("  Slack "), now_ms())).unwrap().unwrap();
    st.lock();
    st.unlock("1234").unwrap();

    let mut rung = Rung::default();
    let in_slack = || Some("slack".to_string());
    assert_eq!(ids(tick(&st, &mut rung, TODAY, in_slack, || None)), ["t1"]);
    assert!(tick(&st, &mut rung, TODAY, in_slack, || None).is_empty(), "once a day, even across ticks");
    st.lock();
    st.unlock("1234").unwrap();
    assert!(tick(&st, &mut rung, TODAY, in_slack, || None).is_empty(), "a lock in the same place is not a new visit");
}

#[test]
fn nothing_is_probed_when_no_open_task_has_a_context() {
    let st = vault("sem-sonda");
    st.mutate(|d| d.tasks.push(task("t1", TODAY))).unwrap();
    let boom = || -> Option<String> { panic!("a probe ran with no context to look for") };
    assert!(tick(&st, &mut Rung::default(), TODAY, boom, boom).is_empty());
    st.mutate(|d| set_context(d, "t1", app("Slack"), now_ms())).unwrap().unwrap();
    st.mutate(|d| d.tasks[0].done = true).unwrap();
    assert!(tick(&st, &mut Rung::default(), TODAY, boom, boom).is_empty(), "a done task no longer waits");
}

#[test]
fn a_recurring_series_brings_its_context_to_each_new_day() {
    let st = vault("serie");
    st.mutate(|d| {
        d.tasks.push(Task { series: Some("s".into()), repeat: Some(Repeat::Daily), ..task("s", "2026-09-08") });
        d.tasks[0].done = true;
    })
    .unwrap();
    st.mutate(|d| set_context(d, "s", app("Slack"), now_ms())).unwrap().unwrap();

    let ring = tick(&st, &mut Rung::default(), TODAY, || Some("Slack".into()), || None);
    assert_eq!(ids(ring), ["s-2026-09-09"]);
}

#[test]
fn an_invalid_name_or_unknown_task_is_refused_and_leaves_the_vault_alone() {
    let st = vault("recusa");
    st.mutate(|d| d.tasks.push(task("t1", TODAY))).unwrap();
    assert!(st.mutate(|d| set_context(d, "t1", app("   "), now_ms())).unwrap().is_err());
    assert!(st.mutate(|d| set_context(d, "nope", app("Slack"), now_ms())).unwrap().is_err());
    assert_eq!(st.read(|d| d.tasks[0].context.clone()).unwrap(), None);
    st.mutate(|d| set_context(d, "t1", app("Slack"), now_ms())).unwrap().unwrap();
    st.mutate(|d| set_context(d, "t1", None, now_ms())).unwrap().unwrap();
    assert_eq!(st.read(|d| d.tasks[0].context.clone()).unwrap(), None);
}
