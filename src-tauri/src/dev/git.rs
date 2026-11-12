//! Local repositories the user chose (never anything outside those folders), their status, and the worktrees that
//! are safe to remove because their work already reached the remote. All through the `git` binary.
use std::path::{Path, PathBuf};

use serde::Serialize;

use crate::dev::exec::{run, Out, QUICK, SLOW};
use crate::error::{AppError, Result};
use crate::lang::tr;

#[derive(Debug, Clone, Default, PartialEq)]
pub struct Status {
    pub branch: Option<String>,
    pub ahead: u32,
    pub behind: u32,
    pub dirty: u32,
}

#[derive(Debug, Clone, PartialEq)]
pub struct Wt {
    pub path: String,
    pub branch: Option<String>,
    pub bare: bool,
}

/// `git status --porcelain=v2 -b`: `# branch.head`, `# branch.ab +2 -1`, then one line per changed path.
pub fn parse_status(text: &str) -> Status {
    let mut s = Status::default();
    for line in text.lines() {
        if let Some(h) = line.strip_prefix("# branch.head ") {
            s.branch = Some(h.to_string()).filter(|h| h != "(detached)");
        } else if let Some(ab) = line.strip_prefix("# branch.ab ") {
            let mut n = ab.split_whitespace().map(|x| x[1..].parse::<u32>().unwrap_or(0));
            (s.ahead, s.behind) = (n.next().unwrap_or(0), n.next().unwrap_or(0));
        } else if !line.starts_with('#') && !line.is_empty() {
            s.dirty += 1;
        }
    }
    s
}

/// `git worktree list --porcelain`: blocks separated by a blank line, the first one being the main checkout.
pub fn parse_worktrees(text: &str) -> Vec<Wt> {
    let mut all: Vec<Wt> = Vec::new();
    for line in text.lines() {
        if let Some(p) = line.strip_prefix("worktree ") {
            all.push(Wt { path: p.to_string(), branch: None, bare: false });
        } else if let (Some(b), Some(w)) = (line.strip_prefix("branch refs/heads/"), all.last_mut()) {
            w.branch = Some(b.to_string());
        } else if let (true, Some(w)) = (line == "bare", all.last_mut()) {
            w.bare = true;
        }
    }
    all
}

/// `%(upstream:track)`: "", "[ahead 2]", "[behind 1]", "[ahead 2, behind 1]" or "[gone]".
pub fn parse_track(text: &str) -> (u32, bool) {
    let gone = text.contains("gone");
    let ahead = text.split("ahead ").nth(1).and_then(|r| r.split(|c: char| !c.is_ascii_digit()).next()?.parse().ok());
    (ahead.unwrap_or(0), gone)
}

#[derive(Debug, Clone, Default)]
pub struct Facts {
    pub branch: Option<String>,
    pub dirty: u32,
    pub merged: bool,
    pub gone: bool,
}

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct Verdict {
    pub safe: bool,
    /// "merged" and "gone" are safe; "detached", "dirty" and "open" are why one is not.
    pub reason: &'static str,
    pub count: u32,
}

/// Safe only with nothing uncommitted and the work already on the remote: merged into the default branch, or its
/// remote branch deleted (what a merged pull request usually does).
pub fn verdict(f: &Facts) -> Verdict {
    let v = |safe, reason, count| Verdict { safe, reason, count };
    match () {
        _ if f.branch.is_none() => v(false, "detached", 0),
        _ if f.dirty > 0 => v(false, "dirty", f.dirty),
        _ if f.merged => v(true, "merged", 0),
        _ if f.gone => v(true, "gone", 0),
        _ => v(false, "open", 0),
    }
}

fn git(repo: &Path, args: &[&str], timeout: std::time::Duration) -> Option<Out> {
    let dir = repo.to_string_lossy();
    let mut all = vec!["-c", "core.quotepath=off", "-C", dir.as_ref()];
    all.extend_from_slice(args);
    run("git", &all, None, timeout)
}

fn text(repo: &Path, args: &[&str]) -> Option<String> {
    git(repo, args, QUICK).filter(|o| o.ok).map(|o| o.stdout.trim().to_string())
}

const SKIP: [&str; 9] = ["node_modules", "target", "dist", "build", "vendor", ".cache", "venv", "__pycache__", ".git"];
const MAX_REPOS: usize = 300;

/// Repositories inside `root`, `depth` folders down; a repository is not searched for more inside it.
pub fn find_repos(root: &Path, depth: u8) -> Vec<PathBuf> {
    let mut found = Vec::new();
    let mut stack = vec![(root.to_path_buf(), 0u8)];
    while let Some((dir, level)) = stack.pop() {
        if dir.join(".git").is_dir() {
            found.push(dir);
            continue;
        }
        if level >= depth || found.len() >= MAX_REPOS {
            continue;
        }
        let Ok(read) = std::fs::read_dir(&dir) else { continue };
        for e in read.flatten() {
            let name = e.file_name().to_string_lossy().into_owned();
            let real_dir = e.file_type().is_ok_and(|t| t.is_dir());
            if real_dir && !SKIP.contains(&name.as_str()) {
                stack.push((e.path(), level + 1));
            }
        }
    }
    found.sort();
    found
}

#[derive(Debug, Clone, Serialize)]
pub struct Repo {
    pub path: String,
    pub name: String,
    pub root: String,
    pub branch: String,
    pub dirty: u32,
    pub ahead: u32,
    pub behind: u32,
    pub last: String,
}

pub fn repo_info(path: &Path, root: &str) -> Repo {
    let s = git(path, &["status", "--porcelain=v2", "-b"], QUICK).map(|o| parse_status(&o.stdout)).unwrap_or_default();
    Repo {
        path: path.to_string_lossy().into_owned(),
        name: path.file_name().map(|n| n.to_string_lossy().into_owned()).unwrap_or_default(),
        root: root.to_string(),
        branch: s.branch.unwrap_or_else(|| "HEAD".into()),
        dirty: s.dirty,
        ahead: s.ahead,
        behind: s.behind,
        last: text(path, &["log", "-1", "--format=%s"]).unwrap_or_default(),
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct Worktree {
    pub repo: String,
    pub repo_path: String,
    pub path: String,
    pub branch: String,
    pub safe: bool,
    pub reason: &'static str,
    pub count: u32,
}

/// What `origin` calls its default branch, or a local `main` / `master` when there is no remote.
fn default_branch(repo: &Path) -> Option<String> {
    if let Some(r) = text(repo, &["symbolic-ref", "--short", "refs/remotes/origin/HEAD"]).filter(|r| !r.is_empty()) {
        return Some(r);
    }
    ["origin/main", "origin/master", "main", "master"]
        .into_iter()
        .find(|b| git(repo, &["rev-parse", "--verify", "--quiet", b], QUICK).is_some_and(|o| o.ok))
        .map(str::to_string)
}

fn facts(repo: &Path, w: &Wt, default: Option<&str>) -> Facts {
    let dirty =
        git(Path::new(&w.path), &["status", "--porcelain"], QUICK).map_or(0, |o| o.stdout.lines().count() as u32);
    let Some(branch) = w.branch.clone() else { return Facts { dirty, ..Default::default() } };
    let refname = format!("refs/heads/{branch}");
    let track = text(repo, &["for-each-ref", "--format=%(upstream:track)", &refname]).unwrap_or_default();
    let merged =
        default.is_some_and(|d| git(repo, &["merge-base", "--is-ancestor", &refname, d], QUICK).is_some_and(|o| o.ok));
    Facts { branch: Some(branch), dirty, merged, gone: parse_track(&track).1 }
}

/// The linked worktrees (never the main checkout) of one repository, each with its verdict.
pub fn worktrees(repo: &Path) -> Vec<Worktree> {
    let list = text(repo, &["worktree", "list", "--porcelain"]).map(|t| parse_worktrees(&t)).unwrap_or_default();
    let default = default_branch(repo);
    let name = repo.file_name().map(|n| n.to_string_lossy().into_owned()).unwrap_or_default();
    list.iter()
        .skip(1)
        .filter(|w| !w.bare && Path::new(&w.path).is_dir())
        .map(|w| {
            let v = verdict(&facts(repo, w, default.as_deref()));
            Worktree {
                repo: name.clone(),
                repo_path: repo.to_string_lossy().into_owned(),
                path: w.path.clone(),
                branch: w.branch.clone().unwrap_or_default(),
                safe: v.safe,
                reason: v.reason,
                count: v.count,
            }
        })
        .collect()
}

fn fail(out: Option<Out>) -> AppError {
    let text = out.map(|o| o.message()).filter(|m| !m.is_empty());
    AppError::Config(text.unwrap_or_else(|| tr("o git não respondeu", "git did not answer").into()))
}

/// git prints forward slashes on Windows; the webview may hand back either form.
fn same_path(a: &str, b: &str) -> bool {
    a.replace('\\', "/") == b.replace('\\', "/")
}

/// Removes one worktree, and its local branch when git agrees nothing is lost. The verdict is recomputed here: the
/// webview's list may be minutes old. Returns whether the branch went too.
pub fn remove_worktree(repo: &Path, path: &str, delete_branch: bool) -> Result<bool> {
    let current = worktrees(repo);
    let Some(w) = current.iter().find(|w| same_path(&w.path, path)) else {
        return Err(AppError::Config(tr("worktree não encontrada", "worktree not found").into()));
    };
    if !w.safe {
        return Err(AppError::Config(
            tr(
                "esta worktree ainda tem trabalho que não está no remoto",
                "this worktree still holds work that is not on the remote",
            )
            .into(),
        ));
    }
    let out = git(repo, &["worktree", "remove", path], SLOW);
    if !out.as_ref().is_some_and(|o| o.ok) {
        return Err(fail(out));
    }
    let _ = git(repo, &["worktree", "prune"], QUICK);
    Ok(delete_branch && git(repo, &["branch", "-d", &w.branch], QUICK).is_some_and(|o| o.ok))
}

pub fn pull(repo: &Path) -> Result<String> {
    let out = git(repo, &["pull", "--ff-only"], SLOW);
    match out {
        Some(o) if o.ok => Ok(o.stdout.trim().lines().last().unwrap_or_default().to_string()),
        other => Err(fail(other)),
    }
}

pub fn fetch(repo: &Path) -> bool {
    git(repo, &["fetch", "--prune"], SLOW).is_some_and(|o| o.ok)
}

#[cfg(test)]
#[path = "git_tests.rs"]
mod tests;
