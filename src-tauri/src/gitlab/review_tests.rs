use super::*;

const BASE: &str = "https://gitlab.example";

fn discussions(v: serde_json::Value) -> Vec<Discussion> {
    serde_json::from_value(v).unwrap()
}

#[test]
fn only_a_safe_project_and_a_real_iid_reach_the_api() {
    assert_eq!(target("acme/grupo/atlas", 4).unwrap(), "acme%2Fgrupo%2Fatlas");
    for (p, n) in [("acme/atlas", 0), ("../x", 1), ("a/b?x=1", 1), ("solo", 1)] {
        assert!(target(p, n).is_err(), "{p} {n}");
        assert!(plan("approve", p, n, "").is_err(), "{p} {n}");
    }
}

#[test]
fn jobs_keep_stage_and_duration_and_name_the_states_the_app_does_not_track() {
    let raw: Vec<RawJob> = serde_json::from_value(json!([
        { "name": "lint", "stage": "test", "status": "success", "duration": 42.7, "web_url": "https://gitlab.example/a/b/-/jobs/1" },
        { "name": "deploy", "stage": "deploy", "status": "manual", "web_url": "https://evil.example/x" },
        { "name": "unit", "stage": "test", "status": "failed", "duration": null },
    ]))
    .unwrap();
    let got = jobs(BASE, raw);
    assert_eq!((got[0].state, got[0].seconds, got[0].stage.as_str()), (ChecksStatus::Success, 42, "test"));
    assert_eq!((got[1].state, got[1].label.as_str(), got[1].url.as_str()), (ChecksStatus::None, "manual", ""));
    assert_eq!((got[2].state, got[2].label.as_str(), got[2].seconds), (ChecksStatus::Failure, "", 0));
}

#[test]
fn approvers_come_first_then_the_reviewers_still_asked() {
    let got = reviewers(&["bia".into()], &["bia".into(), "caio".into()]);
    let pairs: Vec<(&str, &str)> = got.iter().map(|r| (r.login.as_str(), r.state.as_str())).collect();
    assert_eq!(pairs, [("bia", "approved"), ("caio", "pending")]);
}

#[test]
fn discussions_become_threads_without_system_notes_and_carry_their_resolved_state() {
    let raw = discussions(json!([
        { "id": "aaaaaaaa1", "individual_note": true, "notes": [
            { "id": 1, "body": "added 2 commits", "created_at": "2026-11-01T09:00:00Z", "system": true, "author": { "username": "ana" } },
            { "id": 2, "body": "olá", "created_at": "2026-11-01T10:00:00Z", "author": { "username": "ana" } } ] },
        { "id": "bbbbbbbb2", "individual_note": false, "notes": [
            { "id": 3, "body": "e se vier vazio?", "created_at": "2026-11-01T11:00:00Z", "author": { "username": "bia" }, "resolvable": true, "resolved": true,
              "position": { "new_path": "src/a.ts", "new_line": 12 } },
            { "id": 4, "body": "feito", "created_at": "2026-11-01T12:00:00Z", "author": { "username": "ci_bot", "bot": false }, "resolvable": true, "resolved": true } ] },
    ]));
    let got = entries(BASE, "acme/atlas", 7, raw);
    assert_eq!(got.iter().map(|c| c.id).collect::<Vec<_>>(), [2, 3, 4]);
    assert_eq!((got[0].thread.as_str(), got[0].resolvable), ("", false));
    assert_eq!((got[1].path.as_str(), got[1].line, got[1].thread.as_str()), ("src/a.ts", 12, "bbbbbbbb2"));
    assert!(got[1].resolved && got[1].resolvable && !got[1].reply);
    assert!(got[2].reply && got[2].bot && got[2].resolved);
    assert_eq!(got[1].url, "https://gitlab.example/acme/atlas/-/merge_requests/7#note_3");
}

#[test]
fn counts_come_from_the_patch_and_a_removed_file_keeps_its_old_name() {
    assert_eq!(count_changes("@@ -1,2 +1,2 @@\n a\n-b\n+c\n+d"), (2, 1));
    let raw: Vec<Diff> = serde_json::from_value(json!([
        { "old_path": "old.ts", "new_path": "", "deleted_file": true, "diff": "@@ -1 +0,0 @@\n-x" },
        { "old_path": "a.ts", "new_path": "b.ts", "renamed_file": true, "diff": "" },
    ]))
    .unwrap();
    let got = convert(raw);
    assert_eq!((got[0].name.as_str(), got[0].status.as_str(), got[0].deletions), ("old.ts", "removed", 1));
    assert_eq!((got[1].name.as_str(), got[1].status.as_str()), ("b.ts", "renamed"));
}

#[test]
fn approving_needs_no_text_and_a_comment_does() {
    let w = plan("approve", "acme/atlas", 7, "").unwrap();
    assert_eq!((w.put, w.path.as_str()), (false, "projects/acme%2Fatlas/merge_requests/7/approve"));
    let w = plan("comment", "acme/atlas", 7, " oi ").unwrap();
    assert_eq!((w.path.as_str(), w.json), ("projects/acme%2Fatlas/merge_requests/7/notes", json!({ "body": "oi" })));
    assert!(plan("comment", "acme/atlas", 7, "  ").is_err());
    assert!(plan("request_changes", "acme/atlas", 7, "x").is_err());
    assert!(plan("comment", "acme/atlas", 7, &"a".repeat(MAX_COMMENT + 1)).is_err());
}

#[test]
fn replying_and_resolving_only_accept_a_hex_discussion_id() {
    let w = plan_reply("acme/atlas", 7, "abcdef0123456789", "ok").unwrap();
    assert_eq!(w.path, "projects/acme%2Fatlas/merge_requests/7/discussions/abcdef0123456789/notes");
    let w = plan_resolve("acme/atlas", 7, "abcdef0123456789", true).unwrap();
    assert!(w.put && w.json == json!({ "resolved": true }));
    for bad in ["", "../x", "abc", "zzzzzzzzzz", "a/b/c/d/e/f/g/h"] {
        assert!(plan_reply("acme/atlas", 7, bad, "ok").is_err(), "{bad}");
        assert!(plan_resolve("acme/atlas", 7, bad, true).is_err(), "{bad}");
    }
}

#[test]
fn a_read_only_token_gets_a_message_that_says_what_to_change() {
    assert!(write_refused(403).unwrap().to_string().contains("escopo api"));
    assert!(write_refused(405).unwrap().to_string().contains("próprio MR"));
    assert!(write_refused(500).is_none());
}
