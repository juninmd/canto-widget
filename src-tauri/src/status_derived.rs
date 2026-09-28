//! Current state for feeds that post every component change as "Component - State" (Site24x7, which hosts
//! Magalu Cloud's page): no status endpoint, but each component's latest item is its state right now.
use std::collections::HashMap;

use crate::status_feed::StatusItem;
use crate::status_live::Live;

/// Sources whose feed is a per-component state log rather than an incident history.
const DERIVED: &[&str] = &["magalu"];
const MAX_DESCRIPTION: usize = 120;

pub fn derives(id: &str) -> bool {
    DERIVED.contains(&id)
}

/// Site24x7's state names, in English and pt-BR; anything else is not a state and is ignored.
fn indicator(state: &str) -> Option<&'static str> {
    let s = state.trim().to_lowercase();
    let has = |words: &[&str]| words.iter().any(|w| s.contains(w));
    if has(&["maintenance", "manutenção", "manutencao"]) {
        Some("maintenance")
    } else if has(&["major outage", "interrupção total", "interrupção grave", "indisponível", "fora do ar"]) {
        Some("critical")
    } else if has(&["partial outage", "interrupção parcial", "outage", "interrupção"]) {
        Some("major")
    } else if has(&["degraded", "degradad", "lentidão"]) {
        Some("minor")
    } else if has(&["operational", "operacional", "resolved", "resolvid", "normalizad"]) {
        Some("none")
    } else {
        None
    }
}

fn rank(indicator: &str) -> u8 {
    match indicator {
        "maintenance" => 1,
        "minor" => 2,
        "major" => 3,
        "critical" => 4,
        _ => 0,
    }
}

/// Worst current state across components; `None` when no item reads as "Component - State".
pub fn live(items: &[StatusItem]) -> Option<Live> {
    let mut latest: HashMap<String, (i64, &'static str, &str)> = HashMap::new();
    for item in items {
        // The component itself may contain " - " ("Magalu Cloud - API - Operational").
        let Some((component, state)) = item.title.rsplit_once(" - ") else { continue };
        let Some(ind) = indicator(state) else { continue };
        let key = component.trim().to_lowercase();
        if latest.get(&key).is_none_or(|(at, ..)| item.published_at > *at) {
            latest.insert(key, (item.published_at, ind, item.title.as_str()));
        }
    }
    let worst = latest.values().map(|(_, ind, _)| *ind).max_by_key(|i| rank(i))?;
    let mut affected: Vec<(&str, &str)> =
        latest.values().filter(|(_, ind, _)| rank(ind) > 0).map(|(_, ind, title)| (*ind, *title)).collect();
    affected.sort_by(|a, b| rank(b.0).cmp(&rank(a.0)).then(a.1.cmp(b.1)));
    let affected: Vec<&str> = affected.into_iter().map(|(_, title)| title).collect();
    let description = if affected.is_empty() { "Operational".to_string() } else { affected.join("; ") };
    Some(Live { indicator: worst.to_string(), description: description.chars().take(MAX_DESCRIPTION).collect() })
}

#[cfg(test)]
#[path = "status_derived_tests.rs"]
mod tests;
