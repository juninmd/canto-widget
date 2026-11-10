use super::*;

const RELEASE: &str = r#"{
  "tag_name": "v2.1.302",
  "name": "2.1.302",
  "published_at": "2026-10-16T20:53:06Z",
  "html_url": "https://github.com/anthropics/claude-code/releases/tag/v2.1.302",
  "body": "- corrige o modo plano\n- solta a flag nova\n"
}"#;

#[test]
fn a_release_parses_with_the_notes_intact() {
    let release = parse(RELEASE.as_bytes()).unwrap();
    assert_eq!(release.tag, "v2.1.302");
    assert_eq!(release.name, "2.1.302");
    assert_eq!(release.published_at, "2026-10-16T20:53:06Z");
    assert_eq!(release.url, "https://github.com/anthropics/claude-code/releases/tag/v2.1.302");
    assert!(release.notes.contains("corrige o modo plano"));
}

#[test]
fn a_release_without_a_tag_or_off_github_is_dropped() {
    let no_tag = RELEASE.replace("\"v2.1.302\",\n  \"name\"", "\"\",\n  \"name\"");
    assert_eq!(parse(no_tag.as_bytes()), None);
    assert_eq!(parse(RELEASE.replace("https://github.com/", "https://evil.example/").as_bytes()), None);
    assert_eq!(parse("<html>não é json</html>".as_bytes()), None);
}

#[test]
fn a_release_may_come_without_a_date_or_notes() {
    let plain = r##"{"tag_name":"v0.1.0","html_url":"https://github.com/openai/codex/releases/tag/v0.1.0"}"##;
    let release = parse(plain.as_bytes()).unwrap();
    assert_eq!(release.published_at, "");
    assert_eq!(release.notes, "");
    assert_eq!(release.name, "");
}

#[test]
fn notes_are_bounded_before_they_reach_the_webview() {
    let huge = format!(
        r##"{{"tag_name":"v1","html_url":"https://github.com/openai/codex/releases/tag/v1","body":"{}"}}"##,
        "a".repeat(MAX_NOTES * 3)
    );
    assert_eq!(parse(huge.as_bytes()).unwrap().notes.chars().count(), MAX_NOTES);
}

#[cfg(test)]
mod live {
    /// Hits the real GitHub API; run with `cargo test -- --ignored` after touching a repository or the parser.
    #[test]
    #[ignore = "needs network"]
    fn every_catalogued_harness_answers_without_an_error() {
        for (harness, feed) in super::HARNESSES.iter().zip(super::fetch_all()) {
            assert!(feed.error.is_none(), "{}: {:?}", harness.id, feed.error);
        }
    }
}
