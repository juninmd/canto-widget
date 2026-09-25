use super::*;
use crate::model::{now_ms, Task};

fn machine(name: &str, password: &str) -> AppState {
    let dir = std::env::temp_dir().join(format!("canto-sync-{name}-{}-{}", std::process::id(), now_ms()));
    let _ = std::fs::remove_dir_all(&dir);
    let st = AppState::new(dir);
    st.create(password).unwrap();
    st
}

fn with_task(st: &AppState, id: &str) {
    st.mutate(|d| {
        d.tasks.push(Task {
            id: id.into(),
            title: "regar planta".into(),
            day: "2026-09-14".into(),
            updated_at: now_ms(),
            ..Default::default()
        })
    })
    .unwrap();
}

fn folder_dir(name: &str) -> PathBuf {
    let d = std::env::temp_dir().join(format!("canto-sync-pasta-{name}-{}", now_ms()));
    let _ = std::fs::remove_dir_all(&d);
    std::fs::create_dir_all(&d).unwrap();
    d
}

#[test]
fn without_a_folder_nothing_happens() {
    let st = machine("sem-pasta", "1234");
    export_now(&st.dir).unwrap();
    assert_eq!(poll_and_merge(&st).unwrap(), None);
}

#[test]
fn every_save_exports_to_the_folder_once_configured() {
    let st = machine("auto-exporta", "1234");
    let pasta = folder_dir("auto-exporta");
    set_folder(&st, pasta.clone()).unwrap();
    assert!(pasta.join("canto.canto").exists(), "set_folder should seed the file right away");

    with_task(&st, "t1");
    let bytes_first = std::fs::read(pasta.join("canto.canto")).unwrap();
    with_task(&st, "t2");
    let bytes_second = std::fs::read(pasta.join("canto.canto")).unwrap();
    assert_ne!(bytes_first, bytes_second, "the second task's save never reached the synced folder");
}

#[test]
fn a_change_from_another_machine_merges_in_on_poll() {
    let pasta = folder_dir("compartilhada");
    let a = machine("origem-a", "1234");
    set_folder(&a, pasta.clone()).unwrap();
    with_task(&a, "da-a");

    let b = machine("origem-b", "1234");
    set_folder(&b, pasta).unwrap();

    assert!(b.read(|d| d.tasks.iter().any(|t| t.id == "da-a")).unwrap(), "b did not pick up a's task on set_folder");
}

#[test]
fn polling_twice_in_a_row_without_a_new_change_merges_only_once() {
    let pasta = folder_dir("sem-novidade");
    let a = machine("parado-a", "1234");
    set_folder(&a, pasta.clone()).unwrap();
    let b = machine("parado-b", "1234");
    set_folder(&b, pasta).unwrap();
    with_task(&a, "t1");

    assert!(poll_and_merge(&b).unwrap().is_some(), "first poll should see a's new task");
    assert_eq!(poll_and_merge(&b).unwrap(), None, "nothing changed since: should be a no-op");
}

#[test]
fn a_locked_vault_never_reads_or_merges_the_folder() {
    let pasta = folder_dir("trancada");
    let st = machine("trancada-a", "1234");
    set_folder(&st, pasta).unwrap();
    st.lock();
    assert_eq!(poll_and_merge(&st).unwrap(), None);
}

/// Regression for b2ee9f4: two `mutate` calls racing on the same synced folder must not
/// drop each other's write, nor leave `ultimo_hash` pointing at anything but what's actually
/// on disk (a lost update there would make the next poll think there's nothing new to merge).
#[test]
fn concurrent_mutates_do_not_drop_a_write_or_corrupt_the_synced_hash() {
    let pasta = folder_dir("concorrente");
    let st = std::sync::Arc::new(machine("concorrente", "1234"));
    set_folder(&st, pasta.clone()).unwrap();

    let a = {
        let st = st.clone();
        std::thread::spawn(move || with_task(&st, "t-a"))
    };
    let b = {
        let st = st.clone();
        std::thread::spawn(move || with_task(&st, "t-b"))
    };
    a.join().unwrap();
    b.join().unwrap();

    let ids: Vec<String> = st.read(|d| d.tasks.iter().map(|t| t.id.clone()).collect()).unwrap();
    assert!(ids.contains(&"t-a".to_string()), "t-a was dropped by a concurrent mutate");
    assert!(ids.contains(&"t-b".to_string()), "t-b was dropped by a concurrent mutate");

    let bytes = std::fs::read(pasta.join("canto.canto")).unwrap();
    let recorded = load(&st.dir).ultimo_hash;
    assert_eq!(recorded, Some(hash(&bytes)), "ultimo_hash lost a concurrent export's update (b2ee9f4 regression)");
}

#[test]
fn clearing_the_folder_stops_future_exports() {
    let st = machine("limpa", "1234");
    let pasta = folder_dir("limpa");
    set_folder(&st, pasta.clone()).unwrap();
    clear_folder(&st.dir).unwrap();
    assert_eq!(folder(&st.dir), None);

    with_task(&st, "t1");
    // set_folder already wrote once; nothing new should land after clearing.
    let count = std::fs::read_dir(&pasta).unwrap().count();
    assert_eq!(count, 1);
}
