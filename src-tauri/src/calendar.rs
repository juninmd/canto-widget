use serde::{Deserialize, Serialize};

use crate::error::{AppError, Result};
use crate::meet::meet_link;

const API: &str = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct AgendaItem {
    pub id: String,
    pub titulo: String,
    /// RFC3339 quando ha horario; YYYY-MM-DD quando e evento de dia inteiro.
    pub inicio: String,
    pub fim: String,
    pub dia_inteiro: bool,
    pub local: String,
    pub meet: String,
    pub link: String,
}

#[derive(Deserialize)]
struct EventList {
    #[serde(default)]
    items: Vec<RawEvent>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct RawEvent {
    #[serde(default)]
    id: String,
    #[serde(default)]
    summary: Option<String>,
    #[serde(default)]
    location: Option<String>,
    #[serde(default)]
    description: Option<String>,
    #[serde(default)]
    hangout_link: Option<String>,
    #[serde(default)]
    html_link: Option<String>,
    #[serde(default)]
    conference_data: Option<ConferenceData>,
    start: Option<EventTime>,
    end: Option<EventTime>,
    #[serde(default)]
    status: Option<String>,
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
    #[serde(default)]
    uri: Option<String>,
    #[serde(default)]
    entry_point_type: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct EventTime {
    #[serde(default)]
    date_time: Option<String>,
    #[serde(default)]
    date: Option<String>,
}

impl RawEvent {
    fn into_item(self) -> Option<AgendaItem> {
        if self.status.as_deref() == Some("cancelled") {
            return None;
        }
        let start = self.start?;
        let end = self.end.unwrap_or(EventTime {
            date_time: None,
            date: None,
        });
        let dia_inteiro = start.date_time.is_none();
        let entradas: Vec<&str> = self
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
        let local = self.location.unwrap_or_default();
        let descricao = self.description.unwrap_or_default();
        let textos: Vec<&str> = vec![descricao.as_str(), local.as_str()];
        let meet = meet_link(self.hangout_link.as_deref(), &entradas, &textos);
        drop(textos);
        Some(AgendaItem {
            id: self.id,
            titulo: self.summary.unwrap_or_else(|| "(sem titulo)".into()),
            inicio: start.date_time.or(start.date).unwrap_or_default(),
            fim: end.date_time.or(end.date).unwrap_or_default(),
            dia_inteiro,
            local,
            meet,
            link: self.html_link.unwrap_or_default(),
        })
    }
}

pub fn eventos(token: &str, time_min: &str, time_max: &str) -> Result<Vec<AgendaItem>> {
    let res = reqwest::blocking::Client::builder()
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
            ("maxResults", "50"),
        ])
        .send()
        .map_err(|e| AppError::Drive(e.to_string()))?;
    if !res.status().is_success() {
        let status = res.status();
        return Err(AppError::Drive(format!(
            "calendar respondeu {status}: {}",
            res.text().unwrap_or_default()
        )));
    }
    let lista: EventList = res.json().map_err(|e| AppError::Drive(e.to_string()))?;
    Ok(lista.items.into_iter().filter_map(RawEvent::into_item).collect())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn desserializa_evento_do_google_com_camelcase() {
        let json = r#"{"items":[{"id":"e1","summary":"Daily","status":"confirmed",
            "hangoutLink":"https://meet.google.com/aaa-bbbb-ccc",
            "htmlLink":"https://calendar.google.com/x",
            "start":{"dateTime":"2026-09-09T09:00:00-03:00"},
            "end":{"dateTime":"2026-09-09T09:15:00-03:00"}}]}"#;
        let lista: EventList = serde_json::from_str(json).unwrap();
        let item = lista.items.into_iter().next().unwrap().into_item().unwrap();
        assert_eq!(item.titulo, "Daily");
        assert_eq!(item.meet, "https://meet.google.com/aaa-bbbb-ccc");
        assert!(!item.dia_inteiro);
    }

    #[test]
    fn evento_cancelado_some_da_agenda() {
        let json = r#"{"items":[{"id":"e1","status":"cancelled","start":{"date":"2026-09-09"}}]}"#;
        let lista: EventList = serde_json::from_str(json).unwrap();
        assert!(lista.items.into_iter().next().unwrap().into_item().is_none());
    }

    #[test]
    fn evento_de_dia_inteiro_e_marcado() {
        let json = r#"{"items":[{"id":"e2","summary":"Feriado","start":{"date":"2026-09-07"},"end":{"date":"2026-09-08"}}]}"#;
        let lista: EventList = serde_json::from_str(json).unwrap();
        let item = lista.items.into_iter().next().unwrap().into_item().unwrap();
        assert!(item.dia_inteiro);
        assert_eq!(item.inicio, "2026-09-07");
    }
}
