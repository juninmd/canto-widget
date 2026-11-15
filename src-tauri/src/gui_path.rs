//! A desktop launch (Finder, Dock, an application menu, autostart) hands the app a bare `PATH`: no Homebrew, no
//! `~/.local/bin`, no npm or cargo bins. `git`, `docker` and the agent CLIs then look "not installed". The usual
//! places are appended (never ahead of what the user already has) so every lookup and child process sees them.
use std::ffi::{OsStr, OsString};
use std::path::{Path, PathBuf};

/// Extra directories for a Unix desktop session, in the order they are tried.
pub fn extra_dirs(home: Option<&Path>, macos: bool) -> Vec<PathBuf> {
    let mut dirs: Vec<PathBuf> = Vec::new();
    if macos {
        dirs.extend(["/opt/homebrew/bin", "/opt/homebrew/sbin"].map(PathBuf::from));
    } else {
        dirs.extend(["/home/linuxbrew/.linuxbrew/bin", "/snap/bin", "/var/lib/flatpak/exports/bin"].map(PathBuf::from));
    }
    dirs.extend(["/usr/local/bin", "/usr/local/sbin", "/usr/bin", "/bin", "/usr/sbin", "/sbin"].map(PathBuf::from));
    if let Some(home) = home {
        for rel in [
            ".local/bin",
            ".cargo/bin",
            ".bun/bin",
            ".volta/bin",
            ".deno/bin",
            "go/bin",
            ".npm-global/bin",
            ".claude/local",
        ] {
            dirs.push(home.join(rel));
        }
    }
    dirs
}

/// `current` plus every directory of `extra` that is not in it yet.
pub fn merged(current: &OsStr, extra: &[PathBuf]) -> OsString {
    let mut all: Vec<PathBuf> = std::env::split_paths(current).collect();
    for dir in extra {
        if !all.iter().any(|d| d == dir) {
            all.push(dir.clone());
        }
    }
    std::env::join_paths(all).unwrap_or_else(|_| current.to_os_string())
}

/// Call once, before any thread starts: it edits the process environment. Windows resolves tools through the
/// registry's `PATH` and `PATHEXT`, so only Unix needs it.
pub fn init() {
    #[cfg(unix)]
    {
        let home = std::env::var_os("HOME").map(PathBuf::from);
        let extra: Vec<PathBuf> =
            extra_dirs(home.as_deref(), cfg!(target_os = "macos")).into_iter().filter(|d| d.is_dir()).collect();
        let current = std::env::var_os("PATH").unwrap_or_default();
        let next = merged(&current, &extra);
        if next != current {
            // Runs first in `run()`, before the runtime or any worker thread exists.
            std::env::set_var("PATH", next);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn homebrew_only_on_mac() {
        assert!(extra_dirs(None, true).contains(&PathBuf::from("/opt/homebrew/bin")));
        assert!(!extra_dirs(None, false).contains(&PathBuf::from("/opt/homebrew/bin")));
        assert!(extra_dirs(None, false).contains(&PathBuf::from("/snap/bin")));
    }

    #[test]
    fn home_dirs_follow_home() {
        let dirs = extra_dirs(Some(Path::new("/h/u")), false);
        assert!(dirs.contains(&PathBuf::from("/h/u/.local/bin")));
        assert!(!extra_dirs(None, false).iter().any(|d| d.ends_with(".local/bin")));
    }

    #[test]
    fn merged_keeps_order_and_skips_duplicates() {
        let out = merged(OsStr::new("/usr/bin:/a"), &[PathBuf::from("/a"), PathBuf::from("/b")]);
        assert_eq!(out, OsString::from("/usr/bin:/a:/b"));
    }
}
