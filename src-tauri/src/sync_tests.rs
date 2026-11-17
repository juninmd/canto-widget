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

#[test]
fn fifteen_remote_merges_in_a_row_keep_the_earlier_daily_copies() {
    let pasta = folder_dir("quinze");
    let a = machine("quinze-a", "1234");
    let b = machine("quinze-b", "1234");
    for d in 1..=3 {
        backup::daily(&b.dir, &format!("2026-10-{d:02}")).unwrap();
    }
    set_folder(&a, pasta.clone()).unwrap();
    set_folder(&b, pasta.clone()).unwrap();
    for i in 0..15 {
        with_task(&a, &format!("remota-{i}"));
        poll_and_merge(&b).unwrap();
    }
    let dailies = backup::list(&b.dir).iter().filter(|c| c.kind == "daily").count();
    assert!(dailies >= 3, "the daily copies were pushed out by sync imports: {dailies}");
}

#[test]
fn an_oversized_synced_file_is_refused_without_being_read_whole() {
    let pasta = folder_dir("grande");
    let st = machine("grande", "1234");
    set_folder(&st, pasta.clone()).unwrap();
    let file = std::fs::File::create(pasta.join("canto.canto")).unwrap();
    file.set_len(backup::MAX_BYTES + 1024 * 1024).unwrap();
    // A sparse file: reading it whole would allocate 33 MiB, so the cap (checked on the handle) must answer first.
    assert_eq!(poll_and_merge(&st).unwrap(), None);
}

#[test]
fn the_exported_hash_is_of_the_bytes_written_even_if_the_file_is_swapped_after() {
    let pasta = folder_dir("troca");
    let a = machine("troca-a", "1234");
    let b = machine("troca-b", "1234");
    set_folder(&a, pasta.clone()).unwrap();
    with_task(&a, "minha");
    let mine = std::fs::read(pasta.join("canto.canto")).unwrap();
    assert_eq!(load(&a.dir).ultimo_hash.as_deref(), Some(hash(&mine).as_str()));
    // The other machine's version lands right after our export: it must read as a change, not as "our own export".
    set_folder(&b, pasta.clone()).unwrap();
    with_task(&b, "dela");
    assert_ne!(load(&a.dir).ultimo_hash, load(&b.dir).ultimo_hash);
    let merged = poll_and_merge(&a).unwrap();
    assert_eq!(merged.map(|s| s.tasks), Some(2));
}

#[test]
fn exporting_to_a_deleted_folder_records_the_error_and_keeps_saving() {
    let st = machine("pasta-apagada", "1234");
    let pasta = folder_dir("pasta-apagada");
    set_folder(&st, pasta.clone()).unwrap();
    assert!(st.sync.status().last_export_ok_at.is_some());
    // The export recreates a missing folder, so make it unusable instead: a plain file where the folder was.
    std::fs::remove_dir_all(&pasta).unwrap();
    std::fs::write(&pasta, b"x").unwrap();

    with_task(&st, "continua-salvando");
    let status = st.sync.status();
    assert!(status.last_export_error.is_some(), "the failed copy must show up in the status");
    assert!(status.consecutive_failures >= 1);
    assert!(st.read(|d| d.tasks.iter().any(|t| t.id == "continua-salvando")).unwrap());
}

#[test]
fn a_file_from_another_master_password_is_not_derived_twice() {
    let pasta = folder_dir("outra-senha");
    let a = machine("senha-a", "1234");
    set_folder(&a, pasta.clone()).unwrap();
    let b = machine("senha-b", "9999");
    // b points at a folder holding a's file: the first poll fails, the second skips the derivation.
    store::write_json_atomic(&path(&b.dir), &Prefs { pasta: Some(pasta.display().to_string()), ultimo_hash: None })
        .unwrap();
    assert!(poll_and_merge(&b).is_err());
    let derived = b.derives.load(std::sync::atomic::Ordering::SeqCst);
    assert!(b.sync.status().last_merge_error.is_some());
    assert_eq!(poll_and_merge(&b).unwrap(), None);
    assert_eq!(b.derives.load(std::sync::atomic::Ordering::SeqCst), derived, "same file, no new Argon2id run");
    b.sync.reset_backoff();
    assert!(poll_and_merge(&b).is_err(), "'sync now' tries the file again");
}

#[test]
fn backoff_goes_5_15_30_60_and_resets_after_a_success() {
    let min = |f| poll_interval(f).as_secs() / 60;
    assert_eq!([0, 1, 2].map(min), [5, 5, 5]);
    assert_eq!([3, 4].map(min), [15, 15]);
    assert_eq!([5, 6].map(min), [30, 30]);
    assert_eq!([7, 50].map(min), [60, 60]);

    let t = SyncTracker::default();
    for _ in 0..4 {
        t.record(true, Some(&AppError::Io("x".into())));
    }
    assert_eq!(min(t.status().consecutive_failures), 15);
    t.record(true, None);
    assert_eq!(t.status().consecutive_failures, 0);
    assert_eq!(min(t.status().consecutive_failures), 5);
    assert!(t.status().last_export_error.is_none());
}
