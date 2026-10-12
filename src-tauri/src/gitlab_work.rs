//! The user's own open merge requests with what changes between readings: the merge state, requested changes and
//! comments. One call for all of them; GitLab puts these fields in the list.
use crate::error::{AppError, Result};
use serde::Deserialize;

use crate::calendar::Sender;
use crate::forge::ForgeItem;
use crate::forge_filter::PER_PAGE;
use crate::gitlab::{client, item, network, response, Account, RawItem};
use crate::mention_sender::excerpt;
use crate::pr_state::{Decision, Merge, PrState, Said};

/// `detailed_merge_status` (and the older `has_conflicts`) in the terms the alerts use.
pub fn merge_of(status: &str, has_conflicts: bool, draft: bool) -> Merge {
    match status {
        _ if draft => Merge::Blocked,
        _ if has_conflicts || status == "conflict" => Merge::Conflict,
        "mergeable" => Merge::Ready,
        "" | "checking" | "unchecked" | "preparing" => Merge::Unknown,
        _ => Merge::Blocked,
    }
}

fn state(b: &RawItem, draft: bool, comments: u64) -> PrState {
    // Approvals sit behind another endpoint (and a paid tier): only an explicit "requested changes" is known.
    let decision = if b.detailed_merge_status == "requested_changes" { Decision::Changes } else { Decision::Pending };
    PrState { decision, merge: merge_of(&b.detailed_merge_status, b.has_conflicts, draft), comments }
}

pub fn my_mrs(acc: &Account) -> Result<Vec<(ForgeItem, PrState)>> {
    let url = url::Url::parse_with_params(
        &format!("{}/api/v4/merge_requests", acc.base),
        [
            ("scope", "created_by_me"),
            ("state", "opened"),
            ("order_by", "updated_at"),
            ("per_page", &PER_PAGE.to_string()),
        ],
    )
    .map_err(|e| AppError::Gitlab(e.to_string()))?;
    let res = client()?.get(url).bearer_auth(acc.token.as_str()).send().map_err(network)?;
    let raw: Vec<RawItem> = response(res)?;
    Ok(raw
        .into_iter()
        .filter_map(|b| {
            let (draft, comments) = (b.draft || b.work_in_progress, b.user_notes_count);
            let st = state(&b, draft, comments);
            item(&acc.base, true, b).map(|i| (i, st))
        })
        .collect())
}

#[derive(Deserialize)]
struct Note {
    #[serde(default)]
    body: String,
    #[serde(default)]
    system: bool,
    #[serde(default)]
    author: Option<crate::gitlab::User>,
}

/// The newest note a person other than `me` wrote ("assigned to...", "added 2 commits" are system notes).
fn newest_other(notes: Vec<Note>, me: &str, max: usize) -> Option<Said> {
    let n = notes
        .into_iter()
        .find(|n| !n.system && n.author.as_ref().is_some_and(|a| !a.username.eq_ignore_ascii_case(me)))?;
    let a = n.author?;
    let sender = Sender { name: a.name, login: a.username, avatar: a.avatar_url.unwrap_or_default() };
    Some(Said { sender: Some(sender), text: excerpt(&n.body, "", max), mentions_me: false })
}

/// One call for the MR's latest notes; `None` when nobody else wrote one, or the call failed.
pub fn latest_note(acc: &Account, item: &ForgeItem, max: usize) -> Option<Said> {
    if !crate::forge::valid_repo_path(&item.repo, 20) {
        return None;
    }
    let url = url::Url::parse_with_params(
        &format!("{}/api/v4/projects/{}/merge_requests/{}/notes", acc.base, item.repo.replace('/', "%2F"), item.number),
        [("sort", "desc"), ("order_by", "created_at"), ("per_page", "20")],
    )
    .ok()?;
    let res = client().ok()?.get(url).bearer_auth(acc.token.as_str()).send().ok()?;
    newest_other(response::<Vec<Note>>(res).ok()?, &acc.username, max)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn gitlab_statuses_map_to_the_alert_states() {
        assert_eq!(merge_of("mergeable", false, false), Merge::Ready);
        assert_eq!(merge_of("conflict", false, false), Merge::Conflict);
        assert_eq!(merge_of("ci_must_pass", true, false), Merge::Conflict, "a conflict wins over a failing pipeline");
        assert_eq!(merge_of("checking", false, false), Merge::Unknown);
        assert_eq!(merge_of("", false, false), Merge::Unknown, "older instances send no status");
        assert_eq!(merge_of("not_approved", false, false), Merge::Blocked);
        assert_eq!(merge_of("mergeable", false, true), Merge::Blocked, "a draft is never ready");
    }

    #[test]
    fn requested_changes_is_the_only_verdict_the_list_knows() {
        let raw: RawItem =
            serde_json::from_str(r#"{"iid":3,"detailed_merge_status":"requested_changes","user_notes_count":4}"#)
                .unwrap();
        let st = state(&raw, false, raw.user_notes_count);
        assert_eq!((st.decision, st.merge, st.comments), (Decision::Changes, Merge::Blocked, 4));
        let plain: RawItem = serde_json::from_str(r#"{"iid":3}"#).unwrap();
        assert_eq!(state(&plain, false, 0).decision, Decision::Pending);
    }

    #[test]
    fn the_newest_note_by_someone_else_is_what_counts() {
        let notes: Vec<Note> = serde_json::from_str(
            r#"[
            {"body":"added 2 commits","system":true,"author":{"username":"ana","name":"Ana"}},
            {"body":"eu mesma  comentei","system":false,"author":{"username":"voce","name":"Você"}},
            {"body":"pode olhar o\n retry?","system":false,"author":{"username":"bia","name":"Bia Lima","avatar_url":"https://git.example.com/uploads/bia.png"}},
            {"body":"antigo","system":false,"author":{"username":"caio","name":"Caio"}}
        ]"#,
        )
        .unwrap();
        let said = newest_other(notes, "VOCE", 100).expect("a note by someone else");
        let who = said.sender.unwrap();
        assert_eq!(
            (who.login.as_str(), who.name.as_str(), who.avatar.as_str()),
            ("bia", "Bia Lima", "https://git.example.com/uploads/bia.png")
        );
        assert_eq!(said.text, "pode olhar o retry?");
        let mine: Vec<Note> = serde_json::from_str(r#"[{"body":"x","author":{"username":"voce"}}]"#).unwrap();
        assert!(newest_other(mine, "voce", 100).is_none(), "my own notes never count");
    }
}
