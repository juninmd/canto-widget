use super::*;

fn review(login: &str, state: &str, body: &str) -> Review {
    Review {
        user: Some(Author {
            login: login.into(),
            avatar_url: format!("https://avatars.githubusercontent.com/{login}"),
        }),
        state: state.into(),
        body: Some(body.into()),
    }
}

#[test]
fn the_merge_state_is_ready_only_when_clean_and_unknown_only_while_github_works_it_out() {
    assert_eq!(merge_of("clean", false), Merge::Ready);
    assert_eq!(merge_of("dirty", false), Merge::Conflict);
    assert_eq!(merge_of("unknown", false), Merge::Unknown);
    assert_eq!(merge_of("", false), Merge::Unknown);
    for blocked in ["blocked", "behind", "unstable", "has_hooks"] {
        assert_eq!(merge_of(blocked, false), Merge::Blocked, "{blocked}");
    }
    assert_eq!(merge_of("clean", true), Merge::Blocked, "a draft is never ready to merge");
}

#[test]
fn the_latest_decisive_review_of_each_reviewer_stands() {
    assert_eq!(decide(&[]).0, Decision::Pending);
    assert_eq!(decide(&[review("ana", "COMMENTED", "hm")]).0, Decision::Pending, "a plain comment decides nothing");

    let (d, said) = decide(&[review("ana", "APPROVED", "  boa\n\n mesmo  ")]);
    assert_eq!(d, Decision::Approved);
    assert_eq!((said.sender.unwrap().login, said.text), ("ana".to_string(), "boa mesmo".to_string()));

    let (d, said) = decide(&[review("ana", "APPROVED", "ok"), review("bia", "CHANGES_REQUESTED", "falta teste")]);
    assert_eq!((d, said.sender.unwrap().login), (Decision::Changes, "bia".to_string()), "changes outweigh an approval");

    let (d, said) = decide(&[
        review("ana", "APPROVED", "ok"),
        review("bia", "CHANGES_REQUESTED", "x"),
        review("bia", "APPROVED", "agora sim"),
    ]);
    assert_eq!(
        (d, said.sender.unwrap().login),
        (Decision::Approved, "bia".to_string()),
        "bia changed her mind and approved last"
    );

    let (d, _) = decide(&[review("bia", "CHANGES_REQUESTED", "x"), review("bia", "DISMISSED", "")]);
    assert_eq!(d, Decision::Pending, "a dismissed review no longer counts");
}
