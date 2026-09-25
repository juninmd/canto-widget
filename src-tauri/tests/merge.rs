use canto_widget_lib::model::{Note, Task, VaultData};
use std::collections::HashMap;

fn task(id: &str, title: &str, updated_at: i64) -> Task {
    Task {
        id: id.into(),
        title: title.into(),
        done: false,
        day: "2026-09-08".into(),
        created_at: 1,
        updated_at,
        ..Default::default()
    }
}

fn note(id: &str, body: &str, updated_at: i64) -> Note {
    Note {
        id: id.into(),
        title: "n".into(),
        body: body.into(),
        tags: vec![],
        created_at: 1,
        updated_at,
        ..Default::default()
    }
}

fn data(tasks: Vec<Task>, notes: Vec<Note>, deleted: &[(&str, i64)]) -> VaultData {
    VaultData { tasks, notes, deleted: deleted.iter().map(|(id, at)| (id.to_string(), *at)).collect::<HashMap<_, _>>() }
}

#[test]
fn merges_items_exclusive_to_each_side() {
    let merged = data(vec![task("a", "local", 10)], vec![], &[]).merge(data(vec![task("b", "remoto", 5)], vec![], &[]));
    let ids: Vec<_> = merged.tasks.iter().map(|t| t.id.as_str()).collect();
    assert_eq!(ids, vec!["b", "a"]);
}

#[test]
fn more_recent_edit_wins_on_the_same_id() {
    let merged = data(vec![task("a", "antigo", 10)], vec![], &[]).merge(data(vec![task("a", "novo", 20)], vec![], &[]));
    assert_eq!(merged.tasks.len(), 1);
    assert_eq!(merged.tasks[0].title, "novo");
}

#[test]
fn removal_after_the_edit_deletes_the_item() {
    let merged = data(vec![], vec![], &[("a", 30)]).merge(data(vec![task("a", "x", 20)], vec![], &[]));
    assert!(merged.tasks.is_empty());
    assert_eq!(merged.deleted.get("a"), Some(&30));
}

#[test]
fn edit_after_the_removal_revives_the_item() {
    let merged = data(vec![], vec![], &[("a", 10)]).merge(data(vec![task("a", "revivido", 40)], vec![], &[]));
    assert_eq!(merged.tasks.len(), 1);
    assert_eq!(merged.tasks[0].title, "revivido");
}

#[test]
fn merge_is_idempotent() {
    let local = data(vec![task("a", "x", 10)], vec![note("n1", "corpo", 12)], &[("z", 3)]);
    let once = local.clone().merge(local.clone());
    let twice = once.clone().merge(local);
    assert_eq!(once, twice);
}

#[test]
fn tombstone_removes_from_both_collections() {
    let mut d = data(vec![task("a", "x", 1)], vec![note("a", "y", 1)], &[]);
    d.tombstone("a", 99);
    assert!(d.tasks.is_empty() && d.notes.is_empty());
    assert_eq!(d.deleted.get("a"), Some(&99));
}
#[test]
fn a_tie_resolves_the_same_way_on_both_machines() {
    let a = || data(vec![task("t1", "versão A", 50)], vec![], &[]);
    let b = || data(vec![task("t1", "versão B", 50)], vec![], &[]);
    let ab = a().merge(b());
    let ba = b().merge(a());
    assert_eq!(ab.tasks[0].title, ba.tasks[0].title, "each machine kept its own copy and they never converge");
}
#[test]
fn an_edit_after_syncing_a_future_stamp_still_wins() {
    // Another machine's clock ran ahead: its version carries a stamp later than this machine's "now".
    let future = 10_000;
    let local_now = 9_000;
    let mut edited = task("t1", "editado aqui depois", future);
    edited.updated_at = canto_widget_lib::model::next_version(edited.updated_at, local_now);
    let merged = data(vec![edited], vec![], &[]).merge(data(vec![task("t1", "antigo", future)], vec![], &[]));
    assert_eq!(merged.tasks[0].title, "editado aqui depois");
}
#[test]
fn deleting_an_item_stamped_by_a_clock_ahead_stays_deleted_after_sync() {
    let future = 10_000;
    let mut here = data(vec![task("t1", "vindo do futuro", future)], vec![], &[]);
    here.tombstone("t1", 9_000);
    let merged = here.merge(data(vec![task("t1", "vindo do futuro", future)], vec![], &[]));
    assert!(merged.tasks.is_empty(), "the deleted task came back from the other machine");
}
