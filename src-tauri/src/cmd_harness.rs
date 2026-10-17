//! "Agentes" tab command: which coding-agent CLIs are installed on this machine and the latest release of
//! each. Public data only, no vault access, so it answers with the vault locked.
use tauri::{AppHandle, Manager};

use crate::blocking::run;
use crate::harness::{self, HarnessView};
use crate::harness_cache::HarnessCache;
use crate::harness_feed;
use crate::model::now_ms;

/// Detection is local and cheap; the release lookup goes through the cache's 30 min floor.
#[tauri::command]
pub async fn harness_list(app: AppHandle, force: bool) -> Vec<HarnessView> {
    run(move || {
        let feeds = app.state::<HarnessCache>().get(force, now_ms(), harness_feed::fetch_all);
        let path = std::env::var_os("PATH").unwrap_or_default();
        let pathext = std::env::var("PATHEXT").unwrap_or_default();
        Ok::<_, crate::error::AppError>(harness::merge(harness::views(&path, &pathext, |p| p.is_file()), feeds))
    })
    .await
    .unwrap_or_default()
}
