//! The smaller own-work alerts as pure functions: something assigned to the user, a reply in a thread they took part
//! in, and a GitLab pipeline that broke on their merge request.
use std::collections::HashMap;

use crate::calendar::{AgendaItem, Sender};
use crate::forge::{ForgeItem, ForgeList};
use crate::gitlab_todos::Mention;
use crate::notification::PR_PREFIX;
use crate::pr_state::{Said, MAX_EACH};

/// Something assigned to the user by someone else; one the user opened and assigned to themselves is no news.
pub fn others_only(mut list: ForgeList, login: &str) -> ForgeList {
    let before = list.items.len();
    list.items.retain(|i| !i.author.eq_ignore_ascii_case(login));
    list.total = list.total.saturating_sub((before - list.items.len()) as u64);
    list
}

fn summary(tag: &str, title: String, lines: Vec<String>) -> AgendaItem {
    AgendaItem {
        id: format!("{PR_PREFIX}{tag}:summary"),
        title,
        description: lines.into_iter().take(8).collect::<Vec<_>>().join("\n"),
        tag: tag.into(),
        ..Default::default()
    }
}

fn base(item: &ForgeItem, tag: &str) -> AgendaItem {
    AgendaItem {
        id: format!("{PR_PREFIX}{tag}:{}", item.reference),
        title: item.title.clone(),
        organizer: item.reference.clone(),
        link: item.url.clone(),
        tag: tag.into(),
        ..Default::default()
    }
}

pub fn assigned_events(fresh: &[&ForgeItem], en: bool) -> Vec<AgendaItem> {
    if fresh.len() > MAX_EACH {
        let title = if en {
            format!("{} items assigned to you", fresh.len())
        } else {
            format!("{} itens atribuídos a você", fresh.len())
        };
        return vec![summary(
            "assigned",
            title,
            fresh.iter().map(|i| format!("{} {}", i.reference, i.title)).collect(),
        )];
    }
    // The pill already says why it rang; who opened it rides as the sender, so the box below stays empty.
    fresh
        .iter()
        .map(|i| {
            let sender = (!i.author.is_empty()).then(|| Sender { login: i.author.clone(), ..Default::default() });
            AgendaItem { sender, start: i.created_at.clone(), ..base(i, "assigned") }
        })
        .collect()
}

/// Threads the user commented on whose last update moved since the previous reading. The first reading only seeds
/// and so does a thread that was not listed before; the memory follows the list, so a closed thread is forgotten.
pub fn advance_replies<'a>(
    prev: Option<&HashMap<String, String>>,
    items: &'a [ForgeItem],
) -> (Vec<&'a ForgeItem>, HashMap<String, String>) {
    let next = items.iter().map(|i| (i.url.clone(), i.updated_at.clone())).collect();
    let Some(prev) = prev else { return (Vec::new(), next) };
    let moved = items.iter().filter(|i| prev.get(&i.url).is_some_and(|at| *at != i.updated_at)).collect();
    (moved, next)
}

pub fn reply_events(found: &[(&ForgeItem, Said)], en: bool) -> Vec<AgendaItem> {
    if found.len() > MAX_EACH {
        let title = if en {
            format!("{} replies in your threads", found.len())
        } else {
            format!("{} respostas nas suas conversas", found.len())
        };
        return vec![summary(
            "reply",
            title,
            found.iter().map(|(i, _)| format!("{} {}", i.reference, i.title)).collect(),
        )];
    }
    found
        .iter()
        .map(|(i, said)| {
            let who = said.sender.as_ref().map(|s| s.login.as_str()).unwrap_or_default();
            let description = match (who, said.text.as_str()) {
                ("", t) => t.to_string(),
                (a, "") => format!("@{a}"),
                (a, t) => format!("@{a}: {t}"),
            };
            AgendaItem { description, sender: said.sender.clone(), ..base(i, "reply") }
        })
        .collect()
}

/// A failed pipeline on the user's MR, from the to-do GitLab raises for it.
pub fn pipeline_events(fresh: &[&Mention], en: bool) -> Vec<AgendaItem> {
    let ci = |m: &Mention| AgendaItem {
        id: format!("{PR_PREFIX}ci:{}", m.url),
        title: m.title.clone(),
        organizer: m.project.clone(),
        link: m.url.clone(),
        tag: "ci".into(),
        description: if en {
            "The pipeline failed on this merge request.".into()
        } else {
            "O pipeline falhou neste MR.".into()
        },
        ..Default::default()
    };
    if fresh.len() > MAX_EACH {
        let title = if en {
            format!("{} pipelines failed", fresh.len())
        } else {
            format!("{} pipelines falharam", fresh.len())
        };
        return vec![summary("ci", title, fresh.iter().map(|m| format!("{} {}", m.project, m.title)).collect())];
    }
    fresh.iter().map(|m| ci(m)).collect()
}

#[cfg(test)]
#[path = "work_events_tests.rs"]
mod tests;
