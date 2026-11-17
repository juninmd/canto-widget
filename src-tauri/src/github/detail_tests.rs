use super::*;

fn review(login: &str, state: &str) -> Review {
    serde_json::from_value(json!({ "user": { "login": login }, "state": state })).unwrap()
}

#[test]
fn reviewers_list_who_answered_then_who_was_only_asked() {
    let reviews = [review("ana", "APPROVED"), review("bia", "CHANGES_REQUESTED"), review("caio", "COMMENTED")];
    let asked = ["bia".to_string(), "duda".to_string()];
    let got = reviewers(&reviews, &asked);
    let pairs: Vec<(&str, &str)> = got.iter().map(|r| (r.login.as_str(), r.state.as_str())).collect();
    assert_eq!(pairs, [("ana", "approved"), ("bia", "changes"), ("duda", "pending")]);
}

#[test]
fn a_long_description_is_cut_on_a_character_boundary() {
    assert_eq!(clip("  curto  ", 10), "curto");
    let long = "ação ".repeat(400);
    let cut = clip(&long, 20);
    assert!(cut.ends_with('…'));
    assert!(cut.chars().count() <= 20);
}

#[test]
fn jobs_keep_the_state_and_drop_links_outside_github() {
    let runs: RunList = serde_json::from_value(json!({ "check_runs": [
        { "name": "build", "html_url": "https://github.com/a/b/actions/runs/1", "status": "completed", "conclusion": "success" },
        { "name": "deploy", "html_url": "https://evil.example/x", "status": "in_progress" },
        { "name": "test", "html_url": "https://github.com/a/b/actions/runs/2", "status": "completed", "conclusion": "failure" },
    ] })).unwrap();
    let got = jobs(runs.check_runs);
    assert_eq!(got[0].state, ChecksStatus::Success);
    assert_eq!(got[1].state, ChecksStatus::Running);
    assert_eq!(got[1].url, "");
    assert_eq!(got[2].state, ChecksStatus::Failure);
}

#[test]
fn only_a_safe_repository_and_a_real_number_reach_the_api() {
    assert!(check_target("acme/atlas", 3).is_ok());
    for (repo, n) in [("acme/atlas", 0), ("../x", 1), ("a/b?x=1", 1), ("a/b/c", 1), ("solo", 1)] {
        assert!(check_target(repo, n).is_err(), "{repo} {n}");
        assert!(plan("approve", repo, n, "").is_err(), "{repo} {n}");
    }
}

#[test]
fn approving_posts_a_review_and_the_text_is_optional() {
    let bare = plan("approve", "acme/atlas", 7, "  ").unwrap();
    assert_eq!(bare.path, "repos/acme/atlas/pulls/7/reviews");
    assert_eq!(bare.json, json!({ "event": "APPROVE" }));
    let said = plan("approve", "acme/atlas", 7, " Bom trabalho ").unwrap();
    assert_eq!(said.json, json!({ "event": "APPROVE", "body": "Bom trabalho" }));
}

#[test]
fn a_comment_needs_text_and_goes_to_the_conversation() {
    let w = plan("comment", "acme/atlas", 7, "Obrigado!").unwrap();
    assert_eq!(w.path, "repos/acme/atlas/issues/7/comments");
    assert_eq!(w.json, json!({ "body": "Obrigado!" }));
    assert!(plan("comment", "acme/atlas", 7, "   ").is_err());
}

#[test]
fn unknown_actions_and_oversized_text_are_refused() {
    assert!(plan("merge", "acme/atlas", 7, "").is_err());
    assert!(plan("request_changes", "acme/atlas", 7, "x").is_err());
    assert!(plan("comment", "acme/atlas", 7, &"a".repeat(MAX_COMMENT + 1)).is_err());
    assert!(plan("comment", "acme/atlas", 7, &"a".repeat(MAX_COMMENT)).is_ok());
}

#[test]
fn a_read_only_token_gets_a_message_that_says_what_to_change() {
    for status in [403, 404] {
        let text = write_refused(status).unwrap().to_string();
        assert!(text.contains("permissão de escrita"), "{text}");
    }
    assert!(write_refused(422).unwrap().to_string().contains("próprio PR"));
    assert!(write_refused(500).is_none());
    assert!(write_refused(200).is_none());
}
