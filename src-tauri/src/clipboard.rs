use serde::{Deserialize, Serialize};

use crate::error::Result;
use crate::model::now_ms;
use crate::store::{self, SealedBlob};
use crate::vault::AppState;

pub const CLIP_AAD: &[u8] = b"canto.clip.v1";
const MAX_ITEMS: usize = 100;
pub const MAX_CHARS: usize = 32_000;
// Unpinned total kept on disk: every copy re-seals the whole history, so it must stay small.
const BUDGET_CHARS: usize = 1_000_000;
pub const PREVIEW_CHARS: usize = 500;
pub const DEFAULT_MAX_PINNED: usize = 100;
pub const MAX_PINNED_CEILING: usize = 1000;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClipHistory {
    #[serde(default)]
    pub items: Vec<ClipItem>,
    /// Unlike `MAX_ITEMS`, pinned items had no cap at all before this: a runaway pin loop could
    /// grow the vault forever. `prune()` never evicts a pinned item; only `clip_pin` enforces it.
    #[serde(default = "default_max_pinned")]
    pub max_pinned: usize,
}

fn default_max_pinned() -> usize {
    DEFAULT_MAX_PINNED
}

impl Default for ClipHistory {
    fn default() -> Self {
        Self { items: Vec::new(), max_pinned: default_max_pinned() }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClipItem {
    pub id: String,
    pub text: String,
    pub copied_at: i64,
    #[serde(default)]
    pub pinned: bool,
    // Size of what was really copied; 0 in items saved before the cap existed.
    #[serde(default)]
    pub chars: usize,
}

#[derive(Debug, Serialize)]
pub struct ClipView {
    pub id: String,
    pub preview: String,
    pub chars: usize,
    pub kept: usize,
    pub truncated: bool,
    pub copied_at: i64,
    pub pinned: bool,
}

impl From<&ClipItem> for ClipView {
    fn from(i: &ClipItem) -> Self {
        let stored = i.text.chars().count();
        ClipView {
            id: i.id.clone(),
            preview: i.text.chars().take(PREVIEW_CHARS).collect(),
            chars: i.chars.max(stored),
            kept: stored,
            truncated: i.chars > stored,
            copied_at: i.copied_at,
            pinned: i.pinned,
        }
    }
}

impl ClipHistory {
    pub fn pinned_count(&self) -> usize {
        self.items.iter().filter(|i| i.pinned).count()
    }

    /// Toggles pin, refusing to add a new one past `max_pinned`. Unpinning always succeeds.
    pub fn toggle_pin(&mut self, id: &str) -> Result<()> {
        let (pinned_now, max) = (self.pinned_count(), self.max_pinned);
        let Some(item) = self.items.iter_mut().find(|i| i.id == id) else {
            return Ok(());
        };
        if !item.pinned && pinned_now >= max {
            return Err(crate::error::AppError::Config(format!("limite de {max} itens fixados atingido")));
        }
        item.pinned = !item.pinned;
        Ok(())
    }

    pub fn push(&mut self, text: &str, id: String) -> bool {
        let text = text.trim();
        if text.is_empty() {
            return false;
        }
        let chars = text.chars().count();
        let text: String = text.chars().take(MAX_CHARS).collect();
        if self.items.first().is_some_and(|i| i.text == text && i.chars.max(chars) == chars) {
            return false;
        }
        let pinned = self.items.iter().any(|i| i.text == text && i.pinned);
        self.items.retain(|i| i.text != text);
        self.items.insert(0, ClipItem { id, text, copied_at: now_ms(), pinned, chars });
        self.prune();
        true
    }

    pub(crate) fn prune(&mut self) {
        let (mut kept, mut used) = (0, 0);
        let mut first = true;
        self.items.retain(|i| {
            if i.pinned {
                return true;
            }
            kept += 1;
            used += i.text.chars().count();
            let keep = first || (kept <= MAX_ITEMS && used <= BUDGET_CHARS);
            first = false;
            keep
        });
    }
}

impl AppState {
    pub fn clip_load(&self) -> Result<ClipHistory> {
        let guard = self.session.lock().unwrap();
        let Some(session) = guard.as_ref() else {
            return Ok(ClipHistory::default());
        };
        match store::read_json::<SealedBlob>(&store::clip_path(&self.dir))? {
            None => Ok(ClipHistory::default()),
            Some(blob) => match blob.open(session.key(), CLIP_AAD) {
                Ok(plain) => Ok(serde_json::from_slice(&plain)?),
                // History is disposable: an unreadable envelope must not lock up the widget.
                Err(_) => Ok(ClipHistory::default()),
            },
        }
    }

    pub fn clip_save(&self, hist: &ClipHistory) -> Result<()> {
        let guard = self.session.lock().unwrap();
        let Some(session) = guard.as_ref() else {
            return Ok(());
        };
        let plain = serde_json::to_vec(hist)?;
        let blob = SealedBlob::seal(session.key(), session.salt(), &plain, CLIP_AAD, now_ms())?;
        store::write_json_atomic(&store::clip_path(&self.dir), &blob)
    }
}

#[cfg(test)]
#[path = "clipboard_tests.rs"]
mod tests;
