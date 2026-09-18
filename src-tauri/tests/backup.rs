use canto_widget_lib::backup::{self, ImportSummary, KEEP};
use canto_widget_lib::error::AppError;
use canto_widget_lib::model::{now_ms, Note, Task};
use canto_widget_lib::vault::AppState;
use std::path::{Path, PathBuf};

fn machine(name: &str, password: &str) -> AppState {
    let dir = std::env::temp_dir().join(format!("canto-bkp-{name}-{}-{}", std::process::id(), now_ms()));
    let _ = std::fs::remove_dir_all(&dir);
    let st = AppState::new(dir);
    st.create(password).unwrap();
    st
}

fn with_task(st: &AppState, id: &str) {
    st.mutate(|d| {
        d.tasks.push(Task {
            id: id.into(),
            title: "pagar boleto".into(),
            done: false,
            day: "2026-09-14".into(),
            created_at: 1,
            updated_at: now_ms(),
            ..Default::default()
        })
    })
    .unwrap();
}

fn with_note(st: &AppState, id: &str) {
    st.mutate(|d| {
        d.notes.push(Note {
            id: id.into(),
            title: "wifi".into(),
            body: "senha do roteador".into(),
            tags: vec![],
            created_at: 1,
            updated_at: now_ms(),
            ..Default::default()
        })
    })
    .unwrap();
}

fn exported(st: &AppState) -> PathBuf {
    let destination = st.dir.join("fora").join("meu backup.canto");
    backup::export(&st.dir, &destination).unwrap();
    destination
}

fn files(folder: &Path) -> Vec<String> {
    let mut v: Vec<String> = std::fs::read_dir(folder)
        .map(|r| r.filter_map(|e| e.ok()).map(|e| e.file_name().to_string_lossy().into()).collect())
        .unwrap_or_default();
    v.sort();
    v
}

#[test]
fn backup_carries_tasks_to_another_machine_with_the_same_password() {
    let a = machine("origem", "1234");
    with_task(&a, "t1");
    let b = machine("destino", "1234");
    with_note(&b, "n1");

    let summary = backup::import(&b, &exported(&a)).unwrap();

    assert_eq!(summary, ImportSummary { tasks: 1, notes: 1 }, "merge lost an item from one side");
    b.lock();
    b.unlock("1234").unwrap();
    assert_eq!(b.read(|d| d.tasks[0].id.clone()).unwrap(), "t1", "import was not persisted to disk");
}

#[test]
fn exported_file_does_not_leak_plaintext_content() {
    let a = machine("claro", "1234");
    with_note(&a, "n1");
    let text = std::fs::read_to_string(exported(&a)).unwrap();
    assert!(!text.contains("senha do roteador"));
}

#[test]
fn reimporting_the_same_backup_changes_nothing() {
    let a = machine("idem-a", "1234");
    with_task(&a, "t1");
    let b = machine("idem-b", "1234");
    let file = exported(&a);
    backup::import(&b, &file).unwrap();
    let before = b.read(|d| d.clone()).unwrap();
    backup::import(&b, &file).unwrap();
    assert_eq!(b.read(|d| d.clone()).unwrap(), before);
}

#[test]
fn different_password_is_rejected_without_touching_the_local_vault() {
    let a = machine("senha-a", "1234");
    with_task(&a, "t1");
    let b = machine("senha-b", "outra");
    with_note(&b, "n1");
    let before = b.read(|d| d.clone()).unwrap();

    let err = backup::import(&b, &exported(&a)).unwrap_err();

    assert!(err.to_string().contains("outra senha mestra"), "useless message: {err}");
    assert_eq!(b.read(|d| d.clone()).unwrap(), before);
    assert!(files(&backup::backups_dir(&b.dir)).is_empty(), "kept a copy of a failed import");
}

#[test]
fn any_random_file_is_rejected_as_an_invalid_format() {
    let b = machine("lixo", "1234");
    let file = b.dir.join("foto.canto");
    std::fs::write(&file, b"\x89PNG nao sou cofre").unwrap();
    assert!(matches!(backup::import(&b, &file), Err(AppError::Format(_))));
}

#[test]
fn an_oversized_file_is_not_even_read() {
    let b = machine("grande", "1234");
    let file = b.dir.join("enorme.canto");
    std::fs::File::create(&file).unwrap().set_len(64 * 1024 * 1024).unwrap();
    let err = backup::import(&b, &file).unwrap_err();
    assert!(err.to_string().contains("grande demais"), "{err}");
}

#[test]
fn importing_with_a_locked_vault_fails() {
    let a = machine("tranca-a", "1234");
    let b = machine("tranca-b", "1234");
    let file = exported(&a);
    b.lock();
    assert!(matches!(backup::import(&b, &file), Err(AppError::Locked)));
}

#[test]
fn importing_stores_the_previous_state_for_undo() {
    let a = machine("desfaz-a", "1234");
    let b = machine("desfaz-b", "1234");
    backup::import(&b, &exported(&a)).unwrap();
    let copies = files(&backup::backups_dir(&b.dir));
    assert_eq!(copies.len(), 1);
    assert!(copies[0].ends_with("-import.canto"), "{copies:?}");
}

#[test]
fn daily_backup_writes_once_per_day() {
    let st = machine("diario", "1234");
    assert!(backup::daily(&st.dir, "2026-09-14").unwrap());
    assert!(!backup::daily(&st.dir, "2026-09-14").unwrap(), "duplicated the day's copy");
    assert!(backup::daily(&st.dir, "2026-09-15").unwrap());
}

#[test]
fn daily_backup_without_a_vault_does_nothing() {
    let dir = std::env::temp_dir().join(format!("canto-bkp-vazio-{}", now_ms()));
    assert!(!backup::daily(&dir, "2026-09-14").unwrap());
    assert!(!backup::backups_dir(&dir).exists());
}

#[test]
fn pruning_drops_the_oldest_copies() {
    let st = machine("poda", "1234");
    for day in 1..=KEEP + 2 {
        backup::daily(&st.dir, &format!("2026-08-{day:02}")).unwrap();
    }
    let copies = files(&backup::backups_dir(&st.dir));
    assert_eq!(copies.len(), KEEP);
    assert_eq!(copies[0], "2026-08-03.canto", "apagou a copia errada");
}
