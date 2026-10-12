//! What happened on one of the user's GitHub PRs: the review verdict, whether it can merge, how many comments, and
//! the newest comment from someone else. Every failure answers `None`: the next reading tries again.
use std::collections::HashMap;

use serde::Deserialize;

use crate::calendar::Sender;
use crate::forge::ForgeItem;
use crate::mention_sender::{excerpt, get, mentions_login, since, Author, Text};
use crate::pr_state::{Decision, Merge, PrState, Said};

/// A verdict's text is a preview, not the whole review.
const VERDICT_CHARS: usize = 160;

#[derive(Deserialize)]
struct Pull {
    #[serde(default)]
    mergeable_state: String,
    #[serde(default)]
    draft: bool,
    #[serde(default)]
    comments: u64,
    #[serde(default)]
    review_comments: u64,
}

#[derive(Deserialize)]
struct Review {
    #[serde(default)]
    user: Option<Author>,
    #[serde(default)]
    state: String,
    #[serde(default)]
    body: Option<String>,
}

/// GitHub works the merge state out lazily: "unknown" just means ask again later.
pub fn merge_of(state: &str, draft: bool) -> Merge {
    match state {
        _ if draft => Merge::Blocked,
        "clean" => Merge::Ready,
        "dirty" => Merge::Conflict,
        "" | "unknown" => Merge::Unknown,
        _ => Merge::Blocked,
    }
}

fn sender(a: &Author) -> Sender {
    Sender { name: String::new(), login: a.login.clone(), avatar: a.avatar_url.clone() }
}

/// The latest decisive review of each reviewer stands (a dismissal clears it); one asking for changes outweighs
/// approvals. The `Said` is the review that set the verdict.
fn decide(reviews: &[Review]) -> (Decision, Said) {
    let mut last: HashMap<&str, &Review> = HashMap::new();
    let mut order: Vec<&str> = Vec::new();
    for r in reviews {
        let Some(user) = r.user.as_ref() else { continue };
        match r.state.as_str() {
            "APPROVED" | "CHANGES_REQUESTED" => {
                last.insert(&user.login, r);
                order.retain(|l| *l != user.login);
                order.push(&user.login);
            }
            "DISMISSED" => {
                last.remove(user.login.as_str());
                order.retain(|l| *l != user.login);
            }
            _ => {}
        }
    }
    let newest = |state: &str| order.iter().rev().filter_map(|l| last.get(l)).find(|r| r.state == state).copied();
    let (decision, review) = match (newest("CHANGES_REQUESTED"), newest("APPROVED")) {
        (Some(r), _) => (Decision::Changes, Some(r)),
        (None, Some(r)) => (Decision::Approved, Some(r)),
        _ => (Decision::Pending, None),
    };
    let said = review.map_or_else(Said::default, |r| Said {
        sender: r.user.as_ref().map(sender),
        text: excerpt(r.body.as_deref().unwrap_or(""), "", VERDICT_CHARS),
        ..Default::default()
    });
    (decision, said)
}

/// Two calls per PR: the pull itself and its reviews.
pub fn state(token: &str, item: &ForgeItem) -> Option<(PrState, Said)> {
    let base = format!("/repos/{}/pulls/{}", item.repo, item.number);
    let pull: Pull = get(token, &base, &[])?;
    let reviews: Vec<Review> = get(token, &format!("{base}/reviews"), &[("per_page", "100")]).unwrap_or_default();
    let (decision, said) = decide(&reviews);
    let merge = merge_of(&pull.mergeable_state, pull.draft);
    Some((PrState { decision, merge, comments: pull.comments + pull.review_comments }, said))
}

/// The newest comment (thread or inline) that someone other than `me` wrote around the last update.
pub fn latest_comment(token: &str, item: &ForgeItem, me: &str, max: usize) -> Option<Said> {
    let from = since(&item.updated_at);
    let mut params = vec![("per_page", "100")];
    if let Some(f) = from.as_deref() {
        params.push(("since", f));
    }
    let mut paths = vec![format!("/repos/{}/issues/{}/comments", item.repo, item.number)];
    if item.is_pr {
        paths.push(format!("/repos/{}/pulls/{}/comments", item.repo, item.number));
    }
    paths.iter().find_map(|p| {
        let texts: Vec<Text> = get(token, p, &params)?;
        let t = texts.into_iter().rev().find(|t| t.user.as_ref().is_some_and(|u| !u.login.eq_ignore_ascii_case(me)))?;
        let body = t.body.as_deref().unwrap_or("");
        Some(Said {
            sender: t.user.as_ref().map(sender),
            text: excerpt(body, "", max),
            mentions_me: mentions_login(body, me),
        })
    })
}

#[cfg(test)]
#[path = "github_thread_tests.rs"]
mod tests;
