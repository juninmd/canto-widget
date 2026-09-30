//! Per-task focus: the planned effort and the seconds the timer has added so far.
use tauri::State;

use crate::error::{AppError, Result};
use crate::model::{next_version, now_ms};
use crate::vault::AppState;

const MAX_ESTIMATE_MIN: u32 = 24 * 60;
/// One flush never covers more than a day: the UI flushes every minute, so more means a clock jump.
const MAX_ADD_SECS: u32 = 24 * 3600;

pub fn validate_estimate(minutes: Option<u32>) -> Result<Option<u32>> {
    match minutes {
        Some(m) if m == 0 || m > MAX_ESTIMATE_MIN => {
            Err(AppError::Config("estimativa deve ter entre 1 e 1440 minutos".into()))
        }
        other => Ok(other),
    }
}

pub fn add_tracked(current: u32, secs: u32) -> Result<u32> {
    if secs == 0 || secs > MAX_ADD_SECS {
        return Err(AppError::Config("tempo registrado inválido".into()));
    }
    Ok(current.saturating_add(secs))
}

#[tauri::command(async)]
pub fn task_set_estimate(state: State<'_, AppState>, id: String, minutes: Option<u32>) -> Result<()> {
    let minutes = validate_estimate(minutes)?;
    state.mutate(|d| {
        if let Some(t) = d.tasks.iter_mut().find(|t| t.id == id) {
            t.estimate_min = minutes;
            t.updated_at = next_version(t.updated_at, now_ms());
        }
    })
}

/// A task deleted while its timer ran simply has nowhere to add the time.
#[tauri::command(async)]
pub fn task_add_time(state: State<'_, AppState>, id: String, secs: u32) -> Result<()> {
    add_tracked(0, secs)?;
    // Background on purpose: a timer left running must not keep the vault from auto-locking.
    state.in_background(|d| {
        let Some(t) = d.tasks.iter_mut().find(|t| t.id == id) else { return ((), false) };
        t.tracked_secs = add_tracked(t.tracked_secs, secs).unwrap_or(t.tracked_secs);
        t.updated_at = next_version(t.updated_at, now_ms());
        ((), true)
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn an_estimate_is_one_minute_to_a_day_or_none() {
        assert_eq!(validate_estimate(None).unwrap(), None);
        assert_eq!(validate_estimate(Some(25)).unwrap(), Some(25));
        assert!(validate_estimate(Some(0)).is_err());
        assert!(validate_estimate(Some(1441)).is_err());
    }

    #[test]
    fn tracked_time_adds_up_and_refuses_empty_or_absurd_chunks() {
        assert_eq!(add_tracked(60, 30).unwrap(), 90);
        assert_eq!(add_tracked(u32::MAX - 1, 60).unwrap(), u32::MAX);
        assert!(add_tracked(0, 0).is_err());
        assert!(add_tracked(0, 86_401).is_err());
    }

    #[test]
    fn an_old_task_json_without_the_new_fields_still_loads() {
        let t: crate::model::Task = serde_json::from_str(
            r#"{"id":"a","title":"x","done":false,"day":"2026-09-01","created_at":1,"updated_at":1}"#,
        )
        .unwrap();
        assert_eq!((t.estimate_min, t.tracked_secs), (None, 0));
    }
}
