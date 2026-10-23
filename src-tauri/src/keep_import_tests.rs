use super::*;

fn note(json: &str) -> Note {
    match parse(json, "sem título", "arquivada") {
        Parsed::Note(n) => n,
        other => panic!("expected a note, got {other:?}"),
    }
}

#[test]
fn a_text_note_keeps_title_body_labels_pin_and_times() {
    let n = note(
        r#"{"title":"Ideias","textContent":"comprar tinta\n","isPinned":true,"labels":[{"name":"Casa"}],
        "createdTimestampUsec":1700000000000000,"userEditedTimestampUsec":1700000500000000,"color":"DEFAULT"}"#,
    );
    assert_eq!((n.title.as_str(), n.body.as_str()), ("Ideias", "comprar tinta"));
    assert_eq!(n.tags, vec!["keep", "casa"]);
    assert!(n.pinned);
    assert_eq!((n.created_at, n.updated_at), (1_700_000_000_000, 1_700_000_500_000));
}

#[test]
fn a_checklist_becomes_markdown_task_items_and_names_an_untitled_note() {
    let n = note(
        r#"{"title":"","listContent":[{"text":"leite","isChecked":false},{"text":"pão","isChecked":true},
        {"text":"  ","isChecked":false}],"createdTimestampUsec":1,"userEditedTimestampUsec":2000}"#,
    );
    assert_eq!(n.body, "- [ ] leite\n- [x] pão");
    assert_eq!(n.title, "leite");
}

#[test]
fn links_follow_the_text_and_archived_notes_get_a_tag() {
    let n = note(
        r#"{"title":"Ler","textContent":"depois","isArchived":true,"createdTimestampUsec":1000,
        "annotations":[{"url":"https://exemplo.com","title":"Exemplo"},{"url":"javascript:alert(1)"}]}"#,
    );
    assert_eq!(n.body, "depois\n\n[Exemplo](https://exemplo.com)");
    assert!(n.tags.contains(&"arquivada".to_string()));
}

#[test]
fn trashed_and_empty_notes_are_skipped_and_other_json_is_foreign() {
    let trashed = r#"{"title":"x","textContent":"y","isTrashed":true,"createdTimestampUsec":1}"#;
    assert_eq!(parse(trashed, "", ""), Parsed::Skipped);
    assert_eq!(parse(r#"{"title":" ","textContent":"","createdTimestampUsec":1}"#, "", ""), Parsed::Skipped);
    assert_eq!(parse(r#"{"foo":1}"#, "", ""), Parsed::Foreign);
    assert_eq!(parse("<html></html>", "", ""), Parsed::Foreign);
}

#[test]
fn a_note_over_the_body_cap_is_skipped() {
    let big = "a".repeat(MAX_BODY_CHARS + 1);
    let json = format!(r#"{{"title":"t","textContent":"{big}","createdTimestampUsec":1}}"#);
    assert_eq!(parse(&json, "", ""), Parsed::Skipped);
}

#[test]
fn the_same_note_imported_twice_is_recognized() {
    let n = note(r#"{"title":"a","textContent":"b","createdTimestampUsec":5000}"#);
    let existing = vec![Note { id: "1".into(), ..n.clone() }];
    assert!(already_there(&existing, &n));
    assert!(!already_there(&existing, &Note { body: "c".into(), ..n }));
}
