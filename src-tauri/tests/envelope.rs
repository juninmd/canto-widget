use canto_widget_lib::crypto::VaultKey;
use canto_widget_lib::drive::authorize_url;
use canto_widget_lib::oauth::Pkce;
use canto_widget_lib::store::{new_salt, SealedBlob, VAULT_AAD};

#[test]
fn envelope_does_not_leak_plaintext_content() {
    let secret = r#"{"tasks":[{"title":"trocar a senha do banco"}]}"#;
    let salt = new_salt();
    let key = VaultKey::derive("senha-mestra", &salt).unwrap();
    let blob = SealedBlob::seal(&key, &salt, secret.as_bytes(), VAULT_AAD, 1).unwrap();

    let on_disk = serde_json::to_string(&blob).unwrap();
    assert!(!on_disk.contains("trocar a senha do banco"));
    assert!(!on_disk.contains("tasks"));
    assert!(!on_disk.contains("senha-mestra"));

    let back = blob.open(&key, VAULT_AAD).unwrap();
    assert_eq!(String::from_utf8(back).unwrap(), secret);
}

#[test]
fn envelope_of_unknown_version_is_rejected() {
    let salt = new_salt();
    let key = VaultKey::derive("senha", &salt).unwrap();
    let mut blob = SealedBlob::seal(&key, &salt, b"x", VAULT_AAD, 1).unwrap();
    blob.version = 99;
    assert!(blob.open(&key, VAULT_AAD).is_err());
}

#[test]
fn authorization_url_uses_pkce_s256_and_minimum_scope() {
    let pkce = Pkce::new();
    let url = authorize_url("meu-id.apps.googleusercontent.com", "http://127.0.0.1:5731", &pkce);

    assert!(url.starts_with("https://accounts.google.com/o/oauth2/v2/auth?"));
    assert!(url.contains("code_challenge_method=S256"));
    assert!(url.contains(&format!("code_challenge={}", pkce.challenge)));
    assert!(url.contains(&format!("state={}", pkce.state)));
    assert!(url.contains("scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcalendar.events.readonly"));
    // minimum identity to show the account, nothing beyond that
    assert!(url.contains("openid") && url.contains("email"));
    assert!(url.contains("redirect_uri=http%3A%2F%2F127.0.0.1%3A5731"));
    assert!(url.contains("access_type=offline"));
    // The verifier never travels in the authorization URL.
    assert!(!url.contains(&pkce.verifier));
}

#[test]
fn google_login_only_serves_the_agenda_and_does_not_touch_drive() {
    // The backup is now a local file; requesting any Drive scope would be unused access.
    let url = authorize_url("id", "http://127.0.0.1:1", &Pkce::new());
    assert!(!url.contains("auth%2Fdrive"), "{url}");
    assert!(!url.contains("calendar+") && !url.contains("calendar&"), "agenda must be read-only: {url}");
}
