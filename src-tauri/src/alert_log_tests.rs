use super::*;

fn item(id: &str) -> AgendaItem {
    AgendaItem { id: id.into(), title: id.into(), ..Default::default() }
}

#[test]
fn newest_comes_first() {
    let log = AlertLog::default();
    log.push(item("a"), Outcome::Done, 1);
    log.push(item("b"), Outcome::Closed, 2);
    let ids: Vec<_> = log.list().into_iter().map(|r| r.item.id).collect();
    assert_eq!(ids, ["b", "a"]);
}

#[test]
fn the_log_is_bounded_dropping_the_oldest() {
    let log = AlertLog::default();
    for i in 0..MAX_ENTRIES + 5 {
        log.push(item(&i.to_string()), Outcome::Closed, i as i64);
    }
    let list = log.list();
    assert_eq!(list.len(), MAX_ENTRIES);
    assert_eq!(list[0].item.id, (MAX_ENTRIES + 4).to_string());
    assert_eq!(list.last().unwrap().item.id, "5");
}

#[test]
fn outcomes_travel_as_lowercase_words() {
    for (outcome, word) in
        [(Outcome::Done, "done"), (Outcome::Snoozed, "snoozed"), (Outcome::Closed, "closed"), (Outcome::Muted, "muted")]
    {
        assert_eq!(serde_json::to_string(&outcome).unwrap(), format!("\"{word}\""));
        assert_eq!(serde_json::from_str::<Outcome>(&format!("\"{word}\"")).unwrap(), outcome);
    }
    assert!(
        serde_json::from_str::<Outcome>("\"deleted\"").is_err(),
        "an unknown outcome must be refused at the boundary"
    );
}

#[test]
fn closing_and_snoozing_both_leave_a_trace() {
    let close = include_str!("cmd_extras.rs");
    let body = &close[close.find("pub fn alert_close(").unwrap()..];
    assert!(
        body[..body.find("\n}\n").unwrap()].contains("alert_log::record"),
        "a closed alert would vanish from the log"
    );
    let snooze = include_str!("snooze.rs");
    assert!(snooze.contains("Outcome::Snoozed"), "a snoozed alert would vanish from the log");
}

#[test]
fn the_log_is_never_written_to_disk() {
    let src = include_str!("alert_log.rs");
    let code = &src[..src.find("#[cfg(test)]").unwrap()];
    assert!(!code.contains("std::fs") && !code.contains("write_json"), "titles are as sensitive as the agenda");
}
