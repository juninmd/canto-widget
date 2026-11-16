//! What each MCP tool reads or writes. Reads never count as use (the auto-lock keeps ticking) and everything
//! refuses while the vault is locked.
use crate::resilient::LockExt;
use serde_json::{json, Value};
use tauri::{AppHandle, Manager};

use super::rpc::Backend;
use crate::alert_log::AlertLog;
use crate::cmd_notes::{check_size, note_matches};
use crate::commands::new_id;
use crate::forge::filter::{ForgeFilter, Section};
use crate::github::cmd::{valid_token, GithubState};
use crate::github::cmd_lists::Github;
use crate::meeting_cache::Upcoming;
use crate::model::{now_ms, Note, Task, VaultData};
use crate::text_fold::fold;
use crate::vault::AppState;
use crate::weather::state::WeatherState;

pub struct AppBackend(pub AppHandle);

fn locked() -> String {
    crate::lang::tr(
        "o Canto está bloqueado: peça ao usuário para desbloquear",
        "Canto is locked: ask the user to unlock it",
    )
    .into()
}

fn read<T>(state: &AppState, f: impl FnOnce(&VaultData) -> T) -> Result<T, String> {
    let guard = state.session.lock_safe();
    guard.as_ref().map(|s| f(&s.data)).ok_or_else(locked)
}

fn write<T>(state: &AppState, f: impl FnOnce(&mut VaultData) -> T) -> Result<T, String> {
    if !state.is_unlocked() {
        return Err(locked());
    }
    state.in_background(|d| (f(d), true)).map_err(|e| e.to_string())
}

fn text<'a>(args: &'a Value, key: &str) -> &'a str {
    args.get(key).and_then(Value::as_str).unwrap_or_default()
}

fn limit(args: &Value, default: usize, max: usize) -> usize {
    args.get("limit").and_then(Value::as_u64).map_or(default, |n| (n as usize).clamp(1, max))
}

fn snippet(body: &str) -> String {
    let flat: String = body.split_whitespace().collect::<Vec<_>>().join(" ");
    flat.chars().take(200).collect()
}

fn task_json(t: &Task) -> Value {
    json!({
        "id": t.id, "title": t.title, "done": t.done, "day": t.day, "time": t.reminder_time,
        "priority": t.priority, "estimate_min": t.estimate_min, "pr_url": t.pr_url,
        "subtasks": t.subtasks.iter().map(|s| json!({ "title": s.title, "done": s.done })).collect::<Vec<_>>(),
    })
}

fn day_ok(day: &str) -> bool {
    chrono::NaiveDate::parse_from_str(day, "%Y-%m-%d").is_ok()
}

pub fn list_tasks(d: &VaultData, args: &Value) -> Value {
    let day = text(args, "day");
    let all = args.get("include_done").and_then(Value::as_bool).unwrap_or(false);
    let mut list: Vec<&Task> =
        d.tasks.iter().filter(|t| (day.is_empty() || t.day == day) && (all || !day.is_empty() || !t.done)).collect();
    // With a day given, done tasks show too unless the caller said otherwise: that is what the tab shows.
    if !day.is_empty() && !all && args.get("include_done").is_some() {
        list.retain(|t| !t.done);
    }
    list.sort_by_key(|t| (t.day.clone(), t.done, t.order.unwrap_or(t.created_at), t.created_at));
    Value::Array(list.into_iter().take(limit(args, 50, 200)).map(task_json).collect())
}

pub fn list_notes(d: &VaultData, args: &Value) -> Value {
    let needle = fold(text(args, "query").trim());
    let mut list: Vec<&Note> = d.notes.iter().filter(|n| needle.is_empty() || note_matches(n, &needle)).collect();
    list.sort_by_key(|n| std::cmp::Reverse((n.pinned, n.updated_at)));
    Value::Array(
        list.into_iter()
            .take(limit(args, 30, 100))
            .map(|n| json!({ "id": n.id, "title": n.title, "tags": n.tags, "pinned": n.pinned, "updated_at": n.updated_at, "snippet": snippet(&n.body) }))
            .collect(),
    )
}

pub fn create_task_in(d: &mut VaultData, title: &str, day: &str) -> Result<Task, String> {
    let title = title.trim();
    if title.is_empty() || title.chars().count() > 300 {
        return Err("title must have 1 to 300 characters".into());
    }
    if !day_ok(day) {
        return Err("day must be YYYY-MM-DD".into());
    }
    let now = now_ms();
    let task = Task {
        id: new_id(),
        title: title.into(),
        day: day.into(),
        created_at: now,
        updated_at: now,
        ..Default::default()
    };
    d.tasks.push(task.clone());
    Ok(task)
}

pub fn create_note_in(d: &mut VaultData, title: &str, body: &str, tags: Vec<String>) -> Result<Note, String> {
    if title.trim().is_empty() && body.trim().is_empty() {
        return Err("give the note a title or a body".into());
    }
    check_size(title, body, (0, 0)).map_err(|e| e.to_string())?;
    let tags = tags.into_iter().map(|t| t.trim().to_lowercase()).filter(|t| !t.is_empty()).take(20).collect();
    let now = now_ms();
    let note = Note {
        id: new_id(),
        title: title.into(),
        body: body.into(),
        tags,
        created_at: now,
        updated_at: now,
        ..Default::default()
    };
    d.notes.push(note.clone());
    Ok(note)
}

pub fn complete_task_in(d: &mut VaultData, id: &str) -> Result<Value, String> {
    let task = d.tasks.iter_mut().find(|t| t.id == id).ok_or("task not found")?;
    if !task.done {
        task.done = true;
        task.updated_at = crate::model::next_version(task.updated_at, now_ms());
    }
    Ok(json!({ "id": task.id, "title": task.title, "done": true }))
}

pub fn append_to_note_in(d: &mut VaultData, id: &str, extra: &str) -> Result<Value, String> {
    if extra.trim().is_empty() {
        return Err("text is empty".into());
    }
    let note = d.notes.iter_mut().find(|n| n.id == id).ok_or("note not found")?;
    let body = if note.body.is_empty() { extra.to_string() } else { format!("{}\n{extra}", note.body) };
    check_size(&note.title, &body, (note.title.chars().count(), note.body.chars().count()))
        .map_err(|e| e.to_string())?;
    note.body = body;
    note.updated_at = crate::model::next_version(note.updated_at, now_ms());
    Ok(json!({ "id": note.id, "title": note.title }))
}

impl AppBackend {
    fn state(&self) -> tauri::State<'_, AppState> {
        self.0.state::<AppState>()
    }

    fn pull_requests(&self, args: &Value) -> Result<Value, String> {
        let state = self.state();
        if !state.is_unlocked() {
            return Err(locked());
        }
        let section = match text(args, "section") {
            "review_requested" => Section::ReviewRequested,
            "assigned" => Section::Assigned,
            _ => Section::MyPrs,
        };
        let cred = valid_token(&state, &self.0.state::<GithubState>(), now_ms()).map_err(|e| e.to_string())?;
        let list = crate::forge::list_page::<Github>(&state.forges, &cred, section, 1, &ForgeFilter::default(), false)
            .map_err(|e| e.to_string())?;
        let items: Vec<Value> = list
            .items
            .iter()
            .map(|i| json!({ "ref": i.reference, "title": i.title, "url": i.url, "author": i.author, "draft": i.draft, "comments": i.comments, "updated_at": i.updated_at, "conflict": i.conflict }))
            .collect();
        Ok(json!({ "total": list.total, "items": items }))
    }

    fn weather(&self) -> Result<Value, String> {
        let state = self.0.state::<WeatherState>();
        let forecast = state.forecast(false, now_ms(), crate::weather::forecast)?;
        let days: Vec<&_> = forecast.days.iter().take(3).collect();
        Ok(
            json!({ "place": state.place(), "now": forecast.now, "days": days, "rain_from": forecast.rain_from, "air_quality_us": forecast.air }),
        )
    }

    #[cfg(desktop)]
    fn system(&self) -> Result<Value, String> {
        let snap = self.0.state::<crate::sysmon::SystemMonitor>().read();
        let mut value = serde_json::to_value(snap).map_err(|e| e.to_string())?;
        if let Some(map) = value.as_object_mut() {
            // Curves are chart data and the process list says what the user is running: neither leaves the app.
            map.remove("history");
            map.remove("apps");
        }
        Ok(value)
    }

    #[cfg(not(desktop))]
    fn system(&self) -> Result<Value, String> {
        Err("system status is only available on desktop".into())
    }
}

impl Backend for AppBackend {
    fn call(&self, name: &str, args: &Value) -> Result<Value, String> {
        let state = self.state();
        match name {
            "list_notifications" => {
                if !state.is_unlocked() {
                    return Err(locked());
                }
                let log = self.0.state::<AlertLog>().list();
                Ok(Value::Array(
                    log.iter()
                        .map(|r| json!({ "title": r.item.title, "tag": r.item.tag, "start": r.item.start, "link": r.item.link, "outcome": r.outcome, "at_ms": r.at }))
                        .collect(),
                ))
            }
            "list_tasks" => read(&state, |d| list_tasks(d, args)),
            "list_notes" => read(&state, |d| list_notes(d, args)),
            "get_note" => {
                let id = text(args, "id");
                read(&state, |d| d.notes.iter().find(|n| n.id == id).map(|n| json!({ "id": n.id, "title": n.title, "body": n.body, "tags": n.tags, "updated_at": n.updated_at })))?
                    .ok_or_else(|| "note not found".to_string())
            }
            "list_agenda" => {
                if !state.is_unlocked() {
                    return Err(locked());
                }
                Ok(Value::Array(
                    self.0
                        .state::<Upcoming>()
                        .items()
                        .iter()
                        .map(|e| json!({ "title": e.title, "start": e.start, "end": e.end, "all_day": e.all_day, "location": e.location, "meet": e.meet, "link": e.link, "guests": e.guests, "response": e.response }))
                        .collect(),
                ))
            }
            "list_pull_requests" => self.pull_requests(args),
            "get_system_status" => {
                if !state.is_unlocked() {
                    return Err(locked());
                }
                self.system()
            }
            "get_weather" => {
                if !state.is_unlocked() {
                    return Err(locked());
                }
                self.weather()
            }
            "create_task" => {
                let day = match text(args, "day") {
                    "" => chrono::Local::now().format("%Y-%m-%d").to_string(),
                    d => d.to_string(),
                };
                let title = text(args, "title").to_string();
                write(&state, |d| create_task_in(d, &title, &day))?.map(|t| task_json(&t))
            }
            "create_note" => {
                let tags: Vec<String> = args
                    .get("tags")
                    .and_then(Value::as_array)
                    .map(|a| a.iter().filter_map(|v| v.as_str().map(String::from)).collect())
                    .unwrap_or_default();
                let (title, body) = (text(args, "title").to_string(), text(args, "body").to_string());
                write(&state, |d| create_note_in(d, &title, &body, tags))?
                    .map(|n| json!({ "id": n.id, "title": n.title }))
            }
            "complete_task" => {
                let id = text(args, "id").to_string();
                write(&state, |d| complete_task_in(d, &id))?
            }
            "append_to_note" => {
                let (id, extra) = (text(args, "id").to_string(), text(args, "text").to_string());
                write(&state, |d| append_to_note_in(d, &id, &extra))?
            }
            _ => super::more::call(&self.0, name, args).unwrap_or_else(|| Err(format!("unknown tool: {name}"))),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn vault() -> VaultData {
        let mut d = VaultData::default();
        create_task_in(&mut d, "write report", "2026-11-16").unwrap();
        create_task_in(&mut d, "old", "2026-11-15").unwrap();
        d.tasks[1].done = true;
        create_note_in(&mut d, "Reunião", "pauta longa  sobre\nvendas", vec![" Work ".into()]).unwrap();
        d
    }

    #[test]
    fn open_tasks_by_default_and_a_day_shows_its_done_ones_too() {
        let d = vault();
        assert_eq!(list_tasks(&d, &json!({})).as_array().unwrap().len(), 1);
        assert_eq!(list_tasks(&d, &json!({ "include_done": true })).as_array().unwrap().len(), 2);
        assert_eq!(list_tasks(&d, &json!({ "day": "2026-11-15" })).as_array().unwrap().len(), 1);
        assert_eq!(list_tasks(&d, &json!({ "day": "2026-11-15", "include_done": false })).as_array().unwrap().len(), 0);
    }

    #[test]
    fn notes_search_ignores_accents_and_the_list_carries_only_a_snippet() {
        let d = vault();
        let found = list_notes(&d, &json!({ "query": "reuniao" }));
        assert_eq!(found[0]["snippet"], "pauta longa sobre vendas");
        assert!(found[0].get("body").is_none());
        assert_eq!(list_notes(&d, &json!({ "query": "#work" })).as_array().unwrap().len(), 1);
        assert_eq!(list_notes(&d, &json!({ "query": "zzz" })).as_array().unwrap().len(), 0);
    }

    #[test]
    fn completing_and_appending_change_only_what_they_say() {
        let mut d = vault();
        let id = d.tasks[0].id.clone();
        let before = d.tasks[0].updated_at;
        complete_task_in(&mut d, &id).unwrap();
        assert!(d.tasks[0].done && d.tasks[0].updated_at > before);
        assert!(complete_task_in(&mut d, "nope").is_err());
        let note = d.notes[0].id.clone();
        append_to_note_in(&mut d, &note, "mais uma linha").unwrap();
        assert!(d.notes[0].body.starts_with("pauta longa") && d.notes[0].body.ends_with("\nmais uma linha"));
        assert!(append_to_note_in(&mut d, &note, "  ").is_err() && append_to_note_in(&mut d, "x", "a").is_err());
    }

    #[test]
    fn writes_are_validated() {
        let mut d = VaultData::default();
        assert!(create_task_in(&mut d, "  ", "2026-11-16").is_err());
        assert!(create_task_in(&mut d, "x", "tomorrow").is_err());
        assert!(create_task_in(&mut d, &"x".repeat(301), "2026-11-16").is_err());
        assert!(create_note_in(&mut d, "", " ", vec![]).is_err());
        assert!(create_note_in(&mut d, &"t".repeat(301), "", vec![]).is_err());
        assert!(d.tasks.is_empty() && d.notes.is_empty());
    }
}
