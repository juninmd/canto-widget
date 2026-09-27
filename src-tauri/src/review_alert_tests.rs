use super::*;
use crate::forge::item;

fn list(numbers: &[u64], total: u64) -> ForgeList {
    ForgeList { total, items: numbers.iter().map(|n| item(*n, "", "", 0)).collect(), ..Default::default() }
}

fn step(seen: Option<&HashSet<String>>, l: &ForgeList) -> (Vec<u64>, HashSet<String>) {
    let (fresh, next) = advance(seen, l);
    (fresh.iter().map(|i| i.number).collect(), next)
}

#[test]
fn the_first_reading_only_seeds() {
    let (fresh, seen) = step(None, &list(&[1, 2, 3], 3));
    assert!(fresh.is_empty());
    assert_eq!(seen.len(), 3);
}

#[test]
fn only_requests_not_seen_before_are_announced() {
    let (_, seen) = step(None, &list(&[1, 2], 2));
    let now = list(&[3, 1, 2], 3);
    let (fresh, seen) = step(Some(&seen), &now);
    assert_eq!(fresh, vec![3]);
    let (fresh, _) = step(Some(&seen), &now);
    assert!(fresh.is_empty(), "no repeat on the next reading");
}

#[test]
fn a_request_made_again_after_the_review_rings_again() {
    let (_, seen) = step(None, &list(&[1, 2], 2));
    let (_, seen) = step(Some(&seen), &list(&[2], 1));
    let (fresh, _) = step(Some(&seen), &list(&[1, 2], 2));
    assert_eq!(fresh, vec![1]);
}

#[test]
fn an_old_item_sliding_up_from_page_two_is_not_new() {
    let (_, seen) = step(None, &list(&[1, 2], 5));
    let (_, seen) = step(Some(&seen), &list(&[2, 3], 4));
    let (fresh, _) = step(Some(&seen), &list(&[1, 3], 4));
    assert!(fresh.is_empty(), "partial pages only add to the memory");
}

#[test]
fn a_burst_becomes_one_summary() {
    let l = list(&[1, 2, 3, 4], 4);
    let all: Vec<&ForgeItem> = l.items.iter().collect();
    assert_eq!(messages(&all), vec![("Revisão pedida", "4 PRs aguardam sua revisão".to_string())]);
    assert_eq!(messages(&all[..1]), vec![("Revisão pedida", "o/r#1 item 1".to_string())]);
}

#[test]
fn the_switch_defaults_on_and_survives_a_restart() {
    let dir = std::env::temp_dir().join(format!("canto-review-alerts-{}", std::process::id()));
    std::fs::create_dir_all(&dir).unwrap();
    let _ = std::fs::remove_file(dir.join(FILE));
    assert!(ReviewAlerts::load(&dir).enabled(), "no file yet");
    ReviewAlerts::load(&dir).set(false).unwrap();
    assert!(!ReviewAlerts::load(&dir).enabled());
    std::fs::write(dir.join(FILE), "{}").unwrap();
    assert!(ReviewAlerts::load(&dir).enabled(), "missing key reads as on");
    std::fs::remove_dir_all(&dir).unwrap();
}
