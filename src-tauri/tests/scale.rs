// Load harness, run on demand: cargo test --release --test scale -- --ignored --nocapture
use canto_widget_lib::cmd_notes::{page, PAGE_DEFAULT};
use canto_widget_lib::model::{now_ms, Note, Repeat, Task, VaultData};
use canto_widget_lib::routine::materialize;
use canto_widget_lib::vault::AppState;
use std::time::{Duration, Instant};

const TASKS: usize = 30_000;
const NOTES: usize = 5_000;
const TOMBSTONES: usize = 20_000;
const TRANSCRIPTS: usize = 1_000;

fn day(n: usize) -> String {
    format!("2025-{:02}-{:02}", n % 12 + 1, n % 28 + 1)
}

fn big_vault() -> VaultData {
    let mut d = VaultData::default();
    for i in 0..TASKS {
        d.tasks.push(Task {
            id: format!("t{i}"),
            title: format!("Tarefa número {i} do projeto Atlas"),
            done: i % 3 != 0,
            day: day(i),
            created_at: i as i64,
            updated_at: i as i64,
            series: (i % 500 == 0).then(|| format!("t{i}")),
            repeat: (i % 500 == 0).then_some(Repeat::Daily),
            ..Default::default()
        });
    }
    let body = "Lorem ipsum dolor sit amet, reunião de planejamento com o time. ".repeat(32);
    for i in 0..NOTES {
        d.notes.push(Note {
            id: format!("n{i}"),
            title: format!("Nota {i}"),
            body: format!("{body} marcador-{i}"),
            tags: vec![format!("tag{}", i % 40)],
            created_at: i as i64,
            updated_at: i as i64,
            ..Default::default()
        });
    }
    for i in 0..TOMBSTONES {
        d.deleted.insert(format!("gone{i}"), i as i64);
    }
    d
}

fn time<T>(label: &str, budget: Duration, f: impl FnOnce() -> T) -> T {
    let started = Instant::now();
    let out = f();
    let took = started.elapsed();
    println!("{label:<34} {took:>10.1?}  (budget {budget:?})");
    assert!(took <= budget, "{label} took {took:?}, budget {budget:?}");
    out
}

#[test]
#[ignore]
fn large_vault_stays_responsive() {
    let dir = std::env::temp_dir().join(format!("canto-scale-{}-{}", std::process::id(), now_ms()));
    let st = AppState::new(dir.clone());
    st.create("senha-de-carga").unwrap();
    let data = big_vault();
    time("persist large vault", Duration::from_millis(1500), || st.mutate(|d| *d = data).unwrap());
    let size = std::fs::metadata(dir.join("vault.json")).unwrap().len();
    println!("{:<34} {:>10.1} MB", "vault.json on disk", size as f64 / 1e6);

    st.lock();
    time("unlock (argon2 + decode)", Duration::from_millis(3000), || st.unlock("senha-de-carga").unwrap());
    time("toggle one task (full persist)", Duration::from_millis(500), || {
        st.mutate(|d| d.tasks[0].done = !d.tasks[0].done).unwrap()
    });
    time("tasks of one day", Duration::from_millis(50), || {
        st.read(|d| d.tasks.iter().filter(|t| t.day == "2025-03-03").count()).unwrap()
    });
    time("materialize recurring for a day", Duration::from_millis(100), || {
        st.in_background(|d| (materialize(d, "2026-01-10", now_ms()), false)).unwrap()
    });
    for q in ["", "marcador-4999", "planejamento", "#tag7"] {
        time(&format!("notes page {q:?}"), Duration::from_millis(150), || {
            st.read(|d| page(&d.notes, q, PAGE_DEFAULT).total).unwrap()
        });
    }
    let (page_bytes, all_bytes) = st
        .read(|d| {
            (
                serde_json::to_vec(&page(&d.notes, "", PAGE_DEFAULT)).unwrap().len(),
                serde_json::to_vec(&d.notes).unwrap().len(),
            )
        })
        .unwrap();
    println!(
        "{:<34} {:>10.1} KB  (all notes: {:.1} MB)",
        "notes page payload to webview",
        page_bytes as f64 / 1e3,
        all_bytes as f64 / 1e6
    );
    assert!(page_bytes < 500_000, "first page ships {page_bytes} bytes");
    let other = big_vault();
    time("merge with an equal-size vault", Duration::from_millis(1000), || {
        st.read(|d| d.clone().merge(other).tasks.len()).unwrap()
    });

    let tdir = dir.join("transcripts");
    std::fs::create_dir_all(&tdir).unwrap();
    let text = "WEBVTT\n\n00:00:01.000 --> 00:00:02.000\nAna: vamos revisar o escopo da sprint.\n\n".repeat(1_000);
    for i in 0..TRANSCRIPTS {
        std::fs::write(tdir.join(format!("reuniao-{i:04}.vtt")), &text).unwrap();
    }
    time("transcripts list (no query)", Duration::from_millis(1500), || {
        canto_widget_lib::transcripts::list(&tdir, "").unwrap().len()
    });
    time("transcripts search", Duration::from_millis(3000), || {
        canto_widget_lib::transcripts::list(&tdir, "escopo").unwrap().len()
    });
    let _ = std::fs::remove_dir_all(&dir);
}
