//! Tauri commands of the Dev tab. They run on the async pool because each one waits on an external program.
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};
use tauri::State;
use tauri_plugin_dialog::DialogExt;

use crate::dev::cron::{self, Listing};
use crate::dev::docker::{self, DockerState};
use crate::dev::git::{self, Repo, Worktree};
use crate::dev::ports::{self, PortEntry};
use crate::error::{AppError, Result};
use crate::lang::tr;
use crate::store;
use crate::vault::AppState;

#[tauri::command(async)]
pub fn dev_ports_list() -> Vec<PortEntry> {
    ports::list()
}

#[tauri::command(async)]
pub fn dev_port_kill(pid: u32, tree: bool) -> Result<usize> {
    ports::kill(pid, tree)
}

#[tauri::command(async)]
pub fn dev_docker_get() -> DockerState {
    docker::get()
}

#[tauri::command(async)]
pub fn dev_docker_action(kind: String, target: String) -> Result<()> {
    docker::action(&kind, &target)
}

#[tauri::command(async)]
pub fn dev_docker_logs(name: String) -> Result<Vec<String>> {
    docker::logs(&name)
}

#[tauri::command(async)]
pub fn dev_docker_prune(kind: String) -> Result<String> {
    docker::prune(&kind)
}

#[derive(Default, Serialize, Deserialize)]
struct Saved {
    #[serde(default)]
    roots: Vec<String>,
    #[serde(default = "two")]
    depth: u8,
}

fn two() -> u8 {
    2
}

fn file(state: &AppState) -> PathBuf {
    state.dir.join("dev_git.json")
}

fn load(state: &AppState) -> Saved {
    store::read_json(&file(state)).ok().flatten().unwrap_or(Saved { roots: Vec::new(), depth: 2 })
}

fn save(state: &AppState, saved: &Saved) -> Result<()> {
    store::write_json_atomic(&file(state), saved)
}

#[derive(Serialize)]
pub struct GitView {
    roots: Vec<String>,
    depth: u8,
    repos: Vec<Repo>,
    worktrees: Vec<Worktree>,
}

fn scan(saved: &Saved) -> GitView {
    let found: Vec<(String, PathBuf)> = saved
        .roots
        .iter()
        .flat_map(|r| git::find_repos(Path::new(r), saved.depth).into_iter().map(move |p| (r.clone(), p)))
        .collect();
    let mut repos = Vec::new();
    let mut worktrees = Vec::new();
    for chunk in found.chunks(8) {
        let done: Vec<(Repo, Vec<Worktree>)> = std::thread::scope(|s| {
            let jobs: Vec<_> =
                chunk.iter().map(|(root, p)| s.spawn(move || (git::repo_info(p, root), git::worktrees(p)))).collect();
            jobs.into_iter().filter_map(|j| j.join().ok()).collect()
        });
        for (r, w) in done {
            repos.push(r);
            worktrees.extend(w);
        }
    }
    GitView { roots: saved.roots.clone(), depth: saved.depth, repos, worktrees }
}

/// The OS folder picker; the chosen path still goes through `dev_git_root`, which checks it.
#[tauri::command(async)]
pub fn dev_pick_folder(app: tauri::AppHandle) -> Result<Option<String>> {
    let Some(chosen) = app.dialog().file().blocking_pick_folder() else { return Ok(None) };
    let path = chosen.into_path().map_err(|e| AppError::Io(e.to_string()))?;
    Ok(Some(path.to_string_lossy().into_owned()))
}

#[tauri::command(async)]
pub fn dev_git_get(state: State<'_, AppState>) -> GitView {
    scan(&load(&state))
}

fn folder(path: &str) -> Result<String> {
    let real = std::fs::canonicalize(path)
        .map_err(|_| AppError::Config(tr("pasta não encontrada", "folder not found").into()))?;
    let text = real.to_string_lossy().trim_start_matches(r"\\?\").to_string();
    if real.is_dir() {
        Ok(text)
    } else {
        Err(AppError::Config(tr("pasta não encontrada", "folder not found").into()))
    }
}

#[tauri::command(async)]
pub fn dev_git_root(
    state: State<'_, AppState>,
    add: Option<String>,
    remove: Option<String>,
    depth: Option<u8>,
) -> Result<GitView> {
    let mut saved = load(&state);
    if let Some(p) = add {
        let p = folder(&p)?;
        if !saved.roots.contains(&p) {
            saved.roots.push(p);
        }
    }
    if let Some(p) = remove {
        saved.roots.retain(|r| *r != p);
    }
    if let Some(d) = depth {
        saved.depth = d.clamp(1, 4);
    }
    save(&state, &saved)?;
    Ok(scan(&saved))
}

/// A repository the webview names must be one inside a chosen folder, never an arbitrary path.
fn chosen(state: &AppState, repo: &str) -> Result<PathBuf> {
    let saved = load(state);
    let found = saved
        .roots
        .iter()
        .flat_map(|r| git::find_repos(Path::new(r), saved.depth))
        .find(|p| p.to_string_lossy() == repo);
    found.ok_or_else(|| {
        AppError::Config(tr("repositório fora das pastas escolhidas", "repository outside the chosen folders").into())
    })
}

#[tauri::command(async)]
pub fn dev_git_fetch(state: State<'_, AppState>) -> GitView {
    let saved = load(&state);
    for r in saved.roots.iter().flat_map(|r| git::find_repos(Path::new(r), saved.depth)) {
        git::fetch(&r);
    }
    scan(&saved)
}

#[tauri::command(async)]
pub fn dev_git_pull(state: State<'_, AppState>, repo: String) -> Result<String> {
    git::pull(&chosen(&state, &repo)?)
}

#[tauri::command(async)]
pub fn dev_git_worktree_remove(
    state: State<'_, AppState>,
    repo: String,
    path: String,
    delete_branch: bool,
) -> Result<bool> {
    git::remove_worktree(&chosen(&state, &repo)?, &path, delete_branch)
}

#[tauri::command(async)]
pub fn dev_cron_list() -> Listing {
    cron::list()
}

fn backup(state: &AppState) -> PathBuf {
    state.dir.join("dev_crontab_backup.txt")
}

#[tauri::command(async)]
pub fn dev_cron_change(
    state: State<'_, AppState>,
    action: String,
    id: String,
    raw: String,
    name: Option<String>,
    expr: Option<String>,
    command: Option<String>,
) -> Result<()> {
    if cfg!(windows) {
        return cron::windows_change(&action, &id);
    }
    let new = match (&name, &expr, &command) {
        (Some(n), Some(e), Some(c)) => Some((n.as_str(), e.as_str(), c.as_str())),
        _ => None,
    };
    if action == "run" {
        return cron::cron_run(&id, &raw);
    }
    cron::cron_change(&action, &id, &raw, new, &backup(&state))
}
