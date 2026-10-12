use super::*;
use crate::calendar::AgendaItem;

fn text(body: &str, login: &str) -> Text {
    Text {
        body: Some(body.into()),
        user: Some(Author {
            login: login.into(),
            avatar_url: format!("https://avatars.githubusercontent.com/{login}"),
        }),
    }
}

#[test]
fn a_mention_is_a_whole_word_in_any_case() {
    assert!(mentions_login("oi @Voce, olha", "voce"));
    assert!(mentions_login("@voce", "VOCE"));
    assert!(!mentions_login("mande para a@voce.com", "voce"), "an e-mail is not a mention");
    assert!(!mentions_login("@voce-bot passou aqui", "voce"));
    assert!(!mentions_login("@vocee", "voce"));
    assert!(!mentions_login("@voce", ""));
}

#[test]
fn the_newest_text_that_mentions_the_user_names_the_sender() {
    let texts = vec![text("@voce veja", "ana"), text("sem menção", "bia"), text("de novo @voce", "caio")];
    let (author, body) = pick(texts, "voce").expect("a sender");
    assert_eq!((author.login.as_str(), body.as_str()), ("caio", "de novo @voce"));
    assert!(pick(vec![text("nada", "ana")], "voce").is_none());
    assert!(pick(vec![Text { body: Some("@voce".into()), user: None }], "voce").is_none());
}

#[test]
fn a_short_text_is_flattened_and_a_long_one_keeps_the_stretch_around_the_mention() {
    assert_eq!(excerpt("oi\n\n  @voce   olha", "voce", 280), "oi @voce olha");

    let long = format!("{} @Voce veja o retry {}", "a".repeat(200), "z".repeat(200));
    let cut = excerpt(&long, "voce", 100);
    assert!(cut.starts_with('…') && cut.ends_with('…'), "{cut}");
    assert!(cut.contains("@Voce veja o retry"), "{cut}");
    assert_eq!(cut.chars().count(), 100 + 2);

    let late = format!("{} @voce", "a".repeat(300));
    let cut = excerpt(&late, "voce", 100);
    assert!(cut.starts_with('…') && cut.ends_with("@voce"), "{cut}");
    assert_eq!(cut.chars().count(), 100 + 1, "the window slides back instead of running past the end");

    let early = format!("@voce {}", "a".repeat(300));
    assert!(excerpt(&early, "voce", 100).starts_with("@voce a"));
    assert!(excerpt(&"é".repeat(300), "voce", 50).ends_with('…'), "multi-byte text cuts on characters");
}

#[test]
fn the_comment_search_starts_an_hour_before_the_last_update() {
    assert_eq!(since("2026-10-12T10:30:00Z").as_deref(), Some("2026-10-12T09:30:00Z"));
    assert!(since("ontem").is_none());
}

#[test]
fn only_the_forges_own_image_hosts_are_trusted() {
    assert!(trusted_github_avatar("https://avatars.githubusercontent.com/u/1?v=4"));
    assert!(trusted_github_avatar("https://avatars0.githubusercontent.com/u/1"));
    assert!(!trusted_github_avatar("http://avatars.githubusercontent.com/u/1"));
    assert!(!trusted_github_avatar("https://avatars.githubusercontent.com.evil.io/u/1"));
    assert!(!trusted_github_avatar("https://127.0.0.1/a.png"));

    let base = "https://git.example.com";
    assert!(trusted_gitlab_avatar("https://git.example.com/uploads/a.png", base));
    assert!(trusted_gitlab_avatar("https://secure.gravatar.com/avatar/abc", base));
    assert!(!trusted_gitlab_avatar("https://evil.example.org/a.png", base));
    assert!(!trusted_gitlab_avatar("http://git.example.com/uploads/a.png", base), "no TLS");
    assert!(!trusted_gitlab_avatar("", base));
}

fn alert(avatar: &str) -> AgendaItem {
    AgendaItem { sender: Some(Sender { avatar: avatar.into(), ..Default::default() }), ..Default::default() }
}

#[test]
fn avatars_are_downloaded_once_and_untrusted_or_failed_ones_are_dropped() {
    let calls = std::cell::Cell::new(0);
    let download = |u: &str| {
        calls.set(calls.get() + 1);
        (u != "https://ok.test/broken").then(|| "data:image/png;base64,AA==".to_string())
    };
    let trusted = |u: &str| u.starts_with("https://ok.test/");
    let mut cache = HashMap::new();
    let mut events = [
        alert("https://ok.test/a"),
        alert("https://ok.test/a"),
        alert("https://evil.test/a"),
        alert("https://ok.test/broken"),
    ];
    resolve_avatars(events.iter_mut().filter_map(|e| e.sender.as_mut()), &mut cache, trusted, download);
    let avatars: Vec<&str> = events.iter().map(|e| e.sender.as_ref().unwrap().avatar.as_str()).collect();
    assert_eq!(avatars, ["data:image/png;base64,AA==", "data:image/png;base64,AA==", "", ""]);
    assert_eq!(calls.get(), 2, "one for the repeated URL, one for the failing one; the untrusted never leaves");
    assert_eq!(cache.len(), 1, "a failure is not remembered");
}
