//! Google Contacts: the user's own address book (People API), read-only. Photos stay out: the CSP allows no remote image.
use serde::{Deserialize, Serialize};

use crate::error::Result;
use crate::google_api::{client, send, valid_id};

const API: &str = "https://people.googleapis.com/v1/people/me/connections";
const FIELDS: &str = "names,emailAddresses,phoneNumbers,organizations,memberships";
const PAGE_SIZE: &str = "200";
/// Five pages: the webview filters this list as you type, so it stays bounded.
const MAX_PAGES: usize = 5;
const MAX_VALUES: usize = 3;
const MAX_TEXT: usize = 120;

#[derive(Debug, Clone, Default, Serialize, PartialEq)]
pub struct Contact {
    pub id: String,
    pub name: String,
    pub emails: Vec<String>,
    pub phones: Vec<String>,
    pub org: String,
    pub title: String,
    pub starred: bool,
    pub link: String,
}

#[derive(Debug, Clone, Default, Serialize)]
pub struct ContactsView {
    /// Everything the account has, which can be more than `items` holds.
    pub total: u32,
    pub items: Vec<Contact>,
}

#[derive(Deserialize, Default)]
struct Page {
    #[serde(default)]
    connections: Vec<Person>,
    #[serde(rename = "nextPageToken", default)]
    next_page_token: String,
    #[serde(rename = "totalItems", default)]
    total_items: u32,
}

#[derive(Deserialize, Default)]
pub(crate) struct Person {
    #[serde(rename = "resourceName", default)]
    resource_name: String,
    #[serde(default)]
    names: Vec<Name>,
    #[serde(rename = "emailAddresses", default)]
    emails: Vec<Value>,
    #[serde(rename = "phoneNumbers", default)]
    phones: Vec<Value>,
    #[serde(default)]
    organizations: Vec<Organization>,
    #[serde(default)]
    memberships: Vec<Membership>,
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

fn clean(text: &str) -> String {
    text.trim().chars().take(MAX_TEXT).collect()
}

fn values(list: &[Value]) -> Vec<String> {
    list.iter().map(|v| clean(&v.value)).filter(|v| !v.is_empty()).take(MAX_VALUES).collect()
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
        Some(Contact {
            link: if valid_id(&id) { format!("https://contacts.google.com/person/{id}") } else { String::new() },
            org: org.map(|o| clean(&o.name)).unwrap_or_default(),
            title: org.map(|o| clean(&o.title)).unwrap_or_default(),
            id,
            name,
            emails,
            phones,
            starred,
        })
    }
}

pub fn list(token: &str) -> Result<ContactsView> {
    let http = client()?;
    let mut view = ContactsView::default();
    let mut next = String::new();
    for _ in 0..MAX_PAGES {
        let mut params = vec![("personFields", FIELDS), ("pageSize", PAGE_SIZE), ("sortOrder", "FIRST_NAME_ASCENDING")];
        if !next.is_empty() {
            params.push(("pageToken", next.as_str()));
        }
        let page: Page = send("contacts", http.get(API).bearer_auth(token).query(&params))?;
        view.total = view.total.max(page.total_items);
        view.items.extend(page.connections.into_iter().filter_map(Person::into_contact));
        if page.next_page_token.is_empty() {
            break;
        }
        next = page.next_page_token;
    }
    view.total = view.total.max(view.items.len() as u32);
    Ok(view)
}

#[cfg(test)]
#[path = "contacts_tests.rs"]
mod tests;
