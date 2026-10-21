//! Gmail, Google Tasks, Drive and Contacts commands. They reuse the Agenda's Google login; tokens never leave Rust.
use tauri::{AppHandle, Manager};

use crate::blocking::run;
use crate::contacts::{self, ContactsView};
use crate::drive_files::{self, DriveFile};
use crate::error::Result;
use crate::gmail::{self, GmailSummary};
use crate::gtasks::{self, GTask};
use crate::vault::AppState;

fn token(app: &AppHandle) -> Result<String> {
    crate::google_token::fresh(&app.state::<AppState>())
}

#[tauri::command]
pub async fn gmail_summary(app: AppHandle) -> Result<GmailSummary> {
    run(move || gmail::summary(&token(&app)?)).await
}

#[tauri::command]
pub async fn gmail_mark_read(app: AppHandle, id: String) -> Result<()> {
    run(move || gmail::mark_read(&token(&app)?, &id)).await
}

#[tauri::command]
pub async fn gtasks_list(app: AppHandle) -> Result<Vec<GTask>> {
    run(move || gtasks::list(&token(&app)?)).await
}

#[tauri::command]
pub async fn gtasks_add(app: AppHandle, title: String) -> Result<GTask> {
    run(move || {
        gtasks::clean_title(&title)?;
        gtasks::add(&token(&app)?, &title)
    })
    .await
}

#[tauri::command]
pub async fn gtasks_complete(app: AppHandle, id: String) -> Result<()> {
    run(move || {
        crate::google_api::check_id(&id)?;
        gtasks::complete(&token(&app)?, &id)
    })
    .await
}

#[tauri::command]
pub async fn gdrive_list(app: AppHandle, filter: String, search: String) -> Result<Vec<DriveFile>> {
    run(move || {
        drive_files::query(&filter, &search)?;
        drive_files::list(&token(&app)?, &filter, &search)
    })
    .await
}

#[tauri::command]
pub async fn contacts_list(app: AppHandle) -> Result<ContactsView> {
    run(move || contacts::list(&token(&app)?)).await
}
