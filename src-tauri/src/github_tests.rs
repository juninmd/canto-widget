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
fn assigned_merges_issues_and_prs_newest_to_oldest() {
    let issues = convert(search_response(5, vec![raw(1, "https://github.com/o/r/issues/1", "2026-09-01T00:00:00Z", false)]));
    let prs = convert(search_response(4, vec![raw(2, "https://github.com/o/r/pull/2", "2026-09-05T00:00:00Z", true)]));
    let merged = merge(issues, prs);
    assert_eq!(merged.total, 9);
    assert_eq!(merged.items.iter().map(|i| i.number).collect::<Vec<_>>(), vec![2, 1]);
}

#[test]
fn merge_respects_the_one_page_cap() {
    let many = |pr| (0..PER_PAGE as u64).map(|n| raw(n, "https://github.com/o/r/issues/1", "2026-09-01T00:00:00Z", pr)).collect();
    let merged = merge(convert(search_response(30, many(false))), convert(search_response(30, many(true))));
    assert_eq!(merged.items.len(), PER_PAGE);
}

#[test]
fn every_query_carries_an_explicit_type_and_only_open_items() {
    for q in [ASSIGNED_ISSUES, ASSIGNED_PRS, MY_PRS, REVIEW_REQUESTED, MY_ISSUES] {
        assert!(q.contains("is:open"), "{q}");
        assert!(q.contains("is:issue") ^ q.contains("is:pr"), "{q}");
    }
}
