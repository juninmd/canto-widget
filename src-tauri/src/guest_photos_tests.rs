use super::*;

fn search(json: &str) -> Search {
    serde_json::from_str(json).unwrap()
}

#[test]
fn picks_the_exact_email_and_skips_placeholder_photos() {
    let s = search(
        r#"{"people":[
            {"emailAddresses":[{"value":"ana.souza@example.com"}],"photos":[{"url":"https://lh3.googleusercontent.com/a/x=s100","default":false}]},
            {"emailAddresses":[{"value":"ana@example.com"}],"photos":[{"url":"https://lh3.googleusercontent.com/a/g","default":true},{"url":"https://lh3.googleusercontent.com/a/real=s100"}]}
        ]}"#,
    );
    assert_eq!(photo_url(&s, "ANA@example.com").as_deref(), Some("https://lh3.googleusercontent.com/a/real=s96-c"));
    assert_eq!(photo_url(&s, "bruno@example.com"), None, "a prefix match on someone else doesn't count");
}

#[test]
fn only_a_placeholder_means_no_photo() {
    let s = search(
        r#"{"people":[{"emailAddresses":[{"value":"c@example.com"}],"photos":[{"url":"https://x","default":true}]}]}"#,
    );
    assert_eq!(photo_url(&s, "c@example.com"), None);
    assert_eq!(photo_url(&search("{}"), "c@example.com"), None, "no directory access: empty response");
}

#[test]
fn rejects_values_that_are_not_emails() {
    assert!(valid_email("ana@example.com"));
    assert!(!valid_email("ana"));
    assert!(!valid_email("@example.com"));
    assert!(!valid_email("ana@"));
    assert!(!valid_email("ana souza@example.com"));
    assert!(!valid_email(&format!("{}@example.com", "a".repeat(260))));
}

#[test]
fn locking_the_vault_forgets_the_photos() {
    let dir = std::env::temp_dir().join(format!("canto-guest-photos-{}", std::process::id()));
    let state = AppState::new(dir);
    state.guest_photos.0.lock().unwrap().insert("ana@example.com".into(), Some("data:image/png;base64,AA==".into()));
    state.lock();
    assert!(state.guest_photos.0.lock().unwrap().is_empty());
}

#[test]
fn only_a_missing_scope_asks_for_a_reconnect() {
    assert!(missing_scope(Some(r#"Bearer realm="https://accounts.google.com/", error="insufficient_scope""#), ""));
    assert!(missing_scope(None, r#"{"error":{"details":[{"reason":"ACCESS_TOKEN_SCOPE_INSUFFICIENT"}]}}"#));
    assert!(!missing_scope(
        None,
        r#"{"error":{"status":"PERMISSION_DENIED","message":"Must be a G Suite domain user."}}"#
    ));
}
