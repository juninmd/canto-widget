use std::ffi::OsString;
use std::path::{Path, PathBuf};

use super::*;
use crate::harness_feed::{FeedEntry, Release};

fn path_of(dirs: &[&str]) -> OsString {
    std::env::join_paths(dirs.iter().map(PathBuf::from)).unwrap()
}

fn release() -> Release {
    Release {
        tag: "v1.0.0".into(),
        name: "v1.0.0".into(),
        published_at: "2026-10-16T20:53:06Z".into(),
        url: "https://github.com/anthropics/claude-code/releases/tag/v1.0.0".into(),
        notes: "notas".into(),
    }
}

#[test]
fn the_catalog_has_unique_ids_and_well_formed_links() {
    let mut ids: Vec<&str> = HARNESSES.iter().map(|h| h.id).collect();
    ids.sort_unstable();
    let total = ids.len();
    ids.dedup();
    assert_eq!(ids.len(), total);
    for h in HARNESSES {
        let (owner, name) = h.repo.split_once('/').expect("o repo é owner/name");
        assert!(!owner.is_empty() && !name.contains('/'), "{}: {}", h.id, h.repo);
        assert_eq!(h.site, format!("https://github.com/{}", h.repo), "{}", h.id);
        assert!(!h.bin.is_empty() && !h.bin.contains('/'), "{}", h.id);
        assert!(h.install.command.contains(h.install.tool), "{}: {}", h.id, h.install.command);
    }
}

#[test]
fn the_first_directory_with_the_executable_wins() {
    let hit = locate("codex", &path_of(&["/opt/one", "/opt/two"]), "", |p| p == Path::new("/opt/two/codex"));
    assert_eq!(hit, Some(PathBuf::from("/opt/two").join("codex")));
}

#[test]
fn an_empty_path_entry_is_not_read_as_a_relative_one() {
    assert_eq!(locate("claude", &path_of(&["", "/opt/bin"]), "", |p| p == Path::new("claude")), None);
}

#[test]
fn the_path_ext_variant_is_found_only_on_windows() {
    let dir = PathBuf::from("/opt/bin");
    let hit = locate("copilot", &path_of(&["/opt/bin"]), ".CMD", |p| p == dir.join("copilot.cmd"));
    let expected = if cfg!(windows) { Some(dir.join("copilot.cmd")) } else { None };
    assert_eq!(hit, expected);
}

#[test]
fn path_ext_variants_are_added_only_on_windows() {
    let names = candidates("claude", ".COM;.CMD");
    assert_eq!(names[0], "claude");
    if cfg!(windows) {
        assert_eq!(names, vec!["claude", "claude.com", "claude.cmd"]);
    } else {
        assert_eq!(names, vec!["claude"]);
    }
    assert_eq!(candidates("tool.exe", ".EXE"), vec!["tool.exe"]);
}

#[test]
fn views_report_which_clis_are_installed_and_merge_fills_the_feed() {
    let dir = PathBuf::from("/opt/bin");
    let wanted = dir.join("claude");
    let views = views(&path_of(&["/opt/bin"]), "", |p| p == wanted.as_path());
    assert_eq!(views.len(), HARNESSES.len());
    let claude = views.iter().find(|v| v.id == "claude").expect("claude is in the catalog");
    assert!(claude.installed);
    assert_eq!(claude.path.as_deref(), Some(wanted.to_string_lossy().as_ref()));
    assert_eq!(claude.install_command, "npm install -g @anthropic-ai/claude-code");
    assert!(views.iter().filter(|v| v.id != "claude").all(|v| !v.installed && v.path.is_none()));
    assert!(views.iter().all(|v| v.release.is_none() && v.error.is_none()));

    let feeds: Vec<FeedEntry> = HARNESSES
        .iter()
        .enumerate()
        .map(|(i, _)| FeedEntry {
            release: (i == 0).then(release),
            error: (i == 1).then(|| "sem resposta do GitHub".into()),
        })
        .collect();
    let merged = merge(views, feeds);
    assert_eq!(merged[0].release, Some(release()));
    assert_eq!(merged[1].error.as_deref(), Some("sem resposta do GitHub"));
    assert!(merged[2..].iter().all(|v| v.release.is_none() && v.error.is_none()));
}
