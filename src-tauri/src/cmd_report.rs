//! The week/month report. Its bounds come from the UI, which knows the local calendar (see AGENTS.md).
use tauri::{Manager, State};

use crate::blocking::run;
use crate::calendar::{self, AgendaItem};
use crate::cmd_forges::{rfc3339, Opened};
use crate::error::{AppError, Result};
use crate::forge_filter::Window;
use crate::model::now_ms;
use crate::report::{self, VaultPeriod};
use crate::vault::AppState;

const DAY_MS: i64 = 86_400_000;
/// A calendar month plus a daylight-saving hour.
const MAX_SPAN_MS: i64 = 32 * DAY_MS;
/// Bounds a month on a very busy calendar; four of Google's largest pages.
const MAX_EVENTS: usize = 1000;

/// A period ending at most a day ahead (the UI sends the next midnight) and starting at most a month back.
pub fn check_period(from_ms: i64, to_ms: i64, now: i64) -> Result<()> {
    let ok =
        from_ms < to_ms && to_ms - from_ms <= MAX_SPAN_MS && from_ms >= now - MAX_SPAN_MS && to_ms <= now + 2 * DAY_MS;
    if ok {
        Ok(())
    } else {
        Err(AppError::Config("período fora do intervalo".into()))
    }
}

#[tauri::command]
pub async fn forges_activity_between(app: tauri::AppHandle, from_ms: i64, to_ms: i64) -> Result<Opened> {
    check_period(from_ms, to_ms, now_ms())?;
    let w = Window { since: rfc3339(from_ms)?, until: Some(rfc3339(to_ms)?) };
    run(move || crate::cmd_forges::activity(&app, &w)).await
}

#[tauri::command]
pub async fn report_agenda(app: tauri::AppHandle, from_ms: i64, to_ms: i64) -> Result<Vec<AgendaItem>> {
    check_period(from_ms, to_ms, now_ms())?;
    let (min, max) = (rfc3339(from_ms)?, rfc3339(to_ms)?);
    run(move || {
        let token = crate::cmd_extras::google_token(&app.state::<AppState>())?;
        calendar::events_all(&token, &min, &max, MAX_EVENTS)
    })
    .await
}

#[tauri::command(async)]
pub fn report_vault(
    state: State<'_, AppState>,
    from_day: String,
    to_day: String,
    from_ms: i64,
    to_ms: i64,
) -> Result<VaultPeriod> {
    check_period(from_ms, to_ms, now_ms())?;
    report::check_days(&from_day, &to_day)?;
    state.read(|d| report::period(&d.tasks, &d.notes, &from_day, &to_day, from_ms, to_ms))
}

#[cfg(test)]
mod tests {
    use super::*;

    const NOW: i64 = 1_790_000_000_000;

    #[test]
    fn this_month_up_to_the_next_midnight_is_accepted() {
        assert!(check_period(NOW - 30 * DAY_MS, NOW + DAY_MS, NOW).is_ok());
    }

    #[test]
    fn empty_reversed_too_long_too_old_or_future_periods_are_refused() {
        for (from, to) in [
            (NOW, NOW),
            (NOW, NOW - DAY_MS),
            (NOW - 40 * DAY_MS, NOW - 30 * DAY_MS),
            (NOW - 31 * DAY_MS, NOW + DAY_MS + DAY_MS),
            (NOW, NOW + 3 * DAY_MS),
        ] {
            assert!(check_period(from, to, NOW).is_err(), "{from}..{to}");
        }
    }
}
