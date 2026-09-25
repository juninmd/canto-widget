//! Google Calendar's event JSON, reduced to what the widget shows.
use serde::Deserialize;

use crate::calendar::{AgendaItem, Attachment, Guest};
use crate::meet::meet_link;
use crate::plain_text::plain_text;

const DESCRIPTION_CHARS: usize = 1500;
/// Bounds what reaches the webview on all-hands invites.
const MAX_GUESTS: usize = 50;
const RESPONSES: [&str; 4] = ["accepted", "declined", "tentative", "needsAction"];

#[derive(Deserialize)]
pub struct EventList {
    #[serde(default)]
    pub items: Vec<RawEvent>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RawEvent {
    #[serde(default)]
    id: String,
    summary: Option<String>,
    location: Option<String>,
    description: Option<String>,
    hangout_link: Option<String>,
    html_link: Option<String>,
    conference_data: Option<ConferenceData>,
    start: Option<EventTime>,
    end: Option<EventTime>,
    status: Option<String>,
    organizer: Option<Person>,
    creator: Option<Person>,
    #[serde(default)]
    attendees: Vec<Attendee>,
    #[serde(default)]
    attachments: Vec<RawAttachment>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct ConferenceData {
    #[serde(default)]
    entry_points: Vec<EntryPoint>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct EntryPoint {
    uri: Option<String>,
    entry_point_type: Option<String>,
}

#[derive(Deserialize, Default)]
#[serde(rename_all = "camelCase")]
struct EventTime {
    date_time: Option<String>,
    date: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Person {
    #[serde(default)]
    email: String,
    display_name: Option<String>,
    #[serde(rename = "self", default)]
    is_self: bool,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Attendee {
    #[serde(default)]
    resource: bool,
    #[serde(default)]
    email: String,
    display_name: Option<String>,
    response_status: Option<String>,
    #[serde(default)]
    organizer: bool,
    #[serde(default)]
    optional: bool,
    #[serde(rename = "self", default)]
    is_self: bool,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct RawAttachment {
    #[serde(default)]
    title: String,
    #[serde(default)]
    file_url: String,
    #[serde(default)]
    mime_type: String,
}

impl Person {
    fn label(self) -> String {
        if self.is_self {
            return "você".into();
        }
        self.display_name.filter(|n| !n.trim().is_empty()).unwrap_or(self.email)
    }
}

impl Attendee {
    fn into_guest(self) -> Guest {
        let response = self.response_status.filter(|r| RESPONSES.contains(&r.as_str())).unwrap_or_default();
        Guest {
            name: self.display_name.filter(|n| !n.trim().is_empty()).unwrap_or_else(|| self.email.clone()),
            email: self.email,
            response,
            organizer: self.organizer,
            optional: self.optional,
            me: self.is_self,
        }
    }
}

impl RawEvent {
    pub fn into_item(self) -> Option<AgendaItem> {
        if self.status.as_deref() == Some("cancelled") {
            return None;
        }
        let start = self.start?;
        let end = self.end.unwrap_or_default();
        let entries: Vec<&str> = self
            .conference_data
            .as_ref()
            .map(|c| {
                c.entry_points
                    .iter()
                    .filter(|e| e.entry_point_type.as_deref() != Some("phone"))
                    .filter_map(|e| e.uri.as_deref())
                    .collect()
            })
            .unwrap_or_default();
        let location = self.location.unwrap_or_default();
        let raw_description = self.description.unwrap_or_default();
        let mut attendees: Vec<Guest> =
            self.attendees.into_iter().filter(|a| !a.resource).map(Attendee::into_guest).collect();
        let guests = attendees.len() as u32;
        let response = attendees.iter().find(|g| g.me).map(|g| g.response.clone()).unwrap_or_default();
        // Organizer, then the user, then whoever answered first: the people that matter on a small screen.
        attendees.sort_by_key(|g| (!g.organizer, !g.me, rank(&g.response)));
        attendees.truncate(MAX_GUESTS);
        let meet = meet_link(self.hangout_link.as_deref(), &entries, &[raw_description.as_str(), location.as_str()]);
        Some(AgendaItem {
            id: self.id,
            title: self.summary.unwrap_or_else(|| "(sem titulo)".into()),
            all_day: start.date_time.is_none(),
            start: start.date_time.or(start.date).unwrap_or_default(),
            end: end.date_time.or(end.date).unwrap_or_default(),
            location,
            meet,
            link: self.html_link.unwrap_or_default(),
            organizer: self.organizer.map(Person::label).unwrap_or_default(),
            creator: self.creator.map(Person::label).unwrap_or_default(),
            description: plain_text(&raw_description, DESCRIPTION_CHARS),
            guests,
            attachments: self.attachments.into_iter().filter_map(attachment).collect(),
            response,
            attendees,
        })
    }
}

fn rank(response: &str) -> u8 {
    match response {
        "accepted" => 0,
        "tentative" => 1,
        "needsAction" | "" => 2,
        _ => 3,
    }
}

/// Only https links are kept: the UI hands this URL to the system browser.
fn attachment(a: RawAttachment) -> Option<Attachment> {
    a.file_url.starts_with("https://").then(|| Attachment {
        title: if a.title.trim().is_empty() { "anexo".into() } else { a.title },
        url: a.file_url,
        mime: a.mime_type,
    })
}

#[cfg(test)]
#[path = "calendar_event_tests.rs"]
mod tests;
