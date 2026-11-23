use super::*;

fn raw(number: u64, url: &str, updated: &str, pr: bool) -> serde_json::Value {
    let mut v = serde_json::json!({
        "number": number,
        "title": format!("item {number}"),
        "html_url": url,
        "repository_url": "https://api.github.com/repos/octo/canto",
        "updated_at": updated,
        "user": { "login": "octocat" }
    });
    if pr {
        v["pull_request"] = serde_json::json!({ "url": "x" });
        v["draft"] = serde_json::json!(true);
    }
    v
}

fn search_response(total: u64, items: Vec<serde_json::Value>) -> SearchResponse {
    serde_json::from_value(serde_json::json!({ "total_count": total, "items": items })).unwrap()
}

#[test]
fn search_result_becomes_an_item_with_repo_and_type() {
    let list =
        convert(search_response(1, vec![raw(7, "https://github.com/octo/canto/pull/7", "2026-09-10T10:00:00Z", true)]));
    assert_eq!(list.total, 1);
    let it = &list.items[0];
    assert_eq!((it.repo.as_str(), it.number, it.is_pr, it.draft), ("octo/canto", 7, true, true));
    assert_eq!(it.author, "octocat");
}

#[test]
fn issue_without_a_pr_field_is_not_marked_as_pr() {
    let list = convert(search_response(
        1,
        vec![raw(3, "https://github.com/octo/canto/issues/3", "2026-09-10T10:00:00Z", false)],
    ));
    assert!(!list.items[0].is_pr);
    assert!(!list.items[0].draft);
}

#[test]
fn link_outside_github_is_dropped() {
    let list = convert(search_response(
        2,
        vec![
            raw(1, "javascript:alert(1)", "2026-09-10T10:00:00Z", false),
            raw(2, "https://evil.example/octo/canto/issues/2", "2026-09-10T10:00:00Z", false),
        ],
    ));
    assert!(list.items.is_empty());
}

#[test]
fn item_keeps_what_the_sort_needs_and_a_ready_reference() {
    let mut v = raw(9, "https://github.com/octo/canto/issues/9", "2026-09-10T10:00:00Z", false);
    v["created_at"] = serde_json::json!("2026-09-01T08:00:00Z");
    v["comments"] = serde_json::json!(4);
    let it = &convert(search_response(1, vec![v])).items[0];
    assert_eq!(
        (it.created_at.as_str(), it.comments, it.reference.as_str()),
        ("2026-09-01T08:00:00Z", 4, "octo/canto#9")
    );
}

#[test]
fn raw_comment_parses_user_and_url() {
    let json = serde_json::json!({
        "id": 12345,
        "html_url": "https://github.com/octo/canto/pull/7#issuecomment-12345",
        "body": "Que app legal!",
        "created_at": "2026-09-15T10:00:00Z",
        "user": {
            "login": "joao",
            "type": "User",
            "avatar_url": "https://avatars.githubusercontent.com/u/123"
        }
    });
    let c: RawComment = serde_json::from_value(json).unwrap();
    assert_eq!(c.id, 12345);
    assert_eq!(c.body, "Que app legal!");
    assert_eq!(c.user.as_ref().unwrap().login, "joao");
    assert_eq!(c.user.as_ref().unwrap().user_type.as_deref(), Some("User"));
}

#[test]
fn pr_comments_drop_untrusted_avatars_and_non_github_links() {
    let raw: Vec<RawComment> = serde_json::from_value(serde_json::json!([
        {
            "id": 1,
            "html_url": "https://github.com/octo/canto/pull/7#issuecomment-1",
            "body": "ok",
            "created_at": "2026-09-15T10:00:00Z",
            "user": { "login": "ok", "avatar_url": "https://avatars.githubusercontent.com/u/1" }
        },
        {
            "id": 2,
            "html_url": "https://github.com/octo/canto/pull/7#issuecomment-2",
            "body": "evil avatar",
            "created_at": "2026-09-15T10:01:00Z",
            "user": { "login": "bad", "avatar_url": "https://evil.example/a.png" }
        },
        {
            "id": 3,
            "html_url": "https://evil.example/comment",
            "body": "evil url",
            "created_at": "2026-09-15T10:02:00Z",
            "user": { "login": "bad2" }
        }
    ]))
    .unwrap();
    let parsed = parse_comments(raw, |u| format!("data:image/png;base64,{}", u.len()));
    assert_eq!(parsed.len(), 2);
    assert!(parsed[0].avatar_url.starts_with("data:image/png;base64,"));
    assert_eq!(parsed[1].avatar_url, "");
}

#[test]
fn an_item_carries_its_first_labels_and_a_one_line_description() {
    let mut v = raw(9, "https://github.com/octo/canto/pull/9", "2026-09-10T10:00:00Z", true);
    v["labels"] =
        serde_json::json!([{ "name": "bug" }, { "name": "" }, { "name": "ui" }, { "name": "a" }, { "name": "b" }]);
    v["body"] = serde_json::json!("Fixes the\n\nfocus   bug.\n");
    let it = &convert(search_response(1, vec![v])).items[0];
    assert_eq!(it.labels, ["bug", "ui", "a"], "empty names are skipped and the list is capped");
    assert_eq!(it.snippet, "Fixes the focus bug.");
}

#[test]
fn an_item_without_labels_or_body_has_neither() {
    let it = &convert(search_response(1, vec![raw(9, "https://github.com/octo/canto/issues/9", "", false)])).items[0];
    assert!(it.labels.is_empty() && it.snippet.is_empty());
}

#[test]
fn the_author_picture_is_kept_only_from_githubs_own_image_host() {
    let mut v = raw(9, "https://github.com/octo/canto/pull/9", "", true);
    v["user"] =
        serde_json::json!({ "login": "octocat", "avatar_url": "https://avatars.githubusercontent.com/u/1?v=4" });
    assert_eq!(
        convert(search_response(1, vec![v.clone()])).items[0].author_avatar,
        "https://avatars.githubusercontent.com/u/1?v=4"
    );
    v["user"]["avatar_url"] = serde_json::json!("https://evil.example/u/1.png");
    assert_eq!(convert(search_response(1, vec![v])).items[0].author_avatar, "");
}
