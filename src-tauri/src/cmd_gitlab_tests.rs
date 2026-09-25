use super::*;
use crate::model::now_ms;

fn state(name: &str) -> AppState {
    let dir = std::env::temp_dir().join(format!("canto-gl-{name}-{}-{}", std::process::id(), now_ms()));
    let _ = std::fs::remove_dir_all(&dir);
    let st = AppState::new(dir);
    st.create("senha-mestra").unwrap();
    st
}

fn cfg() -> GitlabConfig {
    GitlabConfig {
        base_url: "https://gitlab.acme.io".into(),
        token: "glpat-segredo-0123456789".into(),
        username: "ana".into(),
    }
}

#[test]
fn token_stays_encrypted_on_disk_and_comes_back_identical() {
    let st = state("disco");
    st.save_gitlab(&cfg()).unwrap();
    let raw = std::fs::read_to_string(store::gitlab_path(&st.dir)).unwrap();
    assert!(!raw.contains("glpat") && !raw.contains("acme"), "address and token must not hit the disk in clear");
    assert!(st.gitlab_config().unwrap() == Some(cfg()));
    let _ = std::fs::remove_dir_all(&st.dir);
}

#[test]
fn locked_vault_does_not_hand_out_the_token() {
    let st = state("tranca");
    st.save_gitlab(&cfg()).unwrap();
    st.lock();
    assert!(matches!(st.gitlab_config(), Err(AppError::Locked)));
    let _ = std::fs::remove_dir_all(&st.dir);
}

#[test]
fn without_an_account_the_day_summary_skips_gitlab() {
    let st = state("sem-conta");
    assert!(activity_since(&st, Activity::Opened, "2026-09-18T03:00:00+00:00").is_none());
    let _ = std::fs::remove_dir_all(&st.dir);
}

#[test]
fn changing_the_password_keeps_the_gitlab_account() {
    let st = state("troca");
    st.save_gitlab(&cfg()).unwrap();
    st.change_password("senha-mestra", "senha-nova").unwrap();
    st.lock();
    st.unlock("senha-nova").unwrap();
    assert_eq!(st.gitlab_config().unwrap().unwrap().username, "ana");
    let _ = std::fs::remove_dir_all(&st.dir);
}
