//! Sealed `modelos_ia.json`: the alert choice, the last ranking and the top 10 seen, plus the 3 h floor that
//! keeps the public page from being hammered, whoever asks: the tab, "atualizar" or the watcher.
use serde::{Deserialize, Serialize};

use crate::error::Result;
use crate::models_feed::{FetchError, Model};
use crate::models_rank::{self, Change};
use crate::store::{self, MODELS_AAD};
use crate::vault::AppState;

pub const FLOOR_MS: i64 = 3 * 3_600_000;
pub const BADGE_MS: i64 = 7 * 86_400_000;
/// Bounds what is sealed and sent to the webview; the rest of the list only counts toward `total`.
pub const MAX_LIST: usize = 50;

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum BadgeKind {
    New,
    Up,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Badge {
    pub id: String,
    pub kind: BadgeKind,
    pub at: i64,
}

#[derive(Default, Serialize, Deserialize)]
pub struct ModelsConfig {
    #[serde(default)]
    pub alerts: bool,
    /// Ranked, at most `MAX_LIST`.
    #[serde(default)]
    pub models: Vec<Model>,
    #[serde(default)]
    pub total: usize,
    #[serde(default)]
    pub fetched_at: i64,
    /// Last time the API answered, success or not: what the floor counts from.
    #[serde(default)]
    pub tried_at: i64,
    /// Top 10 ids in order; `None` until the first reading, which only seeds.
    #[serde(default)]
    pub top: Option<Vec<String>>,
    #[serde(default)]
    pub badges: Vec<Badge>,
}

impl AppState {
    pub fn models_config(&self) -> Result<Option<ModelsConfig>> {
        self.sealed(&store::models_path(&self.dir), MODELS_AAD)
    }

    pub fn save_models(&self, cfg: &ModelsConfig) -> Result<()> {
        self.save_sealed(&store::models_path(&self.dir), MODELS_AAD, cfg)
    }
}

/// A clock set backwards must not lock the user out for days.
pub fn due(cfg: &ModelsConfig, now: i64) -> bool {
    cfg.tried_at == 0 || now >= cfg.tried_at + FLOOR_MS || now < cfg.tried_at
}

pub fn next_fetch_at(cfg: &ModelsConfig) -> i64 {
    if cfg.tried_at == 0 {
        0
    } else {
        cfg.tried_at + FLOOR_MS
    }
}

#[derive(Debug, Default, PartialEq)]
pub struct Outcome {
    pub changes: Vec<Change>,
    /// Asked to refresh inside the floor: served from the cache instead.
    pub throttled: bool,
    pub error: Option<String>,
}

/// Calls `fetch` only when the floor allows; a network failure (no answer) doesn't spend the window.
pub fn refresh(
    cfg: &mut ModelsConfig,
    now: i64,
    force: bool,
    fetch: impl FnOnce() -> std::result::Result<Vec<Model>, FetchError>,
) -> Outcome {
    if !due(cfg, now) {
        return Outcome { throttled: force, ..Default::default() };
    }
    let result = fetch();
    if !matches!(result, Err(FetchError::Network(_))) {
        cfg.tried_at = now;
    }
    match result {
        Ok(models) if models.is_empty() => {
            Outcome { error: Some("nenhum modelo com Intelligence Index na página".into()), ..Default::default() }
        }
        Ok(models) => Outcome { changes: apply(cfg, models, now), ..Default::default() },
        Err(e) => Outcome { error: Some(e.message()), ..Default::default() },
    }
}

fn apply(cfg: &mut ModelsConfig, models: Vec<Model>, now: i64) -> Vec<Change> {
    let ranked = models_rank::rank(models);
    let changes = models_rank::diff(cfg.top.as_deref(), &ranked);
    cfg.top = Some(models_rank::top_ids(&ranked));
    cfg.total = ranked.len();
    cfg.models = ranked.into_iter().take(MAX_LIST).collect();
    cfg.fetched_at = now;
    cfg.badges.retain(|b| now - b.at < BADGE_MS && !changes.iter().any(|c| c.id() == b.id));
    cfg.badges.extend(changes.iter().map(|c| Badge {
        id: c.id().to_string(),
        kind: if matches!(c, Change::Entered { .. }) { BadgeKind::New } else { BadgeKind::Up },
        at: now,
    }));
    changes
}

#[derive(Debug, Serialize)]
pub struct Row {
    #[serde(flatten)]
    pub model: Model,
    pub rank: usize,
    pub badge: Option<BadgeKind>,
}

#[derive(Debug, Default, Serialize)]
pub struct ModelsView {
    pub alerts: bool,
    pub models: Vec<Row>,
    pub total: usize,
    pub fetched_at: i64,
    pub next_fetch_at: i64,
    pub throttled: bool,
    pub error: Option<String>,
}

pub fn view(cfg: &ModelsConfig, now: i64, outcome: Outcome) -> ModelsView {
    let badge = |id: &str| cfg.badges.iter().find(|b| b.id == id && now - b.at < BADGE_MS).map(|b| b.kind);
    ModelsView {
        alerts: cfg.alerts,
        models: cfg
            .models
            .iter()
            .enumerate()
            .map(|(i, m)| Row { model: m.clone(), rank: i + 1, badge: badge(&m.id) })
            .collect(),
        total: cfg.total,
        fetched_at: cfg.fetched_at,
        next_fetch_at: next_fetch_at(cfg),
        throttled: outcome.throttled,
        error: outcome.error,
    }
}

#[cfg(test)]
#[path = "models_state_tests.rs"]
mod tests;
