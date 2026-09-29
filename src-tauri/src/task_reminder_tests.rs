use super::*;

fn task(id: &str, time: &str) -> Task {
    Task {
        id: id.into(),
        title: "tomar remédio".into(),
        day: "2026-09-09".into(),
        reminder_time: Some(time.into()),
        ..Default::default()
    }
}

fn now(h: u32, m: u32, s: u32) -> NaiveDateTime {
    NaiveDate::from_ymd_opt(2026, 9, 9).unwrap().and_hms_opt(h, m, s).unwrap()
}

fn rings(t: &Task, at: NaiveDateTime, lead: i64) -> bool {
    !due(std::slice::from_ref(t), &Rung::default(), at, at, lead).is_empty()
}

fn on(day: u32, h: u32, m: u32) -> NaiveDateTime {
    NaiveDate::from_ymd_opt(2026, 9, day).unwrap().and_hms_opt(h, m, 0).unwrap()
}

#[test]
fn a_lead_that_crosses_midnight_checks_tomorrow() {
    assert_eq!(days_to_check(on(9, 23, 40), on(9, 23, 40), 30), ["2026-09-10"]);
    assert_eq!(days_to_check(on(9, 23, 31), on(9, 23, 31), 30), ["2026-09-09", "2026-09-10"]);
    let t = Task { day: "2026-09-10".into(), ..task("t1", "00:10") };
    assert!(rings(&t, on(9, 23, 40), 30));
}

#[test]
fn a_task_just_before_midnight_still_rings_right_after_it() {
    assert_eq!(days_to_check(on(10, 0, 0), on(10, 0, 0), 0), ["2026-09-09", "2026-09-10"]);
    assert!(rings(&task("t1", "23:59"), on(10, 0, 0), 0));
}

#[test]
fn a_clock_jump_forward_between_ticks_still_rings_what_it_skipped() {
    // Spring forward: the local clock goes 01:59:50 -> 03:00:10 in one 20 s tick; 02:30 never "exists".
    let (before, after) = (now(1, 59, 50), now(3, 0, 10));
    let t = task("t1", "02:30");
    assert!(!rings(&t, after, 0));
    assert_eq!(due(std::slice::from_ref(&t), &Rung::default(), before, after, 0).len(), 1);
}

#[test]
fn after_a_long_sleep_old_reminders_stay_quiet() {
    // The caller passes `since = now` when real time jumped, so only the 2-minute tolerance applies.
    let t = task("t1", "12:00");
    assert!(!rings(&t, now(15, 0, 0), 0));
}

#[test]
fn rings_at_the_time_and_for_two_minutes_after() {
    let t = task("t1", "08:30");
    assert!(!rings(&t, now(8, 29, 59), 0));
    assert!(rings(&t, now(8, 30, 0), 0));
    assert!(rings(&t, now(8, 31, 30), 0));
    assert!(!rings(&t, now(8, 32, 0), 0));
}

#[test]
fn lead_moves_the_window_earlier() {
    let t = task("t1", "08:30");
    assert!(!rings(&t, now(8, 19, 59), 10));
    assert!(rings(&t, now(8, 20, 0), 10));
    assert!(!rings(&t, now(8, 22, 0), 10));
}

#[test]
fn done_already_rung_and_untimed_tasks_stay_quiet() {
    let done = Task { done: true, ..task("d", "08:30") };
    let untimed = Task { reminder_time: None, ..task("u", "08:30") };
    let rung = task("r", "08:30");
    let mut set = Rung::default();
    set.insert(&rung);
    assert!(due(&[done, untimed, rung], &set, now(8, 30, 0), now(8, 30, 0), 0).is_empty());
}

#[test]
fn rescheduling_rings_again() {
    let before = task("t1", "08:30");
    let mut set = Rung::default();
    set.insert(&before);
    assert_eq!(due(&[task("t1", "09:00")], &set, now(9, 0, 0), now(9, 0, 0), 0).len(), 1);
}

#[test]
fn the_event_carries_the_task_prefix_and_title() {
    let e = to_event(&task("t9", "08:30"));
    assert_eq!(e.id, "task:t9");
    assert_eq!(e.title, "tomar remédio");
    assert!(e.start.contains("T08:30:00"), "{}", e.start);
}

#[test]
fn a_quick_lock_and_unlock_does_not_ring_the_same_reminder_again() {
    let t = task("t1", "08:30");
    let tasks_for = |day: &str| if day == "2026-09-09" { vec![t.clone()] } else { vec![] };
    let mut memory = Memory::default();
    assert_eq!(memory.tick(now(8, 30, 0), 0, tasks_for).len(), 1);
    memory.lock();
    assert!(memory.tick(now(8, 31, 0), 0, tasks_for).is_empty(), "unlocked within the tolerance");
}

#[test]
fn the_rung_memory_forgets_reminders_long_past() {
    let mut rung = Rung::default();
    let (old, new) = (task("old", "08:30"), Task { day: "2026-09-11".into(), ..task("new", "08:30") });
    rung.insert(&old);
    rung.insert(&new);
    rung.forget_before(on(11, 9, 0));
    assert!(!rung.contains(&old));
    assert!(rung.contains(&new));
}
