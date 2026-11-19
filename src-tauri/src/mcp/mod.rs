//! Local MCP server: lets coding agents (Claude Code, Codex, OpenCode, Cursor, ...) read a few Canto resources.
//! Off by default, loopback only, bearer token, one switch per resource, read-only until the user says otherwise.
//! The config sits next to the vault; the token itself is sealed with the vault key (only its hash is plain, so
//! the server can check requests while the vault is locked, and it refuses the data until the user unlocks).
pub mod agents;
pub mod http;
pub mod more;
pub mod rpc;
pub mod tools;

use crate::resilient::LockExt;
use std::path::{Path, PathBuf};
use std::sync::atomic::Ordering;
use std::sync::Mutex;

use base64::Engine;
use rand::{rngs::SysRng, TryRng};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use tauri::{AppHandle, Manager, State};

use crate::error::{AppError, Result};
use crate::store;
use crate::vault::AppState;

const FILE: &str = "mcp.json";
const TOKEN_FILE: &str = "mcp_token.json";
const TOKEN_AAD: &[u8] = b"canto-mcp-token-v1";
const AGENTS_FILE: &str = "mcp_agents.json";
const AGENTS_AAD: &[u8] = b"canto-mcp-agents-v1";
pub const DEFAULT_PORT: u16 = 47615;

/// One switch per resource. Reads are on except the private ones (notes, clipboard, e-mail, contacts); writes are off.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(default)]
pub struct Perms {
    pub notifications: bool,
    pub tasks: bool,
    pub notes: bool,
    pub agenda: bool,
    pub prs: bool,
    pub system: bool,
    pub weather: bool,
    pub agents: bool,
    pub models: bool,
    pub status: bool,
    pub market: bool,
    pub mentions: bool,
    pub repos: bool,
    pub steam: bool,
    pub health: bool,
    pub clipboard: bool,
    pub gmail: bool,
    pub contacts: bool,
    pub tasks_write: bool,
    pub notes_write: bool,
    pub notify_write: bool,
    pub actions_write: bool,
}

impl Default for Perms {
    fn default() -> Self {
        Self {
            notifications: true,
            tasks: true,
            notes: false,
            agenda: true,
            prs: true,
            system: true,
            weather: true,
            agents: true,
            models: true,
            status: true,
            market: true,
            mentions: true,
            repos: true,
            steam: true,
            health: true,
            clipboard: false,
            gmail: false,
            contacts: false,
            tasks_write: false,
            notes_write: false,
            notify_write: false,
            actions_write: false,
        }
    }
}

impl Perms {
    pub fn allows(&self, key: &str) -> bool {
        match key {
            "notifications" => self.notifications,
            "tasks" => self.tasks,
            "notes" => self.notes,
            "agenda" => self.agenda,
            "prs" => self.prs,
            "system" => self.system,
            "weather" => self.weather,
            "agents" => self.agents,
            "models" => self.models,
            "status" => self.status,
            "market" => self.market,
            "mentions" => self.mentions,
            "repos" => self.repos,
            "steam" => self.steam,
            "health" => self.health,
            "clipboard" => self.clipboard,
            "gmail" => self.gmail,
            "contacts" => self.contacts,
            "tasks_write" => self.tasks_write,
            "notes_write" => self.notes_write,
            "notify_write" => self.notify_write,
            "actions_write" => self.actions_write,
            _ => false,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(default)]
pub(crate) struct Config {
    enabled: bool,
    port: u16,
    perms: Perms,
    /// SHA-256 of the token, hex. Empty until one is generated.
    token_hash: String,
    /// The shared token above reads but never writes, whatever the write switches say.
    default_read_only: bool,
    /// Agents with a token of their own, each optionally read-only.
    agents: Vec<agents::AgentCfg>,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            enabled: false,
            port: DEFAULT_PORT,
            perms: Perms::default(),
            token_hash: String::new(),
            default_read_only: false,
            agents: Vec::new(),
        }
    }
}

pub fn hash_token(token: &str) -> String {
    Sha256::digest(token.as_bytes()).iter().map(|b| format!("{b:02x}")).collect()
}

/// 256 random bits, URL-safe, with a prefix so secret scanners and people recognise it.
pub fn new_token() -> String {
    let mut bytes = [0u8; 32];
    SysRng.try_fill_bytes(&mut bytes).expect("o sistema nao forneceu aleatoriedade");
    format!("canto_{}", base64::engine::general_purpose::URL_SAFE_NO_PAD.encode(bytes))
}

pub struct McpState {
    dir: PathBuf,
    cfg: Mutex<Config>,
    running: Mutex<Option<http::Running>>,
    error: Mutex<Option<String>>,
    /// Serializes config changes (start/stop, token) so two clicks can't interleave.
    change: Mutex<()>,
    /// What agents called, newest last; memory only, cleared with the app.
    calls: Mutex<std::collections::VecDeque<agents::CallEntry>>,
}

impl McpState {
    pub fn load(dir: &Path) -> Self {
        let cfg: Config = store::read_json(&dir.join(FILE)).ok().flatten().unwrap_or_default();
        Self {
            dir: dir.to_path_buf(),
            cfg: Mutex::new(cfg),
            running: Mutex::new(None),
            error: Mutex::new(None),
            change: Mutex::new(()),
            calls: Mutex::new(Default::default()),
        }
    }

    /// Port, every token that opens the endpoint (the shared one first) and the permission switches.
    pub fn snapshot(&self) -> (u16, Vec<agents::Cred>, Perms) {
        let c = self.cfg.lock_safe();
        let mut creds = vec![agents::Cred {
            id: agents::DEFAULT_ID.into(),
            name: agents::DEFAULT_ID.into(),
            token_hash: c.token_hash.clone(),
            read_only: c.default_read_only,
        }];
        creds.extend(c.agents.iter().map(|a| agents::Cred {
            id: a.id.clone(),
            name: a.name.clone(),
            token_hash: a.token_hash.clone(),
            read_only: a.read_only,
        }));
        (c.port, creds, c.perms.clone())
    }

    fn save(&self, cfg: &Config) -> Result<()> {
        store::write_json_atomic(&self.dir.join(FILE), cfg)?;
        *self.cfg.lock_safe() = cfg.clone();
        Ok(())
    }

    fn stop(&self) {
        if let Some(run) = self.running.lock_safe().take() {
            run.stop.store(true, Ordering::Relaxed);
        }
    }

    /// Stops any listener and starts one when enabled; a port in use is shown in Settings, not fatal.
    fn apply(&self, app: &AppHandle) {
        self.stop();
        let (enabled, port) = {
            let c = self.cfg.lock_safe();
            (c.enabled, c.port)
        };
        *self.error.lock_safe() = None;
        if !enabled {
            return;
        }
        // The old accept loop notices its flag within 50 ms and drops the socket; give it that long.
        std::thread::sleep(std::time::Duration::from_millis(120));
        match http::start(app, port) {
            Ok(run) => *self.running.lock_safe() = Some(run),
            Err(e) => *self.error.lock_safe() = Some(e),
        }
    }

    fn token(&self, state: &AppState) -> Result<Option<String>> {
        state.sealed::<String>(&self.dir.join(TOKEN_FILE), TOKEN_AAD)
    }

    fn fresh_token(&self, state: &AppState) -> Result<String> {
        let token = new_token();
        state.save_sealed(&self.dir.join(TOKEN_FILE), TOKEN_AAD, &token)?;
        let mut cfg = self.cfg.lock_safe().clone();
        cfg.token_hash = hash_token(&token);
        self.save(&cfg)?;
        Ok(token)
    }

    /// The token, made on first use. A sealed file that no longer opens (new vault) is replaced, which
    /// also revokes whatever was configured in the agents before.
    fn ensure_token(&self, state: &AppState) -> Result<String> {
        match self.token(state) {
            Ok(Some(t)) if hash_token(&t) == self.cfg.lock_safe().token_hash => Ok(t),
            Err(AppError::Locked) => Err(AppError::Locked),
            _ => self.fresh_token(state),
        }
    }
}

/// Called once at boot: starts the listener when the user left it on.
pub fn start_if_enabled(app: &AppHandle) {
    let state = app.state::<McpState>();
    let _one = state.change.lock_safe();
    state.apply(app);
}

#[derive(Serialize)]
pub struct View {
    enabled: bool,
    running: bool,
    port: u16,
    endpoint: String,
    perms: Perms,
    error: Option<String>,
    default_read_only: bool,
    agents: Vec<agents::AgentView>,
}

pub(crate) fn view(state: &McpState) -> View {
    let c = state.cfg.lock_safe();
    View {
        enabled: c.enabled,
        running: state.running.lock_safe().is_some(),
        port: c.port,
        endpoint: format!("http://127.0.0.1:{}{}", c.port, http::PATH),
        perms: c.perms.clone(),
        error: state.error.lock_safe().clone(),
        default_read_only: c.default_read_only,
        agents: c
            .agents
            .iter()
            .map(|a| agents::AgentView { id: a.id.clone(), name: a.name.clone(), read_only: a.read_only })
            .collect(),
    }
}

#[tauri::command]
pub fn mcp_get(mcp: State<'_, McpState>) -> View {
    view(&mcp)
}

#[tauri::command(async)]
pub fn mcp_set_enabled(
    app: AppHandle,
    mcp: State<'_, McpState>,
    state: State<'_, AppState>,
    enabled: bool,
) -> Result<View> {
    let _one = mcp.change.lock_safe();
    if enabled {
        mcp.ensure_token(&state)?;
    }
    let mut cfg = mcp.cfg.lock_safe().clone();
    cfg.enabled = enabled;
    mcp.save(&cfg)?;
    mcp.apply(&app);
    Ok(view(&mcp))
}

#[tauri::command]
pub fn mcp_set_perms(mcp: State<'_, McpState>, perms: Perms) -> Result<View> {
    let _one = mcp.change.lock_safe();
    let mut cfg = mcp.cfg.lock_safe().clone();
    cfg.perms = perms;
    mcp.save(&cfg)?;
    Ok(view(&mcp))
}

#[tauri::command(async)]
pub fn mcp_set_port(app: AppHandle, mcp: State<'_, McpState>, port: u16) -> Result<View> {
    if port < 1024 {
        return Err(AppError::Config(
            crate::lang::tr("porta inválida: use 1024 ou mais", "invalid port: use 1024 or higher").into(),
        ));
    }
    let _one = mcp.change.lock_safe();
    let mut cfg = mcp.cfg.lock_safe().clone();
    cfg.port = port;
    mcp.save(&cfg)?;
    mcp.apply(&app);
    Ok(view(&mcp))
}

/// Shown in Settings so the user can copy it into an agent's config; needs the vault open.
#[tauri::command(async)]
pub fn mcp_token_get(mcp: State<'_, McpState>, state: State<'_, AppState>) -> Result<String> {
    let _one = mcp.change.lock_safe();
    mcp.ensure_token(&state)
}

/// The old token stops working at once.
#[tauri::command(async)]
pub fn mcp_token_regenerate(mcp: State<'_, McpState>, state: State<'_, AppState>) -> Result<String> {
    let _one = mcp.change.lock_safe();
    mcp.fresh_token(&state)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn tokens_are_unique_prefixed_and_hashed_deterministically() {
        let (a, b) = (new_token(), new_token());
        assert_ne!(a, b);
        assert!(a.starts_with("canto_") && a.len() > 40);
        assert_eq!(hash_token(&a), hash_token(&a));
        assert_eq!(hash_token(&a).len(), 64);
        assert_ne!(hash_token(&a), hash_token(&b));
    }

    #[test]
    fn a_fresh_install_is_off_read_only_and_keeps_notes_private() {
        let c = Config::default();
        assert!(!c.enabled && c.token_hash.is_empty());
        assert!(
            !c.perms.tasks_write
                && !c.perms.notes_write
                && !c.perms.notify_write
                && !c.perms.actions_write
                && !c.perms.notes
        );
        assert!(!c.perms.clipboard && !c.perms.gmail && !c.perms.contacts);
        assert!(c.perms.tasks && c.perms.notifications);
        assert!(!c.perms.allows("unknown"));
    }

    #[test]
    fn an_older_or_partial_file_fills_the_gaps_with_the_safe_defaults() {
        let c: Config = serde_json::from_str(r#"{"enabled":true}"#).unwrap();
        assert!(c.enabled && c.port == DEFAULT_PORT && !c.perms.tasks_write);
    }
}
