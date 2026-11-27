use super::*;

#[test]
fn emoji_map_both_ways_and_skips_what_a_forge_cannot_store() {
    assert_eq!(emoji_name(true, "🎉"), Some("hooray"));
    assert_eq!(emoji_name(false, "🎉"), Some("tada"));
    assert_eq!(emoji_name(true, "🔥"), None, "GitHub has no flame");
    assert_eq!(emoji_name(false, "🔥"), Some("fire"));
    assert_eq!(emoji_name(true, "💣"), None);
    assert_eq!(emoji_of(true, "+1"), Some("👍"));
    assert_eq!(emoji_of(false, "thumbsup"), Some("👍"));
    assert_eq!(emoji_of(false, "custom_party"), None);
}

#[test]
fn a_label_color_is_six_hex_digits_or_nothing() {
    assert_eq!(clean_color("#FF00aa"), "ff00aa");
    assert_eq!(clean_color("0e8a16"), "0e8a16");
    assert_eq!(clean_color("red;background:url(x)"), "");
    assert_eq!(clean_color("fff"), "");
}

#[test]
fn actions_are_read_from_the_webview_by_kind() {
    let a: PrAction = serde_json::from_str(r#"{"kind":"merge","method":"squash"}"#).unwrap();
    assert_eq!(a, PrAction::Merge { method: "squash".into(), auto: false });
    let r: PrAction = serde_json::from_str(r#"{"kind":"unreact","target":"pr","reaction":9}"#).unwrap();
    assert_eq!(r, PrAction::Unreact { target: "pr".into(), id: 0, reaction: 9 });
    assert!(serde_json::from_str::<PrAction>(r#"{"kind":"delete_repo"}"#).is_err());
}

#[test]
fn input_checks_refuse_bad_labels_methods_and_targets() {
    assert!(valid_label("  bug ").is_ok());
    assert!(valid_label("").is_err());
    assert!(valid_label("a\nb").is_err());
    assert!(valid_label(&"x".repeat(MAX_LABEL + 1)).is_err());
    assert!(valid_method("squash").is_ok());
    assert!(valid_method("force").is_err());
    assert!(valid_target("pr", 0).is_ok());
    assert!(valid_target("comment", 0).is_err());
    assert!(valid_target("review", 4).is_ok());
    assert!(valid_target("repo", 4).is_err());
}

#[test]
fn draft_markers_are_swapped_not_stacked() {
    assert_eq!(drafted("feat: x", true), "Draft: feat: x");
    assert_eq!(drafted("Draft: feat: x", true), "Draft: feat: x");
    assert_eq!(drafted("[WIP] Draft: feat: x", false), "feat: x");
    assert_eq!(plain_title("Drafting docs"), "Drafting docs");
}
