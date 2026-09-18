use std::time::Duration;
use tauri::Manager;

use crate::calendar::AgendaItem;
use crate::error::{AppError, Result};
use crate::model::VaultData;
use crate::notification::TASK_PREFIX;
use crate::vault::AppState;

const MAX_MINUTES: u64 = 120;

pub fn delay(minutes: u64) -> Result<Duration> {
    if !(1..=MAX_MINUTES).contains(&minutes) {
        return Err(AppError::Config(format!("adiar entre 1 e {MAX_MINUTES} minutos")));
    }
    Ok(Duration::from_secs(minutes * 60))
}

// A locked vault can't tell whether the task was finished meanwhile, so it rings anyway.
pub fn still_due(event: &AgendaItem, data: Option<&VaultData>) -> bool {
    let Some(id) = event.id.strip_prefix(TASK_PREFIX) else {
        return true;
    };
    data.is_none_or(|d| d.tasks.iter().any(|t| t.id == id && !t.done))
}

#[tauri::command]
pub fn alert_snooze(app: tauri::AppHandle, minutes: u64) -> Result<()> {
    let wait = delay(minutes)?;
    let event = app.state::<AppState>().alert.lock().unwrap().take();
    let event = event.ok_or_else(|| AppError::Config("nenhum aviso aberto".into()))?;
    std::thread::spawn(move || {
        std::thread::sleep(wait);
        let state = app.state::<AppState>();
        let due = state.in_background(|d| (still_due(&event, Some(d)), false)).unwrap_or_else(|_| still_due(&event, None));
        if due {
            let _ = crate::window::open_alert(&app, event);
        }
    });
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::model::Task;

    fn event(id: &str) -> AgendaItem {
        AgendaItem { id: id.into(), title: "Daily".into(), ..Default::default() }
    }

    fn with_task(done: bool) -> VaultData {
        VaultData { tasks: vec![Task { id: "t1".into(), done, ..Default::default() }], ..Default::default() }
    }

    #[test]
    fn delay_is_bounded() {
        assert!(delay(0).is_err());
        assert!(delay(MAX_MINUTES + 1).is_err(), "a huge snooze would silently drop the reminder");
        assert_eq!(delay(10).unwrap(), Duration::from_secs(600));
    }

    #[test]
    fn task_finished_while_snoozed_does_not_ring_again() {
        assert!(!still_due(&event("task:t1"), Some(&with_task(true))));
        assert!(still_due(&event("task:t1"), Some(&with_task(false))));
    }

    #[test]
    fn task_deleted_while_snoozed_does_not_ring_again() {
        assert!(!still_due(&event("task:gone"), Some(&with_task(false))));
    }

    #[test]
    fn meetings_and_locked_vaults_always_ring() {
        assert!(still_due(&event("evt-42"), Some(&with_task(true))));
        assert!(still_due(&event("task:t1"), None));
    }
}
