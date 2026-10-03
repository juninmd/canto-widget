//! What the own-PR alerts decide and say, as pure functions: who is stalled, whose CI just turned red, and the
//! alert each case becomes.
use std::collections::{HashMap, HashSet};

use time::format_description::well_known::Rfc3339;

use crate::calendar::{AgendaItem, Attachment};
use crate::forge::{ChecksStatus, ForgeItem};
use crate::github_failures::FailedJob;
use crate::notification::PR_PREFIX;

/// More stalled PRs than this at once become one summary instead of a stack of pop-ups.
pub const MAX_EACH: usize = 3;
const HOUR_MS: i64 = 3_600_000;

fn hours_since(created_at: &str, now: i64) -> Option<i64> {
    let t = time::OffsetDateTime::parse(created_at, &Rfc3339).ok()?;
    Some((now - (t.unix_timestamp_nanos() / 1_000_000) as i64) / HOUR_MS)
}

/// Open, non-draft PRs that waited at least `hours` since they were opened. The caller already narrowed the
/// search to PRs without any review.
pub fn stalled(items: &[ForgeItem], now: i64, hours: u32) -> Vec<&ForgeItem> {
    items
        .iter()
        .filter(|i| !i.draft && hours_since(&i.created_at, now).is_some_and(|h| h >= i64::from(hours)))
        .collect()
}

/// A stalled PR rings once while it stays stalled; one that got a review and later waits again rings again.
pub fn advance_stalled<'a>(seen: &HashSet<String>, now: &[&'a ForgeItem]) -> (Vec<&'a ForgeItem>, HashSet<String>) {
    let fresh = now.iter().copied().filter(|i| !seen.contains(&i.url)).collect();
    (fresh, now.iter().map(|i| i.url.clone()).collect())
}

/// PRs whose CI is red now and wasn't on the last reading. `None` (first reading) only seeds.
pub fn newly_failing(prev: Option<&HashMap<String, ChecksStatus>>, now: &HashMap<String, ChecksStatus>) -> Vec<String> {
    let Some(prev) = prev else { return Vec::new() };
    let mut out: Vec<String> = now
        .iter()
        .filter(|(k, s)| **s == ChecksStatus::Failure && prev.get(*k) != Some(&ChecksStatus::Failure))
        .map(|(k, _)| k.clone())
        .collect();
    out.sort();
    out
}

/// What a PR whose check failed to answer this time was last known as, so a blip doesn't read as a new failure.
pub fn remember(
    prev: Option<&HashMap<String, ChecksStatus>>,
    now: HashMap<String, ChecksStatus>,
    listed: &HashSet<&str>,
) -> HashMap<String, ChecksStatus> {
    let mut next: HashMap<String, ChecksStatus> =
        prev.into_iter().flatten().filter(|(k, _)| listed.contains(k.as_str())).map(|(k, s)| (k.clone(), *s)).collect();
    next.extend(now);
    next
}

fn base(item: &ForgeItem, kind: &str, tag: &str) -> AgendaItem {
    AgendaItem {
        id: format!("{PR_PREFIX}{kind}:{}", item.reference),
        title: item.title.clone(),
        organizer: item.reference.clone(),
        link: item.url.clone(),
        tag: tag.into(),
        ..Default::default()
    }
}

/// "build · Run tests": the job and, when GitHub says so, the step that broke.
fn job_label(j: &FailedJob) -> String {
    match &j.step {
        Some(step) => format!("{} · {step}", j.name),
        None => j.name.clone(),
    }
}

/// The failed jobs ride along as `attachments`, so the pop-up can list them and open each one.
pub fn ci_event(item: &ForgeItem, jobs: &[FailedJob], en: bool) -> AgendaItem {
    let text = match (jobs.len(), en) {
        (0, true) => "The checks failed on this pull request.".to_string(),
        (0, false) => "O CI falhou neste pull request.".to_string(),
        (n, true) => format!("{n} failed: {}.", jobs.iter().map(|j| j.name.as_str()).collect::<Vec<_>>().join(", ")),
        (n, false) => format!("{n} falhou: {}.", jobs.iter().map(|j| j.name.as_str()).collect::<Vec<_>>().join(", ")),
    };
    let attachments =
        jobs.iter().map(|j| Attachment { title: job_label(j), url: j.url.clone(), mime: String::new() }).collect();
    AgendaItem { description: text, attachments, ..base(item, "ci", "ci") }
}

/// One alert per PR, or a single summary when many are stalled at once.
pub fn stalled_events(fresh: &[&ForgeItem], now: i64, en: bool) -> Vec<AgendaItem> {
    if fresh.len() > MAX_EACH {
        let refs: Vec<&str> = fresh.iter().take(8).map(|i| i.reference.as_str()).collect();
        let title = if en {
            format!("{} PRs without a review", fresh.len())
        } else {
            format!("{} PRs sem revisão", fresh.len())
        };
        return vec![AgendaItem {
            id: format!("{PR_PREFIX}stalled:summary"),
            title,
            description: refs.join("\n"),
            tag: "stalled".into(),
            ..Default::default()
        }];
    }
    fresh
        .iter()
        .map(|i| {
            let h = hours_since(&i.created_at, now).unwrap_or(0);
            let text = if en { format!("No review for {h} h.") } else { format!("Sem revisão há {h} h.") };
            AgendaItem { start: i.created_at.clone(), description: text, ..base(i, "stalled", "stalled") }
        })
        .collect()
}
