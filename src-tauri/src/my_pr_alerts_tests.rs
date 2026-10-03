use super::*;
use crate::forge::{ChecksStatus, ForgeItem};

const NOW: i64 = 1_789_700_400_000; // 2026-09-18T03:00:00Z

fn pr(number: u64, created: &str, draft: bool) -> ForgeItem {
    ForgeItem { is_pr: true, draft, ..crate::forge::item(number, created, created, 0) }
}

fn states(list: &[(&str, ChecksStatus)]) -> HashMap<String, ChecksStatus> {
    list.iter().map(|(k, s)| (k.to_string(), *s)).collect()
}

#[test]
fn only_prs_past_the_limit_count_and_drafts_never_do() {
    let items = [
        pr(1, "2026-09-16T02:00:00Z", false), // 49 h
        pr(2, "2026-09-16T03:00:00Z", false), // exactly 48 h
        pr(3, "2026-09-16T04:00:00Z", false), // 47 h
        pr(4, "2026-09-10T00:00:00Z", true),
        pr(5, "ontem", false),
    ];
    let numbers: Vec<u64> = stalled(&items, NOW, 48).iter().map(|i| i.number).collect();
    assert_eq!(numbers, [1, 2]);
}

#[test]
fn a_stalled_pr_rings_once_and_again_after_it_stops_being_stalled() {
    let items = [pr(1, "2026-09-10T00:00:00Z", false)];
    let waiting = stalled(&items, NOW, 48);
    let (fresh, seen) = advance_stalled(&HashSet::new(), &waiting);
    assert_eq!(fresh.len(), 1, "already overdue at launch still counts");
    let (fresh, seen) = advance_stalled(&seen, &waiting);
    assert!(fresh.is_empty());
    let (_, seen) = advance_stalled(&seen, &[]);
    assert!(advance_stalled(&seen, &waiting).0.len() == 1, "reviewed, then waiting again");
}

#[test]
fn many_stalled_prs_become_one_summary_with_their_references() {
    let items: Vec<ForgeItem> = (1..=4).map(|n| pr(n, "2026-09-10T00:00:00Z", false)).collect();
    let all: Vec<&ForgeItem> = items.iter().collect();
    let [e] = &stalled_events(&all, NOW, false)[..] else { panic!("one summary") };
    assert_eq!((e.id.as_str(), e.title.as_str()), ("pr:stalled:summary", "4 PRs sem revisão"));
    assert_eq!(e.description, "o/r#1\no/r#2\no/r#3\no/r#4");
    assert!(e.link.is_empty());
}

#[test]
fn a_single_stalled_pr_says_how_long_and_links_to_it() {
    let items = [pr(7, "2026-09-16T00:00:00Z", false)];
    let all: Vec<&ForgeItem> = items.iter().collect();
    let [e] = &stalled_events(&all, NOW, false)[..] else { panic!("one alert") };
    assert_eq!((e.id.as_str(), e.tag.as_str(), e.organizer.as_str()), ("pr:stalled:o/r#7", "stalled", "o/r#7"));
    assert_eq!(e.description, "Sem revisão há 51 h.");
    assert_eq!(e.start, "2026-09-16T00:00:00Z");
    assert_eq!(e.link, "https://github.com/o/r/issues/7");
    assert_eq!(stalled_events(&all, NOW, true)[0].description, "No review for 51 h.");
}

#[test]
fn the_first_ci_reading_only_seeds() {
    let now = states(&[("o/r#1", ChecksStatus::Failure)]);
    assert!(newly_failing(None, &now).is_empty());
}

#[test]
fn a_ci_that_turns_red_rings_once_and_again_after_it_recovers() {
    let green = states(&[("o/r#1", ChecksStatus::Success), ("o/r#2", ChecksStatus::Running)]);
    let red = states(&[("o/r#1", ChecksStatus::Failure), ("o/r#2", ChecksStatus::Failure)]);
    assert_eq!(newly_failing(Some(&green), &red), ["o/r#1", "o/r#2"]);
    assert!(newly_failing(Some(&red), &red).is_empty(), "still red is not news");
    let fixed = states(&[("o/r#1", ChecksStatus::Running), ("o/r#2", ChecksStatus::Success)]);
    assert!(newly_failing(Some(&red), &fixed).is_empty());
    assert_eq!(newly_failing(Some(&fixed), &red).len(), 2);
}

#[test]
fn a_pr_that_first_shows_up_already_red_counts_as_new() {
    let prev = states(&[("o/r#1", ChecksStatus::Success)]);
    let now = states(&[("o/r#1", ChecksStatus::Success), ("o/r#9", ChecksStatus::Failure)]);
    assert_eq!(newly_failing(Some(&prev), &now), ["o/r#9"]);
}

#[test]
fn a_status_that_did_not_answer_keeps_its_last_value_and_closed_prs_are_forgotten() {
    let prev = states(&[("o/r#1", ChecksStatus::Failure), ("o/r#2", ChecksStatus::Failure)]);
    let now = states(&[("o/r#3", ChecksStatus::Success)]);
    let listed: HashSet<&str> = ["o/r#1", "o/r#3"].into_iter().collect();
    let next = remember(Some(&prev), now, &listed);
    assert_eq!(next, states(&[("o/r#1", ChecksStatus::Failure), ("o/r#3", ChecksStatus::Success)]));
    assert!(newly_failing(Some(&next), &states(&[("o/r#1", ChecksStatus::Failure)])).is_empty());
}

#[test]
fn a_ci_alert_names_the_pr_and_opens_it() {
    let e = ci_event(&pr(12, "2026-09-10T00:00:00Z", false), false);
    assert_eq!((e.id.as_str(), e.tag.as_str(), e.title.as_str()), ("pr:ci:o/r#12", "ci", "item 12"));
    assert_eq!((e.organizer.as_str(), e.link.as_str()), ("o/r#12", "https://github.com/o/r/issues/12"));
    assert_eq!(e.description, "O CI falhou neste pull request.");
}

#[test]
fn the_switches_default_on_at_48_hours_and_survive_a_restart() {
    let dir = std::env::temp_dir().join(format!("canto-my-pr-alerts-{}", std::process::id()));
    std::fs::create_dir_all(&dir).unwrap();
    let _ = std::fs::remove_file(dir.join(FILE));
    assert_eq!(MyPrAlerts::load(&dir).get(), Config { ci: true, stalled: true, stalled_hours: 48 });
    MyPrAlerts::load(&dir).set(Config { ci: false, stalled: true, stalled_hours: 24 }).unwrap();
    assert_eq!(MyPrAlerts::load(&dir).get(), Config { ci: false, stalled: true, stalled_hours: 24 });
    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn an_absurd_wait_is_clamped_and_a_file_missing_fields_keeps_the_defaults() {
    let dir = std::env::temp_dir().join(format!("canto-my-pr-alerts-clamp-{}", std::process::id()));
    std::fs::create_dir_all(&dir).unwrap();
    let alerts = MyPrAlerts::load(&dir);
    assert_eq!(alerts.set(Config { ci: true, stalled: true, stalled_hours: 0 }).unwrap().stalled_hours, 1);
    assert_eq!(alerts.set(Config { ci: true, stalled: true, stalled_hours: 99_999 }).unwrap().stalled_hours, 336);
    std::fs::write(dir.join(FILE), r#"{"ci":false}"#).unwrap();
    assert_eq!(MyPrAlerts::load(&dir).get(), Config { ci: false, stalled: true, stalled_hours: 48 });
    let _ = std::fs::remove_dir_all(&dir);
}
