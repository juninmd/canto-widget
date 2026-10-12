//! What changed on the user's own open PRs/MRs between two readings, as pure functions: a review verdict, the
//! merge state and new comments, and the alert each change becomes.
use std::collections::HashMap;

use crate::calendar::{AgendaItem, Sender};
use crate::forge::ForgeItem;
use crate::notification::PR_PREFIX;

/// More changes than this at once become one summary instead of a stack of pop-ups.
pub const MAX_EACH: usize = 3;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Decision {
    Pending,
    Approved,
    Changes,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Merge {
    /// The forge has not worked it out yet (GitHub computes it lazily): never counts as a change.
    Unknown,
    Ready,
    Conflict,
    Blocked,
}

#[derive(Debug, Clone, PartialEq)]
pub struct PrState {
    pub decision: Decision,
    pub merge: Merge,
    pub comments: u64,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Change {
    Approved,
    Changes,
    Ready,
    Conflict,
    Comments,
}

impl Change {
    pub fn tag(self) -> &'static str {
        match self {
            Change::Approved => "approved",
            Change::Changes => "changes",
            Change::Ready => "ready",
            Change::Conflict => "conflict",
            Change::Comments => "comment",
        }
    }
}

/// Which switches of the settings a change answers to.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Wanted {
    pub reviews: bool,
    pub merge_state: bool,
    pub comments: bool,
}

impl Wanted {
    pub fn allows(self, c: Change) -> bool {
        match c {
            Change::Approved | Change::Changes => self.reviews,
            Change::Ready | Change::Conflict => self.merge_state,
            Change::Comments => self.comments,
        }
    }
}

pub fn changes(prev: &PrState, now: &PrState) -> Vec<Change> {
    let mut out = Vec::new();
    match (prev.decision, now.decision) {
        (a, Decision::Approved) if a != Decision::Approved => out.push(Change::Approved),
        (a, Decision::Changes) if a != Decision::Changes => out.push(Change::Changes),
        _ => {}
    }
    match (prev.merge, now.merge) {
        (a, Merge::Ready) if a != Merge::Ready => out.push(Change::Ready),
        (a, Merge::Conflict) if a != Merge::Conflict => out.push(Change::Conflict),
        _ => {}
    }
    if now.comments > prev.comments {
        out.push(Change::Comments);
    }
    out
}

/// What is remembered of each listed PR, by reference.
pub type Known = HashMap<String, PrState>;
pub type Changed<'a> = (&'a ForgeItem, Vec<Change>);

/// What changed per PR and what to remember. `None` (first reading) only seeds, and so does a PR that was not
/// listed before. A merge state the forge could not tell yet keeps the last known one.
pub fn advance<'a>(prev: Option<&Known>, now: Vec<(&'a ForgeItem, PrState)>) -> (Vec<Changed<'a>>, Known) {
    let mut changed = Vec::new();
    let mut next = HashMap::new();
    for (item, mut state) in now {
        let before = prev.and_then(|p| p.get(&item.reference));
        if state.merge == Merge::Unknown {
            state.merge = before.map_or(Merge::Unknown, |b| b.merge);
        }
        if let Some(before) = before {
            let c = changes(before, &state);
            if !c.is_empty() {
                changed.push((item, c));
            }
        }
        next.insert(item.reference.clone(), state);
    }
    (changed, next)
}

/// A comment count that went up may be the user's own comment: only one by someone else, found by the lookup,
/// counts. A PR left with no change is dropped.
pub fn drop_unheard(changed: &mut Vec<Changed<'_>>, said: &HashMap<(String, Change), Said>) {
    for (item, list) in changed.iter_mut() {
        list.retain(|c| *c != Change::Comments || said.contains_key(&(item.reference.clone(), *c)));
    }
    changed.retain(|(_, list)| !list.is_empty());
}

/// A PR whose lookup failed this time keeps what was known, so a blip never reads as "left the list" and then
/// as a change.
pub fn keep_blips(next: &mut Known, prev: Option<&Known>, listed: &[&ForgeItem]) {
    for item in listed {
        if let (false, Some(old)) = (next.contains_key(&item.reference), prev.and_then(|p| p.get(&item.reference))) {
            next.insert(item.reference.clone(), old.clone());
        }
    }
}

/// Who judged the PR and what they wrote (for a verdict), or who commented last and what they said.
#[derive(Debug, Clone, PartialEq, Default)]
pub struct Said {
    pub sender: Option<Sender>,
    pub text: String,
    /// The text names the user, so the mention alert already covers it.
    pub mentions_me: bool,
}

fn noun(item: &ForgeItem) -> &'static str {
    if item.reference.contains('!') {
        "MR"
    } else {
        "PR"
    }
}

fn by(said: &Said) -> String {
    said.sender.as_ref().map(|s| if s.name.is_empty() { s.login.clone() } else { s.name.clone() }).unwrap_or_default()
}

fn line(c: Change, item: &ForgeItem, said: &Said, ready_too: bool, en: bool) -> String {
    let n = noun(item);
    let who = match by(said) {
        w if w.is_empty() => w,
        w => format!("{w} "),
    };
    match (c, en) {
        (Change::Approved, true) if ready_too => format!("{who}approved; it is ready to merge."),
        (Change::Approved, false) if ready_too => format!("{who}aprovou; está pronto para merge."),
        (Change::Approved, true) => format!("{who}approved this {n}."),
        (Change::Approved, false) => format!("{who}aprovou este {n}."),
        (Change::Changes, true) => format!("{who}requested changes."),
        (Change::Changes, false) => format!("{who}pediu mudanças."),
        (Change::Ready, true) => "Ready to merge: nothing blocks it.".to_string(),
        (Change::Ready, false) => "Pronto para merge: sem bloqueios.".to_string(),
        (Change::Conflict, true) => format!("Conflict with the base branch; update this {n} to merge it."),
        (Change::Conflict, false) => format!("Conflito com a branch base; atualize este {n} para poder fazer merge."),
        (Change::Comments, true) => "New comment.".to_string(),
        (Change::Comments, false) => "Novo comentário.".to_string(),
    }
}

fn event(item: &ForgeItem, c: Change, said: &Said, ready_too: bool, en: bool) -> AgendaItem {
    let mut description = line(if ready_too { Change::Approved } else { c }, item, said, ready_too, en);
    if !said.text.is_empty() {
        description = format!("{description}\n{}", said.text);
    }
    AgendaItem {
        id: format!("{PR_PREFIX}{}:{}", c.tag(), item.reference),
        title: item.title.clone(),
        organizer: item.reference.clone(),
        link: item.url.clone(),
        tag: c.tag().into(),
        description,
        sender: said.sender.clone(),
        ..Default::default()
    }
}

fn label(c: Change, en: bool) -> &'static str {
    match (c, en) {
        (Change::Approved, true) => "approved",
        (Change::Approved, false) => "aprovado",
        (Change::Changes, true) => "changes requested",
        (Change::Changes, false) => "mudanças pedidas",
        (Change::Ready, true) => "ready to merge",
        (Change::Ready, false) => "pronto para merge",
        (Change::Conflict, true) => "conflict",
        (Change::Conflict, false) => "conflito",
        (Change::Comments, true) => "new comment",
        (Change::Comments, false) => "novo comentário",
    }
}

/// One alert per change, or a single summary when many arrive at once. An approval that also made the PR ready
/// is one alert, not two. `said` is looked up by the caller per PR; a missing one leaves the alert without a name.
pub fn events(
    changed: &[Changed],
    said: &HashMap<(String, Change), Said>,
    wanted: Wanted,
    en: bool,
) -> Vec<AgendaItem> {
    let mut each: Vec<(&ForgeItem, Change, bool)> = Vec::new();
    for (item, list) in changed {
        let both = list.contains(&Change::Approved) && list.contains(&Change::Ready);
        for &c in list.iter().filter(|c| wanted.allows(**c)) {
            if both && c == Change::Approved && wanted.allows(Change::Ready) {
                continue;
            }
            each.push((item, c, both && c == Change::Ready));
        }
    }
    let said_of = |item: &ForgeItem, c: Change| {
        let key = (item.reference.clone(), if c == Change::Ready { Change::Approved } else { c });
        said.get(&key).cloned().unwrap_or_default()
    };
    if each.len() > MAX_EACH {
        let title = if en {
            format!("{} updates on your PRs", each.len())
        } else {
            format!("{} novidades nos seus PRs", each.len())
        };
        let lines: Vec<String> =
            each.iter().take(8).map(|(i, c, _)| format!("{} · {}", i.reference, label(*c, en))).collect();
        return vec![AgendaItem {
            id: format!("{PR_PREFIX}updates:summary"),
            title,
            description: lines.join("\n"),
            tag: "updates".into(),
            ..Default::default()
        }];
    }
    each.into_iter().map(|(i, c, ready_too)| event(i, c, &said_of(i, c), ready_too, en)).collect()
}

#[cfg(test)]
#[path = "pr_state_tests.rs"]
mod tests;
