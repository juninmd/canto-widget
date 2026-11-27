use super::*;

fn act(json: &str) -> PrAction {
    serde_json::from_str(json).unwrap()
}

fn call(step: Result<Step>) -> (bool, bool, String, Value) {
    match step.unwrap() {
        Step::Call { put, delete, path, json } => (put, delete, path, json),
        other => panic!("not a call: {other:?}"),
    }
}

#[test]
fn merge_carries_squash_and_wait_for_the_pipeline() {
    let (put, _, path, j) = call(plan("g/p", 3, &act(r#"{"kind":"merge","method":"squash","auto":true}"#)));
    assert!(put);
    assert_eq!(path, "projects/g%2Fp/merge_requests/3/merge");
    assert_eq!((j["squash"].as_bool(), j["merge_when_pipeline_succeeds"].as_bool()), (Some(true), Some(true)));
    assert_eq!(call(plan("g/p", 3, &act(r#"{"kind":"merge","method":"merge"}"#))).3["squash"], false);
    assert!(plan("g/p", 3, &act(r#"{"kind":"merge","method":"rebase"}"#)).is_err());
}

#[test]
fn close_reopen_and_labels_are_updates_of_the_mr() {
    assert_eq!(call(plan("g/p", 3, &act(r#"{"kind":"close"}"#))).3["state_event"], "close");
    assert_eq!(call(plan("g/p", 3, &act(r#"{"kind":"reopen"}"#))).3["state_event"], "reopen");
    assert_eq!(call(plan("g/p", 3, &act(r#"{"kind":"label_add","name":"area::ui"}"#))).3["add_labels"], "area::ui");
    assert_eq!(call(plan("g/p", 3, &act(r#"{"kind":"label_remove","name":"bug"}"#))).3["remove_labels"], "bug");
    assert!(plan("g/p", 3, &act(r#"{"kind":"label_add","name":"a\u0000b"}"#)).is_err());
}

#[test]
fn a_bad_project_never_becomes_a_request() {
    assert!(plan("../x", 3, &act(r#"{"kind":"close"}"#)).is_err());
    assert!(plan("g/p", 0, &act(r#"{"kind":"close"}"#)).is_err());
}

#[test]
fn awards_go_to_the_mr_or_to_a_note_and_come_back_by_id() {
    let (put, del, path, j) = call(plan("g/p", 3, &act(r#"{"kind":"react","target":"pr","emoji":"🔥"}"#)));
    assert_eq!(
        (put, del, path.as_str(), j["name"].as_str()),
        (false, false, "projects/g%2Fp/merge_requests/3/award_emoji", Some("fire"))
    );
    let (_, _, path, _) = call(plan("g/p", 3, &act(r#"{"kind":"react","target":"comment","id":8,"emoji":"👍"}"#)));
    assert!(path.ends_with("/notes/8/award_emoji"));
    let (_, del, path, _) = call(plan("g/p", 3, &act(r#"{"kind":"unreact","target":"pr","reaction":77}"#)));
    assert!(del && path.ends_with("/award_emoji/77"));
    let (_, del, path, _) = call(plan("g/p", 3, &act(r#"{"kind":"unreact","target":"comment","id":8,"reaction":77}"#)));
    assert!(del && path.ends_with("/notes/8/award_emoji/77"));
    assert!(plan("g/p", 3, &act(r#"{"kind":"unreact","target":"pr","reaction":0}"#)).is_err());
}

#[test]
fn draft_waits_for_the_current_title() {
    assert_eq!(plan("g/p", 3, &act(r#"{"kind":"draft","on":false}"#)).unwrap(), Step::Draft { on: false });
}

#[test]
fn the_meta_reads_state_draft_conflict_and_known_awards() {
    let mr: Mr = serde_json::from_value(json!({
        "title": "Draft: x", "state": "opened", "work_in_progress": true, "has_conflicts": true,
        "author": { "username": "ana", "avatar_url": "https://gitlab.acme.io/uploads/a.png" },
        "labels": [{ "name": "area::ui", "color": "#428BCA" }], "description": "oi"
    }))
    .unwrap();
    let awards: Vec<Award> = serde_json::from_value(json!([
        { "id": 4, "name": "tada", "user": { "username": "bia" } },
        { "id": 5, "name": "custom_party", "user": { "username": "bia" } }
    ]))
    .unwrap();
    let m = convert("https://gitlab.acme.io", mr, awards);
    assert_eq!((m.state.as_str(), m.draft, m.conflict), ("open", true, true));
    assert_eq!(m.labels[0].color, "428bca");
    assert_eq!(m.reactions, [PrReaction { id: 4, emoji: "🎉".into(), user: "bia".into() }]);
    assert!(m.author_avatar.ends_with("/uploads/a.png"));
    assert_eq!(m.merge_methods, ["merge", "squash"]);
}

#[test]
fn a_refused_write_names_the_scope() {
    assert!(refused(403).unwrap().to_string().contains("api"));
    assert!(refused(405).unwrap().to_string().contains("mesclar"));
}
