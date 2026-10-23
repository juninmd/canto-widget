//! What the Gmail tab can do to its mail: which view to list, and read, star, archive or trash in one go.
use crate::error::{AppError, Result};
use crate::gmail::API;
use crate::google_api::{check_id, client, send};

/// Gmail's own importance marker decides what alerts: the rest only counts.
pub const IMPORTANT_QUERY: &str = "in:inbox is:unread is:important";
const SEARCH_MAX: usize = 100;
/// A batch from the tab is at most what it lists; the cap keeps a tampered call small.
const BATCH_MAX: usize = 50;

fn invalid(what: &'static str, en: &'static str) -> AppError {
    AppError::Config(crate::lang::tr(what, en).into())
}

/// The Gmail `q` for a view, with the user's search appended as plain Gmail search words.
pub fn view_query(view: &str, search: &str) -> Result<String> {
    let base = match view {
        "important" => IMPORTANT_QUERY,
        "unread" => "in:inbox is:unread",
        "starred" => "is:starred",
        "inbox" => "in:inbox",
        _ => return Err(invalid("visão inválida", "invalid view")),
    };
    let search: String = search.chars().filter(|c| !c.is_control()).take(SEARCH_MAX).collect();
    let search = search.trim();
    Ok(if search.is_empty() { base.to_string() } else { format!("{base} {search}") })
}

/// Labels added and removed for an action; `trash` is not a label change and goes through its own endpoint.
pub fn labels_for(action: &str) -> Result<(&'static [&'static str], &'static [&'static str])> {
    Ok(match action {
        "read" => (&[], &["UNREAD"]),
        "unread" => (&["UNREAD"], &[]),
        "star" => (&["STARRED"], &[]),
        "unstar" => (&[], &["STARRED"]),
        "archive" => (&[], &["INBOX"]),
        _ => return Err(invalid("ação inválida", "invalid action")),
    })
}

pub fn check_batch(ids: &[String], action: &str) -> Result<()> {
    if ids.is_empty() || ids.len() > BATCH_MAX {
        return Err(invalid("seleção inválida", "invalid selection"));
    }
    ids.iter().try_for_each(|id| check_id(id))?;
    if action != "trash" {
        labels_for(action)?;
    }
    Ok(())
}

pub fn modify(token: &str, ids: &[String], action: &str) -> Result<()> {
    check_batch(ids, action)?;
    let http = client()?;
    if action == "trash" {
        for id in ids {
            let _: serde::de::IgnoredAny =
                send("gmail", http.post(format!("{API}/messages/{id}/trash")).bearer_auth(token))?;
        }
        return Ok(());
    }
    let (add, remove) = labels_for(action)?;
    let body = serde_json::json!({ "ids": ids, "addLabelIds": add, "removeLabelIds": remove });
    let res = http.post(format!("{API}/messages/batchModify")).bearer_auth(token).json(&body).send();
    // batchModify answers 204 with no body, so it can't go through `send`'s JSON decoding.
    let res = res.map_err(|e| AppError::Drive(e.to_string()))?;
    let status = res.status().as_u16();
    if (200..300).contains(&status) {
        Ok(())
    } else {
        Err(crate::google_api::refusal("gmail", status, &res.text().unwrap_or_default()))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn each_view_is_a_gmail_query_and_a_search_only_adds_words() {
        assert_eq!(view_query("important", "").unwrap(), IMPORTANT_QUERY);
        assert_eq!(view_query("starred", "  fatura ").unwrap(), "is:starred fatura");
        assert_eq!(view_query("unread", "a\nb").unwrap(), "in:inbox is:unread ab");
        assert!(view_query("spam", "").is_err());
    }

    #[test]
    fn archiving_leaves_the_inbox_and_unknown_actions_are_refused() {
        assert_eq!(labels_for("archive").unwrap(), (&[][..], &["INBOX"][..]));
        assert_eq!(labels_for("star").unwrap(), (&["STARRED"][..], &[][..]));
        assert!(labels_for("delete").is_err());
    }

    #[test]
    fn a_batch_must_be_small_and_made_of_safe_ids() {
        let ids = |v: &[&str]| v.iter().map(|s| s.to_string()).collect::<Vec<_>>();
        assert!(check_batch(&ids(&["a1", "b2"]), "trash").is_ok());
        assert!(check_batch(&ids(&["../labels"]), "read").is_err());
        assert!(check_batch(&[], "read").is_err());
        assert!(check_batch(&vec!["a".to_string(); 51], "read").is_err());
        assert!(check_batch(&ids(&["a1"]), "spam").is_err());
    }
}
