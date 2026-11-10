use super::*;
use crate::forge::item;

fn thread(n: u64, pr: bool) -> ForgeItem {
    ForgeItem { is_pr: pr, updated_at: "2026-10-12T10:00:00Z".into(), ..item(n, "", "", 0) }
}

fn ana() -> Sender {
    Sender { name: "Ana Pires".into(), login: "ana".into(), avatar: "https://avatars.githubusercontent.com/u/1".into() }
}

#[test]
fn a_github_row_carries_the_thread_and_who_said_what_when_the_comment_was_found() {
    let items = [thread(7, true), thread(8, false)];
    let found = HashMap::from([(
        items[0].reference.clone(),
        Mentioned { sender: ana(), excerpt: "@voce consegue olhar o retry?".into() },
    )]);
    let rows = github_rows(&items, &found);
    assert_eq!((rows[0].id.as_str(), rows[0].reference.as_str()), ("github:o/r#7", "o/r#7"));
    assert_eq!(
        (rows[0].url.as_str(), rows[0].is_pr, rows[0].at.as_str()),
        (items[0].url.as_str(), true, "2026-10-12T10:00:00Z")
    );
    assert_eq!((rows[0].sender.as_ref(), rows[0].preview.as_str()), (Some(&ana()), "@voce consegue olhar o retry?"));
    assert!(
        (rows[1].sender.is_none() && rows[1].preview.is_empty()) && !rows[1].is_pr,
        "no comment found: the thread still lists"
    );
}

fn todo(id: u64, body: &str) -> Mention {
    Mention {
        action: "mentioned".into(),
        id,
        title: "Falha no deploy".into(),
        url: format!("https://git.example.com/acme/atlas/-/merge_requests/{id}"),
        author: "ana".into(),
        author_name: "Ana Pires".into(),
        avatar_url: "https://git.example.com/uploads/ana.png".into(),
        body: body.into(),
        project: "acme/atlas".into(),
        at: "2026-10-12T09:00:00.000Z".into(),
        is_pr: true,
        done: false,
    }
}

#[test]
fn a_gitlab_row_flattens_and_cuts_the_to_do_text_around_the_mention() {
    let long = format!("{} @voce olha {}", "a ".repeat(300), "z ".repeat(300));
    let rows = gitlab_rows(&[todo(5, "oi\n\n @voce   veja"), todo(6, &long), todo(7, "")], "voce");
    assert_eq!((rows[0].id.as_str(), rows[0].reference.as_str(), rows[0].is_pr), ("gitlab:5", "acme/atlas", true));
    assert_eq!((rows[0].preview.as_str(), rows[0].at.as_str()), ("oi @voce veja", "2026-10-12T09:00:00.000Z"));
    let sender = rows[0].sender.as_ref().expect("author");
    assert_eq!((sender.login.as_str(), sender.name.as_str()), ("ana", "Ana Pires"));
    assert!(
        rows[1].preview.contains("@voce olha") && rows[1].preview.chars().count() <= PREVIEW_CHARS + 2,
        "{}",
        rows[1].preview
    );
    assert!(rows[2].preview.is_empty());
}

#[test]
fn photos_are_downloaded_only_from_trusted_hosts_and_never_leave_as_urls() {
    let mut rows = gitlab_rows(&[todo(5, "oi")], "voce");
    rows[0].sender.as_mut().unwrap().avatar = "https://evil.example.org/a.png".into();
    gitlab_photos(&mut rows, "https://git.example.com");
    assert_eq!(rows[0].sender.as_ref().unwrap().avatar, "", "an untrusted host is dropped without a request");
}

#[test]
fn a_thread_that_mentions_me_and_my_team_is_listed_once() {
    let list = |ns: &[u64]| ForgeList {
        total: ns.len() as u64,
        items: ns.iter().map(|n| thread(*n, true)).collect(),
        ..Default::default()
    };
    let both = with_teams(list(&[1, 2]), list(&[2, 3]));
    assert_eq!((both.total, both.items.iter().map(|i| i.number).collect::<Vec<_>>()), (3, vec![1, 2, 3]));
    assert_eq!(with_teams(list(&[1]), list(&[])).items.len(), 1);
}

fn saved_with(read: &[&str], threads: &[&str], authors: &[&str]) -> Saved {
    let mut s = Saved::default();
    s.mark(&read.iter().map(|r| r.to_string()).collect::<Vec<_>>(), true, 1);
    threads.iter().for_each(|t| s.mute_thread(t, "", true));
    authors.iter().for_each(|a| s.mute_author(a, true));
    s
}

#[test]
fn rows_come_back_flagged_unread_muted_or_done_and_the_badge_only_counts_the_open_ones() {
    let mut done = todo(7, "ok");
    done.done = true;
    let mut rows = gitlab_rows(&[todo(5, "um"), todo(6, "dois"), done], "voce");
    assert_eq!(
        rows.iter().map(|r| (r.unread, r.done)).collect::<Vec<_>>(),
        [(true, false), (true, false), (false, true)]
    );

    flag(&mut rows, &saved_with(&["gitlab:5"], &["https://git.example.com/acme/atlas/-/merge_requests/6"], &[]));
    assert_eq!(
        rows.iter().map(|r| (r.unread, r.muted)).collect::<Vec<_>>(),
        [(false, false), (true, true), (false, false)]
    );
    assert_eq!(
        lights(&rows).iter().map(|l| l.id.as_str()).collect::<Vec<_>>(),
        ["gitlab:5", "gitlab:6"],
        "a done to-do is not counted"
    );

    flag(&mut rows, &saved_with(&[], &[], &["ANA"]));
    assert!(rows.iter().all(|r| r.muted), "a muted person is muted in every row, whatever the case");
    assert!(!rows[2].unread, "a done to-do never turns unread again");
}

#[test]
fn github_rows_start_unread_and_the_badge_learns_authors_only_from_earlier_lookups() {
    let items = [thread(7, true), thread(8, false)];
    let rows = github_rows(&items, &HashMap::new());
    assert!(rows.iter().all(|r| r.unread && !r.muted && !r.done));
    let known = HashMap::from([(items[0].reference.clone(), Mentioned { sender: ana(), excerpt: "x".into() })]);
    let l = github_lights(&items, &known);
    assert_eq!((l[0].id.as_str(), l[0].login.as_str(), l[1].login.as_str()), ("github:o/r#7", "ana", ""));
}
