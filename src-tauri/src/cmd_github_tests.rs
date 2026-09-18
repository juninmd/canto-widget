use super::*;

fn state(name: &str) -> AppState {
    let dir = std::env::temp_dir().join(format!("canto-gh-{name}-{}-{}", std::process::id(), now_ms()));
    let _ = std::fs::remove_dir_all(&dir);
    let st = AppState::new(dir);
    st.create("senha-mestra").unwrap();
    st
}

fn cfg(expires_at: i64, refresh: &str) -> GithubConfig {
    GithubConfig {
        tokens: Tokens { access_token: "ghu_acesso".into(), refresh_token: refresh.into(), expires_at },
        login: "octocat".into(),
        source: "app".into(),
        client_id: "Iv23abc".into(),
    }
}

#[test]
fn token_stays_encrypted_on_disk_and_comes_back_identical() {
    let st = state("roundtrip");
    st.save_github(&cfg(0, "")).unwrap();
    let raw = std::fs::read_to_string(store::github_path(&st.dir)).unwrap();
    assert!(!raw.contains("ghu_acesso"), "token gravado em claro");
    assert_eq!(st.github_config().unwrap(), Some(cfg(0, "")));
    let _ = std::fs::remove_dir_all(&st.dir);
}

#[test]
fn locked_vault_does_not_hand_out_the_token() {
    let st = state("trancado");
    st.save_github(&cfg(0, "")).unwrap();
    st.lock();
    assert!(matches!(st.github_config(), Err(AppError::Locked)));
    assert!(valid_token(&st, &GithubState::default(), 0).is_err());
    let _ = std::fs::remove_dir_all(&st.dir);
}

#[test]
fn token_within_its_window_is_used_without_hitting_the_network() {
    let st = state("prazo");
    st.save_github(&cfg(10_000_000, "ghr_x")).unwrap();
    assert_eq!(valid_token(&st, &GithubState::default(), 0).unwrap().as_str(), "ghu_acesso");
    let _ = std::fs::remove_dir_all(&st.dir);
}

#[test]
fn expired_token_without_a_refresh_asks_for_a_new_login() {
    let st = state("vencido");
    st.save_github(&cfg(1_000, "")).unwrap();
    let e = valid_token(&st, &GithubState::default(), 1_000_000).unwrap_err().to_string();
    assert!(e.contains("conecte de novo"), "{e}");
    let _ = std::fs::remove_dir_all(&st.dir);
}

#[test]
fn without_an_account_the_list_asks_to_connect() {
    let st = state("sem-conta");
    let e = valid_token(&st, &GithubState::default(), 0).unwrap_err().to_string();
    assert!(e.contains("conecte sua conta"), "{e}");
    let _ = std::fs::remove_dir_all(&st.dir);
}

#[test]
fn finishing_without_a_started_login_fails_immediately() {
    let st = state("sem-fluxo");
    assert!(finish(&st, &GithubState::default()).is_err());
    let _ = std::fs::remove_dir_all(&st.dir);
}

#[test]
fn changing_the_password_keeps_the_github_account() {
    let st = state("troca");
    st.save_github(&cfg(0, "")).unwrap();
    st.change_password("senha-mestra", "senha-nova").unwrap();
    st.lock();
    st.unlock("senha-nova").unwrap();
    assert_eq!(st.github_config().unwrap().unwrap().login, "octocat");
    let _ = std::fs::remove_dir_all(&st.dir);
}
