//! Google Contacts: the user's own address book (People API), read-only. Photos go out as Google URLs only; the UI asks
//! `contact_photos` for them, which embeds them as `data:` URLs (the only kind the CSP allows).
use serde::{Deserialize, Serialize};

use crate::error::Result;
use crate::google_api::{client, send};

#[path = "contacts_person.rs"]
mod person;
pub(crate) use person::Person;

const API: &str = "https://people.googleapis.com/v1/people/me/connections";
const FIELDS: &str =
    "names,nicknames,emailAddresses,phoneNumbers,organizations,memberships,birthdays,addresses,urls,biographies,relations,photos";
const PAGE_SIZE: &str = "200";
/// Five pages: the webview filters this list as you type, so it stays bounded.
const MAX_PAGES: usize = 5;
const MAX_VALUES: usize = 3;
const MAX_TEXT: usize = 120;
/// A note is free text; the rest of it stays in Google Contacts.
const MAX_NOTE: usize = 500;

/// Google lets a birthday leave the year out.
#[derive(Debug, Clone, Copy, Serialize, PartialEq)]
pub struct Birthday {
    pub day: u8,
    pub month: u8,
    pub year: Option<u16>,
}

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
    pub nickname: String,
    pub department: String,
    pub birthday: Option<Birthday>,
    pub addresses: Vec<String>,
    pub urls: Vec<String>,
    /// "Name (relation)", as the address book words it.
    pub relations: Vec<String>,
    pub note: String,
    /// The contact's own photo on Google's CDN, sized for the avatar; empty for none or Google's generated placeholder.
    pub photo: String,
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
