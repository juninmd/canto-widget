use super::*;

#[test]
fn logins_are_checked_before_they_reach_a_url() {
    for ok in ["ana", "a-b-1", "dependabot[bot]"] {
        assert!(valid_login(ok), "{ok}");
    }
    for bad in ["", "-ana", "a/b", "a b", "../x", "a?x=1", &"a".repeat(40)] {
        assert!(!valid_login(bad), "{bad}");
    }
}

#[test]
fn a_bot_is_never_looked_up() {
    assert!(fetch("t", "dependabot[bot]").is_err());
    assert!(fetch("t", "../orgs").is_err());
}

#[test]
fn the_card_keeps_short_text_the_year_and_only_github_links() {
    let u: User = serde_json::from_str(
        r#"{"login":"ana","name":" Ana Souza ","bio":null,"company":"Acme","location":"Recife","public_repos":12,"followers":3,
            "created_at":"2019-04-02T10:00:00Z","html_url":"https://github.com/ana"}"#,
    )
    .unwrap();
    let p = profile(u);
    assert_eq!((p.name.as_str(), p.bio.as_str(), p.since, p.public_repos), ("Ana Souza", "", 2019, 12));
    assert_eq!(p.url, "https://github.com/ana");
}

#[test]
fn a_foreign_link_and_a_long_bio_are_cut() {
    let long = "x".repeat(500);
    let u: User =
        serde_json::from_str(&format!(r#"{{"login":"ana","bio":"{long}","html_url":"https://evil.example/ana"}}"#))
            .unwrap();
    let p = profile(u);
    assert_eq!(p.bio.chars().count(), 300);
    assert_eq!(p.url, "");
    assert_eq!(p.since, 0);
}
