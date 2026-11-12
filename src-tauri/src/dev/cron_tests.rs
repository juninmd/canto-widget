use super::*;

const TAB: &str = "MAILTO=x@y.z\n# backup noturno\n# canto: Backup do banco\n0 3 * * * pg_dump canto > /bk/c.sql\n*/30 * * * * node clean.js --quiet\n#canto-off# 0 */6 * * 1-5 npm run sync\n@reboot /usr/local/bin/start\n# 5 4 * * * comentado de verdade\n";

#[test]
fn crontab_lines_become_tasks_with_names_and_switch_state() {
    let all = parse_crontab(TAB);
    assert_eq!(all.len(), 4);
    assert_eq!(
        (all[0].name.as_str(), all[0].expr.as_str(), all[0].command.as_str()),
        ("Backup do banco", "0 3 * * *", "pg_dump canto > /bk/c.sql")
    );
    assert_eq!(all[1].name, "node clean.js --quiet");
    assert!(!all[2].enabled && all[2].expr == "0 */6 * * 1-5");
    assert_eq!(all[3].expr, "@reboot");
    assert!(all.iter().all(|t| !t.command.contains("comentado")), "a plain comment is not a task");
    assert_eq!(all[0].id, "3");
}

#[test]
fn split_line_refuses_what_is_not_a_schedule() {
    assert!(split_line("MAILTO=a").is_none());
    assert!(split_line("* * * *").is_none());
    assert!(split_line("* * * * *").is_none(), "a schedule with no command");
}

#[test]
fn windows_json_reads_one_object_or_a_list_and_any_language() {
    let one = r#"{"Name":"Backup","Path":"\\","State":3,"Command":"C:\\b.cmd","Next":"2026-11-13T03:00:00.0000000-03:00","Last":"2026-11-12T03:00:00.0000000-03:00","Result":0}"#;
    let all = parse_windows(one);
    assert_eq!((all.len(), all[0].enabled, all[0].last.as_str(), all[0].id.as_str()), (1, true, "ok", "\\Backup"));
    let many = r#"[{"Name":"A","Path":"\\X\\","State":1,"Command":"a","Next":null,"Last":"2026-11-12T03:00:00-03:00","Result":267009},{"Name":"B","Path":"\\","State":3,"Command":"b","Next":null,"Last":"1999-11-30T00:00:00","Result":267011}]"#;
    let all = parse_windows(many);
    assert_eq!((all[0].enabled, all[0].last.as_str(), all[0].id.as_str()), (false, "failed", "\\X\\A"));
    assert_eq!(all[1].last, "", "never run");
    assert!(parse_windows("").is_empty() && parse_windows("null").is_empty());
}

#[test]
fn a_change_is_refused_when_the_line_moved() {
    let lines: Vec<String> = TAB.lines().map(str::to_string).collect();
    assert_eq!(locate(&lines, "3", "0 3 * * * pg_dump canto > /bk/c.sql").unwrap(), 3);
    assert!(locate(&lines, "3", "outra coisa").is_err());
    assert!(locate(&lines, "99", "x").is_err() && locate(&lines, "abc", "x").is_err());
}

#[test]
fn single_line_blocks_newlines_that_would_add_a_second_entry() {
    assert!(single_line("echo oi"));
    assert!(!single_line("echo oi\n* * * * * rm -rf x") && !single_line("   "));
}
