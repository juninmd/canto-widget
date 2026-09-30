use super::*;

fn task(title: &str, day: &str, done: bool) -> Task {
    Task { id: title.into(), title: title.into(), day: day.into(), done, ..Default::default() }
}

fn note(title: &str, body: &str, created_at: i64, updated_at: i64) -> Note {
    Note { id: title.into(), title: title.into(), body: body.into(), created_at, updated_at, ..Default::default() }
}

#[test]
fn done_tasks_count_on_their_day_inside_the_period_and_open_ones_never() {
    let tasks = [
        task("antes", "2026-08-31", true),
        task("segunda", "2026-09-21", true),
        task("aberta", "2026-09-22", false),
        task("hoje", "2026-09-27", true),
        task("depois", "2026-09-28", true),
    ];
    let out = period(&tasks, &[], "2026-09-21", "2026-09-27", 0, 1);
    let titles: Vec<_> = out.done.iter().map(|t| t.title.as_str()).collect();
    assert_eq!(titles, vec!["segunda", "hoje"]);
    assert_eq!(out.done_total, 2);
}

#[test]
fn focus_time_sums_every_task_of_the_period_done_or_not() {
    let with = |title: &str, day: &str, done: bool, secs: u32| Task { tracked_secs: secs, ..task(title, day, done) };
    let tasks = [
        with("antes", "2026-08-31", true, 900),
        with("feita", "2026-09-21", true, 600),
        with("aberta", "2026-09-22", false, 300),
    ];
    assert_eq!(period(&tasks, &[], "2026-09-21", "2026-09-27", 0, 1).focused_secs, 900);
}

#[test]
fn notes_are_created_or_edited_in_the_period_and_the_end_is_exclusive() {
    let notes = [
        note("velha", "", 10, 20),
        note("nova", "", 100, 150),
        note("editada", "", 10, 120),
        note("amanha", "", 200, 200),
    ];
    let out = period(&[], &notes, "2026-09-01", "2026-09-01", 100, 200);
    assert_eq!(
        out.notes,
        vec![
            TouchedNote { title: "editada".into(), created: false, at: 120 },
            TouchedNote { title: "nova".into(), created: true, at: 150 },
        ]
    );
}

#[test]
fn an_untitled_note_is_named_by_its_first_line() {
    let out = period(&[], &[note("", "\n  lista de compras \nleite", 5, 5)], "2026-09-01", "2026-09-01", 0, 10);
    assert_eq!(out.notes[0].title, "lista de compras");
}

#[test]
fn a_huge_period_is_bounded_but_the_total_still_counts_everything() {
    let tasks: Vec<Task> = (0..LIST_MAX + 5).map(|i| task(&format!("t{i}"), "2026-09-10", true)).collect();
    let out = period(&tasks, &[], "2026-09-01", "2026-09-30", 0, 1);
    assert_eq!((out.done.len(), out.done_total), (LIST_MAX, LIST_MAX + 5));
}

#[test]
fn days_must_be_well_formed_ordered_and_at_most_a_month_apart() {
    assert!(check_days("2026-09-01", "2026-09-30").is_ok());
    assert!(check_days("2026-09-27", "2026-09-27").is_ok());
    for (a, b) in [("2026-09-28", "2026-09-27"), ("2026-08-01", "2026-09-27"), ("2026-9-1", "2026-09-27"), ("x", "y")] {
        assert!(check_days(a, b).is_err(), "{a}..{b}");
    }
}
