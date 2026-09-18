use serde::{Deserialize, Serialize};
use std::collections::HashMap;

pub fn now_ms() -> i64 {
    (time::OffsetDateTime::now_utc().unix_timestamp_nanos() / 1_000_000) as i64
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

fn merge_list<T: Versioned + Clone>(
    mine: Vec<T>,
    theirs: Vec<T>,
    deleted: &HashMap<String, i64>,
) -> Vec<T> {
    let mut by_id: HashMap<String, T> = HashMap::new();
    for item in mine.into_iter().chain(theirs) {
        match by_id.get(item.id()) {
            Some(cur) if cur.updated_at() >= item.updated_at() => {}
            _ => {
                by_id.insert(item.id().to_string(), item);
            }
        }
    }
    let mut out: Vec<T> = by_id
        .into_values()
        .filter(|i| deleted.get(i.id()).is_none_or(|at| *at < i.updated_at()))
        .collect();
    out.sort_by_key(|i| i.updated_at());
    out
}
