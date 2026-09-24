use tauri::State;

use crate::error::{AppError, Result};
use crate::model::{next_version, now_ms, ExtendedRepeat, Repeat, Task, VaultData};
use crate::vault::AppState;

/// Valid "YYYY-MM-DD", or `None`. The day comes from the webview: don't trust the format.
fn civil(day: &str) -> Option<(i64, u32, u32)> {
    let b = day.as_bytes();
    if b.len() != 10 || b[4] != b'-' || b[7] != b'-' {
        return None;
    }
    let num = |r: std::ops::Range<usize>| day.get(r)?.parse::<u32>().ok();
    let (y, m, d) = (num(0..4)?, num(5..7)?, num(8..10)?);
    ((1..=12).contains(&m) && (1..=31).contains(&d)).then_some((y as i64, m, d))
}

/// 0 = Sunday ... 6 = Saturday (Howard Hinnant's days_from_civil algorithm).
pub fn weekday_of(day: &str) -> Option<u8> {
    let (y, m, d) = civil(day)?;
    let y = if m <= 2 { y - 1 } else { y };
    let era = y.div_euclid(400);
    let yoe = y - era * 400;
    let mp = (m as i64 + 9) % 12;
    let doy = (153 * mp + 2) / 5 + d as i64 - 1;
    let doe = yoe * 365 + yoe / 4 - yoe / 100 + doy;
    let days = era * 146_097 + doe - 719_468;
    Some((days + 4).rem_euclid(7) as u8)
}

impl Repeat {
    pub fn applies_on(&self, day: &str) -> bool {
        match (self, weekday_of(day)) {
            (_, None) => false,
            (Repeat::Daily, _) => true,
            (Repeat::Weekdays, Some(s)) => (1..=5).contains(&s),
            (Repeat::Weekly { weekday: target }, Some(s)) => *target == s,
        }
    }
}

impl ExtendedRepeat {
    pub fn applies_on(&self, day: &str) -> bool {
        match self {
            ExtendedRepeat::Monthly { day: target } => civil(day).is_some_and(|(_, _, d)| d == *target as u32),
            ExtendedRepeat::SpecificDays { days } => weekday_of(day).is_some_and(|s| days.contains(&s)),
        }
    }
}

pub fn instance_id(series: &str, day: &str) -> String {
    format!("{series}-{day}")
}

/// Deterministic id so two machines produce the same item, the merge doesn't duplicate, and a deleted instance's tombstone prevents it coming back.
pub fn materialize(d: &mut VaultData, day: &str, now: i64) -> usize {
    if civil(day).is_none() {
        return 0;
    }
    let mut latest: std::collections::HashMap<&str, &Task> = Default::default();
    let mut has_today = std::collections::HashSet::new();
    for t in &d.tasks {
        let Some(series) = t.series.as_deref() else { continue };
        if t.day.as_str() == day {
            has_today.insert(series);
        } else if t.day.as_str() < day && latest.get(series).is_none_or(|u| u.day < t.day) {
            latest.insert(series, t);
        }
    }
    let new_tasks: Vec<Task> = latest
        .into_iter()
        .filter(|(series, _)| !has_today.contains(series))
        .filter(|(_, t)| {
            t.repeat.is_some_and(|r| r.applies_on(day)) || t.extended_repeat.as_ref().is_some_and(|r| r.applies_on(day))
        })
        .map(|(series, t)| Task {
            id: instance_id(series, day),
            day: day.to_string(),
            done: false,
            created_at: now,
            updated_at: now,
            ..t.clone()
        })
        .filter(|t| !d.deleted.contains_key(&t.id))
        .collect();
    let n = new_tasks.len();
    d.tasks.extend(new_tasks);
    n
}

/// "HH:MM" 24h. Anything else is rejected before reaching the vault.
pub fn validate_time(time: &str) -> Result<String> {
    let b = time.as_bytes();
    let ok = b.len() == 5
        && b[2] == b':'
        && [0, 1, 3, 4].iter().all(|&i| b[i].is_ascii_digit())
        && matches!((time[..2].parse::<u8>(), time[3..].parse::<u8>()), (Ok(h), Ok(m)) if h < 24 && m < 60);
    if !ok {
        return Err(AppError::Config("horário inválido, use HH:MM".into()));
    }
    Ok(time.to_string())
}

pub fn set_schedule(t: &mut Task, time: Option<String>, repeat: Option<Repeat>, now: i64) -> Result<()> {
    if let Some(Repeat::Weekly { weekday }) = repeat {
        if weekday > 6 {
            return Err(AppError::Config("dia da semana inválido".into()));
        }
    }
    t.reminder_time = time.filter(|h| !h.is_empty()).map(|h| validate_time(&h)).transpose()?;
    t.repeat = repeat;
    // The two recurrence kinds are mutually exclusive: picking one clears the other.
    if repeat.is_some() {
        t.extended_repeat = None;
    }
    if repeat.is_some() && t.series.is_none() {
        t.series = Some(t.id.clone());
    }
    t.updated_at = next_version(t.updated_at, now);
    Ok(())
}

fn validate_extended(repeat: &ExtendedRepeat) -> Result<()> {
    match repeat {
        ExtendedRepeat::Monthly { day } if !(1..=31).contains(day) => {
            Err(AppError::Config("dia do mês inválido".into()))
        }
        ExtendedRepeat::SpecificDays { days } if days.is_empty() || days.iter().any(|d| *d > 6) => {
            Err(AppError::Config("dias da semana inválidos".into()))
        }
        _ => Ok(()),
    }
}

pub fn set_extended_repeat(t: &mut Task, repeat: Option<ExtendedRepeat>, now: i64) -> Result<()> {
    if let Some(r) = &repeat {
        validate_extended(r)?;
    }
    t.extended_repeat = repeat;
    if t.extended_repeat.is_some() {
        t.repeat = None;
        if t.series.is_none() {
            t.series = Some(t.id.clone());
        }
    }
    t.updated_at = next_version(t.updated_at, now);
    Ok(())
}

#[tauri::command(async)]
pub fn task_set_extended_repeat(state: State<'_, AppState>, id: String, repeat: Option<ExtendedRepeat>) -> Result<()> {
    state.mutate(|d| match d.tasks.iter_mut().find(|t| t.id == id) {
        Some(t) => set_extended_repeat(t, repeat, now_ms()),
        None => Err(AppError::NotFound),
    })?
}

#[tauri::command(async)]
pub fn task_set_schedule(
    state: State<'_, AppState>,
    id: String,
    time: Option<String>,
    repeat: Option<Repeat>,
) -> Result<()> {
    state.mutate(|d| match d.tasks.iter_mut().find(|t| t.id == id) {
        Some(t) => set_schedule(t, time, repeat, now_ms()),
        None => Err(AppError::NotFound),
    })?
}

/// Open tasks with a time on `day`, materializing the day's recurring instances first.
pub fn reminders_for(state: &AppState, day: &str) -> Result<Vec<Task>> {
    state.in_background(|d| {
        let created = materialize(d, day, now_ms());
        let list = d.tasks.iter().filter(|t| t.day == day && !t.done && t.reminder_time.is_some()).cloned().collect();
        (list, created > 0)
    })
}
