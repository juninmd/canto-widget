//! What spans both forges: the PRs/MRs the user opened today, for the day summary.
use serde::Serialize;
use tauri::Manager;

use crate::blocking::run;
use crate::error::{AppError, Result};
use crate::forge::{ForgeItem, ForgeList};
use crate::model::now_ms;
use crate::vault::AppState;

const DAY_MS: i64 = 86_400_000;

#[derive(Debug, Default, Serialize)]
pub struct Opened {
    pub items: Vec<ForgeItem>,
    /// One line per forge that failed; the other forge's items still come.
    pub errors: Vec<String>,
}

/// `since_ms` is local midnight from the UI; anything outside the last two days is refused rather than searched.
#[tauri::command]
pub async fn forges_opened_since(app: tauri::AppHandle, since_ms: i64) -> Result<Opened> {
    let now = now_ms();
    if !(now - 2 * DAY_MS..=now + 60_000).contains(&since_ms) {
        return Err(AppError::Config("inicio do dia fora do intervalo".into()));
    }
    let since = rfc3339(since_ms)?;
    run(move || {
        let state = app.state::<AppState>();
        if !state.is_unlocked() {
            return Err(AppError::Locked);
        }
        let results = [crate::cmd_github_lists::opened_since(&app, &since), crate::cmd_gitlab::opened_since(&state, &since)];
        Ok(combine(results.into_iter().flatten()))
    })
    .await
}

/// Sum of "revisão pedida a mim" across every connected forge; a forge that fails or isn't
/// connected just doesn't add to the total (used by the tray badge, not shown to the user directly).
pub(crate) fn review_requested_total(app: &tauri::AppHandle) -> u64 {
    let state = app.state::<AppState>();
    [crate::cmd_github_lists::review_requested(app), crate::cmd_gitlab::review_requested(&state)]
        .into_iter()
        .flatten()
        .filter_map(Result::ok)
        .sum()
}

fn combine(results: impl Iterator<Item = Result<ForgeList>>) -> Opened {
    let mut out = Opened::default();
    for r in results {
        match r {
            Ok(list) => out.items.extend(list.items),
            Err(e) => out.errors.push(e.to_string()),
        }
    }
    out.items.sort_by(|a, b| a.created_at.cmp(&b.created_at));
    out
}

/// Built from numbers, never from user text: it goes straight into a search query.
fn rfc3339(ms: i64) -> Result<String> {
    let t = time::OffsetDateTime::from_unix_timestamp(ms.div_euclid(1000)).map_err(|e| AppError::Config(e.to_string()))?;
    Ok(format!(
        "{:04}-{:02}-{:02}T{:02}:{:02}:{:02}+00:00",
        t.year(),
        u8::from(t.month()),
        t.day(),
        t.hour(),
        t.minute(),
        t.second()
    ))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::forge::item;

    #[test]
    fn local_midnight_becomes_a_utc_timestamp_both_apis_accept() {
        // 2026-09-18 00:00 in São Paulo (UTC-3).
        assert_eq!(rfc3339(1_789_700_400_000).unwrap(), "2026-09-18T03:00:00+00:00");
    }

    #[test]
    fn one_forge_failing_keeps_the_other_ones_items_in_opening_order() {
        let gh = ForgeList { items: vec![item(2, "2026-09-18T15:00:00Z", "", 0)], ..Default::default() };
        let gl = ForgeList { items: vec![item(1, "2026-09-18T12:00:00Z", "", 0)], ..Default::default() };
        let out = combine([Ok(gh), Err(AppError::Gitlab("sem resposta".into())), Ok(gl)].into_iter());
        assert_eq!(out.items.iter().map(|i| i.number).collect::<Vec<_>>(), vec![1, 2]);
        assert_eq!(out.errors, vec!["gitlab: sem resposta"]);
    }
}
