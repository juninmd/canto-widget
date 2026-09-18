//! Updates from signed GitHub releases. The webview gets these two commands, never the updater plugin itself.
use std::sync::{Arc, Mutex};

use serde::Serialize;
use tauri::{Emitter, Manager, State};
use tauri_plugin_updater::{Update, UpdaterExt};

use crate::error::{AppError, Result};
use crate::vault::AppState;

pub const PROGRESS_EVENT: &str = "canto://update-progress";

/// The update found by the last check, installed only if the user asks for it.
#[derive(Default)]
pub struct PendingUpdate(Mutex<Option<Update>>);

#[derive(Serialize, Debug, PartialEq)]
pub struct UpdateInfo {
    pub current: String,
    /// Newest published version, even when it is not newer than the running one.
    pub latest: String,
    pub available: bool,
    pub notes: String,
    pub date: Option<String>,
}

#[derive(Serialize, Clone)]
struct Progress {
    downloaded: u64,
    total: Option<u64>,
}

pub fn summarize(current: &str, published: Option<String>, found: Option<(&str, Option<String>)>) -> UpdateInfo {
    let available = found.is_some();
    let (notes, date) = found.map_or((String::new(), None), |(notes, date)| (notes.trim().to_string(), date));
    UpdateInfo {
        current: current.to_string(),
        latest: published.unwrap_or_else(|| current.to_string()),
        available,
        notes,
        date,
    }
}

fn failed(e: tauri_plugin_updater::Error) -> AppError {
    use tauri_plugin_updater::Error as E;
    AppError::Update(match e {
        E::Minisign(_) | E::Base64(_) | E::SignatureUtf8(_) => {
            "o instalador baixado não confere com a assinatura do projeto e foi descartado".into()
        }
        E::ReleaseNotFound => "nenhuma versão publicada foi encontrada".into(),
        E::Reqwest(_) | E::Network(_) => "sem conexão com o servidor de atualizações".into(),
        other => other.to_string(),
    })
}

#[tauri::command]
pub async fn update_check(app: tauri::AppHandle, pending: State<'_, PendingUpdate>) -> Result<UpdateInfo> {
    let current = app.package_info().version.to_string();
    let published: Arc<Mutex<Option<String>>> = Arc::default();
    let seen = published.clone();
    let vault = app.clone();
    let update = app
        .updater_builder()
        .version_comparator(move |running, remote| {
            *seen.lock().unwrap() = Some(remote.version.to_string());
            remote.version > running
        })
        // Windows closes the app to run the installer: keys leave memory first.
        .on_before_exit(move || vault.state::<AppState>().lock())
        .build()
        .map_err(failed)?
        .check()
        .await
        .map_err(failed)?;
    let published = published.lock().unwrap().take();
    let info = summarize(
        &current,
        published,
        update.as_ref().map(|u| (u.body.as_deref().unwrap_or_default(), u.date.map(|d| d.date().to_string()))),
    );
    *pending.0.lock().unwrap() = update;
    Ok(info)
}

/// Downloads, checks the signature against the embedded public key and installs; then the app restarts.
#[tauri::command]
pub async fn update_install(app: tauri::AppHandle, pending: State<'_, PendingUpdate>) -> Result<()> {
    let update = pending
        .0
        .lock()
        .unwrap()
        .take()
        .ok_or_else(|| AppError::Update("nenhuma atualização pendente: verifique de novo".into()))?;
    let (mut downloaded, emitter) = (0u64, app.clone());
    update
        .download_and_install(
            move |chunk, total| {
                downloaded += chunk as u64;
                // Progress is cosmetic: a closed window must not abort the download.
                let _ = emitter.emit(PROGRESS_EVENT, Progress { downloaded, total });
            },
            || {},
        )
        .await
        .map_err(failed)?;
    app.restart()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn a_newer_release_is_offered_with_its_notes_and_date() {
        let info = summarize("0.1.0", Some("0.2.0".into()), Some((" Correções\n", Some("2026-09-18".into()))));
        assert_eq!(
            info,
            UpdateInfo {
                current: "0.1.0".into(),
                latest: "0.2.0".into(),
                available: true,
                notes: "Correções".into(),
                date: Some("2026-09-18".into()),
            }
        );
    }

    #[test]
    fn a_tampered_download_is_explained_in_portuguese() {
        let msg = failed(tauri_plugin_updater::Error::SignatureUtf8("x".into())).to_string();
        assert!(msg.contains("não confere com a assinatura"), "{msg}");
        assert!(failed(tauri_plugin_updater::Error::ReleaseNotFound).to_string().contains("nenhuma versão publicada"));
    }

    #[test]
    fn up_to_date_still_shows_the_published_version() {
        let info = summarize("0.2.0", Some("0.2.0".into()), None);
        assert!(!info.available);
        assert_eq!(info.latest, "0.2.0");
        assert_eq!(info.notes, "");
    }

    #[test]
    fn a_local_build_ahead_of_the_release_is_not_offered_a_downgrade() {
        let info = summarize("0.3.0-dev", Some("0.2.0".into()), None);
        assert!(!info.available);
        assert_eq!(info.latest, "0.2.0", "the screen must say which version is published, not echo the local one");
    }
}
