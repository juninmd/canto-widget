use super::*;

fn owned(appid: u32, name: &str, total_min: u32, last_played: i64) -> OwnedGame {
    OwnedGame { appid, name: name.into(), total_min, art: String::new(), last_played }
}

fn recent(appid: u32, name: &str, recent_min: u32) -> RecentGame {
    RecentGame { appid, name: name.into(), recent_min, total_min: 0, art: String::new() }
}

fn installed(appid: u32, name: &str, last_played: i64) -> Installed {
    Installed { appid, name: name.into(), size_bytes: 10, last_played }
}

#[test]
fn the_library_the_recent_list_and_the_disk_become_one_list_last_played_first() {
    let games = merge(
        vec![owned(620, "Portal 2", 900, 100), owned(570, "Dota 2", 9000, 300), owned(400, "Portal", 50, 0)],
        &[recent(570, "Dota 2", 120)],
        &[installed(620, "Portal 2", 500), installed(1086940, "Baldur's Gate 3", 0)],
    );
    let order: Vec<u32> = games.iter().map(|g| g.appid).collect();
    assert_eq!(order, vec![620, 570, 400, 1086940], "the disk's last session wins over the API's older one");
    assert!(games[0].installed && games[0].size_bytes == 10);
    assert_eq!(games[1].recent_min, 120);
    assert!(games[3].installed, "a game only on disk still appears, even without the key");
    assert!(games[0].art.ends_with("/620/header.jpg") && games[0].cover.ends_with("/620/library_600x900.jpg"));
}

#[test]
fn a_page_filters_searches_and_counts_everything() {
    let mut library: Vec<OwnedGame> = (1..=30).map(|i| owned(i, &format!("Game {i}"), i * 10, i as i64)).collect();
    library.push(owned(99, "Portal", 5, 0));
    let games = merge(library, &[recent(30, "Game 30", 60)], &[installed(99, "Portal", 0)]);

    let first = page(&games, "all", "", 0, true);
    assert_eq!((first.items.len(), first.total, first.pages), (PAGE, 31, 2));
    assert_eq!(first.counts, PlayCounts { all: 31, recent: 1, installed: 1 });
    assert_eq!(first.hero.as_ref().map(|g| g.appid), Some(30), "the banner is the last game played");
    assert_eq!(page(&games, "all", "", 1, true).items.len(), 7);

    let mine = page(&games, "installed", "", 0, true);
    assert_eq!(mine.items.iter().map(|g| g.appid).collect::<Vec<_>>(), vec![99]);
    assert_eq!(page(&games, "recent", "", 0, true).total, 1);
    assert_eq!(page(&games, "all", "PORT", 0, true).total, 1, "the search ignores case");
    let empty = page(&[], "all", "", 0, false);
    assert_eq!((empty.total, empty.pages, empty.hero), (0, 1, None));
}
