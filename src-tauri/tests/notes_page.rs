use canto_widget_lib::cmd_notes::{check_size, page, MAX_BODY_CHARS, MAX_TITLE_CHARS};
use canto_widget_lib::model::Note;

fn notes(n: usize) -> Vec<Note> {
    (0..n)
        .map(|i| Note {
            id: format!("n{i}"),
            title: format!("nota {i}"),
            tags: vec![if i % 2 == 0 { "par" } else { "impar" }.into()],
            pinned: i == 3,
            updated_at: i as i64,
            ..Default::default()
        })
        .collect()
}

#[test]
fn a_page_says_how_many_matched_so_the_ui_can_offer_more() {
    let p = page(&notes(120), "", 50);
    assert_eq!(p.total, 120);
    assert_eq!(p.items.len(), 50);
    assert_eq!(p.items[0].id, "n3", "the pinned note must lead even on page one");
    assert_eq!(p.items[1].id, "n119", "then the most recent");
}

#[test]
fn filtering_happens_before_the_cut_so_old_matches_are_counted() {
    let p = page(&notes(120), "#impar", 10);
    assert_eq!(p.total, 60);
    assert!(p.items.iter().all(|n| n.tags == ["impar"]));
}

#[test]
fn a_zero_or_absurd_limit_is_clamped_instead_of_emptying_or_flooding_the_list() {
    assert_eq!(page(&notes(5), "", 0).items.len(), 1);
    assert_eq!(page(&notes(900), "", usize::MAX).items.len(), 500);
}

#[test]
fn oversized_notes_are_refused_with_a_readable_reason() {
    assert!(check_size("t", &"a".repeat(MAX_BODY_CHARS), (0, 0)).is_ok());
    let err = check_size("t", &"a".repeat(MAX_BODY_CHARS + 1), (0, 0)).unwrap_err().to_string();
    assert!(err.contains("100 mil"), "{err}");
    assert!(check_size(&"é".repeat(MAX_TITLE_CHARS + 1), "", (0, 0)).is_err());
    assert!(check_size(&"é".repeat(MAX_TITLE_CHARS), "", (0, 0)).is_ok(), "limit must count characters, not bytes");
}

#[test]
fn a_note_already_over_the_cap_can_be_edited_and_trimmed_but_not_grown() {
    let big = MAX_BODY_CHARS + 5_000;
    assert!(check_size("novo título", &"a".repeat(big), (5, big)).is_ok(), "a synced big note became read-only");
    assert!(check_size("t", &"a".repeat(big - 10), (1, big)).is_ok());
    assert!(check_size("t", &"a".repeat(big + 1), (1, big)).is_err());
}
