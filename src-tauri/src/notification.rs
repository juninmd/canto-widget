//! System notification alongside the window alert: arrives even with the widget covered.
use tauri_plugin_notification::NotificationExt;

use crate::calendar::AgendaItem;

/// Same prefix the UI puts on the reminder id (`PREFIXO_TAREFA` in `lembretes.ts`).
pub const TASK_PREFIX: &str = "task:";
/// Same prefix as `STATUS_PREFIX` in the UI's `Alert.tsx`.
pub const STATUS_PREFIX: &str = "status:";
/// Same prefix as `MODEL_PREFIX` in the UI's `alerts.ts`: a model entered or climbed in the AI top 10.
pub const MODEL_PREFIX: &str = "model:";
/// Same prefix as `PR_PREFIX` in the UI's `alerts.ts`: one of the user's own PRs has red CI or no review for too long.
pub const PR_PREFIX: &str = "pr:";
/// Same prefix as `MENTION_PREFIX` in the UI's `alerts.ts`: someone @-mentioned the user on GitHub or GitLab.
pub const MENTION_PREFIX: &str = "mention:";

pub fn content(event: &AgendaItem) -> (&'static str, String) {
    if event.id.starts_with(TASK_PREFIX) {
        return (crate::lang::tr("Lembrete de tarefa", "Task reminder"), event.title.clone());
    }
    if event.id.starts_with(STATUS_PREFIX) {
        return (
            crate::lang::tr("Serviço com problema", "Service issue"),
            format!("{}: {}", event.title, event.description),
        );
    }
    if event.id.starts_with(MODEL_PREFIX) {
        return (crate::lang::tr("Modelo de IA", "AI model"), format!("{}: {}", event.title, event.tag));
    }
    if event.id.starts_with(MENTION_PREFIX) {
        let body = format!("{} {}", event.organizer, event.title).trim().to_string();
        return (crate::lang::tr("Você foi mencionado", "You were mentioned"), body);
    }
    if event.id.starts_with(PR_PREFIX) {
        let title = match event.tag.as_str() {
            "ci" => crate::lang::tr("CI falhou", "CI failed"),
            _ => crate::lang::tr("PR sem revisão", "PR without a review"),
        };
        return (title, format!("{} {}", event.organizer, event.title).trim().to_string());
    }
    let body = match event.location.trim() {
        "" => event.title.clone(),
        location => format!("{} · {location}", event.title),
    };
    (crate::lang::tr("Reunião começando", "Meeting starting"), body)
}

pub fn send(app: &tauri::AppHandle, event: &AgendaItem) {
    let (title, body) = content(event);
    notify_os(app, title, &body);
}

/// The only way to an OS notification, so do not disturb covers every kind. Best effort: a denied or
/// unavailable notification must not block the window alert.
pub fn notify_os(app: &tauri::AppHandle, title: &str, body: &str) {
    if crate::do_not_disturb::quiet(app) {
        return;
    }
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
            ..Default::default()
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

    #[test]
    fn own_pr_alerts_say_which_case_and_name_the_pr() {
        let pr = |tag: &str| AgendaItem {
            id: "pr:ci:acme/atlas#12".into(),
            title: "Corrige o parser".into(),
            organizer: "acme/atlas#12".into(),
            tag: tag.into(),
            ..Default::default()
        };
        assert_eq!(content(&pr("ci")), ("CI falhou", "acme/atlas#12 Corrige o parser".into()));
        assert_eq!(content(&pr("stalled")).0, "PR sem revisão");
    }
}
