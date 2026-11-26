use super::*;
use serde_json::json;

fn raw(v: serde_json::Value) -> Raw {
    serde_json::from_value(v).unwrap()
}

#[test]
fn general_and_inline_comments_merge_oldest_first() {
    let general = vec![raw(
        json!({ "id": 2, "html_url": "https://github.com/a/b/pull/1#issuecomment-2", "body": "ok", "created_at": "2026-11-02T10:00:00Z", "user": { "login": "ana" } }),
    )];
    let inline = vec![raw(
        json!({ "id": 1, "html_url": "https://github.com/a/b/pull/1#discussion_r1", "body": "e se vier vazio?", "created_at": "2026-11-01T10:00:00Z", "user": { "login": "bia" }, "path": "src/a.ts", "line": 12, "diff_hunk": "@@ -1 +1 @@\n-a\n+b" }),
    )];
    let got = merge(general, inline);
    assert_eq!(got.iter().map(|c| c.id).collect::<Vec<_>>(), [1, 2]);
    assert_eq!((got[0].path.as_str(), got[0].line), ("src/a.ts", 12));
    assert_eq!((got[1].path.as_str(), got[1].line), ("", 0));
}

#[test]
fn links_outside_github_are_dropped() {
    let evil = raw(
        json!({ "id": 1, "html_url": "https://evil.example/x", "body": "x", "created_at": "2026-11-01T10:00:00Z" }),
    );
    assert!(merge(vec![evil], vec![]).is_empty());
}

#[test]
fn bots_are_marked_and_a_reply_leaves_the_diff_to_its_thread() {
    let bot = raw(
        json!({ "id": 1, "html_url": "https://github.com/a/b/pull/1#c", "body": "cobertura", "created_at": "2026-11-01T10:00:00Z", "user": { "login": "ci[bot]", "type": "Bot" } }),
    );
    let reply = raw(
        json!({ "id": 2, "html_url": "https://github.com/a/b/pull/1#r2", "body": "feito", "created_at": "2026-11-01T11:00:00Z", "user": { "login": "ana" }, "path": "a.ts", "original_line": 9, "diff_hunk": "+x", "in_reply_to_id": 1 }),
    );
    let got = merge(vec![bot], vec![reply]);
    assert!(got[0].bot && !got[1].bot);
    assert!(got[1].reply && got[1].hunk.is_empty());
    assert_eq!(got[1].line, 9);
}

#[test]
fn the_diff_keeps_only_its_last_lines_and_a_long_body_is_cut() {
    let hunk: String = (0..20).map(|i| format!("+l{i}\n")).collect();
    let long = "ação ".repeat(600);
    let c = raw(
        json!({ "id": 1, "html_url": "https://github.com/a/b/pull/1#r1", "body": long, "created_at": "2026-11-01T10:00:00Z", "path": "a.ts", "line": 3, "diff_hunk": hunk }),
    );
    let got = merge(vec![], vec![c]);
    assert_eq!(got[0].hunk.lines().count(), MAX_HUNK_LINES);
    assert!(got[0].hunk.ends_with("+l19"));
    assert!(got[0].body.chars().count() <= MAX_BODY);
}
