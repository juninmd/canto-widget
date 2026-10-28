use super::*;
use crate::model::Task;

fn app(name: &str) -> TaskContext {
    TaskContext::App { name: name.into() }
}

#[test]
fn the_name_is_trimmed_and_must_be_sane() {
    assert_eq!(clean(app("  Slack  ")).unwrap(), app("Slack"));
    for bad in ["", "   ", "a\nb", "x\u{0}y", &"a".repeat(MAX_LEN + 1)] {
        assert!(matches!(clean(app(bad)), Err(AppError::Config(_))), "aceitou {bad:?}");
    }
    assert!(clean(app(&"a".repeat(MAX_LEN))).is_ok());
}

#[test]
fn the_wire_shape_is_tagged_and_older_vaults_without_it_still_load() {
    let json = serde_json::to_string(&TaskContext::Wifi { name: "Casa".into() }).unwrap();
    assert_eq!(json, r#"{"kind":"wifi","name":"Casa"}"#);
    let old: Task =
        serde_json::from_str(r#"{"id":"t","title":"x","done":false,"day":"2026-09-09","created_at":1,"updated_at":1}"#)
            .unwrap();
    assert_eq!(old.context, None);
}

#[test]
fn a_recurring_instance_keeps_the_context_of_its_series() {
    let mut data = crate::model::VaultData {
        tasks: vec![Task {
            id: "s".into(),
            day: "2026-09-08".into(),
            series: Some("s".into()),
            repeat: Some(crate::model::Repeat::Daily),
            context: Some(app("Slack")),
            ..Default::default()
        }],
        ..Default::default()
    };
    crate::routine::materialize(&mut data, "2026-09-09", 1);
    assert_eq!(data.tasks.iter().find(|t| t.day == "2026-09-09").and_then(|t| t.context.clone()), Some(app("Slack")));
}
