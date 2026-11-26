use super::*;
use serde_json::json;

#[test]
fn a_long_patch_keeps_its_first_lines_and_says_it_was_cut() {
    let long: String = (0..MAX_PATCH_LINES + 5).map(|i| format!("+l{i}\n")).collect();
    let (kept, cut) = cap_patch(&long);
    assert!(cut);
    assert_eq!(kept.lines().count(), MAX_PATCH_LINES);
    let (short, cut) = cap_patch("@@ -1 +1 @@\n-a\n+b");
    assert!(!cut);
    assert_eq!(short.lines().count(), 3);
}

#[test]
fn files_keep_counts_and_a_binary_file_has_no_patch() {
    let raw: Vec<Raw> = serde_json::from_value(json!([
        { "filename": "src/a.ts", "status": "modified", "additions": 3, "deletions": 1, "patch": "@@ -1 +1 @@\n-a\n+b" },
        { "filename": "logo.png", "status": "weird" },
    ]))
    .unwrap();
    let got = convert(raw);
    assert_eq!((got[0].additions, got[0].deletions), (3, 1));
    assert!(got[1].patch.is_empty() && !got[1].truncated);
    assert_eq!(got[1].status, "modified");
}

#[test]
fn only_a_safe_repository_reaches_the_api() {
    assert!(fetch("t", "../x", 1).is_err());
    assert!(fetch("t", "a/b", 0).is_err());
}
