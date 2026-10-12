//! The mentions subtab of the GitHub and GitLab tabs.
use tauri::Manager;

use crate::blocking::run;
use crate::cmd_github::{valid_token, GithubState};
use crate::cmd_github_lists::Github;
use crate::cmd_gitlab::to_account;
use crate::error::{AppError, Result};
use crate::forge::{self, ForgeItem};
use crate::forge_filter::{ForgeFilter, Section};
use crate::gitlab;
use crate::mention_feed::{self, MentionRow};
use crate::model::now_ms;
use crate::vault::AppState;

/// Open threads that mention the user's @login directly (a team mention does not match), newest first.
#[tauri::command]
pub async fn github_mentions(app: tauri::AppHandle, force: Option<bool>) -> Result<Vec<MentionRow>> {
    run(move || {
        let state = app.state::<AppState>();
        state.touch();
        let login = state.github_config()?.map(|c| c.login).filter(|l| !l.is_empty());
        let login = login.ok_or_else(|| AppError::Github("conecte sua conta do GitHub".into()))?;
        let cred = valid_token(&state, &app.state::<GithubState>(), now_ms())?;
        let filter = ForgeFilter::default();
        let list =
            forge::list_page::<Github>(&state.forges, &cred, Section::Mentioned, 1, &filter, force.unwrap_or(false))?;
        Ok(rows(&list.items, &cred, &login))
    })
    .await
}

fn rows(items: &[ForgeItem], token: &str, login: &str) -> Vec<MentionRow> {
    let found = mention_feed::github_found(token, login, items);
    let mut rows = mention_feed::github_rows(items, &found);
    mention_feed::github_photos(&mut rows);
    rows
}

/// The user's pending "mentioned" to-dos.
#[tauri::command]
pub async fn gitlab_mentions(app: tauri::AppHandle) -> Result<Vec<MentionRow>> {
    run(move || {
        let state = app.state::<AppState>();
        state.touch();
        let cfg = state.gitlab_config()?.ok_or_else(|| AppError::Gitlab("conecte sua conta do GitLab".into()))?;
        let acc = to_account(&cfg);
        let mut rows = mention_feed::gitlab_rows(&gitlab::mentions(&acc)?, &cfg.username);
        mention_feed::gitlab_photos(&mut rows, &cfg.base_url);
        Ok(rows)
    })
    .await
}
