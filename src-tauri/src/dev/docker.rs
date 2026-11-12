//! Docker through its own CLI (`docker ... --format '{{json .}}'`): the same on Windows, macOS and Linux, and no
//! extra crate. The tab only exists while the engine answers, so every read first asks for the server version.
use std::collections::{HashMap, HashSet};

use serde::{Deserialize, Serialize};

use crate::dev::exec::{run, Out, QUICK, SLOW};
use crate::error::{AppError, Result};
use crate::lang::tr;

#[derive(Debug, Clone, Default, Serialize, PartialEq)]
pub struct Container {
    pub id: String,
    pub name: String,
    pub image: String,
    pub state: String,
    pub status: String,
    /// "ok", "bad", "starting" or "" when the image has no health check.
    pub health: String,
    pub ports: Vec<u16>,
    /// The compose project, or "" for a container started by hand.
    pub project: String,
    pub cpu: f32,
    pub mem: u64,
}

#[derive(Debug, Clone, Default, Serialize, PartialEq)]
pub struct Image {
    pub id: String,
    pub name: String,
    pub size: u64,
    pub age: String,
    pub used: bool,
}

#[derive(Debug, Clone, Default, Serialize, PartialEq)]
pub struct Named {
    pub name: String,
    pub detail: String,
    pub used: bool,
}

#[derive(Debug, Clone, Default, Serialize)]
pub struct DockerState {
    pub running: bool,
    pub version: String,
    pub containers: Vec<Container>,
    pub images: Vec<Image>,
    pub volumes: Vec<Named>,
    pub networks: Vec<Named>,
}

#[derive(Deserialize, Default)]
#[serde(default, rename_all = "PascalCase")]
struct PsRow {
    #[serde(rename = "ID")]
    id: String,
    names: String,
    image: String,
    state: String,
    status: String,
    ports: String,
    labels: String,
}

/// "412MB", "1.24GB", "892kB", "41.2MiB": the number and its unit (decimal or binary) into bytes.
pub fn parse_size(text: &str) -> u64 {
    let t = text.trim();
    let at = t.find(|c: char| !(c.is_ascii_digit() || c == '.')).unwrap_or(t.len());
    let n: f64 = t[..at].parse().unwrap_or(0.0);
    let unit = t[at..].trim().to_ascii_lowercase();
    let mult = match unit.as_str() {
        "kb" => 1e3,
        "mb" => 1e6,
        "gb" => 1e9,
        "tb" => 1e12,
        "kib" => 1024.0,
        "mib" => 1048576.0,
        "gib" => 1073741824.0,
        "tib" => 1099511627776.0,
        _ => 1.0,
    };
    (n * mult) as u64
}

/// The host ports out of "0.0.0.0:8080->8080/tcp, :::8080->8080/tcp, 5432/tcp": only published ones count.
pub fn host_ports(text: &str) -> Vec<u16> {
    let mut ports: Vec<u16> =
        text.split(',').filter_map(|p| p.split_once("->")?.0.rsplit(':').next()?.parse().ok()).collect();
    ports.sort_unstable();
    ports.dedup();
    ports
}

pub fn health(status: &str) -> &'static str {
    if status.contains("(unhealthy)") {
        "bad"
    } else if status.contains("(healthy)") {
        "ok"
    } else if status.contains("health: starting") {
        "starting"
    } else {
        ""
    }
}

fn label(labels: &str, key: &str) -> String {
    labels.split(',').find_map(|l| l.strip_prefix(key)?.strip_prefix('=')).unwrap_or_default().to_string()
}

fn rows<T: for<'de> Deserialize<'de>>(text: &str) -> Vec<T> {
    text.lines().filter_map(|l| serde_json::from_str(l.trim()).ok()).collect()
}

pub fn parse_containers(ps: &str, stats: &str) -> Vec<Container> {
    #[derive(Deserialize, Default)]
    #[serde(default, rename_all = "PascalCase")]
    struct Stat {
        name: String,
        #[serde(rename = "CPUPerc")]
        cpu_perc: String,
        mem_usage: String,
    }
    let usage: HashMap<String, Stat> = rows::<Stat>(stats).into_iter().map(|s| (s.name.clone(), s)).collect();
    rows::<PsRow>(ps)
        .into_iter()
        .map(|r| {
            let name = r.names.split(',').next().unwrap_or_default().to_string();
            let u = usage.get(&name);
            Container {
                id: r.id,
                project: label(&r.labels, "com.docker.compose.project"),
                health: health(&r.status).into(),
                ports: host_ports(&r.ports),
                cpu: u.and_then(|u| u.cpu_perc.trim_end_matches('%').parse().ok()).unwrap_or(0.0),
                mem: u.map_or(0, |u| parse_size(u.mem_usage.split('/').next().unwrap_or_default())),
                name,
                image: r.image,
                state: r.state,
                status: r.status,
            }
        })
        .collect()
}

pub fn parse_images(images: &str, in_use: &HashSet<String>) -> Vec<Image> {
    #[derive(Deserialize, Default)]
    #[serde(default, rename_all = "PascalCase")]
    struct Row {
        #[serde(rename = "ID")]
        id: String,
        repository: String,
        tag: String,
        size: String,
        created_since: String,
    }
    rows::<Row>(images)
        .into_iter()
        .map(|r| {
            let name =
                if r.repository == "<none>" { "<none>".to_string() } else { format!("{}:{}", r.repository, r.tag) };
            let used = in_use.contains(&name) || in_use.contains(&r.id) || in_use.iter().any(|u| u.starts_with(&r.id));
            Image { id: r.id, name, size: parse_size(&r.size), age: r.created_since, used }
        })
        .collect()
}

pub fn parse_named(text: &str, key: &str, detail: &str, unused: &HashSet<String>) -> Vec<Named> {
    rows::<serde_json::Value>(text)
        .into_iter()
        .map(|v| {
            let name = v[key].as_str().unwrap_or_default().to_string();
            let used = !unused.contains(&name);
            Named { detail: v[detail].as_str().unwrap_or_default().to_string(), name, used }
        })
        .collect()
}

fn docker(args: &[&str], timeout: std::time::Duration) -> Option<Out> {
    run("docker", args, None, timeout).filter(|o| o.ok)
}

pub fn get() -> DockerState {
    let Some(v) = docker(&["version", "--format", "{{.Server.Version}}"], QUICK) else { return DockerState::default() };
    let out = |args: &[&str]| docker(args, SLOW).map(|o| o.stdout).unwrap_or_default();
    let json = "{{json .}}";
    let ps = out(&["ps", "-a", "--format", json]);
    let stats = out(&["stats", "--no-stream", "--format", json]);
    let in_use: HashSet<String> = rows::<PsRow>(&ps).into_iter().map(|r| r.image).collect();
    let lines = |args: &[&str]| -> HashSet<String> { out(args).lines().map(|l| l.trim().to_string()).collect() };
    DockerState {
        running: true,
        version: v.stdout.trim().to_string(),
        containers: parse_containers(&ps, &stats),
        images: parse_images(&out(&["images", "--format", json]), &in_use),
        volumes: parse_named(
            &out(&["volume", "ls", "--format", json]),
            "Name",
            "Driver",
            &lines(&["volume", "ls", "-f", "dangling=true", "-q"]),
        ),
        networks: parse_named(&out(&["network", "ls", "--format", json]), "Name", "Driver", &HashSet::new()),
    }
}

/// A name or id from the webview goes straight to the CLI, so it can't look like a flag or carry a shell character.
pub fn valid_target(t: &str) -> bool {
    let ok = |c: char| c.is_ascii_alphanumeric() || "_.:/@-".contains(c);
    !t.is_empty() && t.len() <= 255 && t.chars().all(ok) && !t.starts_with(['-', '.'])
}

fn fail(out: Option<Out>) -> AppError {
    let text = out.map(|o| o.message()).filter(|m| !m.is_empty());
    AppError::Config(text.unwrap_or_else(|| tr("o Docker não respondeu", "Docker did not answer").into()))
}

/// start, stop, restart and rm act on a container; rmi on an image; volume-rm on a volume.
pub fn action(kind: &str, target: &str) -> Result<()> {
    if !valid_target(target) {
        return Err(AppError::Config(tr("nome inválido", "invalid name").into()));
    }
    let args: Vec<&str> = match kind {
        "start" | "stop" | "restart" | "rm" | "rmi" => vec![kind, target],
        "volume-rm" => vec!["volume", "rm", target],
        _ => return Err(AppError::Config(tr("ação desconhecida", "unknown action").into())),
    };
    let out = run("docker", &args, None, SLOW);
    if out.as_ref().is_some_and(|o| o.ok) {
        Ok(())
    } else {
        Err(fail(out))
    }
}

pub fn logs(name: &str) -> Result<Vec<String>> {
    if !valid_target(name) {
        return Err(AppError::Config(tr("nome inválido", "invalid name").into()));
    }
    let out = run("docker", &["logs", "--tail", "300", "--timestamps", name], None, QUICK);
    match out {
        Some(o) if o.ok => Ok(format!("{}{}", o.stdout, o.stderr).lines().map(str::to_string).collect()),
        other => Err(fail(other)),
    }
}

/// Everything unused, and what it freed ("Total reclaimed space: 1.2GB").
pub fn prune(kind: &str) -> Result<String> {
    let attempts: &[&[&str]] = match kind {
        "images" => &[&["image", "prune", "-a", "-f"]],
        "volumes" => &[&["volume", "prune", "-a", "-f"], &["volume", "prune", "-f"]],
        _ => return Err(AppError::Config(tr("ação desconhecida", "unknown action").into())),
    };
    let mut last = None;
    for args in attempts {
        let out = run("docker", args, None, SLOW);
        if out.as_ref().is_some_and(|o| o.ok) {
            return Ok(out.map(|o| o.stdout.lines().last().unwrap_or_default().to_string()).unwrap_or_default());
        }
        last = out;
    }
    Err(fail(last))
}

#[cfg(test)]
#[path = "docker_tests.rs"]
mod tests;
