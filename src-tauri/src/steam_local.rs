//! The games installed on this machine, read from the Steam client's own folders: every library
//! listed in `libraryfolders.vdf` and one `appmanifest_<appid>.acf` per installed app. Needs no key
//! and no network, so "jogue agora" shows them even for an account without the Web API key.
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};

/// One installed app, as its manifest describes it.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Installed {
    pub appid: u32,
    pub name: String,
    pub size_bytes: u64,
    /// Unix seconds; 0 when the manifest predates the field or the game never ran.
    pub last_played: i64,
}

/// Tools the client installs on its own: none of them is a game the player picked.
const TOOLS: [u32; 4] = [228980, 1070560, 1391110, 1628350];

/// The value of every `"key" "value"` pair named `key` in a VDF/ACF text, unescaped.
fn values<'a>(text: &'a str, key: &'a str) -> impl Iterator<Item = String> + 'a {
    let quoted = format!("\"{key}\"");
    text.lines().filter_map(move |line| {
        let rest = line.trim_start().strip_prefix(quoted.as_str())?;
        let value = rest.trim().strip_prefix('"')?.strip_suffix('"')?;
        Some(value.replace("\\\\", "\\").replace("\\\"", "\""))
    })
}

fn value(text: &str, key: &str) -> Option<String> {
    values(text, key).next()
}

/// The library roots a `libraryfolders.vdf` lists.
pub fn library_paths(vdf: &str) -> Vec<String> {
    let mut paths: Vec<String> = values(vdf, "path").filter(|p| !p.trim().is_empty()).collect();
    paths.dedup();
    paths
}

/// One manifest, or `None` for a tool, a half-written file or an app still downloading.
pub fn parse_manifest(acf: &str) -> Option<Installed> {
    let appid: u32 = value(acf, "appid")?.parse().ok()?;
    let name = value(acf, "name")?.trim().to_string();
    if appid == 0 || name.is_empty() || TOOLS.contains(&appid) || is_runtime(&name) {
        return None;
    }
    // Bit 4 is "fully installed"; a manifest without flags is an old one and counts as installed.
    let flags: u32 = value(acf, "StateFlags").and_then(|v| v.parse().ok()).unwrap_or(4);
    if flags & 4 == 0 {
        return None;
    }
    Some(Installed {
        appid,
        name,
        size_bytes: value(acf, "SizeOnDisk").and_then(|v| v.parse().ok()).unwrap_or(0),
        last_played: value(acf, "LastPlayed").and_then(|v| v.parse().ok()).unwrap_or(0),
    })
}

fn is_runtime(name: &str) -> bool {
    ["Proton ", "Steam Linux Runtime", "Steamworks Common"].iter().any(|prefix| name.starts_with(prefix))
}

/// Where the client usually lives on each system; the first one that has `steamapps` wins.
fn roots() -> Vec<PathBuf> {
    let home = std::env::var_os("HOME").or_else(|| std::env::var_os("USERPROFILE")).map(PathBuf::from);
    let mut out = Vec::new();
    if cfg!(windows) {
        for var in ["ProgramFiles(x86)", "ProgramFiles"] {
            if let Some(dir) = std::env::var_os(var) {
                out.push(PathBuf::from(dir).join("Steam"));
            }
        }
        out.push(PathBuf::from(r"C:\Program Files (x86)\Steam"));
    } else if let Some(home) = home {
        if cfg!(target_os = "macos") {
            out.push(home.join("Library/Application Support/Steam"));
        } else {
            out.push(home.join(".steam/steam"));
            out.push(home.join(".local/share/Steam"));
            out.push(home.join(".var/app/com.valvesoftware.Steam/.local/share/Steam"));
        }
    }
    out
}

/// Every installed app across the libraries of the first client found. Missing folders are simply
/// no games: a machine without Steam is not an error.
pub fn installed() -> Vec<Installed> {
    let Some(root) = roots().into_iter().find(|r| r.join("steamapps").is_dir()) else {
        return Vec::new();
    };
    let mut libraries = vec![root.clone()];
    if let Ok(vdf) = std::fs::read_to_string(root.join("steamapps/libraryfolders.vdf")) {
        libraries.extend(library_paths(&vdf).into_iter().map(PathBuf::from));
    }
    let mut games: Vec<Installed> = Vec::new();
    for library in libraries {
        for game in scan(&library.join("steamapps")) {
            if !games.iter().any(|g| g.appid == game.appid) {
                games.push(game);
            }
        }
    }
    games
}

fn scan(steamapps: &Path) -> Vec<Installed> {
    let Ok(entries) = std::fs::read_dir(steamapps) else { return Vec::new() };
    entries
        .filter_map(|entry| entry.ok())
        .filter(|entry| {
            let name = entry.file_name();
            let name = name.to_string_lossy();
            name.starts_with("appmanifest_") && name.ends_with(".acf")
        })
        // A manifest is a few hundred bytes; a huge file is not one and is skipped.
        .filter(|entry| entry.metadata().is_ok_and(|m| m.len() < 64 * 1024))
        .filter_map(|entry| std::fs::read_to_string(entry.path()).ok())
        .filter_map(|text| parse_manifest(&text))
        .collect()
}

#[cfg(test)]
#[path = "steam_local_tests.rs"]
mod tests;
