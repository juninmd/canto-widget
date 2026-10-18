use super::*;

#[test]
fn recent_games_keep_both_playtimes_and_a_missing_one_reads_as_zero() {
    let json = r#"{"response":{"total_count":2,"games":[
        {"appid":620,"name":"Portal 2","playtime_2weeks":120,"playtime_forever":4000},
        {"appid":400,"name":"Portal","playtime_forever":900}
    ]}}"#;
    let games = parse_recent(json);
    assert_eq!(games.len(), 2);
    assert_eq!(
        games[0],
        RecentGame { appid: 620, name: "Portal 2".into(), recent_min: 120, total_min: 4000, art: String::new() }
    );
    assert_eq!(games[1].recent_min, 0);
    assert!(parse_recent(r#"{"response":{}}"#).is_empty());
}

#[test]
fn a_vanity_name_resolves_only_when_steam_says_success() {
    assert_eq!(
        parse_vanity(r#"{"response":{"steamid":"76561190000000000","success":1}}"#).as_deref(),
        Some("76561190000000000")
    );
    assert_eq!(parse_vanity(r#"{"response":{"success":42,"message":"No match"}}"#), None);
    assert_eq!(parse_vanity("nada"), None);
}

#[test]
fn the_persona_name_doubles_as_the_key_check() {
    assert_eq!(parse_summary(r#"{"response":{"players":[{"personaname":"Ana"}]}}"#).as_deref(), Some("Ana"));
    assert_eq!(parse_summary(r#"{"response":{"players":[]}}"#), None);
}

#[test]
fn the_library_keeps_the_name_and_the_total_playtime_of_every_game() {
    let json = r#"{"response":{"game_count":3,"games":[
        {"appid":620,"name":"Portal 2","playtime_forever":4000,"playtime_2weeks":120,"img_icon_url":"abc"},
        {"appid":400,"name":"Portal","playtime_forever":900},
        {"appid":730,"name":"","playtime_forever":10},
        {"appid":0,"name":"Sem appid","playtime_forever":5}
    ]}}"#;
    let games = parse_owned(json);
    assert_eq!(games.len(), 2, "a game without a name or an appid has nothing to show");
    assert_eq!(games[0].name, "Portal 2");
    assert_eq!((games[0].appid, games[0].total_min), (620, 4000));
    assert!(games[0].art.is_empty(), "the capsule is built by the command, not reported here");
    assert_eq!(parse_owned(r#"{"response":{}}"#).len(), 0, "a private profile is an empty library");
    assert!(parse_owned("nada").is_empty());
}
