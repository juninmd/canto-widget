//! Gmail, Google Tasks, Drive and Contacts commands. They reuse the Agenda's Google login; tokens never leave Rust.
use tauri::{AppHandle, Manager};

use crate::blocking::run;
use crate::contacts::{self, ContactsView};
use crate::drive_files::{self, DrivePage, DriveQuota};
use crate::error::{AppError, Result};
use crate::gmail::{self, GmailSummary};
use crate::gmail_actions;
use crate::gtasks::{self, GTask};
use crate::vault::AppState;

fn token(app: &AppHandle) -> Result<String> {
    crate::google_token::fresh(&app.state::<AppState>())
}

#[tauri::command]
pub async fn gmail_summary(app: AppHandle, view: String, search: String) -> Result<GmailSummary> {
    run(move || {
        gmail_actions::view_query(&view, &search)?;
        gmail::list(&token(&app)?, &view, &search)
    })
    .await
}

#[tauri::command]
pub async fn gmail_modify(app: AppHandle, ids: Vec<String>, action: String) -> Result<()> {
    run(move || {
        gmail_actions::check_batch(&ids, &action)?;
        gmail_actions::modify(&token(&app)?, &ids, &action)
    })
    .await
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
pub async fn gdrive_list(
    app: AppHandle,
    filter: String,
    kind: String,
    search: String,
    folder: String,
    page: String,
) -> Result<DrivePage> {
    run(move || {
        if !drive_files::valid_page(&page) {
            return Err(AppError::Config(crate::lang::tr("página inválida", "invalid page").into()));
        }
        drive_files::query(&filter, &kind, &search, &folder)?;
        drive_files::list(&token(&app)?, &filter, &kind, &search, &folder, &page)
    })
    .await
}

#[tauri::command]
pub async fn gdrive_quota(app: AppHandle) -> Result<DriveQuota> {
    run(move || drive_files::quota(&token(&app)?)).await
}

#[tauri::command]
pub async fn contacts_list(app: AppHandle) -> Result<ContactsView> {
    run(move || contacts::list(&token(&app)?)).await
}
