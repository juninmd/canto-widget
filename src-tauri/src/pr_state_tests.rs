use super::*;
use crate::forge::item;

fn state(d: Decision, m: Merge, comments: u64) -> PrState {
    PrState { decision: d, merge: m, comments }
}

fn pr(n: u64) -> ForgeItem {
    ForgeItem { is_pr: true, ..item(n, "", "", 0) }
}

const ALL: Wanted = Wanted { reviews: true, merge_state: true, comments: true };

fn marina() -> Said {
    Said {
        sender: Some(Sender { name: "Marina Souza".into(), login: "marina".into(), avatar: String::new() }),
        text: "ótimo trabalho".into(),
        mentions_me: false,
    }
}

#[test]
fn each_kind_of_change_is_seen_once_when_it_starts() {
    let base = state(Decision::Pending, Merge::Blocked, 2);
    assert!(changes(&base, &base).is_empty());
    assert_eq!(changes(&base, &state(Decision::Approved, Merge::Blocked, 2)), [Change::Approved]);
    assert_eq!(changes(&base, &state(Decision::Changes, Merge::Blocked, 2)), [Change::Changes]);
    assert_eq!(changes(&base, &state(Decision::Pending, Merge::Ready, 2)), [Change::Ready]);
    assert_eq!(changes(&base, &state(Decision::Pending, Merge::Conflict, 2)), [Change::Conflict]);
    assert_eq!(changes(&base, &state(Decision::Pending, Merge::Blocked, 5)), [Change::Comments]);
    let ready = state(Decision::Approved, Merge::Ready, 2);
    assert!(changes(&ready, &ready).is_empty(), "staying approved or ready never rings again");
    assert!(changes(&ready, &state(Decision::Pending, Merge::Blocked, 1)).is_empty(), "losing a state is silent");
    assert_eq!(
        changes(&state(Decision::Changes, Merge::Blocked, 0), &state(Decision::Approved, Merge::Ready, 0)),
        [Change::Approved, Change::Ready]
    );
}

#[test]
fn the_first_reading_and_new_prs_only_seed_and_an_unknown_merge_keeps_the_last_one() {
    let (a, b) = (pr(1), pr(2));
    let seen = state(Decision::Pending, Merge::Blocked, 0);
    let (changed, mem) = advance(None, vec![(&a, seen.clone())]);
    assert!(changed.is_empty() && mem.len() == 1);

    let now =
        vec![(&a, state(Decision::Approved, Merge::Unknown, 0)), (&b, state(Decision::Approved, Merge::Ready, 9))];
    let (changed, next) = advance(Some(&mem), now);
    assert_eq!(changed.len(), 1, "the PR that was not listed before only seeds");
    assert_eq!((changed[0].0.number, &changed[0].1[..]), (1, &[Change::Approved][..]));
    assert_eq!(next["o/r#1"].merge, Merge::Blocked, "unknown carries the last known state");
    assert_eq!(next["o/r#2"].comments, 9);

    let (_, dropped) = advance(Some(&next), vec![(&b, state(Decision::Approved, Merge::Ready, 9))]);
    assert_eq!(dropped.len(), 1, "a PR that left the list is forgotten");
    let (back, _) = advance(Some(&dropped), vec![(&a, state(Decision::Approved, Merge::Ready, 0))]);
    assert!(back.is_empty(), "and seeds again if it returns");
}

#[test]
fn an_approval_names_who_and_what_they_said_in_either_language() {
    let a = pr(7);
    let said = HashMap::from([(("o/r#7".to_string(), Change::Approved), marina())]);
    let [e] = &events(&[(&a, vec![Change::Approved])], &said, ALL, false)[..] else { panic!("one alert") };
    assert_eq!((e.id.as_str(), e.tag.as_str(), e.organizer.as_str()), ("pr:approved:o/r#7", "approved", "o/r#7"));
    assert_eq!(e.description, "Marina Souza aprovou este PR.\nótimo trabalho");
    assert_eq!(e.sender.as_ref().map(|s| s.login.as_str()), Some("marina"));
    assert!(events(&[(&a, vec![Change::Approved])], &said, ALL, true)[0]
        .description
        .starts_with("Marina Souza approved this PR."));
    let mr = ForgeItem { reference: "g/p!3".into(), ..pr(3) };
    assert_eq!(
        events(&[(&mr, vec![Change::Conflict])], &HashMap::new(), ALL, false)[0].description,
        "Conflito com a branch base; atualize este MR para poder fazer merge."
    );
}

#[test]
fn an_approval_that_made_the_pr_ready_is_one_alert() {
    let a = pr(7);
    let said = HashMap::from([(("o/r#7".to_string(), Change::Approved), Said { text: String::new(), ..marina() })]);
    let out = events(&[(&a, vec![Change::Approved, Change::Ready])], &said, ALL, false);
    let [e] = &out[..] else { panic!("one alert, got {out:?}") };
    assert_eq!(e.tag, "ready");
    assert_eq!(e.description, "Marina Souza aprovou; está pronto para merge.");

    let only_ready = Wanted { reviews: false, ..ALL };
    let out = events(&[(&a, vec![Change::Approved, Change::Ready])], &said, only_ready, false);
    assert_eq!((out.len(), out[0].tag.as_str()), (1, "ready"));
    let only_reviews = Wanted { merge_state: false, ..ALL };
    let out = events(&[(&a, vec![Change::Approved, Change::Ready])], &said, only_reviews, false);
    assert_eq!((out.len(), out[0].tag.as_str()), (1, "approved"), "with the merge switch off the approval still rings");
}

#[test]
fn the_settings_switch_each_group_off_and_a_burst_becomes_one_summary() {
    let a = pr(7);
    let none = Wanted { reviews: false, merge_state: false, comments: false };
    assert!(events(&[(&a, vec![Change::Approved, Change::Conflict, Change::Comments])], &HashMap::new(), none, false)
        .is_empty());

    let prs: Vec<ForgeItem> = (1..=4).map(pr).collect();
    let changed: Vec<(&ForgeItem, Vec<Change>)> = prs.iter().map(|p| (p, vec![Change::Comments])).collect();
    let [sum] = &events(&changed, &HashMap::new(), ALL, false)[..] else { panic!("one summary") };
    assert_eq!((sum.id.as_str(), sum.title.as_str()), ("pr:updates:summary", "4 novidades nos seus PRs"));
    assert_eq!(sum.description.lines().count(), 4);
    assert!(sum.description.lines().all(|l| l.ends_with("novo comentário")), "{}", sum.description);
}

#[test]
fn a_lookup_that_failed_keeps_what_was_known_while_the_pr_is_still_listed() {
    let (a, b) = (pr(1), pr(2));
    let known = HashMap::from([
        ("o/r#1".to_string(), state(Decision::Approved, Merge::Ready, 3)),
        ("o/r#2".to_string(), state(Decision::Pending, Merge::Blocked, 0)),
    ]);
    let mut next = HashMap::from([("o/r#2".to_string(), state(Decision::Pending, Merge::Blocked, 1))]);
    keep_blips(&mut next, Some(&known), &[&a, &b]);
    assert_eq!(next["o/r#1"].comments, 3, "the PR that failed to answer keeps its last state");
    assert_eq!(next["o/r#2"].comments, 1, "an answered one is untouched");
    let mut closed = HashMap::new();
    keep_blips(&mut closed, Some(&known), &[&b]);
    assert!(!closed.contains_key("o/r#1"), "a PR that is no longer listed is forgotten");
}

#[test]
fn a_comment_nobody_else_wrote_is_not_news() {
    let (a, b) = (pr(1), pr(2));
    let mut changed = vec![(&a, vec![Change::Comments]), (&b, vec![Change::Approved, Change::Comments])];
    let said = HashMap::from([(("o/r#2".to_string(), Change::Comments), marina())]);
    drop_unheard(&mut changed, &said);
    assert_eq!(changed.len(), 1, "my own comment on #1 found no one else and is dropped");
    assert_eq!((changed[0].0.number, &changed[0].1[..]), (2, &[Change::Approved, Change::Comments][..]));
    let mut only_mine = vec![(&a, vec![Change::Comments])];
    drop_unheard(&mut only_mine, &HashMap::new());
    assert!(only_mine.is_empty());
}
