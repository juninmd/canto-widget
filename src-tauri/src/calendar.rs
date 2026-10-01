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
    /// Short state for alerts that aren't calendar events: a Status API indicator or a model's rank.
    #[serde(default)]
    pub tag: String,
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

/// Largest page Google serves; a month of meetings rarely needs a second one.
const PAGE_MAX: u32 = 250;

pub fn events(token: &str, time_min: &str, time_max: &str, max_results: u32) -> Result<Vec<AgendaItem>> {
    Ok(page(token, time_min, time_max, max_results, None)?.0)
}

/// Every event in the interval, following `nextPageToken` until `cap` events (then it stops: a bound, not a list).
pub fn events_all(token: &str, time_min: &str, time_max: &str, cap: usize) -> Result<Vec<AgendaItem>> {
    collect_pages(cap, |next| page(token, time_min, time_max, PAGE_MAX, next))
}

pub(crate) fn collect_pages<T>(
    cap: usize,
    mut fetch: impl FnMut(Option<&str>) -> Result<(Vec<T>, Option<String>)>,
) -> Result<Vec<T>> {
    let mut out = Vec::new();
    let mut next: Option<String> = None;
    loop {
        let (items, token) = fetch(next.as_deref())?;
        out.extend(items);
        match token.filter(|t| !t.is_empty()) {
            Some(t) if out.len() < cap => next = Some(t),
            _ => break,
        }
    }
    out.truncate(cap);
    Ok(out)
}

fn page(
    token: &str,
    time_min: &str,
    time_max: &str,
    max_results: u32,
    page_token: Option<&str>,
) -> Result<(Vec<AgendaItem>, Option<String>)> {
    let mut query = vec![
        ("timeMin", time_min.to_string()),
        ("timeMax", time_max.to_string()),
        ("singleEvents", "true".to_string()),
        ("orderBy", "startTime".to_string()),
        ("maxResults", max_results.to_string()),
    ];
    if let Some(t) = page_token {
        query.push(("pageToken", t.to_string()));
    }
    let res = crate::net::client_builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| AppError::Drive(e.to_string()))?
        .get(API)
        .bearer_auth(token)
        .query(&query)
        .send()
        .map_err(|e| AppError::Drive(e.to_string()))?;
    if !res.status().is_success() {
        let status = res.status();
        return Err(AppError::Drive(format!("calendar respondeu {status}: {}", res.text().unwrap_or_default())));
    }
    let list: EventList = res.json().map_err(|e| AppError::Drive(e.to_string()))?;
    Ok((list.items.into_iter().filter_map(RawEvent::into_item).collect(), list.next_page_token))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn pages_are_followed_until_the_last_one() {
        let mut asked = Vec::new();
        let out = collect_pages(100, |next| {
            asked.push(next.map(String::from));
            Ok(match next {
                None => (vec![1, 2], Some("p2".to_string())),
                _ => (vec![3], None),
            })
        })
        .unwrap();
        assert_eq!(out, vec![1, 2, 3]);
        assert_eq!(asked, vec![None, Some("p2".to_string())]);
    }

    #[test]
    fn a_busy_calendar_stops_at_the_cap_instead_of_paging_forever() {
        let mut calls = 0;
        let out = collect_pages(5, |_| {
            calls += 1;
            Ok((vec![0; 3], Some("again".to_string())))
        })
        .unwrap();
        assert_eq!((out.len(), calls), (5, 2));
    }

    #[test]
    fn a_failed_page_fails_the_whole_list_rather_than_returning_a_silent_part() {
        let r = collect_pages(100, |next| match next {
            None => Ok((vec![1], Some("p2".to_string()))),
            _ => Err(AppError::Drive("calendar respondeu 500".into())),
        });
        assert!(r.is_err());
    }
}
