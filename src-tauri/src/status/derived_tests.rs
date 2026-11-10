use super::*;

fn item(title: &str, published_at: i64) -> StatusItem {
    StatusItem { title: title.into(), link: "https://status.magalu.cloud".into(), published_at }
}

#[test]
fn only_state_log_feeds_derive_a_live_state() {
    assert!(derives("magalu"));
    assert!(!derives("github") && !derives("aws"));
}

#[test]
fn every_component_operational_reads_as_none() {
    let items = [item("Block Storage - Operational", 20), item("Magalu Cloud - API - Operacional", 10)];
    assert_eq!(live(&items), Some(Live { indicator: "none".into(), description: "Operational".into() }));
}

#[test]
fn the_latest_item_of_each_component_is_its_current_state() {
    let recovered = [item("Block Storage - Operational", 20), item("Block Storage - Major Outage", 10)];
    assert_eq!(live(&recovered).unwrap().indicator, "none");
    let broke = [item("Block Storage - Major Outage", 20), item("Block Storage - Operational", 10)];
    assert_eq!(live(&broke).unwrap().indicator, "critical");
}

#[test]
fn the_worst_component_wins_and_the_description_lists_the_affected_ones_worst_first() {
    let items = [
        item("Kubernetes - Degraded Performance", 30),
        item("Magalu Cloud - API - Partial Outage", 20),
        item("Block Storage - Operational", 10),
    ];
    let got = live(&items).unwrap();
    assert_eq!(got.indicator, "major");
    assert_eq!(got.description, "Magalu Cloud - API - Partial Outage; Kubernetes - Degraded Performance");
}

#[test]
fn maintenance_is_not_an_outage() {
    let items = [item("Object Storage - Under Maintenance", 10), item("Block Storage - Operational", 10)];
    assert_eq!(live(&items).unwrap().indicator, "maintenance");
}

#[test]
fn titles_that_are_not_a_component_state_are_ignored() {
    assert_eq!(live(&[item("Scheduled update", 10), item("Network - something odd", 5)]), None);
    assert_eq!(live(&[]), None);
}

#[test]
fn a_long_description_is_capped() {
    let items: Vec<_> = (0..20).map(|i| item(&format!("Component {i} - Major Outage"), i)).collect();
    assert_eq!(live(&items).unwrap().description.chars().count(), MAX_DESCRIPTION);
}
