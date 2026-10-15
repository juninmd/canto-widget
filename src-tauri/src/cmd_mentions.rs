//! The mentions subtab of the GitHub and GitLab tabs.
use serde::Serialize;
use tauri::Manager;

use crate::blocking::run;
use crate::cmd_github::{valid_token, GithubState};
use crate::cmd_github_lists::Github;
use crate::cmd_gitlab::to_account;
use crate::error::{AppError, Result};
use crate::forge::{self, ForgeItem};
use crate::forge_filter::{ForgeFilter, Section};
use crate::github_teams;
use crate::gitlab_todos;
use crate::mention_feed::{self, MentionRow};
use crate::mentions_state::{self, MentionsUnread, GITHUB, GITLAB};
use crate::model::now_ms;
use crate::my_pr_alerts::MyPrAlerts;
use crate::vault::AppState;

#[derive(Serialize)]
pub struct MentionsReply {
    pub rows: Vec<MentionRow>,
    /// When the list left the forge (ms; 0 when it was just asked); older than now when it came from the cache.
    pub fetched_at: i64,
    /// Set when the rate limit forced a cached copy: fresh data only after this instant (ms).
    pub limited_until: Option<i64>,
    pub unread: u32,
}

/// Open threads that mention the user's @login directly (and their teams, when asked), newest first.
#[tauri::command]
pub async fn github_mentions(app: tauri::AppHandle, force: Option<bool>) -> Result<MentionsReply> {
    run(move || {
        let state = app.state::<AppState>();
        state.touch();
        let login = state.github_config()?.map(|c| c.login).filter(|l| !l.is_empty());
        let login = login.ok_or_else(|| AppError::Github("conecte sua conta do GitHub".into()))?;
        let cred = valid_token(&state, &app.state::<GithubState>(), now_ms())?;
        let filter = ForgeFilter::default();
        let force = force.unwrap_or(false);
        let mut list = forge::list_page::<Github>(&state.forges, &cred, Section::Mentioned, 1, &filter, force)?;
        let mut names = vec![login];
        if app.state::<MyPrAlerts>().get().team_mentions {
            let teams = forge::list_page::<Github>(&state.forges, &cred, Section::TeamMentioned, 1, &filter, force)?;
            list = mention_feed::with_teams(list, teams);
            names.extend(github_teams::lookup(&cred));
        }
        let mut rows = rows(&list.items, &cred, &names);
        let unread = flag(&state, &app.state::<MentionsUnread>(), GITHUB, &mut rows)?;
        Ok(MentionsReply { rows, fetched_at: list.fetched_at, limited_until: list.limited_until, unread })
    })
    .await
}

fn rows(items: &[ForgeItem], token: &str, names: &[String]) -> Vec<MentionRow> {
    let found = mention_feed::github_found(token, names, items);
    let mut rows = mention_feed::github_rows(items, &found);
    mention_feed::github_photos(&mut rows);
    rows
}

/// Marks what the user read or muted and remembers the list for the badge; returns how many are unread.
fn flag(state: &AppState, unread: &MentionsUnread, slot: usize, rows: &mut [MentionRow]) -> Result<u32> {
    let saved = mentions_state::load(state)?;
    mention_feed::flag(rows, &saved);
    Ok(unread.set(slot, mention_feed::lights(rows), &saved))
}

/// The user's mention to-dos: the pending ones and, when asked, the ones already done.
#[tauri::command]
pub async fn gitlab_mentions(app: tauri::AppHandle, include_done: Option<bool>) -> Result<MentionsReply> {
    run(move || {
        let state = app.state::<AppState>();
        state.touch();
        let cfg = state.gitlab_config()?.ok_or_else(|| AppError::Gitlab("conecte sua conta do GitLab".into()))?;
        let acc = to_account(&cfg);
        let todos = match include_done.unwrap_or(false) {
            true => gitlab_todos::mentions_with_done(&acc)?,
            false => gitlab_todos::mentions(&acc)?,
        };
        let mut rows = mention_feed::gitlab_rows(&todos, &cfg.username);
        mention_feed::gitlab_photos(&mut rows, &cfg.base_url);
        let unread = flag(&state, &app.state::<MentionsUnread>(), GITLAB, &mut rows)?;
        Ok(MentionsReply { rows, fetched_at: 0, limited_until: None, unread })
    })
    .await
}
