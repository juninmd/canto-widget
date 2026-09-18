use super::*;

fn hist(texts: &[&str]) -> ClipHistory {
    let mut h = ClipHistory::default();
    for (i, t) in texts.iter().enumerate() {
        h.push(t, format!("id{i}"));
    }
    h
}

#[test]
fn most_recent_stays_on_top() {
    let h = hist(&["um", "dois"]);
    assert_eq!(h.items[0].text, "dois");
    assert_eq!(h.items.len(), 2);
}

#[test]
fn repeat_moves_up_without_duplicating() {
    let mut h = hist(&["um", "dois"]);
    assert!(h.push("um", "novo".into()));
    assert_eq!(h.items.len(), 2);
    assert_eq!(h.items[0].text, "um");
}

#[test]
fn ignores_empty_and_the_same_text_in_a_row() {
    let mut h = hist(&["um"]);
    assert!(!h.push("   ", "x".into()));
    assert!(!h.push("um", "y".into()));
    assert_eq!(h.items.len(), 1);
}

#[test]
fn respects_the_item_cap() {
    let mut h = ClipHistory::default();
    for i in 0..(MAX_ITEMS + 20) {
        h.push(&format!("item {i}"), format!("id{i}"));
    }
    assert_eq!(h.items.len(), MAX_ITEMS);
    assert_eq!(h.items[0].text, format!("item {}", MAX_ITEMS + 19));
}

#[test]
fn pinned_items_survive_the_cap() {
    let mut h = ClipHistory::default();
    h.push("guardar isto", "fixo".into());
    h.items[0].pinned = true;
    for i in 0..(MAX_ITEMS + 10) {
        h.push(&format!("ruido {i}"), format!("id{i}"));
    }
    assert!(h.items.iter().any(|i| i.text == "guardar isto"));
}

#[test]
fn oversized_text_is_truncated() {
    let mut h = ClipHistory::default();
    h.push(&"a".repeat(MAX_CHARS * 2), "big".into());
    assert_eq!(h.items[0].text.chars().count(), MAX_CHARS);
}

#[test]
fn oversized_copy_keeps_a_prefix_and_remembers_the_real_size() {
    let mut h = ClipHistory::default();
    let big = "a".repeat(MAX_CHARS * 3);
    h.push(&big, "big".into());
    let view = ClipView::from(&h.items[0]);
    assert_eq!(h.items[0].text.chars().count(), MAX_CHARS);
    assert_eq!(view.chars, MAX_CHARS * 3, "the UI must be able to say how much was left out");
    assert_eq!(view.kept, MAX_CHARS);
    assert!(view.truncated);
}

#[test]
fn copying_a_cut_item_back_does_not_duplicate_it() {
    let mut h = ClipHistory::default();
    h.push(&"b".repeat(MAX_CHARS + 10), "big".into());
    h.push("outro", "o".into());
    let prefix = h.items[1].text.clone();
    assert!(h.push(&prefix, "again".into()));
    assert_eq!(h.items.len(), 2, "the prefix written back by copy became a second item");
    assert!(!ClipView::from(&h.items[0]).truncated, "the clipboard now holds exactly the stored text");
}

#[test]
fn history_has_a_total_size_budget_that_spares_pinned_and_newest() {
    let mut h = ClipHistory::default();
    h.push(&"p".repeat(MAX_CHARS), "pinned".into());
    h.items[0].pinned = true;
    for i in 0..(BUDGET_CHARS / MAX_CHARS + 5) {
        h.push(&format!("{i}{}", "x".repeat(MAX_CHARS)), format!("id{i}"));
    }
    let unpinned: usize = h.items.iter().filter(|i| !i.pinned).map(|i| i.text.chars().count()).sum();
    assert!(unpinned <= BUDGET_CHARS, "history grew past its budget: {unpinned}");
    assert!(h.items.iter().any(|i| i.id == "pinned"));
    assert_eq!(h.items[0].id, format!("id{}", BUDGET_CHARS / MAX_CHARS + 4));
}

#[test]
fn the_list_only_ships_a_short_preview_to_the_webview() {
    let mut h = ClipHistory::default();
    h.push(&"c".repeat(MAX_CHARS), "c".into());
    let view = ClipView::from(&h.items[0]);
    assert_eq!(view.preview.chars().count(), PREVIEW_CHARS);
    assert!(!view.truncated);
}

#[test]
fn legacy_items_without_a_size_are_not_flagged_as_cut() {
    let h: ClipHistory = serde_json::from_str(r#"{"items":[{"id":"a","text":"velho","copied_at":1}]}"#).unwrap();
    let view = ClipView::from(&h.items[0]);
    assert_eq!(view.chars, 5);
    assert!(!view.truncated);
}

#[test]
fn multibyte_text_is_cut_on_a_character_boundary() {
    let mut h = ClipHistory::default();
    h.push(&"é".repeat(MAX_CHARS + 1), "e".into());
    assert!(h.items[0].text.chars().all(|c| c == 'é'));
}


#[test]
fn copying_a_pinned_text_again_keeps_it_pinned() {
    let mut h = hist(&["guardar"]);
    h.items[0].pinned = true;
    h.push("outro", "o".into());
    h.push("guardar", "again".into());
    assert!(h.items[0].pinned, "re-copying silently unpinned the item");
}

#[test]
fn a_50_million_char_copy_becomes_a_small_history() {
    let mut h = ClipHistory::default();
    let started = std::time::Instant::now();
    h.push(&"x".repeat(50_000_000), "huge".into());
    let on_disk = serde_json::to_vec(&h).unwrap().len();
    assert!(on_disk < 40_000, "history would seal {on_disk} bytes on every copy");
    assert_eq!(ClipView::from(&h.items[0]).chars, 50_000_000);
    assert!(started.elapsed() < std::time::Duration::from_secs(2), "took {:?}", started.elapsed());
}
