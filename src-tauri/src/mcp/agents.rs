//! One token per agent, each optionally read-only, plus a memory-only log of what every agent called.
//! The log keeps the tool and the outcome, never the arguments or the data returned: it is there so the owner can
//! see what an agent touched, and must not become a second copy of the vault's content.
use crate::resilient::LockExt;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tauri::State;

use super::{hash_token, new_token, McpState, Perms, View, AGENTS_AAD, AGENTS_FILE};
use crate::error::{AppError, Result};
use crate::model::now_ms;
use crate::vault::AppState;

pub const DEFAULT_ID: &str = "default";
const MAX_AGENTS: usize = 10;
const MAX_NAME: usize = 40;
const MAX_CALLS: usize = 200;

/// A named agent with its own token (only the hash is plain, like the default token's).
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct AgentCfg {
    pub id: String,
    pub name: String,
    pub token_hash: String,
    pub read_only: bool,
}

/// What the request check needs to know about whoever holds a token.
#[derive(Debug, Clone, PartialEq)]
pub struct Cred {
    pub id: String,
    pub name: String,
    pub token_hash: String,
    pub read_only: bool,
}

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct AgentView {
    pub id: String,
    pub name: String,
    pub read_only: bool,
}

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct CallEntry {
    pub at: i64,
    /// Agent name; the shared token reads as "default".
    pub agent: String,
    pub tool: String,
    /// "ok", "error" or "blocked" (switched off, or a write from a read-only agent).
    pub outcome: &'static str,
    pub write: bool,
}

impl Perms {
    /// The same switches with every write turned off.
    pub fn read_only(&self) -> Perms {
        Perms { tasks_write: false, notes_write: false, ..self.clone() }
    }

    /// What this holder may do: a read-only one never writes, whatever the switches say.
    pub fn for_cred(&self, cred: &Cred) -> Perms {
        if cred.read_only {
            self.read_only()
        } else {
            self.clone()
        }
    }
}

/// The holder of `supplied` (hash), compared in constant time against every token.
pub fn identify<'a>(creds: &'a [Cred], supplied: &str) -> Option<&'a Cred> {
    let mut found = None;
    for c in creds {
        if !c.token_hash.is_empty() && super::http::same(supplied, &c.token_hash) {
            found = Some(c);
        }
    }
    found
}

/// Classifies a `tools/call` reply for the log.
pub fn outcome_of(reply: &serde_json::Value) -> &'static str {
    if reply.get("error").is_some() {
        return "error";
    }
    let result = &reply["result"];
    if result["isError"] != true {
        return "ok";
    }
    let text = result["content"][0]["text"].as_str().unwrap_or_default();
    if text.contains("is switched off in Canto") {
        "blocked"
    } else {
        "error"
    }
}

impl McpState {
    pub(super) fn log_call(&self, entry: CallEntry) {
        let mut calls = self.calls.lock_safe();
        if calls.len() >= MAX_CALLS {
            calls.pop_front();
        }
        calls.push_back(entry);
    }

    fn agent_tokens(&self, state: &AppState) -> Result<HashMap<String, String>> {
        match state.sealed::<HashMap<String, String>>(&self.dir.join(AGENTS_FILE), AGENTS_AAD) {
            Ok(tokens) => Ok(tokens.unwrap_or_default()),
            Err(AppError::Locked) => Err(AppError::Locked),
            // Sealed with a previous master password (like the shared token): treated as gone, and re-issued on demand.
            Err(_) => Ok(HashMap::new()),
        }
    }

    fn save_agent_tokens(&self, state: &AppState, tokens: &HashMap<String, String>) -> Result<()> {
        state.save_sealed(&self.dir.join(AGENTS_FILE), AGENTS_AAD, tokens)
    }
}

fn clean_name(raw: &str) -> Result<String> {
    let name: String = raw.split_whitespace().collect::<Vec<_>>().join(" ");
    let len = name.chars().count();
    if len == 0 || len > MAX_NAME {
        return Err(AppError::Config(format!("o nome do agente precisa ter de 1 a {MAX_NAME} caracteres")));
    }
    Ok(name)
}

fn new_id() -> String {
    new_token().trim_start_matches("canto_").chars().filter(|c| c.is_ascii_alphanumeric()).take(8).collect()
}

/// Adds an agent with its own token, sealed with the vault key (so the vault must be open).
#[tauri::command(async)]
pub fn mcp_agent_add(
    mcp: State<'_, McpState>,
    state: State<'_, AppState>,
    name: String,
    read_only: bool,
) -> Result<View> {
    let name = clean_name(&name)?;
    let _one = mcp.change.lock_safe();
    let mut cfg = mcp.cfg.lock_safe().clone();
    if cfg.agents.len() >= MAX_AGENTS {
        return Err(AppError::Config(format!("no máximo {MAX_AGENTS} agentes")));
    }
    let (id, token) = (new_id(), new_token());
    let mut tokens = mcp.agent_tokens(&state)?;
    tokens.insert(id.clone(), token.clone());
    mcp.save_agent_tokens(&state, &tokens)?;
    cfg.agents.push(AgentCfg { id, name, token_hash: hash_token(&token), read_only });
    mcp.save(&cfg)?;
    Ok(super::view(&mcp))
}

#[tauri::command]
pub fn mcp_agent_set_read_only(mcp: State<'_, McpState>, id: String, read_only: bool) -> Result<View> {
    let _one = mcp.change.lock_safe();
    let mut cfg = mcp.cfg.lock_safe().clone();
    if id == DEFAULT_ID {
        cfg.default_read_only = read_only;
    } else {
        cfg.agents.iter_mut().find(|a| a.id == id).ok_or(AppError::NotFound)?.read_only = read_only;
    }
    mcp.save(&cfg)?;
    Ok(super::view(&mcp))
}

/// The token stops working at once (the hash leaves the config); the sealed copy is cleaned up when the vault is open.
#[tauri::command]
pub fn mcp_agent_remove(mcp: State<'_, McpState>, state: State<'_, AppState>, id: String) -> Result<View> {
    let _one = mcp.change.lock_safe();
    let mut cfg = mcp.cfg.lock_safe().clone();
    let before = cfg.agents.len();
    cfg.agents.retain(|a| a.id != id);
    if cfg.agents.len() == before {
        return Err(AppError::NotFound);
    }
    mcp.save(&cfg)?;
    if let Ok(mut tokens) = mcp.agent_tokens(&state) {
        tokens.remove(&id);
        let _ = mcp.save_agent_tokens(&state, &tokens);
    }
    Ok(super::view(&mcp))
}

#[tauri::command(async)]
pub fn mcp_agent_token(mcp: State<'_, McpState>, state: State<'_, AppState>, id: String) -> Result<String> {
    let _one = mcp.change.lock_safe();
    if !mcp.cfg.lock_safe().agents.iter().any(|a| a.id == id) {
        return Err(AppError::NotFound);
    }
    let mut tokens = mcp.agent_tokens(&state)?;
    if let Some(token) = tokens.get(&id) {
        return Ok(token.clone());
    }
    // The sealed copy no longer opens (master password changed): issue a new token, which revokes the old one.
    let token = new_token();
    tokens.insert(id.clone(), token.clone());
    mcp.save_agent_tokens(&state, &tokens)?;
    let mut cfg = mcp.cfg.lock_safe().clone();
    if let Some(a) = cfg.agents.iter_mut().find(|a| a.id == id) {
        a.token_hash = hash_token(&token);
    }
    mcp.save(&cfg)?;
    Ok(token)
}

#[tauri::command]
pub fn mcp_calls(mcp: State<'_, McpState>) -> Vec<CallEntry> {
    mcp.calls.lock_safe().iter().cloned().collect::<Vec<_>>().into_iter().rev().collect()
}

#[tauri::command]
pub fn mcp_calls_clear(mcp: State<'_, McpState>) {
    mcp.calls.lock_safe().clear();
}

pub fn entry(cred: &Cred, tool: &str, outcome: &'static str, write: bool) -> CallEntry {
    CallEntry { at: now_ms(), agent: cred.name.clone(), tool: tool.to_string(), outcome, write }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn cred(id: &str, secret: &str, read_only: bool) -> Cred {
        Cred { id: id.into(), name: id.into(), token_hash: hash_token(secret), read_only }
    }

    #[test]
    fn each_token_identifies_its_own_agent() {
        let all = [cred("default", "a", false), cred("claude", "b", true)];
        assert_eq!(identify(&all, &hash_token("b")).unwrap().id, "claude");
        assert_eq!(identify(&all, &hash_token("a")).unwrap().id, "default");
        assert!(identify(&all, &hash_token("c")).is_none());
        let unset = Cred { token_hash: String::new(), ..cred("x", "x", false) };
        assert!(identify(&[unset], "").is_none(), "a cred with no token never matches");
    }

    #[test]
    fn a_read_only_holder_never_gets_writes_whatever_the_switches_say() {
        let perms = Perms { tasks_write: true, notes_write: true, ..Perms::default() };
        let ro = perms.for_cred(&cred("a", "x", true));
        assert!(!ro.tasks_write && !ro.notes_write && ro.tasks);
        let rw = perms.for_cred(&cred("a", "x", false));
        assert!(rw.tasks_write && rw.notes_write);
    }

    #[test]
    fn outcomes_tell_ok_blocked_and_failed_apart() {
        let ok = json!({"result":{"content":[{"type":"text","text":"{}"}],"isError":false}});
        let off = json!({"result":{"content":[{"type":"text","text":"`create_task` is switched off in Canto (Settings)."}],"isError":true}});
        let bad = json!({"result":{"content":[{"type":"text","text":"boom"}],"isError":true}});
        let proto = json!({"error":{"code":-32602,"message":"unknown tool"}});
        assert_eq!([&ok, &off, &bad, &proto].map(outcome_of), ["ok", "blocked", "error", "error"]);
    }

    #[test]
    fn names_are_trimmed_squeezed_and_bounded() {
        assert_eq!(clean_name("  Claude   Code ").unwrap(), "Claude Code");
        assert!(clean_name("   ").is_err());
        assert!(clean_name(&"x".repeat(41)).is_err());
    }

    #[test]
    fn ids_are_short_and_distinct() {
        let (a, b) = (new_id(), new_id());
        assert_eq!(a.len(), 8);
        assert_ne!(a, b);
    }
}
