use super::*;
use std::fs;

#[test]
fn status_counts_changes_and_reads_the_upstream_gap() {
    let text = "# branch.oid abc\n# branch.head feature/x\n# branch.upstream origin/feature/x\n# branch.ab +2 -1\n1 .M N... 100644 100644 100644 a b src/a.rs\n? novo.txt\n";
    let s = parse_status(text);
    assert_eq!((s.branch.as_deref(), s.ahead, s.behind, s.dirty), (Some("feature/x"), 2, 1, 2));
    assert_eq!(parse_status("# branch.head (detached)\n").branch, None);
}

#[test]
fn worktree_blocks_list_the_main_checkout_first() {
    let text = "worktree /r/app\nHEAD a\nbranch refs/heads/main\n\nworktree /r/app.wt/fix\nHEAD b\nbranch refs/heads/fix/x\n\nworktree /r/app.wt/d\nHEAD c\ndetached\n";
    let all = parse_worktrees(text);
    assert_eq!(all.len(), 3);
    assert_eq!(all[1].branch.as_deref(), Some("fix/x"));
    assert_eq!(all[2].branch, None);
}

#[test]
fn track_text_tells_ahead_and_gone() {
    assert_eq!(parse_track("[ahead 3, behind 1]"), (3, false));
    assert_eq!(parse_track("[gone]"), (0, true));
    assert_eq!(parse_track(""), (0, false));
}

#[test]
fn only_merged_or_gone_and_clean_is_safe() {
    let f = |dirty, merged, gone, branch: Option<&str>| {
        verdict(&Facts { branch: branch.map(Into::into), dirty, merged, gone })
    };
    assert_eq!(f(0, true, false, Some("a")).reason, "merged");
    assert_eq!(f(0, false, true, Some("a")).reason, "gone");
    assert!(!f(3, true, true, Some("a")).safe, "uncommitted work wins over everything");
    assert_eq!((f(3, true, true, Some("a")).reason, f(3, true, true, Some("a")).count), ("dirty", 3));
    assert!(!f(0, false, false, Some("a")).safe, "a branch still open stays");
    assert_eq!(f(0, true, false, None).reason, "detached");
}

fn sh(dir: &Path, args: &[&str]) {
    let mut all = vec!["-c", "user.name=t", "-c", "user.email=t@t", "-c", "commit.gpgsign=false"];
    all.extend_from_slice(args);
    let ok = run("git", &["-C", &dir.to_string_lossy()].iter().copied().chain(all).collect::<Vec<_>>(), None, SLOW);
    assert!(ok.is_some_and(|o| o.ok), "git {args:?}");
}

fn scratch(name: &str) -> PathBuf {
    let dir = std::env::temp_dir().join(format!("canto-dev-{name}-{}", std::process::id()));
    let _ = fs::remove_dir_all(&dir);
    fs::create_dir_all(&dir).unwrap();
    // git rejects the `\\?\` verbatim form canonicalize gives on Windows.
    PathBuf::from(dir.canonicalize().unwrap().to_string_lossy().trim_start_matches(r"\\?\").to_string())
}

#[test]
fn a_merged_clean_worktree_is_removed_and_a_dirty_one_is_kept() {
    let root = scratch("wt");
    let repo = root.join("app");
    fs::create_dir_all(&repo).unwrap();
    sh(&repo, &["init", "-q", "-b", "main"]);
    fs::write(repo.join("a.txt"), "1").unwrap();
    sh(&repo, &["add", "."]);
    sh(&repo, &["commit", "-q", "-m", "um"]);
    let (clean, dirty) = (root.join("app-clean"), root.join("app-dirty"));
    sh(&repo, &["worktree", "add", "-q", "-b", "fix/clean", &clean.to_string_lossy()]);
    sh(&repo, &["worktree", "add", "-q", "-b", "fix/dirty", &dirty.to_string_lossy()]);
    fs::write(dirty.join("wip.txt"), "x").unwrap();

    let all = worktrees(&repo);
    assert_eq!(all.len(), 2);
    let by = |b: &str| all.iter().find(|w| w.branch == b).unwrap();
    assert_eq!((by("fix/clean").safe, by("fix/clean").reason), (true, "merged"));
    assert_eq!((by("fix/dirty").safe, by("fix/dirty").reason, by("fix/dirty").count), (false, "dirty", 1));

    assert!(remove_worktree(&repo, &dirty.to_string_lossy(), true).is_err());
    assert!(dirty.exists());
    assert!(remove_worktree(&repo, &clean.to_string_lossy(), true).unwrap());
    assert!(!clean.exists());
    assert!(remove_worktree(&repo, "/nao/e/worktree", true).is_err());
    let info = repo_info(&repo, "root");
    assert_eq!((info.branch.as_str(), info.dirty, info.last.as_str()), ("main", 0, "um"));
    let _ = fs::remove_dir_all(&root);
}

#[test]
fn repositories_are_found_to_the_depth_asked_and_not_inside_each_other() {
    let root = scratch("find");
    for p in ["a/.git", "b/c/.git", "b/c/inner/.git", "node_modules/x/.git", "deep/1/2/3/.git"] {
        fs::create_dir_all(root.join(p)).unwrap();
    }
    let names = |d| {
        find_repos(&root, d)
            .iter()
            .map(|p| p.strip_prefix(&root).unwrap().to_string_lossy().replace('\\', "/"))
            .collect::<Vec<_>>()
    };
    assert_eq!(names(1), vec!["a"]);
    assert_eq!(names(2), vec!["a", "b/c"]);
    assert!(!names(9).contains(&"node_modules/x".to_string()));
    let _ = fs::remove_dir_all(&root);
}
