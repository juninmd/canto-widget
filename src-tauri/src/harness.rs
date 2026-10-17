//! Catalog of coding-agent harnesses: which CLIs the "Agentes" tab knows, where each one publishes its
//! release notes and the command that installs it. No vault, no network, nothing from the webview but `force`.
use std::ffi::OsStr;
use std::path::{Path, PathBuf};

use serde::Serialize;

use crate::harness_feed::FeedEntry;

/// The package manager a command belongs to; the tool name is a brand, so it stays as it is in every language.
pub struct Method {
    pub tool: &'static str,
    pub command: &'static str,
}

pub struct Harness {
    pub id: &'static str,
    pub name: &'static str,
    /// `owner/name` on GitHub, the only source of the release feed.
    pub repo: &'static str,
    /// Executable looked up in PATH to tell whether the CLI is installed on this machine.
    pub bin: &'static str,
    pub site: &'static str,
    pub install: Method,
}

/// Frozen on purpose: an id coming back from the webview is never turned into a path or a command.
pub const HARNESSES: &[Harness] = &[
    Harness {
        id: "claude",
        name: "Claude Code",
        repo: "anthropics/claude-code",
        bin: "claude",
        site: "https://github.com/anthropics/claude-code",
        install: Method { tool: "npm", command: "npm install -g @anthropic-ai/claude-code" },
    },
    Harness {
        id: "codex",
        name: "Codex CLI",
        repo: "openai/codex",
        bin: "codex",
        site: "https://github.com/openai/codex",
        install: Method { tool: "npm", command: "npm install -g @openai/codex" },
    },
    Harness {
        id: "gemini",
        name: "Gemini CLI",
        repo: "google-gemini/gemini-cli",
        bin: "gemini",
        site: "https://github.com/google-gemini/gemini-cli",
        install: Method { tool: "npm", command: "npm install -g @google/gemini-cli" },
    },
    Harness {
        id: "opencode",
        name: "OpenCode",
        repo: "sst/opencode",
        bin: "opencode",
        site: "https://github.com/sst/opencode",
        install: Method { tool: "npm", command: "npm install -g opencode-ai" },
    },
    Harness {
        id: "copilot",
        name: "GitHub Copilot CLI",
        repo: "github/copilot-cli",
        bin: "copilot",
        site: "https://github.com/github/copilot-cli",
        install: Method { tool: "npm", command: "npm install -g @github/copilot" },
    },
    Harness {
        id: "aider",
        name: "Aider",
        repo: "Aider-AI/aider",
        bin: "aider",
        site: "https://github.com/Aider-AI/aider",
        install: Method { tool: "pipx", command: "pipx install aider-chat" },
    },
];

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct HarnessView {
    pub id: String,
    pub name: String,
    pub repo: String,
    pub site: String,
    pub install_tool: String,
    pub install_command: String,
    pub installed: bool,
    /// Where the executable was found, for the "instalado" line; None when the CLI is missing.
    pub path: Option<String>,
    pub release: Option<crate::harness_feed::Release>,
    /// Set when this harness alone failed to answer: the rest of the list keeps showing.
    pub error: Option<String>,
}

/// Windows resolves `claude` through PATHEXT (`claude.cmd` for an npm install); elsewhere the name is exact.
fn candidates(bin: &str, pathext: &str) -> Vec<String> {
    let mut names = vec![bin.to_string()];
    if cfg!(windows) {
        let lower = bin.to_ascii_lowercase();
        for ext in pathext.split(';').filter(|e| !e.is_empty()) {
            let ext = ext.to_ascii_lowercase();
            if !lower.ends_with(&ext) {
                names.push(format!("{bin}{ext}"));
            }
        }
    }
    names
}

/// First `bin` variant that exists on `path`; `exists` is injected so tests need no files. Per directory the
/// bare name wins over its extensions, the order cmd.exe looks in.
pub fn locate(bin: &str, path: &OsStr, pathext: &str, exists: impl Fn(&Path) -> bool) -> Option<PathBuf> {
    let names = candidates(bin, pathext);
    for dir in std::env::split_paths(path).filter(|d| !d.as_os_str().is_empty()) {
        for name in &names {
            let candidate = dir.join(name);
            if exists(&candidate) {
                return Some(candidate);
            }
        }
    }
    None
}

/// Catalog with the local detection already in it, in catalog order; `merge` adds the release feed.
pub fn views(path: &OsStr, pathext: &str, exists: impl Fn(&Path) -> bool) -> Vec<HarnessView> {
    HARNESSES.iter().map(|h| view(h, locate(h.bin, path, pathext, &exists))).collect()
}

/// Fills the release (or the failure of that one harness) in; both lists are in catalog order.
pub fn merge(mut views: Vec<HarnessView>, feeds: Vec<FeedEntry>) -> Vec<HarnessView> {
    for (view, feed) in views.iter_mut().zip(feeds) {
        view.release = feed.release;
        view.error = feed.error;
    }
    views
}

fn view(h: &Harness, found: Option<PathBuf>) -> HarnessView {
    HarnessView {
        id: h.id.into(),
        name: h.name.into(),
        repo: h.repo.into(),
        site: h.site.into(),
        install_tool: h.install.tool.into(),
        install_command: h.install.command.into(),
        installed: found.is_some(),
        path: found.map(|p| p.to_string_lossy().into_owned()),
        release: None,
        error: None,
    }
}

#[cfg(test)]
#[path = "harness_tests.rs"]
mod tests;
