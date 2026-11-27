use super::*;

fn act(json: &str) -> PrAction {
    serde_json::from_str(json).unwrap()
}

fn rest(step: Result<Step>) -> (Verb, String, Option<Value>) {
    match step.unwrap() {
        Step::Rest { verb, path, json } => (verb, path, json),
        other => panic!("not a REST step: {other:?}"),
    }
}

#[test]
fn merge_close_and_reopen_hit_the_pull_request() {
    let (v, p, j) = rest(plan("a/b", 7, &act(r#"{"kind":"merge","method":"squash"}"#)));
    assert_eq!(
        (v, p.as_str(), j.unwrap()["merge_method"].as_str()),
        (Verb::Put, "repos/a/b/pulls/7/merge", Some("squash"))
    );
    let (v, p, j) = rest(plan("a/b", 7, &act(r#"{"kind":"close"}"#)));
    assert_eq!((v, p.as_str(), j.unwrap()["state"].as_str()), (Verb::Patch, "repos/a/b/pulls/7", Some("closed")));
    assert_eq!(rest(plan("a/b", 7, &act(r#"{"kind":"reopen"}"#))).2.unwrap()["state"], "open");
}

#[test]
fn a_bad_target_or_method_never_becomes_a_request() {
    assert!(plan("../etc", 7, &act(r#"{"kind":"close"}"#)).is_err());
    assert!(plan("a/b", 0, &act(r#"{"kind":"close"}"#)).is_err());
    assert!(plan("a/b", 7, &act(r#"{"kind":"merge","method":"octopus"}"#)).is_err());
}

#[test]
fn draft_is_a_graphql_step_resolved_later() {
    assert_eq!(plan("a/b", 7, &act(r#"{"kind":"draft","on":true}"#)).unwrap(), Step::Draft { on: true });
}

#[test]
fn labels_are_added_in_the_body_and_removed_in_one_encoded_segment() {
    let (v, p, j) = rest(plan("a/b", 7, &act(r#"{"kind":"label_add","name":"needs review"}"#)));
    assert_eq!(
        (v, p.as_str(), j.unwrap()["labels"][0].as_str()),
        (Verb::Post, "repos/a/b/issues/7/labels", Some("needs review"))
    );
    let (v, p, j) = rest(plan("a/b", 7, &act(r#"{"kind":"label_remove","name":"area/ui ?#"}"#)));
    assert_eq!((v, p.as_str(), j), (Verb::Delete, "repos/a/b/issues/7/labels/area%2Fui%20%3F%23", None));
    assert!(plan("a/b", 7, &act(r#"{"kind":"label_add","name":""}"#)).is_err());
}

#[test]
fn reactions_go_to_the_right_collection_and_use_githubs_names() {
    let (_, p, j) = rest(plan("a/b", 7, &act(r#"{"kind":"react","target":"pr","emoji":"🎉"}"#)));
    assert_eq!((p.as_str(), j.unwrap()["content"].as_str()), ("repos/a/b/issues/7/reactions", Some("hooray")));
    let (_, p, _) = rest(plan("a/b", 7, &act(r#"{"kind":"react","target":"comment","id":55,"emoji":"👍"}"#)));
    assert_eq!(p, "repos/a/b/issues/comments/55/reactions");
    let (_, p, _) = rest(plan("a/b", 7, &act(r#"{"kind":"react","target":"review","id":56,"emoji":"👍"}"#)));
    assert_eq!(p, "repos/a/b/pulls/comments/56/reactions");
    assert!(
        plan("a/b", 7, &act(r#"{"kind":"react","target":"comment","emoji":"👍"}"#)).is_err(),
        "a comment needs its id"
    );
    assert!(plan("a/b", 7, &act(r#"{"kind":"react","target":"pr","emoji":"🔥"}"#)).is_err(), "no flame on GitHub");
}

#[test]
fn only_the_prs_own_reaction_can_be_taken_back() {
    let (v, p, _) = rest(plan("a/b", 7, &act(r#"{"kind":"unreact","target":"pr","reaction":99}"#)));
    assert_eq!((v, p.as_str()), (Verb::Delete, "repos/a/b/issues/7/reactions/99"));
    assert!(plan("a/b", 7, &act(r#"{"kind":"unreact","target":"comment","id":5,"reaction":99}"#)).is_err());
    assert!(plan("a/b", 7, &act(r#"{"kind":"unreact","target":"pr","reaction":0}"#)).is_err());
}

#[test]
fn the_meta_reads_state_conflict_methods_and_drops_unknown_reactions() {
    let pull: Pull = serde_json::from_value(json!({
        "title": "feat: x", "state": "closed", "merged": true, "draft": false, "mergeable_state": "dirty",
        "user": { "login": "ana", "avatar_url": "https://avatars.githubusercontent.com/u/1" },
        "labels": [{ "name": "bug", "color": "D73A4A" }, { "name": "odd", "color": "zz;x" }],
        "assignees": [{ "login": "bia" }], "milestone": { "title": "v1" }, "body": "oi"
    }))
    .unwrap();
    let rules: RepoRules = serde_json::from_value(json!({ "allow_rebase_merge": false })).unwrap();
    let reactions: Vec<RawReaction> = serde_json::from_value(json!([
        { "id": 1, "content": "+1", "user": { "login": "ana" } },
        { "id": 2, "content": "weird", "user": { "login": "ana" } }
    ]))
    .unwrap();
    let m = convert(pull, rules, reactions);
    assert_eq!((m.state.as_str(), m.conflict, m.author.as_str()), ("merged", true, "ana"));
    assert_eq!(m.merge_methods, ["merge", "squash"]);
    assert_eq!(
        m.labels,
        [PrLabel { name: "bug".into(), color: "d73a4a".into() }, PrLabel { name: "odd".into(), color: String::new() }]
    );
    assert_eq!(m.reactions.len(), 1);
    assert_eq!(m.reactions[0].emoji, "👍");
    assert!(m.author_avatar.starts_with("https://avatars.githubusercontent.com/"));
}

#[test]
fn a_refused_write_explains_itself() {
    assert!(refused(405).unwrap().to_string().contains("mesclar"));
    assert!(refused(403).unwrap().to_string().contains("escrita"));
    assert!(refused(500).is_none());
}
