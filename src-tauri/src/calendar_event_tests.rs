use super::*;

fn parse(json: &str) -> Option<AgendaItem> {
    let list: EventList = serde_json::from_str(json).unwrap();
    list.items.into_iter().next().unwrap().into_item()
}

#[test]
fn deserializes_a_google_event_with_camelcase() {
    let item = parse(
        r#"{"items":[{"id":"e1","summary":"Daily","status":"confirmed",
        "hangoutLink":"https://meet.google.com/aaa-bbbb-ccc",
        "htmlLink":"https://calendar.google.com/x",
        "start":{"dateTime":"2026-09-09T09:00:00-03:00"},
        "end":{"dateTime":"2026-09-09T09:15:00-03:00"}}]}"#,
    )
    .unwrap();
    assert_eq!(item.title, "Daily");
    assert_eq!(item.meet, "https://meet.google.com/aaa-bbbb-ccc");
    assert!(!item.all_day);
    assert_eq!((item.organizer.as_str(), item.guests, item.attachments.len()), ("", 0, 0));
}

#[test]
fn canceled_event_is_dropped_from_the_agenda() {
    assert!(parse(r#"{"items":[{"id":"e1","status":"cancelled","start":{"date":"2026-09-09"}}]}"#).is_none());
}

#[test]
fn all_day_event_is_flagged() {
    let item = parse(
        r#"{"items":[{"id":"e2","summary":"Feriado","start":{"date":"2026-09-07"},"end":{"date":"2026-09-08"}}]}"#,
    )
    .unwrap();
    assert!(item.all_day);
    assert_eq!(item.start, "2026-09-07");
}

#[test]
fn who_organized_and_who_created_are_named_and_the_user_is_you() {
    let item = parse(
        r#"{"items":[{"id":"e3","start":{"dateTime":"2026-09-09T10:00:00Z"},
        "organizer":{"email":"ana@example.com","displayName":"Ana Souza"},
        "creator":{"email":"eu@example.com","self":true}}]}"#,
    )
    .unwrap();
    assert_eq!(item.organizer, "Ana Souza");
    assert_eq!(item.creator, "você");
}

#[test]
fn organizer_without_a_name_falls_back_to_the_email() {
    let item = parse(r#"{"items":[{"id":"e4","start":{"date":"2026-09-09"},"organizer":{"email":"bot@example.com","displayName":" "}}]}"#).unwrap();
    assert_eq!(item.organizer, "bot@example.com");
}

#[test]
fn rooms_are_not_counted_as_guests() {
    let item = parse(
        r#"{"items":[{"id":"e5","start":{"date":"2026-09-09"},
        "attendees":[{"email":"a@x.com"},{"email":"b@x.com"},{"email":"sala@resource.calendar.google.com","resource":true}]}]}"#,
    )
    .unwrap();
    assert_eq!(item.guests, 2);
}

#[test]
fn gemini_notes_attached_to_the_event_are_kept_and_non_https_links_dropped() {
    let item = parse(
        r#"{"items":[{"id":"e6","start":{"date":"2026-09-09"},"attachments":[
        {"title":"Anotações do Gemini","fileUrl":"https://docs.google.com/document/d/abc","mimeType":"application/vnd.google-apps.document"},
        {"title":"x","fileUrl":"javascript:alert(1)"},
        {"title":"","fileUrl":"https://drive.google.com/file/d/xyz"}]}]}"#,
    )
    .unwrap();
    let got: Vec<(&str, &str)> = item.attachments.iter().map(|a| (a.title.as_str(), a.url.as_str())).collect();
    assert_eq!(
        got,
        vec![
            ("Anotações do Gemini", "https://docs.google.com/document/d/abc"),
            ("anexo", "https://drive.google.com/file/d/xyz")
        ]
    );
}

#[test]
fn html_description_reaches_the_ui_as_plain_text_and_still_yields_the_meet_link() {
    let item = parse(
        r#"{"items":[{"id":"e7","start":{"date":"2026-09-09"},
        "description":"Pauta<br><b>Link</b>: https://meet.google.com/xyz-abcd-efg"}]}"#,
    )
    .unwrap();
    assert_eq!(item.description, "Pauta\nLink: https://meet.google.com/xyz-abcd-efg");
    assert_eq!(item.meet, "https://meet.google.com/xyz-abcd-efg");
}

#[test]
fn guest_list_carries_each_answer_and_the_users_own_rsvp() {
    let item = parse(
        r#"{"items":[{"id":"e8","start":{"date":"2026-09-09"},"attendees":[
        {"email":"caio@example.com","responseStatus":"declined"},
        {"email":"eu@example.com","displayName":"Eu","responseStatus":"tentative","self":true},
        {"email":"bia@example.com","displayName":"Bia Reis","responseStatus":"accepted","optional":true},
        {"email":"ana@example.com","displayName":"Ana Souza","responseStatus":"accepted","organizer":true},
        {"email":"dora@example.com","responseStatus":"<script>"},
        {"email":"sala@resource.calendar.google.com","resource":true}]}]}"#,
    )
    .unwrap();
    assert_eq!(item.response, "tentative");
    let got: Vec<(&str, &str)> = item.attendees.iter().map(|g| (g.name.as_str(), g.response.as_str())).collect();
    assert_eq!(
        got,
        vec![
            ("Ana Souza", "accepted"),
            ("Eu", "tentative"),
            ("Bia Reis", "accepted"),
            ("dora@example.com", ""),
            ("caio@example.com", "declined")
        ]
    );
    assert!(item.attendees[0].organizer && item.attendees[1].me && item.attendees[2].optional);
    assert_eq!(item.guests, 5);
}

#[test]
fn event_without_the_user_on_the_list_has_no_rsvp() {
    let item = parse(r#"{"items":[{"id":"e9","start":{"date":"2026-09-09"},"attendees":[{"email":"a@x.com","responseStatus":"accepted"}]}]}"#).unwrap();
    assert_eq!((item.response.as_str(), item.attendees.len()), ("", 1));
}

#[test]
fn huge_guest_lists_are_capped_but_still_counted() {
    let many: Vec<String> = (0..80).map(|i| format!(r#"{{"email":"p{i}@x.com"}}"#)).collect();
    let item = parse(&format!(
        r#"{{"items":[{{"id":"e10","start":{{"date":"2026-09-09"}},"attendees":[{}]}}]}}"#,
        many.join(",")
    ))
    .unwrap();
    assert_eq!((item.guests, item.attendees.len()), (80, MAX_GUESTS));
}
