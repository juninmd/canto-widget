use serde::{Deserialize, Serialize};

use crate::calendar_event::{EventList, RawEvent};
use crate::error::{AppError, Result};

const API: &str = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

#[derive(Debug, Clone, Default, Serialize, Deserialize, PartialEq)]
pub struct AgendaItem {
    pub id: String,
    pub title: String,
    /// RFC3339 when there's a time; YYYY-MM-DD for an all-day event.
    pub start: String,
    pub end: String,
    pub all_day: bool,
    pub location: String,
    pub meet: String,
    pub link: String,
    // Defaults keep task reminders and snoozed alerts, built without these, deserializable.
    #[serde(default)]
    pub organizer: String,
    #[serde(default)]
    pub creator: String,
    #[serde(default)]
    pub description: String,
    #[serde(default)]
    pub guests: u32,
    #[serde(default)]
    pub attachments: Vec<Attachment>,
    /// The user's own RSVP (accepted, declined, tentative, needsAction); empty when not on the guest list.
    #[serde(default)]
    pub response: String,
    #[serde(default)]
    pub attendees: Vec<Guest>,
}

/// A person on the guest list; rooms are left out.
#[derive(Debug, Clone, Default, Serialize, Deserialize, PartialEq)]
pub struct Guest {
    pub name: String,
    pub email: String,
    pub response: String,
    pub organizer: bool,
    pub optional: bool,
    pub me: bool,
}

/// A file linked to the event, such as the notes Gemini writes after a Meet.
#[derive(Debug, Clone, Default, Serialize, Deserialize, PartialEq)]
pub struct Attachment {
    pub title: String,
    pub url: String,
    pub mime: String,
}

pub fn events(token: &str, time_min: &str, time_max: &str, max_results: u32) -> Result<Vec<AgendaItem>> {
    let res = crate::net::client_builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| AppError::Drive(e.to_string()))?
        .get(API)
        .bearer_auth(token)
        .query(&[
            ("timeMin", time_min),
            ("timeMax", time_max),
            ("singleEvents", "true"),
            ("orderBy", "startTime"),
            ("maxResults", &max_results.to_string()),
        ])
        .send()
        .map_err(|e| AppError::Drive(e.to_string()))?;
    if !res.status().is_success() {
        let status = res.status();
        return Err(AppError::Drive(format!("calendar respondeu {status}: {}", res.text().unwrap_or_default())));
    }
    let list: EventList = res.json().map_err(|e| AppError::Drive(e.to_string()))?;
    Ok(list.items.into_iter().filter_map(RawEvent::into_item).collect())
}
