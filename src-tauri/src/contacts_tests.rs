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

#[test]
fn a_contact_brings_its_birthday_addresses_links_relations_and_note() {
    let c = person(
        r#"{"resourceName": "people/c9", "names": [{"displayName": "Bia"}], "nicknames": [{"value": "Bibi"}],
            "organizations": [{"name": "Vértice", "department": "Vendas"}],
            "birthdays": [{"text": "sem data"}, {"date": {"month": 10, "day": 23}}],
            "addresses": [{"formattedValue": "Rua A, 10\nSão Paulo"}],
            "urls": [{"value": "https://bia.dev"}, {"value": "javascript:alert(1)"}],
            "relations": [{"person": "Rui", "formattedType": "Cônjuge"}, {"person": "Lia"}],
            "biographies": [{"value": "Prefere WhatsApp."}]}"#,
    )
    .unwrap();
    assert_eq!(c.birthday, Some(Birthday { day: 23, month: 10, year: None }));
    assert_eq!((c.nickname.as_str(), c.department.as_str()), ("Bibi", "Vendas"));
    assert_eq!(c.addresses, ["Rua A, 10 São Paulo"]);
    assert_eq!(c.urls, ["https://bia.dev"]);
    assert_eq!(c.relations, ["Rui (Cônjuge)", "Lia"]);
    assert_eq!(c.note, "Prefere WhatsApp.");
    let c = person(r#"{"resourceName": "people/c8", "names": [{"displayName": "Rui"}], "birthdays": [{"date": {"year": 1990, "month": 2, "day": 30}}, {"date": {"year": 1990, "month": 13, "day": 1}}]}"#).unwrap();
    assert_eq!(c.birthday, Some(Birthday { day: 30, month: 2, year: Some(1990) }));
}
