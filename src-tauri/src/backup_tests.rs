use super::*;
use crate::model::Task;

fn names(daily: usize, import: usize) -> Vec<String> {
    let mut v: Vec<String> = (0..daily).map(|i| format!("2026-10-{:02}.canto", i + 1)).collect();
    v.extend((0..import).map(|i| format!("2026-11-{:02}T{}-import.canto", i + 1, 1_000 + i)));
    v
}

fn state(name: &str) -> AppState {
    let dir = std::env::temp_dir().join(format!("canto-backup-{name}-{}-{}", std::process::id(), now_ms()));
    let _ = std::fs::remove_dir_all(&dir);
    let st = AppState::new(dir);
    st.create("1234").unwrap();
    st
}

fn add_task(st: &AppState, id: &str) {
    st.mutate(|d| d.tasks.push(Task { id: id.into(), updated_at: now_ms(), ..Default::default() })).unwrap();
}

#[test]
fn only_the_excess_imports_are_pruned_and_no_daily() {
    let all = names(10, 12);
    let doomed = plan_prune(&all, KEEP_DAILY, KEEP_IMPORT);
    assert_eq!(doomed, ["2026-11-01T1000-import.canto", "2026-11-02T1001-import.canto"]);
}

#[test]
fn each_kind_is_pruned_on_its_own_count() {
    let doomed = plan_prune(&names(13, 3), KEEP_DAILY, KEEP_IMPORT);
    assert_eq!(doomed, ["2026-10-01.canto", "2026-10-02.canto", "2026-10-03.canto"]);
}

#[test]
fn files_outside_the_two_patterns_are_never_pruned() {
    let mut all = names(12, 12);
    all.extend(
        ["minha-copia.canto", "2026-11-01.canto.tmp", "x-import.canto", "2026-11-01T1-import.canto.next", "notas.txt"]
            .map(String::from),
    );
    let doomed = plan_prune(&all, 1, 1);
    assert!(doomed.iter().all(|n| n.starts_with("2026-")), "{doomed:?}");
    for keep in
        ["minha-copia.canto", "2026-11-01.canto.tmp", "x-import.canto", "2026-11-01T1-import.canto.next", "notas.txt"]
    {
        assert!(!doomed.contains(&keep.to_string()), "{keep}");
    }
}

#[test]
fn saving_prunes_on_disk_without_touching_a_stray_file() {
    let st = state("poda");
    let folder = backups_dir(&st.dir);
    std::fs::create_dir_all(&folder).unwrap();
    std::fs::write(folder.join("minha-copia.canto"), b"x").unwrap();
    for i in 0..12 {
        save(&st.dir, &format!("2026-11-{:02}T{}-import", i + 1, 1_000 + i)).unwrap();
    }
    let kept = list(&st.dir);
    assert_eq!(kept.iter().filter(|c| c.kind == "import").count(), KEEP_IMPORT);
    assert!(folder.join("minha-copia.canto").exists());
    let _ = std::fs::remove_dir_all(&st.dir);
}

#[test]
fn a_run_of_automatic_imports_leaves_the_dailies_and_makes_one_copy() {
    let (a, b) = (state("rajada-a"), state("rajada-b"));
    for d in 1..=3 {
        save(&b.dir, &format!("2026-10-{d:02}")).unwrap();
    }
    for i in 0..15 {
        add_task(&a, &format!("da-a-{i}"));
        let file = std::env::temp_dir().join(format!("canto-rajada-{}-{i}.canto", std::process::id()));
        // `b` shares `a`'s password, so its vault opens the other's envelope.
        export(&a.dir, &file).unwrap();
        import_bytes(&b, &std::fs::read(&file).unwrap(), true).unwrap();
        let _ = std::fs::remove_file(&file);
    }
    let copies = list(&b.dir);
    assert_eq!(copies.iter().filter(|c| c.kind == "daily").count(), 3, "dailies were pruned by the burst");
    assert_eq!(copies.iter().filter(|c| c.kind == "import").count(), 1, "the burst should share one copy");
    assert_eq!(b.read(|d| d.tasks.len()).unwrap(), 15);
    let _ = (std::fs::remove_dir_all(&a.dir), std::fs::remove_dir_all(&b.dir));
}

#[test]
fn importing_what_is_already_here_makes_no_copy() {
    let (a, b) = (state("igual-a"), state("igual-b"));
    add_task(&a, "t");
    let file = std::env::temp_dir().join(format!("canto-igual-{}.canto", std::process::id()));
    let bytes = export(&a.dir, &file).unwrap();
    let _ = std::fs::remove_file(&file);
    import_bytes(&b, &bytes, true).unwrap();
    let before = list(&b.dir).len();
    import_bytes(&b, &bytes, true).unwrap();
    assert_eq!(list(&b.dir).len(), before, "a no-op merge must not take a copy");
    let _ = (std::fs::remove_dir_all(&a.dir), std::fs::remove_dir_all(&b.dir));
}

#[test]
fn a_manual_import_always_keeps_a_copy() {
    let (a, b) = (state("manual-a"), state("manual-b"));
    let file = std::env::temp_dir().join(format!("canto-manual-{}.canto", std::process::id()));
    export(&a.dir, &file).unwrap();
    import(&b, &file).unwrap();
    import(&b, &file).unwrap();
    let _ = std::fs::remove_file(&file);
    assert!(list(&b.dir).iter().filter(|c| c.kind == "import").count() >= 1);
    let _ = (std::fs::remove_dir_all(&a.dir), std::fs::remove_dir_all(&b.dir));
}

#[test]
fn restore_puts_the_vault_back_and_keeps_the_current_state_as_a_copy() {
    let st = state("restaura");
    add_task(&st, "antes");
    assert!(daily(&st.dir, "2026-11-01").unwrap());
    add_task(&st, "depois");
    let summary = restore(&st, "2026-11-01.canto").unwrap();
    assert_eq!(summary.tasks, 1);
    assert_eq!(st.read(|d| d.tasks.iter().map(|t| t.id.clone()).collect::<Vec<_>>()).unwrap(), ["antes"]);
    // The state from before the restore can be restored in turn.
    let undo = list(&st.dir).into_iter().find(|c| c.kind == "import").expect("safety copy").name;
    assert_eq!(restore(&st, &undo).unwrap().tasks, 2);
    let _ = std::fs::remove_dir_all(&st.dir);
}

#[test]
fn restore_refuses_names_that_are_not_listed_copies() {
    let st = state("nome");
    for bad in ["../vault.json", "vault.json", "..", "a/b.canto", "2026-11-01.canto/../../x", "minha-copia.canto"] {
        assert!(matches!(restore(&st, bad), Err(AppError::NotFound)), "{bad}");
    }
    let _ = std::fs::remove_dir_all(&st.dir);
}

#[test]
fn the_list_is_newest_first_and_shows_only_the_two_kinds() {
    let st = state("lista");
    let folder = backups_dir(&st.dir);
    std::fs::create_dir_all(&folder).unwrap();
    for n in ["2026-11-01.canto", "2026-11-02T5000-import.canto", "estranho.canto", "2026-11-03.canto"] {
        std::fs::write(folder.join(n), b"x").unwrap();
    }
    let got: Vec<(String, &str, Option<i64>)> = list(&st.dir).into_iter().map(|c| (c.name, c.kind, c.at)).collect();
    assert_eq!(
        got,
        [
            ("2026-11-03.canto".to_string(), "daily", None),
            ("2026-11-02T5000-import.canto".to_string(), "import", Some(5000)),
            ("2026-11-01.canto".to_string(), "daily", None),
        ]
    );
    let _ = std::fs::remove_dir_all(&st.dir);
}
