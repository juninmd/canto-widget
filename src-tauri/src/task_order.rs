use tauri::State;

use crate::error::Result;
use crate::model::{now_ms, Task};
use crate::vault::AppState;

/// `ids` is the day's tasks in their new order; unknown or other-day ids are ignored.
pub fn reorder(tasks: &mut [Task], day: &str, ids: &[String], now: i64) {
    for (position, id) in ids.iter().enumerate() {
        if let Some(t) = tasks.iter_mut().find(|t| &t.id == id && t.day == day) {
            t.order = Some(position as i64);
            t.updated_at = now;
        }
    }
}

#[tauri::command(async)]
pub fn tasks_reorder(state: State<'_, AppState>, day: String, ids: Vec<String>) -> Result<()> {
    state.mutate(|d| reorder(&mut d.tasks, &day, &ids, now_ms()))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn t(id: &str, day: &str) -> Task {
        Task { id: id.into(), day: day.into(), ..Default::default() }
    }

    #[test]
    fn reorder_sets_position_only_for_the_matching_day() {
        let mut tasks = vec![t("a", "2026-09-09"), t("b", "2026-09-09"), t("c", "2026-09-10")];
        reorder(&mut tasks, "2026-09-09", &["b".into(), "a".into()], 42);
        assert_eq!(tasks[0].order, Some(1)); // "a"
        assert_eq!(tasks[1].order, Some(0)); // "b"
        assert_eq!(tasks[2].order, None); // "c", a different day
        assert_eq!(tasks[0].updated_at, 42);
    }

    #[test]
    fn an_id_that_does_not_exist_is_ignored() {
        let mut tasks = vec![t("a", "2026-09-09")];
        reorder(&mut tasks, "2026-09-09", &["sumiu".into(), "a".into()], 1);
        assert_eq!(tasks[0].order, Some(1));
    }
}
