use super::*;

fn person(json: &str) -> Option<Contact> {
    serde_json::from_str::<Person>(json).unwrap().into_contact()
}

#[test]
fn a_contact_keeps_its_name_values_company_and_star() {
    let c = person(
        r#"{"resourceName": "people/c123", "names": [{"displayName": "Marina Lopes"}],
            "emailAddresses": [{"value": "marina@exemplo.com"}, {"value": "m@outro.com"}, {"value": ""}],
            "phoneNumbers": [{"value": "+55 11 90000-0000"}],
            "organizations": [{"name": "Vértice", "title": "Diretora"}],
            "memberships": [{"contactGroupMembership": {"contactGroupId": "starred"}}]}"#,
    )
    .unwrap();
    assert_eq!((c.id.as_str(), c.name.as_str()), ("c123", "Marina Lopes"));
    assert_eq!(c.emails, ["marina@exemplo.com", "m@outro.com"]);
    assert_eq!(c.phones, ["+55 11 90000-0000"]);
    assert_eq!((c.org.as_str(), c.title.as_str(), c.starred), ("Vértice", "Diretora", true));
    assert_eq!(c.link, "https://contacts.google.com/person/c123");
}

#[test]
fn a_nameless_contact_is_named_by_its_address_and_an_empty_one_is_dropped() {
    let c = person(r#"{"resourceName": "people/c1", "phoneNumbers": [{"value": "555-0100"}], "emailAddresses": [{"value": "a@b.com"}]}"#)
        .unwrap();
    assert_eq!(c.name, "a@b.com");
    assert!(!c.starred);
    assert!(person(r#"{"resourceName": "people/c2", "names": [{"displayName": "  "}]}"#).is_none());
}

#[test]
fn only_url_safe_ids_become_links_and_values_are_capped() {
    let c = person(r#"{"resourceName": "people/../x?y", "names": [{"displayName": "Ana"}]}"#).unwrap();
    assert_eq!(c.link, "");
    let many: String = (0..6).map(|i| format!(r#"{{"value": "{i}@x.com"}},"#)).collect();
    let c = person(&format!(r#"{{"resourceName": "people/c3", "names": [{{"displayName": "{}"}}], "emailAddresses": [{many}{{"value": "z@x.com"}}]}}"#, "n".repeat(300)))
        .unwrap();
    assert_eq!((c.emails.len(), c.name.chars().count()), (MAX_VALUES, MAX_TEXT));
}
