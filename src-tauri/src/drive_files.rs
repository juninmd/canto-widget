//! Google Drive files: recent, starred, shared or owned, by kind and name, plus the storage quota. Metadata only.
use serde::{Deserialize, Serialize};

use crate::error::{AppError, Result};
use crate::google_api::{client, send};

const API: &str = "https://www.googleapis.com/drive/v3/files";
const ABOUT: &str = "https://www.googleapis.com/drive/v3/about";
const FIELDS: &str = "files(id,name,mimeType,webViewLink,modifiedTime,starred,parents,size,\
lastModifyingUser/displayName,lastModifyingUser/me)";
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
    /// The folder it lives in, on drive.google.com; empty when Drive doesn't say.
    pub folder: String,
    /// Bytes; 0 for Google's own documents, which don't count against the quota.
    pub size: u64,
}

/// Bytes used and the plan's limit; `limit` is 0 when the storage is unlimited.
#[derive(Debug, Clone, Default, Serialize, PartialEq)]
pub struct DriveQuota {
    pub used: u64,
    pub limit: u64,
}

#[derive(Deserialize)]
struct About {
    #[serde(rename = "storageQuota", default)]
    storage_quota: RawQuota,
}

#[derive(Deserialize, Default)]
struct RawQuota {
    #[serde(default)]
    limit: String,
    #[serde(default)]
    usage: String,
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
    #[serde(default)]
    parents: Vec<String>,
    /// Drive sends int64 as a string.
    #[serde(default)]
    size: String,
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
        let folder = self
            .parents
            .first()
            .filter(|p| crate::google_api::valid_id(p))
            .map(|p| format!("https://drive.google.com/drive/folders/{p}"))
            .unwrap_or_default();
        DriveFile {
            kind: kind_of(&self.mime_type).into(),
            folder,
            size: self.size.parse().unwrap_or(0),
            link: safe_link(&self.web_view_link),
            id: self.id,
            name: self.name,
            modified: self.modified_time,
            starred: self.starred,
            editor,
        }
    }
}

fn invalid() -> AppError {
    AppError::Config(crate::lang::tr("filtro inválido", "invalid filter").into())
}

/// The Drive `q` expression and its order for a filter (`recent`, `starred`, `shared`, `mine`), a kind (empty for
/// any) and a name search.
pub fn query(filter: &str, kind: &str, search: &str) -> Result<(String, &'static str)> {
    let (extra, order) = match filter {
        "recent" => ("", "recency desc"),
        "starred" => (" and starred = true", "recency desc"),
        "shared" => (" and sharedWithMe = true", "sharedWithMeTime desc"),
        "mine" => (" and 'me' in owners", "recency desc"),
        _ => return Err(invalid()),
    };
    let mime = match kind {
        "" => "",
        "doc" => " and mimeType = 'application/vnd.google-apps.document'",
        "sheet" => " and mimeType = 'application/vnd.google-apps.spreadsheet'",
        "slide" => " and mimeType = 'application/vnd.google-apps.presentation'",
        "pdf" => " and mimeType = 'application/pdf'",
        _ => return Err(invalid()),
    };
    let mut q = format!("trashed = false and mimeType != 'application/vnd.google-apps.folder'{extra}{mime}");
    let search: String = search.trim().chars().take(SEARCH_MAX).collect();
    if !search.is_empty() {
        q.push_str(&format!(" and name contains '{}'", search.replace('\\', "\\\\").replace('\'', "\\'")));
    }
    Ok((q, order))
}

pub fn list(token: &str, filter: &str, kind: &str, search: &str) -> Result<Vec<DriveFile>> {
    let (q, order) = query(filter, kind, search)?;
    let params = [("q", q.as_str()), ("orderBy", order), ("pageSize", "30"), ("fields", FIELDS)];
    let list: FileList = send("drive", client()?.get(API).bearer_auth(token).query(&params))?;
    Ok(list.files.into_iter().map(RawFile::into_file).collect())
}

fn into_quota(raw: RawQuota) -> DriveQuota {
    DriveQuota { used: raw.usage.parse().unwrap_or(0), limit: raw.limit.parse().unwrap_or(0) }
}

pub fn quota(token: &str) -> Result<DriveQuota> {
    let about: About = send("drive", client()?.get(ABOUT).bearer_auth(token).query(&[("fields", "storageQuota")]))?;
    Ok(into_quota(about.storage_quota))
}

#[cfg(test)]
#[path = "drive_files_tests.rs"]
mod tests;
