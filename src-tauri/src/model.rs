use serde::{Deserialize, Serialize};
use std::collections::HashMap;

pub fn now_ms() -> i64 {
    (time::OffsetDateTime::now_utc().unix_timestamp_nanos() / 1_000_000) as i64
}

pub trait Versioned {
    fn id(&self) -> &str;
    fn updated_at(&self) -> i64;
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Task {
    pub id: String,
    pub title: String,
    pub done: bool,
    /// Dia ao qual a tarefa pertence, no formato YYYY-MM-DD (hora local).
    pub day: String,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Note {
    pub id: String,
    pub title: String,
    pub body: String,
    #[serde(default)]
    pub tags: Vec<String>,
    pub created_at: i64,
    pub updated_at: i64,
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
    /// Lapides: id -> instante da remocao. Sem elas, um item apagado localmente
    /// volta a existir no proximo sync vindo de outra maquina.
    #[serde(default)]
    pub deleted: HashMap<String, i64>,
}

impl VaultData {
    pub fn tombstone(&mut self, id: &str, at: i64) {
        self.tasks.retain(|t| t.id != id);
        self.notes.retain(|n| n.id != id);
        self.deleted.insert(id.to_string(), at);
    }

    /// Merge last-write-wins por item; remocao vence se for mais recente que a edicao.
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
