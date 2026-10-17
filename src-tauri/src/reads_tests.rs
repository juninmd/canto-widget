use super::*;

const RSS: &str = r#"<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>Blog Exemplo</title>
<item>
  <title>Como o cache do Cargo decide o que recompilar</title>
  <link>https://blog.exemplo.test/cargo-cache</link>
  <pubDate>Fri, 17 Oct 2026 10:00:00 +0000</pubDate>
  <description>&lt;p&gt;Um resumo &lt;b&gt;curto&lt;/b&gt; do texto.&lt;/p&gt;</description>
  <enclosure url="https://cdn.exemplo.test/cargo.png" type="image/png"/>
</item>
<item>
  <title>Notas sobre escrita técnica curta</title>
  <link>http://texto.exemplo.test/curta</link>
  <updated>2026-10-16T12:00:00Z</updated>
  <description>Sem imagem.</description>
</item>
<item><title>Sem link não vira card</title><description>x</description></item>
</channel></rss>"#;

const ATOM: &str = r#"<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Fotos Exemplo</title>
  <entry>
    <title>Trilha na serra</title>
    <link rel="alternate" href="https://fotos.exemplo.test/serra"/>
    <updated>2026-10-15T08:00:00Z</updated>
    <content type="html">&lt;img src="https://cdn.exemplo.test/serra.jpg"&gt;&lt;p&gt;Subida&lt;/p&gt;</content>
  </entry>
  <entry>
    <title>Do host interno</title>
    <link href="https://fotos.exemplo.test/interno"/>
    <summary>&lt;img src="http://192.168.0.10/foto.png"&gt;não pode baixar</summary>
  </entry>
</feed>"#;

#[test]
fn a_feed_becomes_cards_with_title_link_source_date_and_summary() {
    let articles = parse_feed(RSS.as_bytes(), "https://blog.exemplo.test/feed").unwrap();
    assert_eq!(articles.len(), 2, "a entrada sem link fica de fora");
    let first = &articles[0];
    assert_eq!(first.title, "Como o cache do Cargo decide o que recompilar");
    assert_eq!(first.url, "https://blog.exemplo.test/cargo-cache");
    assert_eq!(first.host, "blog.exemplo.test");
    assert_eq!(first.source, "Blog Exemplo");
    assert_eq!(first.summary, "Um resumo curto do texto.");
    let expected = chrono::DateTime::parse_from_rfc3339("2026-10-17T10:00:00Z").unwrap().timestamp_millis();
    assert_eq!(first.published_at, expected);
    assert!(first.has_image);
    assert_eq!(first.image.as_deref(), Some("https://cdn.exemplo.test/cargo.png"));
    assert_eq!(articles[1].host, "texto.exemplo.test");
    assert!(!articles[1].has_image);
}

#[test]
fn an_atom_entry_pictures_come_from_the_html_and_never_from_a_private_host() {
    let articles = parse_feed(ATOM.as_bytes(), "https://fotos.exemplo.test/feed.xml").unwrap();
    assert_eq!(articles.len(), 2);
    assert_eq!(articles[0].title, "Trilha na serra");
    assert_eq!(articles[0].summary, "Subida");
    assert_eq!(articles[0].image.as_deref(), Some("https://cdn.exemplo.test/serra.jpg"));
    assert!(!articles[1].has_image, "http e host privado são recusados");
    assert_eq!(articles[1].summary, "não pode baixar");
}

#[test]
fn a_feed_without_a_title_falls_back_to_its_host() {
    let without_title = RSS.replace("<title>Blog Exemplo</title>", "");
    let articles = parse_feed(without_title.as_bytes(), "https://blog.exemplo.test/feed").unwrap();
    assert_eq!(articles[0].source, "blog.exemplo.test");
    assert!(parse_feed("<html>nao e um feed</html>".as_bytes(), "https://x.test").map_or(true, |a| a.is_empty()));
}

#[test]
fn ids_are_stable_and_differ_per_address() {
    let first = article_id("https://blog.exemplo.test/a");
    assert_eq!(first, article_id("https://blog.exemplo.test/a"));
    assert_eq!(first.len(), 16);
    assert_ne!(first, article_id("https://blog.exemplo.test/b"));
}

#[test]
fn only_http_and_https_addresses_are_accepted() {
    assert!(valid_feed_url("https://blog.exemplo.test/feed"));
    assert!(valid_feed_url("http://blog.exemplo.test/feed"));
    assert!(!valid_feed_url("file:///etc/passwd"));
    assert!(!valid_feed_url("javascript:alert(1)"));
    assert!(!valid_feed_url("blog.exemplo.test/feed"));
    assert_eq!(host_of("https://Blog.Exemplo.Test/feed"), Some("blog.exemplo.test".into()));
}

#[test]
fn a_thumbnail_has_to_be_https_on_a_public_host() {
    assert!(safe_image_url("https://cdn.exemplo.test/a.png").is_some());
    assert_eq!(safe_image_url("http://cdn.exemplo.test/a.png"), None, "só https");
    for blocked in [
        "https://localhost/a.png",
        "https://127.0.0.1/a.png",
        "https://10.0.0.5/a.png",
        "https://192.168.1.10/a.png",
        "https://172.16.0.9/a.png",
        "https://169.254.1.1/a.png",
        "https://100.64.0.1/a.png",
        "https://nas.local/a.png",
        "https://maquina.internal/a.png",
        "https://[::1]/a.png",
    ] {
        assert_eq!(safe_image_url(blocked), None, "{blocked}");
    }
}

#[test]
fn public_hosts_are_the_ones_that_can_serve_a_picture() {
    assert!(is_public_host("cdn.exemplo.test"));
    assert!(is_public_host("exemplo.test"));
    assert!(is_public_host("8.8.8.8"));
    assert!(!is_public_host(""));
    assert!(!is_public_host("-sem-nada.test"));
    assert!(!is_public_host("a..b.test"));
    assert!(!is_public_host(&format!("{}.test", "a".repeat(250))));
}
