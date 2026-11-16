//! Tools that reuse the commands the tabs already call, so each one shows exactly what its tab shows (same
//! caches, same rate limits). Results are trimmed here: an agent needs a screenful, not a whole feed.
use serde::Serialize;
use serde_json::{json, Value};
use tauri::{AppHandle, Manager};

use crate::vault::AppState;

fn limit(args: &Value, default: usize, max: usize) -> usize {
    args.get("limit").and_then(Value::as_u64).map_or(default, |n| (n as usize).clamp(1, max))
}

fn text<'a>(args: &'a Value, key: &str) -> &'a str {
    args.get(key).and_then(Value::as_str).unwrap_or_default()
}

fn json_of<T: Serialize>(v: T) -> Result<Value, String> {
    serde_json::to_value(v).map_err(|e| e.to_string())
}

/// Keeps the first `n` items of the array under `key` and reports how many were left out.
pub fn trim(mut value: Value, key: &str, n: usize) -> Value {
    if let Some(list) = value.get_mut(key).and_then(Value::as_array_mut) {
        let total = list.len();
        list.truncate(n);
        if total > n {
            value["omitted"] = json!(total - n);
        }
    }
    value
}

fn block<F: std::future::Future<Output = T>, T>(f: F) -> T {
    tauri::async_runtime::block_on(f)
}

fn unlocked(app: &AppHandle) -> Result<(), String> {
    if app.state::<AppState>().is_unlocked() {
        Ok(())
    } else {
        Err(crate::lang::tr(
            "o Canto está bloqueado: peça ao usuário para desbloquear",
            "Canto is locked: ask the user to unlock it",
        )
        .into())
    }
}

/// `None` when `name` is not one of these tools.
pub fn call(app: &AppHandle, name: &str, args: &Value) -> Option<Result<Value, String>> {
    // Public feeds work while locked; everything else reads the user's accounts or vault.
    if name != "get_api_status" && name != "get_market" && name != "list_agents" && name != "get_ai_models" {
        if let Err(e) = unlocked(app) {
            return Some(Err(e));
        }
    }
    let state = app.state::<AppState>();
    Some(match name {
        "list_agents" => json_of(block(crate::harness::cmd::harness_list(app.clone(), false))),
        "get_ai_models" => block(crate::models::cmd::models_get(app.clone(), false))
            .map_err(|e| e.to_string())
            .and_then(json_of)
            .map(|v| trim(v, "models", limit(args, 25, 100))),
        "get_api_status" => json_of(block(crate::status::cmd::api_status(app.clone(), false))),
        "get_market" => json_of(block(crate::market::cmd::market_get(app.clone(), false))),
        "list_mentions" => block(crate::mentions::cmd::github_mentions(app.clone(), Some(false)))
            .map_err(|e| e.to_string())
            .and_then(json_of),
        "list_repositories" => block(crate::repos::cmd::github_repos_page(app.clone(), 1, Some(false)))
            .map_err(|e| e.to_string())
            .and_then(json_of),
        "list_steam_deals" => {
            block(crate::steam::cmd::steam_deals(app.clone(), 0, false)).map_err(|e| e.to_string()).and_then(json_of)
        }
        "list_steam_trending" => {
            block(crate::steam::cmd::steam_trending(app.clone(), false)).map_err(|e| e.to_string()).and_then(json_of)
        }
        "list_health" => {
            crate::health::cmd::health_list(state, app.state()).map_err(|e| e.to_string()).and_then(json_of)
        }
        "list_clipboard" => crate::cmd_extras::clip_list(state, text(args, "query").into())
            .map_err(|e| e.to_string())
            .and_then(json_of)
            .map(|mut v| {
                // The revision stamp and pin quota are UI plumbing.
                if let Some(map) = v.as_object_mut() {
                    map.remove("revision");
                    map.remove("max_pinned");
                }
                trim(v, "items", limit(args, 20, 100))
            }),
        "list_emails" => {
            let view = match text(args, "view") {
                "" => "inbox",
                v => v,
            };
            block(crate::google::cmd::gmail_summary(app.clone(), view.into(), text(args, "search").into()))
                .map_err(|e| e.to_string())
                .and_then(json_of)
                .map(|v| trim(v, "important", limit(args, 20, 50)))
        }
        "list_contacts" => block(crate::google::cmd::contacts_list(app.clone()))
            .map_err(|e| e.to_string())
            .and_then(json_of)
            .map(|v| filter_contacts(v, text(args, "query"), limit(args, 20, 100))),
        _ => return None,
    })
}

fn filter_contacts(mut value: Value, query: &str, n: usize) -> Value {
    let needle = crate::text_fold::fold(query.trim());
    if let Some(items) = value.get_mut("items").and_then(Value::as_array_mut) {
        if !needle.is_empty() {
            items.retain(|c| crate::text_fold::contains(&c.to_string(), &needle));
        }
    }
    trim(value, "items", n)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn trim_keeps_the_first_items_and_says_how_many_were_left_out() {
        let v = trim(json!({ "models": [1, 2, 3, 4], "total": 4 }), "models", 2);
        assert_eq!(v["models"], json!([1, 2]));
        assert_eq!(v["omitted"], 2);
        assert!(trim(json!({ "models": [1] }), "models", 2).get("omitted").is_none());
        assert_eq!(trim(json!({}), "models", 2), json!({}));
    }

    #[test]
    fn contacts_are_searched_without_accents_and_capped() {
        let v = json!({ "total": 3, "items": [{ "name": "José Silva" }, { "name": "Ana" }, { "name": "Jose Lima" }] });
        let found = filter_contacts(v.clone(), "jose", 10);
        assert_eq!(found["items"].as_array().unwrap().len(), 2);
        assert_eq!(filter_contacts(v, "", 1)["items"].as_array().unwrap().len(), 1);
    }

    #[test]
    fn limits_are_clamped() {
        assert_eq!(limit(&json!({ "limit": 9999 }), 20, 100), 100);
        assert_eq!(limit(&json!({ "limit": 0 }), 20, 100), 1);
        assert_eq!(limit(&json!({}), 20, 100), 20);
    }
}
