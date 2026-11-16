use super::*;

#[test]
fn accepts_plain_http_and_https() {
    assert_eq!(parse_web_url("https://example.com/a?b=1").unwrap().as_str(), "https://example.com/a?b=1");
    assert_eq!(parse_web_url("http://localhost:8080/").unwrap().as_str(), "http://localhost:8080/");
    assert_eq!(parse_web_url("  HTTPS://Example.com/x  ").unwrap().as_str(), "https://example.com/x");
}

#[test]
fn refuses_everything_else() {
    let long = format!("https://example.com/{}", "a".repeat(2049 - "https://example.com/".len()));
    assert_eq!(long.len(), 2049);
    for bad in [
        "javascript:alert(1)",
        "file:///c:/x",
        "https://u:p@example.com/",
        "https://example.com@evil.example/",
        "https://exa mple.com",
        "https://example.com/\r\n",
        "https://example.com/\r\nx",
        "",
        "https://",
        "httpfoo://x",
        &long,
    ] {
        assert!(matches!(parse_web_url(bad), Err(AppError::Config(m)) if m == "link não suportado"), "{bad:?}");
    }
}

#[test]
fn the_filter_helper_drops_invalid_links_and_normalizes_the_rest() {
    assert_eq!(web_url_or_none(" https://example.com ").as_deref(), Some("https://example.com/"));
    assert_eq!(web_url_or_none("httpfoo://x"), None);
}
