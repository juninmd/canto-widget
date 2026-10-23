//! Google Keep notes from a Google Takeout export: the Keep API only answers Workspace accounts through a service
//! account, so Takeout's one-JSON-per-note files are the way in for personal Google accounts.
use serde::Deserialize;

use crate::cmd_notes::{MAX_BODY_CHARS, MAX_TITLE_CHARS};
use crate::model::Note;

/// Every imported note carries this tag, so `#keep` finds them all.
pub const TAG: &str = "keep";
/// A Takeout note is a few KB; a bigger file is something else and isn't parsed.
pub const MAX_FILE_BYTES: u64 = 2 * 1024 * 1024;
pub const MAX_FILES: usize = 5_000;

#[derive(Deserialize, Default)]
#[serde(rename_all = "camelCase", default)]
struct KeepNote {
    title: String,
    text_content: String,
    list_content: Vec<KeepItem>,
    labels: Vec<KeepLabel>,
    annotations: Vec<KeepAnnotation>,
    is_trashed: bool,
    is_pinned: bool,
    is_archived: bool,
    created_timestamp_usec: i64,
    user_edited_timestamp_usec: i64,
}

#[derive(Deserialize, Default)]
#[serde(rename_all = "camelCase", default)]
struct KeepItem {
    text: String,
    is_checked: bool,
}

#[derive(Deserialize, Default)]
#[serde(default)]
struct KeepLabel {
    name: String,
}

#[derive(Deserialize, Default)]
#[serde(default)]
struct KeepAnnotation {
    url: String,
    title: String,
}

#[derive(Debug, PartialEq)]
pub enum Parsed {
    Note(Note),
    /// Trashed, empty or over the size caps: counted, not imported.
    Skipped,
    /// Not a Keep note at all (Takeout's .html twins, other services' JSON).
    Foreign,
}

/// The note as Canto stores it, minus the id: Keep's checklists become Markdown task items, labels become tags.
pub fn parse(json: &str, untitled: &str, archived_tag: &str) -> Parsed {
    let Ok(k) = serde_json::from_str::<KeepNote>(json) else {
        return Parsed::Foreign;
    };
    if k.created_timestamp_usec == 0 && k.user_edited_timestamp_usec == 0 {
        return Parsed::Foreign;
    }
    let body = body_of(&k);
    if k.is_trashed || (k.title.trim().is_empty() && body.trim().is_empty()) {
        return Parsed::Skipped;
    }
    let title = match k.title.trim() {
        "" => first_line(&body).unwrap_or(untitled).to_string(),
        t => t.to_string(),
    };
    let title: String = title.chars().take(MAX_TITLE_CHARS).collect();
    if body.chars().count() > MAX_BODY_CHARS {
        return Parsed::Skipped;
    }
    let mut tags = vec![TAG.to_string()];
    for l in &k.labels {
        let tag = l.name.trim().to_lowercase();
        if !tag.is_empty() && !tags.contains(&tag) {
            tags.push(tag);
        }
    }
    if k.is_archived {
        tags.push(archived_tag.to_string());
    }
    let created = k.created_timestamp_usec / 1000;
    let updated = (k.user_edited_timestamp_usec / 1000).max(created);
    Parsed::Note(Note {
        title,
        body,
        tags,
        created_at: if created > 0 { created } else { updated },
        updated_at: updated,
        pinned: k.is_pinned,
        ..Default::default()
    })
}

fn body_of(k: &KeepNote) -> String {
    let mut out = k.text_content.trim_end().to_string();
    if !k.list_content.is_empty() {
        let items: Vec<String> = k
            .list_content
            .iter()
            .filter(|i| !i.text.trim().is_empty())
            .map(|i| format!("- [{}] {}", if i.is_checked { "x" } else { " " }, i.text.trim()))
            .collect();
        push_block(&mut out, &items.join("\n"));
    }
    let links: Vec<String> = k
        .annotations
        .iter()
        .filter(|a| a.url.starts_with("http"))
        .map(|a| if a.title.trim().is_empty() { a.url.clone() } else { format!("[{}]({})", a.title.trim(), a.url) })
        .collect();
    if !links.is_empty() {
        push_block(&mut out, &links.join("\n"));
    }
    out
}

fn push_block(out: &mut String, block: &str) {
    if block.is_empty() {
        return;
    }
    if !out.is_empty() {
        out.push_str("\n\n");
    }
    out.push_str(block);
}

fn first_line(body: &str) -> Option<&str> {
    body.lines().map(|l| l.trim_start_matches("- [ ] ").trim_start_matches("- [x] ").trim()).find(|l| !l.is_empty())
}

/// Importing the same export twice must not double the notes: same creation time, title and body is the same note.
pub fn already_there(existing: &[Note], n: &Note) -> bool {
    existing.iter().any(|e| e.created_at == n.created_at && e.title == n.title && e.body == n.body)
}

#[cfg(test)]
#[path = "keep_import_tests.rs"]
mod tests;
