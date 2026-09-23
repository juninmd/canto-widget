//! Notes and transcripts Gemini attaches to Calendar events after a Meet.
use serde::Serialize;
use std::collections::HashSet;

use crate::calendar::AgendaItem;

const GOOGLE_DOC: &str = "application/vnd.google-apps.document";

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct GeminiDoc {
    pub meeting: String,
    pub start: String,
    pub title: String,
    pub url: String,
}

/// Gemini names its docs "Notes by Gemini", "Anotações do Gemini" or "... - Transcript"; other attachments stay out.
fn is_gemini(title: &str, mime: &str, url: &str) -> bool {
    let doc = mime == GOOGLE_DOC || url.starts_with("https://docs.google.com/document/");
    let t = title.to_lowercase();
    doc && (t.contains("gemini") || t.contains("transcri"))
}

/// Newest meeting first; a doc attached to several occurrences shows once.
pub fn from_events(events: Vec<AgendaItem>) -> Vec<GeminiDoc> {
    let mut seen = HashSet::new();
    let mut docs: Vec<GeminiDoc> = Vec::new();
    for e in events.into_iter().rev() {
        for a in e.attachments {
            if is_gemini(&a.title, &a.mime, &a.url) && seen.insert(a.url.clone()) {
                docs.push(GeminiDoc { meeting: e.title.clone(), start: e.start.clone(), title: a.title, url: a.url });
            }
        }
    }
    docs
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::calendar::Attachment;

    fn event(title: &str, start: &str, attachments: Vec<(&str, &str, &str)>) -> AgendaItem {
        AgendaItem {
            title: title.into(),
            start: start.into(),
            attachments: attachments
                .into_iter()
                .map(|(t, u, m)| Attachment { title: t.into(), url: u.into(), mime: m.into() })
                .collect(),
            ..Default::default()
        }
    }

    #[test]
    fn keeps_gemini_notes_and_transcripts_and_drops_other_attachments() {
        let docs = from_events(vec![event(
            "Planejamento",
            "2026-09-17T14:00:00Z",
            vec![
                ("Anotações do Gemini", "https://docs.google.com/document/d/a", GOOGLE_DOC),
                ("Planejamento - Transcript", "https://docs.google.com/document/d/b", GOOGLE_DOC),
                ("Pauta do planejamento", "https://docs.google.com/document/d/c", GOOGLE_DOC),
                ("Gemini.pdf", "https://drive.google.com/file/d/d", "application/pdf"),
            ],
        )]);
        let titles: Vec<&str> = docs.iter().map(|d| d.title.as_str()).collect();
        assert_eq!(titles, vec!["Anotações do Gemini", "Planejamento - Transcript"]);
        assert_eq!(docs[0].meeting, "Planejamento");
    }

    #[test]
    fn newest_meeting_comes_first_and_a_repeated_doc_shows_once() {
        let notes = ("Notes by Gemini", "https://docs.google.com/document/d/x", GOOGLE_DOC);
        let docs = from_events(vec![
            event("Daily", "2026-09-16T09:00:00Z", vec![notes]),
            event("Daily", "2026-09-17T09:00:00Z", vec![notes]),
            event(
                "Retro",
                "2026-09-18T15:00:00Z",
                vec![("Notes by Gemini", "https://docs.google.com/document/d/y", "")],
            ),
        ]);
        let got: Vec<(&str, &str)> = docs.iter().map(|d| (d.meeting.as_str(), d.start.as_str())).collect();
        assert_eq!(got, vec![("Retro", "2026-09-18T15:00:00Z"), ("Daily", "2026-09-17T09:00:00Z")]);
    }
}
