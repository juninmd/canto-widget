use super::*;

fn raw(json: &str) -> RawMessage {
    serde_json::from_str(json).unwrap()
}

#[test]
fn a_metadata_message_becomes_a_mail_linking_its_thread() {
    let mail = raw(r#"{
        "id": "18c2a", "threadId": "18c29", "snippet": "Ajustei a cláusula, n&#39;est&quot;a",
        "internalDate": "1792500000000",
        "payload": {"headers": [{"name": "Subject", "value": "Contrato revisado"},
                                {"name": "from", "value": "\"Marina Lopes\" <marina@exemplo.com>"}]}
    }"#)
    .into_mail();
    assert_eq!(mail.id, "18c2a");
    assert_eq!(mail.from, "Marina Lopes");
    assert_eq!(mail.subject, "Contrato revisado");
    assert_eq!(mail.snippet, "Ajustei a cláusula, n'est\"a");
    assert_eq!(mail.date, 1_792_500_000_000);
    assert_eq!(mail.link, "https://mail.google.com/mail/u/0/#inbox/18c29");
}

#[test]
fn a_message_without_headers_or_a_safe_thread_still_has_a_link() {
    let mail = raw(r#"{"id": "abc", "threadId": "../x"}"#).into_mail();
    assert_eq!((mail.from.as_str(), mail.subject.as_str(), mail.date), ("", "", 0));
    assert_eq!(mail.link, "https://mail.google.com/mail/u/0/#inbox/abc");
}

#[test]
fn the_sender_is_the_display_name_or_the_bare_address() {
    assert_eq!(sender_name("Banco Aurora <fatura@aurora.exemplo>"), "Banco Aurora");
    assert_eq!(sender_name("\"Equipe Vértice\" <time@vertice.exemplo>"), "Equipe Vértice");
    assert_eq!(sender_name("<so@endereco.exemplo>"), "so@endereco.exemplo");
    assert_eq!(sender_name("ana@exemplo.com"), "ana@exemplo.com");
}

#[test]
fn the_labels_say_whether_a_mail_is_unread_and_starred() {
    let mail = raw(r#"{"id": "a1", "labelIds": ["INBOX", "STARRED"]}"#).into_mail();
    assert_eq!((mail.unread, mail.starred), (false, true));
    let mail = raw(r#"{"id": "a2", "labelIds": ["UNREAD", "IMPORTANT"]}"#).into_mail();
    assert_eq!((mail.unread, mail.starred), (true, false));
}

#[test]
fn a_message_that_fails_is_left_out_and_the_order_is_kept() {
    let fetch =
        |id: &str| if id == "b" { Err(crate::error::AppError::Drive("404".into())) } else { Ok(id.to_string()) };
    assert_eq!(fetch_all(&["a", "b", "c"], fetch).unwrap(), vec!["a", "c"]);
    assert!(fetch_all(&["b"], fetch).is_err());
    assert!(fetch_all(&[], fetch).unwrap().is_empty());
}
