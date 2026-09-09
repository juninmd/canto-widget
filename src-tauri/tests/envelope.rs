use canto_widget_lib::crypto::VaultKey;
use canto_widget_lib::drive::authorize_url;
use canto_widget_lib::oauth::Pkce;
use canto_widget_lib::store::{new_salt, SealedBlob, VAULT_AAD};

#[test]
fn envelope_nao_vaza_o_conteudo_em_claro() {
    let segredo = r#"{"tasks":[{"title":"trocar a senha do banco"}]}"#;
    let salt = new_salt();
    let key = VaultKey::derive("senha-mestra", &salt).unwrap();
    let blob = SealedBlob::seal(&key, &salt, segredo.as_bytes(), VAULT_AAD, 1).unwrap();

    let em_disco = serde_json::to_string(&blob).unwrap();
    assert!(!em_disco.contains("trocar a senha do banco"));
    assert!(!em_disco.contains("tasks"));
    assert!(!em_disco.contains("senha-mestra"));

    let de_volta = blob.open(&key, VAULT_AAD).unwrap();
    assert_eq!(String::from_utf8(de_volta).unwrap(), segredo);
}

#[test]
fn envelope_de_versao_desconhecida_e_recusado() {
    let salt = new_salt();
    let key = VaultKey::derive("senha", &salt).unwrap();
    let mut blob = SealedBlob::seal(&key, &salt, b"x", VAULT_AAD, 1).unwrap();
    blob.version = 99;
    assert!(blob.open(&key, VAULT_AAD).is_err());
}

#[test]
fn url_de_autorizacao_usa_pkce_s256_e_escopo_minimo() {
    let pkce = Pkce::new();
    let url = authorize_url("meu-id.apps.googleusercontent.com", "http://127.0.0.1:5731", &pkce);

    assert!(url.starts_with("https://accounts.google.com/o/oauth2/v2/auth?"));
    assert!(url.contains("code_challenge_method=S256"));
    assert!(url.contains(&format!("code_challenge={}", pkce.challenge)));
    assert!(url.contains(&format!("state={}", pkce.state)));
    assert!(url.contains("scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.appdata"));
    // identidade minima para exibir a conta, nada alem disso
    assert!(url.contains("openid") && url.contains("email"));
    assert!(url.contains("redirect_uri=http%3A%2F%2F127.0.0.1%3A5731"));
    assert!(url.contains("access_type=offline"));
    // O verifier jamais viaja na URL de autorizacao.
    assert!(!url.contains(&pkce.verifier));
}

#[test]
fn escopo_pedido_nao_alcanca_o_drive_inteiro() {
    let url = authorize_url("id", "http://127.0.0.1:1", &Pkce::new());
    assert!(!url.contains("auth%2Fdrive&") && !url.contains("auth%2Fdrive+") && !url.contains("drive.file"));
    assert!(url.contains("drive.appdata"));
}
