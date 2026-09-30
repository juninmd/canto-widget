use super::*;

fn m(id: &str, name: &str, score: f64) -> Model {
    Model { id: id.into(), name: name.into(), creator: "Lumen Labs".into(), score, price: None, speed: None }
}

/// Twelve models, `a0` best: `a0`..`a9` are the top 10.
fn field() -> Vec<Model> {
    (0..12).map(|i| m(&format!("a{i}"), &format!("Modelo {i:02}"), 90.0 - i as f64)).collect()
}

fn ids(changes: &[Change]) -> Vec<String> {
    changes
        .iter()
        .map(|c| match c {
            Change::Entered { id, rank, .. } => format!("+{id}@{rank}"),
            Change::Climbed { id, rank, old, .. } => format!("^{id}@{old}->{rank}"),
        })
        .collect()
}

fn seen(models: &[Model]) -> Vec<String> {
    top_ids(&rank(models.to_vec()))
}

#[test]
fn ranks_by_index_with_ties_broken_by_name_then_id() {
    let ranked = rank(vec![m("z", "beta", 50.0), m("y", "Alfa", 50.0), m("x", "Gama", 70.0), m("w", "alfa", 50.0)]);
    let order: Vec<&str> = ranked.iter().map(|m| m.id.as_str()).collect();
    assert_eq!(order, ["x", "w", "y", "z"], "case-insensitive name, then id");
}

#[test]
fn the_first_reading_only_seeds() {
    assert!(diff(None, &rank(field())).is_empty());
}

#[test]
fn an_identical_reading_is_quiet() {
    let now = rank(field());
    assert!(diff(Some(&seen(&now)), &now).is_empty());
}

#[test]
fn a_new_launch_entering_the_top_10_is_announced_with_its_rank_and_score() {
    let before = seen(&field());
    let mut now = field();
    now.push(m("novo", "Aurora 4", 88.5));
    let changes = diff(Some(&before), &rank(now));
    assert_eq!(ids(&changes), ["+novo@3"]);
    let Change::Entered { score, creator, .. } = &changes[0] else { panic!() };
    assert_eq!((*score, creator.as_str()), (88.5, "Lumen Labs"));
}

#[test]
fn a_model_climbing_from_below_counts_as_an_entry() {
    let before = seen(&field());
    let mut now = field();
    now[10].score = 95.0;
    assert_eq!(ids(&diff(Some(&before), &rank(now))), ["+a10@1"], "the others only moved down");
}

#[test]
fn a_model_already_in_the_top_10_that_improves_is_a_climb() {
    let before = seen(&field());
    let mut now = field();
    now[5].score = 89.5;
    assert_eq!(ids(&diff(Some(&before), &rank(now))), ["^a5@6->2"]);
}

#[test]
fn dropping_out_is_quiet_but_lifts_the_ones_below() {
    let before = seen(&field());
    let mut now = field();
    now[8].score = 1.0;
    assert_eq!(ids(&diff(Some(&before), &rank(now))), ["^a9@10->9", "+a10@10"]);
}

#[test]
fn a_model_coming_back_after_dropping_out_is_announced_again() {
    let first = field();
    let mut dropped = field();
    dropped[9].score = 1.0;
    let after_drop = seen(&dropped);
    assert!(!after_drop.contains(&"a9".to_string()));
    assert!(ids(&diff(Some(&seen(&first)), &rank(dropped))).contains(&"+a10@10".to_string()));
    assert_eq!(ids(&diff(Some(&after_drop), &rank(field()))), ["+a9@10"]);
}

#[test]
fn a_tie_resolved_by_name_is_stable_between_readings() {
    let mut tied = field();
    tied[3].score = tied[2].score;
    let before = seen(&tied);
    assert!(diff(Some(&before), &rank(tied.clone())).is_empty());
    tied.reverse();
    assert!(diff(Some(&before), &rank(tied)).is_empty(), "input order doesn't matter");
}

#[test]
fn a_renamed_model_keeps_its_place_and_the_new_name_is_used() {
    let before = seen(&field());
    let mut now = field();
    now[4].name = "Nimbus Ultra 2".into();
    assert!(diff(Some(&before), &rank(now.clone())).is_empty(), "same id, same rank: no alert");
    now[4].score = 99.0;
    let changes = diff(Some(&before), &rank(now));
    assert_eq!(message(&changes[0], false).0, "Nimbus Ultra 2 subiu para #1");
}

#[test]
fn messages_in_both_languages() {
    let entered = Change::Entered {
        id: "o".into(),
        name: "Orca Think".into(),
        creator: "Pelagic AI".into(),
        rank: 3,
        score: 71.25,
    };
    assert_eq!(
        message(&entered, false),
        ("Novo no top 10: Orca Think".to_string(), "Pelagic AI · #3 com 71,2 pontos".to_string())
    );
    assert_eq!(message(&entered, true).1, "Pelagic AI · #3 with 71.2 points");
    let climbed = Change::Climbed { id: "n".into(), name: "Nimbus Ultra".into(), rank: 2, old: 5 };
    assert_eq!(message(&climbed, false), ("Nimbus Ultra subiu para #2".to_string(), "antes #5".to_string()));
    assert_eq!(message(&climbed, true), ("Nimbus Ultra rose to #2".to_string(), "was #5".to_string()));
    assert_eq!(score_text(70.0, false), "70");
}

#[test]
fn a_burst_becomes_one_summary() {
    let before = seen(&field());
    let mut now = field();
    now[0].score = 1.0;
    let changes = diff(Some(&before), &rank(now));
    assert_eq!(changes.len(), 10, "nine climbs and one entry");
    assert_eq!(
        messages(&changes, false),
        vec![("10 mudanças no top 10 de IA".into(), "Abra a aba Modelos IA para ver".into())]
    );
    assert_eq!(messages(&changes[..2], false).len(), 2);
}
