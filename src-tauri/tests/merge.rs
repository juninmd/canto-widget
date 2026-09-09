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
    }
}

fn data(tasks: Vec<Task>, notes: Vec<Note>, deleted: &[(&str, i64)]) -> VaultData {
    VaultData {
        tasks,
        notes,
        deleted: deleted
            .iter()
            .map(|(id, at)| (id.to_string(), *at))
            .collect::<HashMap<_, _>>(),
    }
}

#[test]
fn une_itens_exclusivos_dos_dois_lados() {
    let merged = data(vec![task("a", "local", 10)], vec![], &[])
        .merge(data(vec![task("b", "remoto", 5)], vec![], &[]));
    let ids: Vec<_> = merged.tasks.iter().map(|t| t.id.as_str()).collect();
    assert_eq!(ids, vec!["b", "a"]);
}

#[test]
fn edicao_mais_recente_vence_no_mesmo_id() {
    let merged = data(vec![task("a", "antigo", 10)], vec![], &[])
        .merge(data(vec![task("a", "novo", 20)], vec![], &[]));
    assert_eq!(merged.tasks.len(), 1);
    assert_eq!(merged.tasks[0].title, "novo");
}

#[test]
fn remocao_posterior_a_edicao_apaga_o_item() {
    let merged = data(vec![], vec![], &[("a", 30)]).merge(data(vec![task("a", "x", 20)], vec![], &[]));
    assert!(merged.tasks.is_empty());
    assert_eq!(merged.deleted.get("a"), Some(&30));
}

#[test]
fn edicao_posterior_a_remocao_ressuscita_o_item() {
    let merged =
        data(vec![], vec![], &[("a", 10)]).merge(data(vec![task("a", "revivido", 40)], vec![], &[]));
    assert_eq!(merged.tasks.len(), 1);
    assert_eq!(merged.tasks[0].title, "revivido");
}

#[test]
fn merge_e_idempotente() {
    let local = data(vec![task("a", "x", 10)], vec![note("n1", "corpo", 12)], &[("z", 3)]);
    let once = local.clone().merge(local.clone());
    let twice = once.clone().merge(local);
    assert_eq!(once, twice);
}

#[test]
fn tombstone_remove_das_duas_colecoes() {
    let mut d = data(vec![task("a", "x", 1)], vec![note("a", "y", 1)], &[]);
    d.tombstone("a", 99);
    assert!(d.tasks.is_empty() && d.notes.is_empty());
    assert_eq!(d.deleted.get("a"), Some(&99));
}
