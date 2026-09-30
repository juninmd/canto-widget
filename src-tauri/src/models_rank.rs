//! Ranking by the Intelligence Index and what changed in the top 10 between two readings.
use std::cmp::Ordering;

use crate::models_feed::Model;

pub const TOP: usize = 10;
/// More changes than this at once (a model leaving #1 lifts nine others) become one summary banner.
const MAX_EACH: usize = 3;

/// Highest index first; ties by name, then id, so the order never flips between two identical readings.
pub fn rank(mut models: Vec<Model>) -> Vec<Model> {
    models.sort_by(|a, b| {
        b.score
            .partial_cmp(&a.score)
            .unwrap_or(Ordering::Equal)
            .then_with(|| a.name.to_lowercase().cmp(&b.name.to_lowercase()))
            .then_with(|| a.id.cmp(&b.id))
    });
    models
}

/// Ids of the first `TOP` of an already ranked list; position + 1 is the rank.
pub fn top_ids(ranked: &[Model]) -> Vec<String> {
    ranked.iter().take(TOP).map(|m| m.id.clone()).collect()
}

#[derive(Debug, Clone, PartialEq)]
pub enum Change {
    /// A launch or a model climbing from below #10, or coming back after dropping out.
    Entered {
        id: String,
        name: String,
        creator: String,
        rank: usize,
        score: f64,
    },
    Climbed {
        id: String,
        name: String,
        rank: usize,
        old: usize,
    },
}

impl Change {
    pub fn id(&self) -> &str {
        match self {
            Change::Entered { id, .. } | Change::Climbed { id, .. } => id,
        }
    }
}

/// Keyed by id, so a renamed model is the same model. `None` (first reading) only seeds; dropping out is quiet.
pub fn diff(previous: Option<&[String]>, ranked: &[Model]) -> Vec<Change> {
    let Some(previous) = previous else { return Vec::new() };
    ranked
        .iter()
        .take(TOP)
        .enumerate()
        .filter_map(|(i, m)| {
            let rank = i + 1;
            match previous.iter().position(|id| *id == m.id) {
                None => Some(Change::Entered {
                    id: m.id.clone(),
                    name: m.name.clone(),
                    creator: m.creator.clone(),
                    rank,
                    score: m.score,
                }),
                Some(p) if rank < p + 1 => {
                    Some(Change::Climbed { id: m.id.clone(), name: m.name.clone(), rank, old: p + 1 })
                }
                Some(_) => None,
            }
        })
        .collect()
}

/// One decimal at most; `en` is a parameter, not `lang::english()`, so tests don't race on a process-wide flag.
pub fn score_text(score: f64, en: bool) -> String {
    let s = format!("{:.1}", score);
    let s = s.strip_suffix(".0").unwrap_or(&s).to_string();
    if en {
        s
    } else {
        s.replace('.', ",")
    }
}

pub fn message(change: &Change, en: bool) -> (String, String) {
    match (change, en) {
        (Change::Entered { name, creator, rank, score, .. }, en) => {
            let who = if creator.is_empty() { String::new() } else { format!("{creator} · ") };
            let score = score_text(*score, en);
            if en {
                (format!("New in the top 10: {name}"), format!("{who}#{rank} with {score} points"))
            } else {
                (format!("Novo no top 10: {name}"), format!("{who}#{rank} com {score} pontos"))
            }
        }
        (Change::Climbed { name, rank, old, .. }, true) => (format!("{name} rose to #{rank}"), format!("was #{old}")),
        (Change::Climbed { name, rank, old, .. }, false) => {
            (format!("{name} subiu para #{rank}"), format!("antes #{old}"))
        }
    }
}

pub fn messages(changes: &[Change], en: bool) -> Vec<(String, String)> {
    if changes.len() > MAX_EACH {
        let n = changes.len();
        return vec![if en {
            (format!("{n} changes in the AI top 10"), "Open the AI models tab to see them".into())
        } else {
            (format!("{n} mudanças no top 10 de IA"), "Abra a aba Modelos IA para ver".into())
        }];
    }
    changes.iter().map(|c| message(c, en)).collect()
}

#[cfg(test)]
#[path = "models_rank_tests.rs"]
mod tests;
