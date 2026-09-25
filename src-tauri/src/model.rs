use serde::{Deserialize, Serialize};
use std::collections::HashMap;

pub fn now_ms() -> i64 {
    (time::OffsetDateTime::now_utc().unix_timestamp_nanos() / 1_000_000) as i64
}

/// Stamp for an edit: never at or below the current one, so a stamp synced from a machine whose clock
/// runs ahead can't make a later local edit lose the merge.
pub fn next_version(prev: i64, now: i64) -> i64 {
    now.max(prev.saturating_add(1))
}

pub trait Versioned {
    fn id(&self) -> &str;
    fn updated_at(&self) -> i64;
}

/// Task repeat rule. `weekday` for `Weekly`: 0 = Sunday ... 6 = Saturday.
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(tag = "tipo", rename_all = "snake_case")]
pub enum Repeat {
    #[serde(rename = "diaria")]
    Daily,
    #[serde(rename = "dias_uteis")]
    Weekdays,
    #[serde(rename = "semanal")]
    Weekly {
        #[serde(rename = "dia")]
        weekday: u8,
    },
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, PartialEq)]
pub struct Task {
    pub id: String,
    pub title: String,
    pub done: bool,
    /// Day the task belongs to, "YYYY-MM-DD" local time.
    pub day: String,
    pub created_at: i64,
    pub updated_at: i64,
    /// Reminder time, "HH:MM" local. `default` so older vaults still deserialize.
    #[serde(default, rename = "hora")]
    pub reminder_time: Option<String>,
    #[serde(default, rename = "repetir")]
    pub repeat: Option<Repeat>,
    /// Id of the first task in the series; instances get id `<series>-<day>`.
    #[serde(default, rename = "serie")]
    pub series: Option<String>,
    /// Linked PR/MR, http(s) only. New field: no legacy vault has it, so plain default is enough.
    #[serde(default)]
    pub pr_url: Option<String>,
    #[serde(default)]
    pub subtasks: Vec<Subtask>,
    #[serde(default)]
    pub priority: Option<Priority>,
    /// Manual position within its day, from dragging to reorder. Falls back to `created_at` when unset.
    #[serde(default)]
    pub order: Option<i64>,
    /// Monthly or specific-weekdays recurrence. Kept separate from `repeat` (never a new variant on it):
    /// that field's tag is a frozen wire contract, and an unknown tag would fail deserializing the
    /// whole task list on an older install. An unrecognized *field* is just ignored instead.
    #[serde(default)]
    pub extended_repeat: Option<ExtendedRepeat>,
}

/// `day` for `Monthly`: 1-31, matched exactly (a 30-day month has no 31st, so it just doesn't fire that month).
/// `days` for `SpecificDays`: 0 = Sunday ... 6 = Saturday, same as `Repeat::Weekly`.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "tipo", rename_all = "snake_case")]
pub enum ExtendedRepeat {
    Monthly { day: u8 },
    SpecificDays { days: Vec<u8> },
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum Priority {
    Low,
    Medium,
    High,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, PartialEq)]
pub struct Subtask {
    pub id: String,
    pub title: String,
    pub done: bool,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, PartialEq)]
pub struct Note {
    pub id: String,
    pub title: String,
    pub body: String,
    #[serde(default)]
    pub tags: Vec<String>,
    pub created_at: i64,
    pub updated_at: i64,
    #[serde(default, rename = "fixada")]
    pub pinned: bool,
    /// Optional reference to a task or an agenda event; `label` is a title snapshot for display,
    /// since the linked item can be renamed or (for an event) never seen again by this vault.
    #[serde(default)]
    pub link: Option<NoteLink>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum NoteLink {
    Task { id: String, label: String },
    Event { id: String, label: String },
}

impl Versioned for Task {
    fn id(&self) -> &str {
        &self.id
    }
    fn updated_at(&self) -> i64 {
        self.updated_at
    }
}

impl Versioned for Note {
    fn id(&self) -> &str {
        &self.id
    }
    fn updated_at(&self) -> i64 {
        self.updated_at
    }
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, PartialEq)]
pub struct VaultData {
    #[serde(default)]
    pub tasks: Vec<Task>,
    #[serde(default)]
    pub notes: Vec<Note>,
    /// Tombstones (id -> deletion timestamp); without these, a locally deleted item would reappear on sync from another machine.
    #[serde(default)]
    pub deleted: HashMap<String, i64>,
}

impl VaultData {
    pub fn tombstone(&mut self, id: &str, at: i64) {
        // Past the item's own stamp, or a copy stamped by a clock that runs ahead revives it on the next merge.
        let tasks = self.tasks.iter().filter(|t| t.id == id).map(|t| t.updated_at);
        let at = tasks
            .chain(self.notes.iter().filter(|n| n.id == id).map(|n| n.updated_at))
            .fold(at, |at, prev| next_version(prev, at));
        self.tasks.retain(|t| t.id != id);
        self.notes.retain(|n| n.id != id);
        self.deleted.insert(id.to_string(), at);
    }

    /// Last-write-wins merge per item; a deletion wins if newer than the edit.
    pub fn merge(self, other: VaultData) -> VaultData {
        let mut deleted = self.deleted;
        for (id, at) in other.deleted {
            let entry = deleted.entry(id).or_insert(at);
            *entry = (*entry).max(at);
        }
        VaultData {
            tasks: merge_list(self.tasks, other.tasks, &deleted),
            notes: merge_list(self.notes, other.notes, &deleted),
            deleted,
        }
    }
}

fn merge_list<T: Versioned + Clone + Serialize>(
    mine: Vec<T>,
    theirs: Vec<T>,
    deleted: &HashMap<String, i64>,
) -> Vec<T> {
    let mut by_id: HashMap<String, T> = HashMap::new();
    for item in mine.into_iter().chain(theirs) {
        match by_id.get(item.id()) {
            Some(cur) if !newer(&item, cur) => {}
            _ => {
                by_id.insert(item.id().to_string(), item);
            }
        }
    }
    let mut out: Vec<T> =
        by_id.into_values().filter(|i| deleted.get(i.id()).is_none_or(|at| *at < i.updated_at())).collect();
    out.sort_by_key(|i| i.updated_at());
    out
}

/// On a tie the content decides, so both machines keep the same copy whichever side merges.
fn newer<T: Versioned + Serialize>(item: &T, cur: &T) -> bool {
    match item.updated_at().cmp(&cur.updated_at()) {
        std::cmp::Ordering::Equal => serde_json::to_string(item).ok() > serde_json::to_string(cur).ok(),
        o => o.is_gt(),
    }
}
