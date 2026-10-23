//! The People API's person, read down to the fields the Contatos tab shows.
use serde::Deserialize;

use super::{Birthday, Contact, MAX_NOTE, MAX_TEXT, MAX_VALUES};
use crate::google_api::valid_id;

#[derive(Deserialize, Default)]
pub(crate) struct Person {
    #[serde(rename = "resourceName", default)]
    resource_name: String,
    #[serde(default)]
    names: Vec<Name>,
    #[serde(default)]
    nicknames: Vec<Value>,
    #[serde(rename = "emailAddresses", default)]
    emails: Vec<Value>,
    #[serde(rename = "phoneNumbers", default)]
    phones: Vec<Value>,
    #[serde(default)]
    organizations: Vec<Organization>,
    #[serde(default)]
    memberships: Vec<Membership>,
    #[serde(default)]
    birthdays: Vec<BirthdayField>,
    #[serde(default)]
    addresses: Vec<Address>,
    #[serde(default)]
    urls: Vec<Value>,
    #[serde(default)]
    biographies: Vec<Value>,
    #[serde(default)]
    relations: Vec<Relation>,
}

#[derive(Deserialize)]
struct Name {
    #[serde(rename = "displayName", default)]
    display_name: String,
}

#[derive(Deserialize)]
struct Value {
    #[serde(default)]
    value: String,
}

#[derive(Deserialize)]
struct Organization {
    #[serde(default)]
    name: String,
    #[serde(default)]
    title: String,
    #[serde(default)]
    department: String,
}

#[derive(Deserialize)]
struct Membership {
    #[serde(rename = "contactGroupMembership", default)]
    group: Option<GroupMembership>,
}

#[derive(Deserialize)]
struct GroupMembership {
    #[serde(rename = "contactGroupId", default)]
    id: String,
}

#[derive(Deserialize)]
struct BirthdayField {
    #[serde(default)]
    date: Option<Date>,
}

#[derive(Deserialize)]
struct Date {
    #[serde(default)]
    year: u16,
    #[serde(default)]
    month: u8,
    #[serde(default)]
    day: u8,
}

#[derive(Deserialize)]
struct Address {
    #[serde(rename = "formattedValue", default)]
    formatted: String,
}

#[derive(Deserialize)]
struct Relation {
    #[serde(default)]
    person: String,
    #[serde(rename = "formattedType", default)]
    kind: String,
}

fn clip(text: &str, max: usize) -> String {
    text.split_whitespace().collect::<Vec<_>>().join(" ").chars().take(max).collect()
}

fn clean(text: &str) -> String {
    clip(text, MAX_TEXT)
}

fn capped(list: impl Iterator<Item = String>) -> Vec<String> {
    list.filter(|v| !v.is_empty()).take(MAX_VALUES).collect()
}

fn values(list: &[Value]) -> Vec<String> {
    capped(list.iter().map(|v| clean(&v.value)))
}

/// The first birthday with a real day and month; year 0 is Google's "no year".
fn birthday(list: &[BirthdayField]) -> Option<Birthday> {
    list.iter()
        .filter_map(|b| b.date.as_ref())
        .find(|d| (1..=12).contains(&d.month) && (1..=31).contains(&d.day))
        .map(|d| Birthday { day: d.day, month: d.month, year: (d.year > 0).then_some(d.year) })
}

impl Person {
    /// A contact with no name falls back to its first e-mail or phone; one with none of them is not worth a row.
    pub(crate) fn into_contact(self) -> Option<Contact> {
        let emails = values(&self.emails);
        let phones = values(&self.phones);
        let name = self.names.first().map(|n| clean(&n.display_name)).filter(|n| !n.is_empty());
        let name = name.or_else(|| emails.first().or(phones.first()).cloned())?;
        let id = self.resource_name.strip_prefix("people/").unwrap_or(&self.resource_name).to_string();
        let org = self.organizations.first();
        let starred = self.memberships.iter().any(|m| m.group.as_ref().is_some_and(|g| g.id == "starred"));
        let relations = capped(self.relations.iter().map(|r| {
            let (who, kind) = (clean(&r.person), clean(&r.kind));
            if who.is_empty() || kind.is_empty() {
                who
            } else {
                format!("{who} ({kind})")
            }
        }));
        Some(Contact {
            link: if valid_id(&id) { format!("https://contacts.google.com/person/{id}") } else { String::new() },
            org: org.map(|o| clean(&o.name)).unwrap_or_default(),
            title: org.map(|o| clean(&o.title)).unwrap_or_default(),
            department: org.map(|o| clean(&o.department)).unwrap_or_default(),
            nickname: values(&self.nicknames).into_iter().next().unwrap_or_default(),
            birthday: birthday(&self.birthdays),
            addresses: capped(self.addresses.iter().map(|a| clean(&a.formatted))),
            urls: values(&self.urls)
                .into_iter()
                .filter(|u| u.starts_with("https://") || u.starts_with("http://"))
                .collect(),
            note: self.biographies.first().map(|b| clip(&b.value, MAX_NOTE)).unwrap_or_default(),
            relations,
            id,
            name,
            emails,
            phones,
            starred,
        })
    }
}
