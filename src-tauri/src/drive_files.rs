//! Google Drive files: recent, starred or shared with the user, optionally by name. Metadata only.
use serde::{Deserialize, Serialize};

use crate::error::{AppError, Result};
use crate::google_api::{client, send};

const API: &str = "https://www.googleapis.com/drive/v3/files";
const FIELDS: &str =
    "files(id,name,mimeType,webViewLink,modifiedTime,starred,lastModifyingUser/displayName,lastModifyingUser/me)";
const SEARCH_MAX: usize = 100;

#[derive(Debug, Clone, Default, Serialize, PartialEq)]
pub struct DriveFile {
    pub id: String,
    pub name: String,
    /// `doc`, `sheet`, `slide`, `pdf` or `other`: enough for the badge.
    pub kind: String,
    pub link: String,
    pub modified: String,
    pub starred: bool,
    /// Who changed it last; empty when it was the user.
    pub editor: String,
}

#[derive(Deserialize)]
struct FileList {
    #[serde(default)]
    files: Vec<RawFile>,
}

#[derive(Deserialize)]
pub(crate) struct RawFile {
    id: String,
    #[serde(default)]
    name: String,
    #[serde(rename = "mimeType", default)]
    mime_type: String,
    #[serde(rename = "webViewLink", default)]
    web_view_link: String,
    #[serde(rename = "modifiedTime", default)]
    modified_time: String,
    #[serde(default)]
    starred: bool,
    #[serde(rename = "lastModifyingUser", default)]
    last_modifying_user: Option<User>,
}

#[derive(Deserialize)]
struct User {
    #[serde(rename = "displayName", default)]
    display_name: String,
    #[serde(default)]
    me: bool,
}

pub fn kind_of(mime: &str) -> &'static str {
    match mime {
        "application/vnd.google-apps.document" => "doc",
        "application/vnd.google-apps.spreadsheet" => "sheet",
        "application/vnd.google-apps.presentation" => "slide",
        "application/pdf" => "pdf",
        _ => "other",
    }
}

/// Only Google's own pages open from the UI.
fn safe_link(link: &str) -> String {
    let trusted = ["https://docs.google.com/", "https://drive.google.com/"];
    if trusted.iter().any(|prefix| link.starts_with(prefix)) {
        link.to_string()
    } else {
        String::new()
    }
}

impl RawFile {
    pub(crate) fn into_file(self) -> DriveFile {
        let editor = self.last_modifying_user.filter(|u| !u.me).map(|u| u.display_name).unwrap_or_default();
        DriveFile {
            kind: kind_of(&self.mime_type).into(),
            link: safe_link(&self.web_view_link),
            id: self.id,
            name: self.name,
            modified: self.modified_time,
            starred: self.starred,
            editor,
        }
    }
}

/// The Drive `q` expression and its order for a filter (`recent`, `starred`, `shared`) and a name search.
pub fn query(filter: &str, search: &str) -> Result<(String, &'static str)> {
    let (extra, order) = match filter {
        "recent" => ("", "recency desc"),
        "starred" => (" and starred = true", "recency desc"),
        "shared" => (" and sharedWithMe = true", "sharedWithMeTime desc"),
        _ => return Err(AppError::Config(crate::lang::tr("filtro inválido", "invalid filter").into())),
    };
    let mut q = format!("trashed = false and mimeType != 'application/vnd.google-apps.folder'{extra}");
    let search: String = search.trim().chars().take(SEARCH_MAX).collect();
    if !search.is_empty() {
        q.push_str(&format!(" and name contains '{}'", search.replace('\\', "\\\\").replace('\'', "\\'")));
    }
    Ok((q, order))
}

pub fn list(token: &str, filter: &str, search: &str) -> Result<Vec<DriveFile>> {
    let (q, order) = query(filter, search)?;
    let params = [("q", q.as_str()), ("orderBy", order), ("pageSize", "30"), ("fields", FIELDS)];
    let list: FileList = send("drive", client()?.get(API).bearer_auth(token).query(&params))?;
    Ok(list.files.into_iter().map(RawFile::into_file).collect())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn filters_become_drive_queries_and_a_search_cannot_break_out_of_its_quotes() {
        let (q, order) = query("shared", "").unwrap();
        assert!(q.ends_with("and sharedWithMe = true"), "{q}");
        assert_eq!(order, "sharedWithMeTime desc");
        let (q, _) = query("recent", " d'água \\ ").unwrap();
        assert!(q.ends_with(r"and name contains 'd\'água \\'"), "{q}");
        assert!(query("trashed", "").is_err());
    }

    #[test]
    fn a_file_keeps_its_kind_editor_and_only_a_google_link() {
        let raw: RawFile = serde_json::from_str(
            r#"{"id": "1", "name": "Roadmap Q4", "mimeType": "application/vnd.google-apps.document",
                "webViewLink": "https://docs.google.com/document/d/1/edit", "starred": true,
                "modifiedTime": "2026-10-20T14:20:00Z", "lastModifyingUser": {"displayName": "Rafael", "me": false}}"#,
        )
        .unwrap();
        let file = raw.into_file();
        assert_eq!((file.kind.as_str(), file.editor.as_str(), file.starred), ("doc", "Rafael", true));
        assert_eq!(file.link, "https://docs.google.com/document/d/1/edit");
        let mine: RawFile = serde_json::from_str(
            r#"{"id": "2", "mimeType": "image/png", "webViewLink": "javascript:alert(1)",
                "lastModifyingUser": {"displayName": "Eu", "me": true}}"#,
        )
        .unwrap();
        let file = mine.into_file();
        assert_eq!((file.kind.as_str(), file.editor.as_str(), file.link.as_str()), ("other", "", ""));
    }
}
