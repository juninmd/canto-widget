use super::*;
use crate::model::now_ms;

const T0: i64 = 1_790_000_000_000;

fn m(id: &str, score: f64) -> Model {
    Model { id: id.into(), name: id.into(), creator: "Stratos".into(), score, price: Some(1.0), speed: None }
}

fn list(n: usize) -> Vec<Model> {
    (0..n).map(|i| m(&format!("a{i}"), 90.0 - i as f64)).collect()
}

#[test]
fn the_first_fetch_seeds_the_top_10_and_bounds_the_list() {
    let mut cfg = ModelsConfig::default();
    let out = refresh(&mut cfg, T0, false, || Ok(list(80)));
    assert_eq!(out, Outcome::default(), "no changes, no alert on the first run");
    assert_eq!((cfg.models.len(), cfg.total, cfg.fetched_at), (MAX_LIST, 80, T0));
    assert_eq!(cfg.top.as_ref().unwrap().len(), 10);
    assert!(cfg.badges.is_empty());
}

#[test]
fn nothing_is_fetched_again_within_3_hours_even_when_forced() {
    let mut cfg = ModelsConfig::default();
    refresh(&mut cfg, T0, false, || Ok(list(12)));
    let mut calls = 0;
    let out = refresh(&mut cfg, T0 + FLOOR_MS - 1, true, || {
        calls += 1;
        Ok(list(12))
    });
    assert_eq!(calls, 0);
    assert!(out.throttled, "the UI says when the next fetch is allowed");
    assert_eq!(next_fetch_at(&cfg), T0 + FLOOR_MS);
    assert!(!refresh(&mut cfg, T0 + 1, false, || Ok(list(12))).throttled, "only a manual refresh is told");
    refresh(&mut cfg, T0 + FLOOR_MS, false, || {
        calls += 1;
        Ok(list(12))
    });
    assert_eq!(calls, 1);
}

#[test]
fn http_errors_spend_the_window_but_a_network_failure_does_not() {
    let mut cfg = ModelsConfig::default();
    let out = refresh(&mut cfg, T0, false, || Err(FetchError::Network("offline".into())));
    assert_eq!(cfg.tried_at, 0);
    assert!(out.error.unwrap().contains("offline"));
    let out = refresh(&mut cfg, T0, false, || Err(FetchError::RateLimited));
    assert_eq!((cfg.tried_at, out.error.as_deref()), (T0, Some("limite de buscas atingido, tente mais tarde")));
    assert!(!due(&cfg, T0 + 60_000));
}

#[test]
fn an_empty_answer_keeps_the_previous_ranking() {
    let mut cfg = ModelsConfig::default();
    refresh(&mut cfg, T0, false, || Ok(list(12)));
    let out = refresh(&mut cfg, T0 + FLOOR_MS, false, || Ok(Vec::new()));
    assert!(out.error.is_some());
    assert_eq!(cfg.models.len(), 12);
    assert_eq!(cfg.fetched_at, T0);
}

#[test]
fn a_clock_set_backwards_does_not_block_fetching() {
    let cfg = ModelsConfig { tried_at: T0, ..Default::default() };
    assert!(due(&cfg, T0 - 1));
}

#[test]
fn changes_leave_badges_that_last_7_days() {
    let mut cfg = ModelsConfig::default();
    refresh(&mut cfg, T0, false, || Ok(list(12)));
    let mut next = list(12);
    next[11].score = 95.0;
    next[5].score = 89.5;
    let t1 = T0 + FLOOR_MS;
    let out = refresh(&mut cfg, t1, false, || Ok(next));
    assert_eq!(out.changes.len(), 2);
    let v = view(&cfg, t1, Outcome::default());
    let badge = |id: &str| v.models.iter().find(|r| r.model.id == id).unwrap().badge;
    assert_eq!((badge("a11"), badge("a5"), badge("a0")), (Some(BadgeKind::New), Some(BadgeKind::Up), None));
    assert_eq!(v.models[0].rank, 1);
    assert!(view(&cfg, t1 + BADGE_MS, Outcome::default()).models.iter().all(|r| r.badge.is_none()));
}

#[test]
fn the_ranking_is_sealed_on_disk_and_survives_a_password_change() {
    let dir = std::env::temp_dir().join(format!("canto-models-{}-{}", std::process::id(), now_ms()));
    let st = AppState::new(dir);
    st.create("senha-velha").unwrap();
    let mut cfg = ModelsConfig::default();
    refresh(&mut cfg, T0, false, || Ok(vec![m("Aurora", 70.0)]));
    st.save_models(&cfg).unwrap();
    let raw = std::fs::read_to_string(store::models_path(&st.dir)).unwrap();
    assert!(!raw.contains("Aurora"), "nothing in clear on disk");
    st.change_password("senha-velha", "senha-nova").unwrap();
    st.lock();
    st.unlock("senha-nova").unwrap();
    let back = st.models_config().unwrap().unwrap();
    assert_eq!(back.models.len(), 1);
    let _ = std::fs::remove_dir_all(&st.dir);
}

#[test]
fn an_older_file_with_a_key_and_without_the_newer_fields_still_loads() {
    let cfg: ModelsConfig = serde_json::from_str(r#"{"key":"aa_chave_ficticia_0123"}"#).unwrap();
    assert!(cfg.top.is_none() && !cfg.alerts && cfg.models.is_empty());
}
