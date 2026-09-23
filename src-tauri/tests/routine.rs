use canto_widget_lib::error::AppError;
use canto_widget_lib::model::{ExtendedRepeat, Repeat, Task, VaultData};
use canto_widget_lib::routine::{
    instance_id, materialize, set_extended_repeat, set_schedule, validate_time, weekday_of,
};

fn task(id: &str, day: &str) -> Task {
    Task {
        id: id.into(),
        title: "tomar remedio".into(),
        day: day.into(),
        created_at: 1,
        updated_at: 1,
        ..Default::default()
    }
}

fn with_series(day: &str, r: Repeat) -> VaultData {
    let mut t = task("s1", day);
    set_schedule(&mut t, Some("08:30".into()), Some(r), 2).unwrap();
    VaultData { tasks: vec![t], ..Default::default() }
}

fn on_day<'a>(d: &'a VaultData, day: &str) -> Vec<&'a Task> {
    d.tasks.iter().filter(|t| t.day == day).collect()
}

#[test]
fn weekday_of_matches_the_calendar() {
    assert_eq!(weekday_of("2026-09-14"), Some(1)); // segunda
    assert_eq!(weekday_of("2026-09-13"), Some(0)); // domingo
    assert_eq!(weekday_of("2024-02-29"), Some(4)); // quinta, ano bissexto
    assert_eq!(weekday_of("2000-01-01"), Some(6)); // sabado
    for bad in ["", "2026-9-14", "2026-13-01", "abcd-ef-gh", "2026-09-14T00"] {
        assert_eq!(weekday_of(bad), None, "aceitou {bad:?}");
    }
}

#[test]
fn daily_creates_the_next_days_task_with_time_and_open() {
    let mut d = with_series("2026-09-14", Repeat::Daily);
    d.tasks[0].done = true;
    assert_eq!(materialize(&mut d, "2026-09-15", 10), 1);
    let new_task = on_day(&d, "2026-09-15")[0];
    assert_eq!(new_task.id, instance_id("s1", "2026-09-15"));
    assert!(!new_task.done, "instancia nova herdou o concluido da anterior");
    assert_eq!(new_task.reminder_time.as_deref(), Some("08:30"));
}

#[test]
fn opening_the_day_again_does_not_duplicate() {
    let mut d = with_series("2026-09-14", Repeat::Daily);
    materialize(&mut d, "2026-09-15", 10);
    assert_eq!(materialize(&mut d, "2026-09-15", 11), 0);
    assert_eq!(on_day(&d, "2026-09-15").len(), 1);
}

#[test]
fn weekdays_skips_the_weekend() {
    let mut d = with_series("2026-09-18", Repeat::Weekdays); // sexta
    assert_eq!(materialize(&mut d, "2026-09-19", 10), 0, "created on Saturday");
    assert_eq!(materialize(&mut d, "2026-09-21", 10), 1, "did not create on Monday");
}

#[test]
fn weekly_only_on_the_chosen_day() {
    let mut d = with_series("2026-09-14", Repeat::Weekly { weekday: 1 });
    assert_eq!(materialize(&mut d, "2026-09-15", 10), 0);
    assert_eq!(materialize(&mut d, "2026-09-21", 10), 1);
}

#[test]
fn a_deleted_instance_does_not_come_back() {
    let mut d = with_series("2026-09-14", Repeat::Daily);
    materialize(&mut d, "2026-09-15", 10);
    d.tombstone(&instance_id("s1", "2026-09-15"), 20);
    assert_eq!(materialize(&mut d, "2026-09-15", 30), 0);
    assert_eq!(materialize(&mut d, "2026-09-16", 30), 1, "deleting one day stopped the whole series");
}

#[test]
fn stopping_the_repeat_ends_the_series() {
    let mut d = with_series("2026-09-14", Repeat::Daily);
    materialize(&mut d, "2026-09-15", 10);
    let today = d.tasks.iter_mut().find(|t| t.day == "2026-09-15").unwrap();
    set_schedule(today, None, None, 11).unwrap();
    assert_eq!(materialize(&mut d, "2026-09-16", 12), 0);
}

#[test]
fn two_machines_generate_the_same_instance_and_the_merge_does_not_duplicate() {
    let mut a = with_series("2026-09-14", Repeat::Daily);
    let mut b = a.clone();
    materialize(&mut a, "2026-09-15", 10);
    materialize(&mut b, "2026-09-15", 99);
    assert_eq!(on_day(&a.merge(b), "2026-09-15").len(), 1);
}

#[test]
fn a_time_outside_the_format_is_rejected_before_the_vault() {
    assert_eq!(validate_time("09:05").unwrap(), "09:05");
    for bad in ["9:05", "24:00", "12:60", "+1:00", "ab:cd", "12:3é", ""] {
        assert!(matches!(validate_time(bad), Err(AppError::Config(_))), "accepted {bad:?}");
    }
    let mut t = task("x", "2026-09-14");
    assert!(set_schedule(&mut t, None, Some(Repeat::Weekly { weekday: 7 }), 1).is_err());
    assert!(t.repeat.is_none() && t.series.is_none(), "state changed despite the error");
}

fn with_extended_series(day: &str, r: ExtendedRepeat) -> VaultData {
    let mut t = task("s1", day);
    set_extended_repeat(&mut t, Some(r), 2).unwrap();
    VaultData { tasks: vec![t], ..Default::default() }
}

#[test]
fn monthly_fires_only_on_the_chosen_day_of_month() {
    let mut d = with_extended_series("2026-09-05", ExtendedRepeat::Monthly { day: 5 });
    assert_eq!(materialize(&mut d, "2026-09-06", 10), 0);
    assert_eq!(materialize(&mut d, "2026-10-05", 10), 1);
}

#[test]
fn a_day_of_month_a_shorter_month_lacks_simply_does_not_fire_that_month() {
    let mut d = with_extended_series("2026-01-31", ExtendedRepeat::Monthly { day: 31 });
    assert_eq!(materialize(&mut d, "2026-02-28", 10), 0, "February has no 31st");
    assert_eq!(materialize(&mut d, "2026-03-31", 10), 1);
}

#[test]
fn specific_days_fires_on_any_of_the_chosen_weekdays() {
    // Monday (1) and Wednesday (3), starting Monday 2026-09-14.
    let mut d = with_extended_series("2026-09-14", ExtendedRepeat::SpecificDays { days: vec![1, 3] });
    assert_eq!(materialize(&mut d, "2026-09-15", 10), 0, "tuesday is not chosen");
    assert_eq!(materialize(&mut d, "2026-09-16", 10), 1, "wednesday is chosen");
}

#[test]
fn setting_one_recurrence_kind_clears_the_other() {
    let mut t = task("x", "2026-09-14");
    set_schedule(&mut t, None, Some(Repeat::Daily), 1).unwrap();
    set_extended_repeat(&mut t, Some(ExtendedRepeat::Monthly { day: 1 }), 2).unwrap();
    assert!(t.repeat.is_none(), "legacy repeat survived setting the extended kind");

    set_schedule(&mut t, None, Some(Repeat::Weekdays), 3).unwrap();
    assert!(t.extended_repeat.is_none(), "extended repeat survived setting the legacy kind");
}

#[test]
fn extended_repeat_rejects_an_out_of_range_day_or_weekday() {
    let mut t = task("x", "2026-09-14");
    assert!(set_extended_repeat(&mut t, Some(ExtendedRepeat::Monthly { day: 32 }), 1).is_err());
    assert!(set_extended_repeat(&mut t, Some(ExtendedRepeat::SpecificDays { days: vec![] }), 1).is_err());
    assert!(set_extended_repeat(&mut t, Some(ExtendedRepeat::SpecificDays { days: vec![7] }), 1).is_err());
    assert!(t.extended_repeat.is_none(), "state changed despite the error");
}

#[test]
fn old_vault_without_the_new_fields_opens_the_same() {
    let json = r#"{"tasks":[{"id":"a","title":"t","done":false,"day":"2026-09-14","created_at":1,"updated_at":1}],
                   "notes":[{"id":"n","title":"t","body":"b","created_at":1,"updated_at":1}]}"#;
    let d: VaultData = serde_json::from_str(json).unwrap();
    assert!(d.tasks[0].reminder_time.is_none() && d.tasks[0].repeat.is_none());
    assert!(!d.notes[0].pinned);
}

mod notes {
    use canto_widget_lib::cmd_notes::{file_stem, note_matches, sort, to_markdown, validate_link};
    use canto_widget_lib::error::AppError;
    use canto_widget_lib::model::{Note, NoteLink};

    fn note(id: &str, tags: &[&str], pinned: bool, updated_at: i64) -> Note {
        Note {
            id: id.into(),
            title: format!("nota {id}"),
            tags: tags.iter().map(|t| t.to_string()).collect(),
            pinned,
            updated_at,
            ..Default::default()
        }
    }

    #[test]
    fn pinned_stays_on_top_even_if_older() {
        let mut l =
            vec![note("nova", &[], false, 50), note("velha-fixada", &[], true, 1), note("media", &[], false, 20)];
        sort(&mut l);
        let ids: Vec<_> = l.iter().map(|n| n.id.as_str()).collect();
        assert_eq!(ids, ["velha-fixada", "nova", "media"]);
    }

    #[test]
    fn clicking_a_tag_filters_by_the_exact_tag_not_a_substring() {
        let work = note("a", &["trabalho"], false, 1);
        let trab = note("b", &["trab"], false, 1);
        assert!(note_matches(&work, "#trabalho"));
        assert!(!note_matches(&trab, "#trabalho"));
        assert!(!note_matches(&work, "#trab"), "#tag turned into a substring search");
        assert!(note_matches(&work, "trab"), "free search stopped matching a tag substring");
    }

    #[test]
    fn a_link_needs_both_a_real_id_and_a_label() {
        assert!(validate_link(&NoteLink::Task { id: "t1".into(), label: "comprar leite".into() }).is_ok());
        assert!(matches!(
            validate_link(&NoteLink::Task { id: "  ".into(), label: "comprar leite".into() }),
            Err(AppError::Config(_))
        ));
        assert!(matches!(
            validate_link(&NoteLink::Event { id: "e1".into(), label: " ".into() }),
            Err(AppError::Config(_))
        ));
    }

    #[test]
    fn markdown_export_keeps_title_body_and_tags_readable() {
        let n = Note {
            title: "Wifi de casa".into(),
            body: "senha: 12345".into(),
            tags: vec!["casa".into()],
            ..note("n1", &[], false, 1)
        };
        let md = to_markdown(&n);
        assert!(md.starts_with("# Wifi de casa\n\n"));
        assert!(md.contains("senha: 12345"));
        assert!(md.contains("_tags: casa_"));
    }

    #[test]
    fn export_file_name_is_a_safe_slug_even_for_an_empty_or_symbol_only_title() {
        assert_eq!(file_stem("Reunião c/ Time: Sprint #3!"), "reunião-c-time-sprint-3");
        assert_eq!(file_stem("   "), "nota");
        assert_eq!(file_stem("!!!"), "nota");
    }
}

#[test]
fn completing_via_reminder_never_reopens_an_already_done_task() {
    use canto_widget_lib::commands::complete;
    let mut d = VaultData { tasks: vec![task("a", "2026-09-14")], ..Default::default() };
    assert!(complete(&mut d, "a", 5), "did not complete");
    assert!(!complete(&mut d, "a", 6), "second call changed the vault");
    assert!(d.tasks[0].done);
    assert_eq!(d.tasks[0].updated_at, 5, "timestamp changed with no real change");
    assert!(!complete(&mut d, "inexistente", 7));
}
