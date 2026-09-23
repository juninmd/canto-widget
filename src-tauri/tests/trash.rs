use canto_widget_lib::clipboard::{ClipHistory, ClipItem};
use canto_widget_lib::model::{now_ms, Note, Task, VaultData};
use canto_widget_lib::trash::{undo, Removed};
use canto_widget_lib::vault::AppState;

fn task(id: &str, updated_at: i64) -> Task {
    Task {
        id: id.into(),
        title: "pagar boleto".into(),
        done: false,
        day: "2026-09-14".into(),
        created_at: 1,
        updated_at,
        ..Default::default()
    }
}

fn note(id: &str) -> Note {
    Note {
        id: id.into(),
        title: "wifi".into(),
        body: "senha".into(),
        tags: vec![],
        created_at: 1,
        updated_at: 5,
        ..Default::default()
    }
}

fn clip(id: &str, text: &str, copied_at: i64) -> ClipItem {
    ClipItem { id: id.into(), text: text.into(), copied_at, pinned: false, chars: 0 }
}

fn vault(name: &str) -> AppState {
    let dir = std::env::temp_dir().join(format!("canto-lixeira-{name}-{}-{}", std::process::id(), now_ms()));
    let st = AppState::new(dir);
    st.create("1234").unwrap();
    st
}

#[test]
fn undo_returns_the_task_and_removes_the_tombstone() {
    let mut d = VaultData { tasks: vec![task("t1", 10)], ..Default::default() };
    let removed = d.remove("t1", 20).expect("task existed");
    assert!(d.tasks.is_empty() && d.deleted.contains_key("t1"));

    d.restore(removed, 30);

    assert_eq!(d.tasks.len(), 1);
    assert!(!d.deleted.contains_key("t1"), "tombstone stayed and the next merge would delete it again");
}

#[test]
fn restored_item_survives_an_old_backup_with_the_tombstone() {
    let mut local = VaultData { tasks: vec![task("t1", 10)], ..Default::default() };
    let removed = local.remove("t1", 20).unwrap();
    let old_backup = local.clone();
    local.restore(removed, 30);

    let merged = local.merge(old_backup);

    assert_eq!(merged.tasks.len(), 1, "importing a backup taken between delete and undo erased the task");
}

#[test]
fn removing_a_missing_id_stores_nothing_to_undo() {
    let mut d = VaultData { notes: vec![note("n1")], ..Default::default() };
    assert!(d.remove("nao-existe", 1).is_none());
    assert_eq!(d.notes.len(), 1);
}

#[test]
fn restored_clipboard_comes_back_in_order_without_duplicating() {
    let mut h = ClipHistory { items: vec![clip("c3", "novo", 300)], ..Default::default() };
    h.restore(vec![clip("c1", "velho", 100), clip("c2", "novo", 200), clip("c3", "novo", 300)]);
    let texts: Vec<&str> = h.items.iter().map(|i| i.text.as_str()).collect();
    assert_eq!(texts, ["novo", "velho"], "duplicated text or lost chronological order");
}

#[test]
fn key_only_undoes_once() {
    let st = vault("uma-vez");
    st.mutate(|d| d.tasks.push(task("t1", now_ms()))).unwrap();
    let removed = st.mutate(|d| d.remove("t1", now_ms())).unwrap().unwrap();
    let key = st.trash.store(removed);

    assert!(undo(&st, &key).unwrap());
    assert!(!undo(&st, &key).unwrap(), "second click restored it again");
    assert_eq!(st.read(|d| d.tasks.len()).unwrap(), 1);
}

#[test]
fn locking_clears_the_trash() {
    let st = vault("tranca");
    let key = st.trash.store(Removed::Note(note("n1")));
    st.lock();
    st.unlock("1234").unwrap();
    assert!(!undo(&st, &key).unwrap(), "plaintext content survived the locked vault");
}

#[test]
fn trash_has_a_cap_and_drops_the_oldest() {
    let st = vault("teto");
    let first = st.trash.store(Removed::Note(note("n0")));
    for i in 1..=20 {
        st.trash.store(Removed::Note(note(&format!("n{i}"))));
    }
    assert!(st.trash.take(&first).is_none());
}

#[test]
fn a_removal_arriving_after_lock_does_not_stay_in_ram_as_plaintext() {
    let st = vault("depois-tranca");
    st.lock();
    assert!(st.store_in_trash(Removed::Note(note("n1"))).is_none());
    st.unlock("1234").unwrap();
    assert!(st.trash.take("qualquer").is_none());
}

#[test]
fn undo_with_a_locked_vault_answers_that_it_cannot_anymore() {
    let st = vault("desfaz-trancado");
    let key = st.store_in_trash(Removed::Note(note("n1"))).unwrap();
    st.lock();
    assert!(!undo(&st, &key).unwrap(), "should be Ok(false), not a locked-vault error");
}
