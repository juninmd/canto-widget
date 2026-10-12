use super::*;

fn light(id: &str, url: &str, login: &str) -> Light {
    Light { id: id.into(), url: url.into(), login: login.into() }
}

#[test]
fn a_mention_is_unread_until_marked_and_can_be_marked_unread_again() {
    let mut s = Saved::default();
    assert!(s.is_unread("github:o/r#1"));
    s.mark(&["github:o/r#1".to_string(), "gitlab:5".to_string()], true, 1000);
    assert!(!s.is_unread("github:o/r#1") && !s.is_unread("gitlab:5"));
    s.mark(&["gitlab:5".to_string()], false, 2000);
    assert!(s.is_unread("gitlab:5") && !s.is_unread("github:o/r#1"));
}

#[test]
fn old_and_surplus_read_marks_are_dropped() {
    let mut s = Saved::default();
    s.mark(&["old".to_string()], true, 0);
    s.mark(&["new".to_string()], true, KEEP_MS + 1);
    assert!(s.is_unread("old") && !s.is_unread("new"), "a mark older than the keep window is forgotten");
    let ids: Vec<String> = (0..MAX_READ + 20).map(|i| format!("id{i}")).collect();
    for (i, id) in ids.iter().enumerate() {
        s.mark(std::slice::from_ref(id), true, KEEP_MS + 10 + i as i64);
    }
    assert_eq!(s.read.len(), MAX_READ);
    assert!(s.is_unread("id0") && !s.is_unread(&ids[MAX_READ + 19]), "the oldest marks go first");
}

#[test]
fn threads_and_people_are_muted_independently_of_case() {
    let mut s = Saved::default();
    s.mute_thread("https://github.com/o/r/pull/1", "Corrige o parser", true);
    s.mute_author("Marina", true);
    assert!(s.is_muted("https://github.com/o/r/pull/1", "bia"), "a muted thread, whoever wrote");
    assert!(s.is_muted("https://github.com/o/r/pull/2", "MARINA"), "a muted person, in any thread");
    assert!(!s.is_muted("https://github.com/o/r/pull/2", "bia") && !s.is_muted("x", ""));
    s.mute_thread("https://github.com/o/r/pull/1", "", false);
    s.mute_author("marina", false);
    assert_eq!(s, Saved::default());
    s.mute_author("", true);
    assert!(s.authors.is_empty(), "an empty login is never muted");
}

#[test]
fn the_unread_count_follows_reads_and_mutes_across_both_forges() {
    let unread = MentionsUnread::default();
    let mut saved = Saved::default();
    assert_eq!(
        unread.set(GITHUB, vec![light("github:o/r#1", "u1", "ana"), light("github:o/r#2", "u2", "bia")], &saved),
        2
    );
    assert_eq!(unread.set(GITLAB, vec![light("gitlab:5", "u5", "caio")], &saved), 3);
    saved.mark(&["github:o/r#1".to_string()], true, 1);
    assert_eq!(unread.recount(&saved), 2);
    saved.mute_author("bia", true);
    assert_eq!(unread.recount(&saved), 1, "a muted author's mention is not counted");
    saved.mute_thread("u5", "", true);
    assert_eq!((unread.recount(&saved), unread.count()), (0, 0));
    unread.clear(GITHUB, &Saved::default());
    assert_eq!(unread.count(), 1, "clearing one forge leaves the other's rows (the muted thread is not in this saved)");
}

#[test]
fn a_file_written_before_a_field_existed_still_opens() {
    let s: Saved = serde_json::from_str(r#"{"read":{"gitlab:5":10}}"#).unwrap();
    assert!(!s.is_unread("gitlab:5") && s.threads.is_empty() && s.authors.is_empty());
}
