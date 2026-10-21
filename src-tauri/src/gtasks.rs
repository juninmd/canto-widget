//! Google Tasks: the default list's open tasks, adding one from the quick capture and checking one off.
use serde::{Deserialize, Serialize};

use crate::error::{AppError, Result};
use crate::google_api::{check_id, client, send};

const API: &str = "https://tasks.googleapis.com/tasks/v1/lists/@default/tasks";
/// Google's own limit for a task title.
const TITLE_MAX: usize = 1024;

#[derive(Debug, Clone, Default, Serialize, PartialEq)]
pub struct GTask {
    pub id: String,
    pub title: String,
    /// `YYYY-MM-DD`, or empty without a due date (Google keeps only the day).
    pub due: String,
}

#[derive(Deserialize)]
struct TaskList {
    #[serde(default)]
    items: Vec<RawTask>,
}

#[derive(Deserialize)]
pub(crate) struct RawTask {
    id: String,
    #[serde(default)]
    title: String,
    #[serde(default)]
    due: String,
    #[serde(default)]
    status: String,
}

/// Completed tasks and Google's blank placeholders stay out.
pub(crate) fn open_tasks(raw: Vec<RawTask>) -> Vec<GTask> {
    raw.into_iter()
        .filter(|t| t.status != "completed" && !t.title.trim().is_empty())
        .map(|t| GTask { due: t.due.get(..10).unwrap_or("").to_string(), id: t.id, title: t.title })
        .collect()
}

pub fn clean_title(title: &str) -> Result<String> {
    let title = title.trim();
    if title.is_empty() || title.chars().count() > TITLE_MAX {
        return Err(AppError::Config(crate::lang::tr("título de tarefa inválido", "invalid task title").into()));
    }
    Ok(title.to_string())
}

pub fn list(token: &str) -> Result<Vec<GTask>> {
    let query = [("showCompleted", "false"), ("showHidden", "false"), ("maxResults", "100")];
    let list: TaskList = send("tasks", client()?.get(API).bearer_auth(token).query(&query))?;
    Ok(open_tasks(list.items))
}

pub fn add(token: &str, title: &str) -> Result<GTask> {
    let body = serde_json::json!({ "title": clean_title(title)? });
    let raw: RawTask = send("tasks", client()?.post(API).bearer_auth(token).json(&body))?;
    Ok(GTask { due: String::new(), id: raw.id, title: raw.title })
}

pub fn complete(token: &str, id: &str) -> Result<()> {
    check_id(id)?;
    let body = serde_json::json!({ "status": "completed" });
    let _: serde::de::IgnoredAny =
        send("tasks", client()?.patch(format!("{API}/{id}")).bearer_auth(token).json(&body))?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn only_open_named_tasks_are_listed_with_the_due_day() {
        let list: TaskList = serde_json::from_str(
            r#"{"items": [
                {"id": "a", "title": "Renovar seguro", "due": "2026-10-20T00:00:00.000Z", "status": "needsAction"},
                {"id": "b", "title": "Feita", "status": "completed"},
                {"id": "c", "title": "  ", "status": "needsAction"},
                {"id": "d", "title": "Sem data", "status": "needsAction"}
            ]}"#,
        )
        .unwrap();
        let tasks = open_tasks(list.items);
        assert_eq!(tasks.len(), 2);
        assert_eq!(tasks[0], GTask { id: "a".into(), title: "Renovar seguro".into(), due: "2026-10-20".into() });
        assert_eq!(tasks[1].due, "");
    }

    #[test]
    fn a_title_is_trimmed_and_bounded() {
        assert_eq!(clean_title("  Comprar presente  ").unwrap(), "Comprar presente");
        assert!(clean_title("   ").is_err());
        assert!(clean_title(&"x".repeat(TITLE_MAX + 1)).is_err());
    }

    #[test]
    fn completing_refuses_an_id_that_could_reach_another_path() {
        assert!(complete("token", "a/../b").is_err());
    }
}
