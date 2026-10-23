use super::*;

const FEED: &str = r#"{"appnews":{"appid":1086940,"newsitems":[
  {"gid":"5001","title":"Hotfix #2","url":"https://steamstore-a.akamaihd.net/news/externalpost/x","contents":"[list][*]Fixed a crash when loading saves[*][b]Photo mode[/b]: new poses[/list]","date":1761000000,"tags":["patchnotes"]},
  {"gid":"5002","title":"Community Stream this Friday","url":"https://steamcommunity.com/games/x","contents":"Join us","date":1761100000,"tags":[]},
  {"gid":"5003","title":"Patch 8 is live","url":"https://store.steampowered.com/news/app/1086940/view/5003","contents":"[p]Over 1000 changes[/p][p]{STEAM_CLAN_IMAGE}/a.png[/p][p]- Crossplay[/p]","date":1761200000}
]}}"#;

#[test]
fn only_updates_are_kept_newest_first_with_a_short_changelog() {
    let items = parse(FEED, 1086940, "Baldur's Gate 3");
    assert_eq!(
        items.iter().map(|i| i.gid.as_str()).collect::<Vec<_>>(),
        vec!["5003", "5001"],
        "the stream is not an update"
    );
    assert_eq!(items[0].lines, vec!["Over 1000 changes", "Crossplay"], "images dropped, dashes trimmed");
    assert_eq!(items[1].lines, vec!["Fixed a crash when loading saves", "Photo mode: new poses"]);
    assert_eq!(items[0].game, "Baldur's Gate 3");
    assert!(items[0].url.starts_with("https://store.steampowered.com/news/app/1086940/view"));
    assert_eq!(
        items[1].url, "https://store.steampowered.com/news/app/1086940",
        "a foreign link falls back to Steam's page"
    );
    assert!(parse("not json", 1, "x").is_empty());
}

#[test]
fn a_huge_changelog_is_capped_in_lines_and_length() {
    let long = format!("[list]{}[/list]", (0..40).map(|i| format!("[*]change {i}")).collect::<String>());
    assert_eq!(changelog(&long).len(), LINES);
    let line = changelog(&"x".repeat(500));
    assert_eq!(line[0].chars().count(), 201);
}

#[test]
fn fresh_means_after_the_last_read_and_the_list_is_merged_across_games() {
    let mut items = parse(FEED, 1086940, "BG3");
    items.extend(parse(FEED, 1086940, "BG3"));
    let now = 1761200000 * 1000 + 1000;
    let news = combine(items.clone(), 1761100000 * 1000, now, 50);
    assert_eq!(news.items.len(), 2, "the same update twice is shown once");
    assert_eq!((news.items[0].fresh, news.items[1].fresh, news.unread), (true, false, 1));
    let never_read = combine(items, 0, now, 1);
    assert_eq!((never_read.items.len(), never_read.unread), (1, 1), "before any read, the last three days count");
}
