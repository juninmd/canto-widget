use std::collections::VecDeque;
use std::sync::Mutex;
use tauri::State;

use crate::clipboard::{ClipHistory, ClipItem};
use crate::commands::new_id;
use crate::error::{AppError, Result};
use crate::model::{next_version, now_ms, Note, Task, VaultData};
use crate::vault::AppState;

/// A few removals are enough to undo from the toast; the cap stops the trash growing forever.
const CAPACITY: usize = 20;

#[derive(Clone)]
pub enum Removed {
    Task(Task),
    Note(Note),
    Clips(Vec<ClipItem>),
}

/// RAM only; the webview only knows the key, so undo never accepts content from it, no payload to forge.
#[derive(Default)]
pub struct Trash(Mutex<VecDeque<(String, Removed)>>);

impl Trash {
    pub fn store(&self, item: Removed) -> String {
        let key = new_id();
        self.put(key.clone(), item);
        key
    }
    fn put(&self, key: String, item: Removed) {
        let mut queue = self.0.lock().unwrap();
        if queue.len() == CAPACITY {
            queue.pop_front();
        }
        queue.push_back((key, item));
    }

    pub fn take(&self, key: &str) -> Option<Removed> {
        let mut queue = self.0.lock().unwrap();
        let pos = queue.iter().position(|(c, _)| c == key)?;
        queue.remove(pos).map(|(_, item)| item)
    }

    /// Called on lock: plaintext content doesn't survive a closed vault.
    pub fn clear(&self) {
        self.0.lock().unwrap().clear();
    }
}

impl AppState {
    /// Stores while holding the session lock, else the auto-lock watchdog could lock mid-store and leave plaintext in RAM.
    pub fn store_in_trash(&self, item: Removed) -> Option<String> {
        let session = self.session.lock().unwrap();
        session.as_ref()?;
        Some(self.trash.store(item))
    }
    /// Same guard as `store_in_trash`; keeps the key the webview already holds.
    fn return_to_trash(&self, key: &str, item: Removed) {
        let session = self.session.lock().unwrap();
        if session.is_some() {
            self.trash.put(key.to_string(), item);
        }
    }
}

impl VaultData {
    pub fn remove(&mut self, id: &str, at: i64) -> Option<Removed> {
        let found = self
            .tasks
            .iter()
            .find(|t| t.id == id)
            .cloned()
            .map(Removed::Task)
            .or_else(|| self.notes.iter().find(|n| n.id == id).cloned().map(Removed::Note));
        self.tombstone(id, at);
        found
    }

    /// Fresh timestamp: an old backup with the tombstone won't delete the item again on merge.
    pub fn restore(&mut self, item: Removed, at: i64) {
        match item {
            Removed::Task(mut t) => {
                // Past the tombstone too: another machine may already hold it.
                let dead = self.deleted.remove(&t.id).unwrap_or(0);
                t.updated_at = next_version(t.updated_at.max(dead), at);
                self.tasks.retain(|x| x.id != t.id);
                self.tasks.push(t);
            }
            Removed::Note(mut n) => {
                let dead = self.deleted.remove(&n.id).unwrap_or(0);
                n.updated_at = next_version(n.updated_at.max(dead), at);
                self.notes.retain(|x| x.id != n.id);
                self.notes.push(n);
            }
            Removed::Clips(_) => {}
        }
    }
}

impl ClipHistory {
    /// Returns items to their chronological position, without duplicating what was re-copied.
    pub fn restore(&mut self, items: Vec<ClipItem>) {
        for item in items {
            if !self.items.iter().any(|i| i.id == item.id || i.text == item.text) {
                self.items.push(item);
            }
        }
        self.items.sort_by_key(|i| std::cmp::Reverse(i.copied_at));
        self.prune();
    }
}

/// Undoes a recent removal. `false` when the key was already used or the vault locked meanwhile.
#[tauri::command(async)]
pub fn trash_undo(state: State<'_, AppState>, key: String) -> Result<bool> {
    undo(&state, &key)
}

pub fn undo(state: &AppState, key: &str) -> Result<bool> {
    // Locked: the trash has already been (or will be) cleared; answer "can't anymore" instead of a generic error.
    if !state.is_unlocked() {
        return Ok(false);
    }
    let Some(item) = state.trash.take(key) else {
        return Ok(false);
    };
    match restore(state, item.clone()) {
        Ok(()) => Ok(true),
        Err(AppError::Locked) => Ok(false),
        Err(e) => {
            // Restoring is idempotent, so the toast's retry can run again without duplicating anything.
            state.return_to_trash(key, item);
            Err(e)
        }
    }
}

fn restore(state: &AppState, item: Removed) -> Result<()> {
    match item {
        Removed::Clips(items) => {
            let mut hist = state.clip_load()?;
            hist.restore(items);
            state.clip_save(&hist)
        }
        vault => state.mutate(|d| d.restore(vault, now_ms())),
    }
}
