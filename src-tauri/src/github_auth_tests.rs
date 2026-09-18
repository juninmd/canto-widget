use super::*;
use serde_json::json;

#[test]
fn valid_pat_comes_back_trimmed() {
    assert_eq!(validate_pat("  github_pat_11ABC_def  ").unwrap(), "github_pat_11ABC_def");
    assert_eq!(validate_pat("ghp_abc123").unwrap(), "ghp_abc123");
}

#[test]
fn oddly_formatted_pat_is_rejected() {
    for raw in ["", "   ", "ghp abc", "ghp_abc\nX-Header: 1", "tok\u{e9}n", &"a".repeat(256)] {
        assert!(validate_pat(raw).is_err(), "aceitou {raw:?}");
    }
}

#[test]
fn user_has_not_typed_the_code_yet() {
    assert_eq!(interpret(&json!({"error": "authorization_pending"}), 0).unwrap(), PollResult::Pending);
}

#[test]
fn github_asks_to_wait_longer() {
    assert_eq!(interpret(&json!({"error": "slow_down", "interval": 15}), 0).unwrap(), PollResult::SlowDown(15));
}

#[test]
fn expired_or_denied_code_ends_the_login() {
    let e = interpret(&json!({"error": "expired_token"}), 0).unwrap_err().to_string();
    assert!(e.contains("expirou"), "{e}");
    assert!(interpret(&json!({"error": "access_denied"}), 0).is_err());
}

#[test]
fn expiring_token_stores_the_expiry_and_the_refresh_token() {
    let v = json!({"access_token": "ghu_x", "refresh_token": "ghr_y", "expires_in": 28800});
    let PollResult::Ready(t) = interpret(&v, 1_000).unwrap() else { panic!("esperava token") };
    assert_eq!(t, Tokens { access_token: "ghu_x".into(), refresh_token: "ghr_y".into(), expires_at: 1_000 + 28_800_000 });
}

#[test]
fn token_without_expiry_never_expires() {
    let PollResult::Ready(t) = interpret(&json!({"access_token": "ghu_x"}), 5).unwrap() else { panic!() };
    assert_eq!(t.expires_at, 0);
    assert!(!t.expired(i64::MAX));
}

#[test]
fn response_without_token_or_error_is_a_failure() {
    assert!(interpret(&json!({}), 0).is_err());
}

#[test]
fn renews_one_minute_before_expiring() {
    let t = Tokens { access_token: "a".into(), refresh_token: "r".into(), expires_at: 100_000 };
    assert!(!t.expired(100_000 - SLACK_MS - 1));
    assert!(t.expired(100_000 - SLACK_MS));
}
