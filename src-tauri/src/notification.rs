//! System notification alongside the window alert: arrives even with the widget covered.
use tauri_plugin_notification::NotificationExt;

use crate::calendar::AgendaItem;

/// Same prefix the UI puts on the reminder id (`PREFIXO_TAREFA` in `lembretes.ts`).
pub const TASK_PREFIX: &str = "task:";

pub fn content(event: &AgendaItem) -> (&'static str, String) {
    if event.id.starts_with(TASK_PREFIX) {
        return ("Lembrete de tarefa", event.title.clone());
    }
    let body = match event.location.trim() {
        "" => event.title.clone(),
        location => format!("{} · {location}", event.title),
    };
    ("Reunião começando", body)
}

/// Best effort: a denied or unavailable notification must not block the window alert.
pub fn send(app: &tauri::AppHandle, event: &AgendaItem) {
    let (title, body) = content(event);
    if let Err(e) = app.notification().builder().title(title).body(body).show() {
        eprintln!("notificacao do sistema falhou: {e}");
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn event(id: &str, location: &str) -> AgendaItem {
        AgendaItem {
            id: id.into(),
            title: "Daily do time".into(),
            start: String::new(),
            end: String::new(),
            all_day: false,
            location: location.into(),
            meet: String::new(),
            link: String::new(),
        }
    }

    #[test]
    fn task_reminder_announces_itself_as_a_task() {
        assert_eq!(content(&event("task:abc", "")), ("Lembrete de tarefa", "Daily do time".into()));
    }

    #[test]
    fn meeting_carries_the_location_when_present() {
        assert_eq!(content(&event("ev1", "Sala 3")).1, "Daily do time · Sala 3");
        assert_eq!(content(&event("ev1", "  ")), ("Reunião começando", "Daily do time".into()));
    }
}
