//! Answering an invite. Google keeps each guest's answer inside the event's attendee list, so the answer is a
//! read of the event followed by a patch of that list with the user's own entry changed.
use serde_json::{json, Value};
use tauri::{AppHandle, Manager};

use crate::blocking::run;
use crate::error::{AppError, Result};
use crate::google::api;
use crate::vault::AppState;

const API: &str = "https://www.googleapis.com/calendar/v3/calendars/primary/events";
const ANSWERS: [&str; 3] = ["accepted", "declined", "tentative"];

/// The webview's event id and answer go into a URL and a body: both are checked first.
pub fn check(event_id: &str, answer: &str) -> Result<()> {
    api::check_id(event_id)?;
    if ANSWERS.contains(&answer) {
        Ok(())
    } else {
        Err(AppError::Config(crate::lang::tr("resposta inválida", "invalid answer").into()))
    }
}

/// The event's guest list with the user's own entry answering; `None` when the user is not on it.
fn with_answer(event: &Value, answer: &str) -> Option<Vec<Value>> {
    let mut guests = event.get("attendees")?.as_array()?.clone();
    let me = guests.iter_mut().find(|g| g.get("self").and_then(Value::as_bool) == Some(true))?;
    me["responseStatus"] = json!(answer);
    Some(guests)
}

fn respond(token: &str, event_id: &str, answer: &str) -> Result<()> {
    let url = format!("{API}/{event_id}");
    let client = api::client()?;
    let event: Value = api::send("calendar", client.get(&url).bearer_auth(token))?;
    let guests = with_answer(&event, answer).ok_or_else(|| {
        AppError::Config(
            crate::lang::tr("você não está na lista de convidados", "you are not on the guest list").into(),
        )
    })?;
    // Like Google's own answer buttons, this tells the organizer.
    let patch =
        client.patch(&url).bearer_auth(token).query(&[("sendUpdates", "all")]).json(&json!({ "attendees": guests }));
    api::send::<Value>("calendar", patch).map(drop)
}

/// A declined event leaves the agenda; the meeting watcher may still hold it for a few minutes, so it must not ring.
#[tauri::command]
pub async fn agenda_respond(app: AppHandle, event_id: String, answer: String) -> Result<()> {
    check(&event_id, &answer)?;
    run(move || {
        let token = crate::google::token::fresh(&app.state::<AppState>())?;
        respond(&token, &event_id, &answer)?;
        if answer == "declined" {
            app.state::<crate::meeting_alert::Alerted>().mark(&event_id);
        }
        Ok(())
    })
    .await
}

#[cfg(test)]
mod tests {
    use super::*;

    fn event() -> Value {
        json!({"id":"e1","attendees":[
            {"email":"boss@x.com","organizer":true,"responseStatus":"accepted"},
            {"email":"me@x.com","self":true,"responseStatus":"needsAction","optional":true}]})
    }

    #[test]
    fn only_the_users_own_entry_changes_and_the_rest_of_the_guest_list_is_kept() {
        let guests = with_answer(&event(), "accepted").unwrap();
        assert_eq!(guests[1]["responseStatus"], "accepted");
        assert_eq!(guests[1]["optional"], true, "fields Google sent must travel back untouched");
        assert_eq!(guests[0], event()["attendees"][0]);
    }

    #[test]
    fn an_event_the_user_is_not_invited_to_cannot_be_answered() {
        assert!(with_answer(&json!({"attendees":[{"email":"a@x.com"}]}), "declined").is_none());
        assert!(with_answer(&json!({"id":"solo"}), "declined").is_none());
    }

    #[test]
    fn ids_and_answers_from_the_webview_are_validated() {
        assert!(check("abc123_20261120T130000Z", "tentative").is_ok());
        assert!(check("../x", "accepted").is_err());
        assert!(check("abc", "needsAction").is_err());
        assert!(check("abc", "").is_err());
    }
}
