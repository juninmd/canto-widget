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
    let list = convert(search_response(1, vec![raw(7, "https://github.com/octo/canto/pull/7", "2026-09-10T10:00:00Z", true)]));
    assert_eq!(list.total, 1);
    let it = &list.items[0];
    assert_eq!((it.repo.as_str(), it.number, it.is_pr, it.draft), ("octo/canto", 7, true, true));
    assert_eq!(it.author, "octocat");
}

#[test]
fn issue_without_a_pr_field_is_not_marked_as_pr() {
    let list = convert(search_response(1, vec![raw(3, "https://github.com/octo/canto/issues/3", "2026-09-10T10:00:00Z", false)]));
    assert!(!list.items[0].is_pr);
    assert!(!list.items[0].draft);
}

#[test]
fn link_outside_github_is_dropped() {
    let list = convert(search_response(2, vec![
        raw(1, "javascript:alert(1)", "2026-09-10T10:00:00Z", false),
        raw(2, "https://evil.example/octo/canto/issues/2", "2026-09-10T10:00:00Z", false),
    ]));
    assert!(list.items.is_empty());
}

#[test]
fn item_keeps_what_the_sort_needs_and_a_ready_reference() {
    let mut v = raw(9, "https://github.com/octo/canto/issues/9", "2026-09-10T10:00:00Z", false);
    v["created_at"] = serde_json::json!("2026-09-01T08:00:00Z");
    v["comments"] = serde_json::json!(4);
    let it = &convert(search_response(1, vec![v])).items[0];
    assert_eq!((it.created_at.as_str(), it.comments, it.reference.as_str()), ("2026-09-01T08:00:00Z", 4, "octo/canto#9"));
}
