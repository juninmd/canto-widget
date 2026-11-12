//! Which process holds which port. Each OS answers differently (`netstat -ano` on Windows, `lsof` on macOS, `ss`
//! on Linux), so the parsers are pure functions over the tool's text and the tab sees one list.
use std::collections::{HashMap, HashSet};

use serde::Serialize;
use sysinfo::{Pid, ProcessRefreshKind, ProcessesToUpdate, RefreshKind, System, UpdateKind};

use crate::dev::exec::{run, QUICK};
use crate::error::{AppError, Result};
use crate::lang::tr;

#[derive(Debug, Clone, PartialEq)]
pub struct Raw {
    pub proto: &'static str,
    pub addr: String,
    pub port: u16,
    pub pid: u32,
}

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct PortEntry {
    pub port: u16,
    pub proto: String,
    pub addr: String,
    pub pid: u32,
    pub ppid: u32,
    pub name: String,
    pub cmd: String,
    /// The process's working folder: its last segment names the project.
    pub cwd: String,
    pub mem: u64,
    /// Reachable from other machines, not only from this one.
    pub exposed: bool,
}

/// `127.0.0.1:3000`, `[::1]:3000`, `*:3000` and `[::]:3000` into address and port.
pub fn split_addr(text: &str) -> Option<(String, u16)> {
    let (addr, port) = text.trim().rsplit_once(':')?;
    let addr = addr.trim_start_matches('[').trim_end_matches(']');
    let addr = if addr == "*" { "0.0.0.0" } else { addr };
    Some((addr.to_string(), port.parse().ok().filter(|p| *p > 0)?))
}

pub fn is_loopback(addr: &str) -> bool {
    addr.starts_with("127.") || addr == "::1" || addr == "localhost"
}

/// Windows words the state ("LISTENING") in the user's language, so a listener is told by its empty foreign address.
pub fn parse_netstat(text: &str) -> Vec<Raw> {
    text.lines()
        .filter_map(|line| {
            let cols: Vec<&str> = line.split_whitespace().collect();
            let (proto, local, pid) = match (cols.first().map(|c| c.to_ascii_uppercase()).as_deref(), cols.len()) {
                (Some("TCP"), 5) if matches!(cols[2], "0.0.0.0:0" | "[::]:0" | "*:0") => ("TCP", cols[1], cols[4]),
                (Some("UDP"), 4) => ("UDP", cols[1], cols[3]),
                _ => return None,
            };
            let (addr, port) = split_addr(local)?;
            Some(Raw { proto, addr, port, pid: pid.parse().ok()? })
        })
        .collect()
}

/// `lsof -nP -iTCP -sTCP:LISTEN -iUDP -FpPn`: a `p` line starts a process, then `P` and `n` come once per socket.
pub fn parse_lsof(text: &str) -> Vec<Raw> {
    let (mut pid, mut proto, mut out) = (0u32, "TCP", Vec::new());
    for line in text.lines() {
        let (tag, rest) = line.split_at(line.chars().next().map_or(0, char::len_utf8));
        match tag {
            "p" => pid = rest.parse().unwrap_or(0),
            "P" => proto = if rest.eq_ignore_ascii_case("UDP") { "UDP" } else { "TCP" },
            "n" if pid > 0 && !rest.contains("->") => {
                if let Some((addr, port)) = split_addr(rest.split(' ').next().unwrap_or(rest)) {
                    out.push(Raw { proto, addr, port, pid });
                }
            }
            _ => {}
        }
    }
    out
}

/// `ss -H -tulnp`: `tcp LISTEN 0 511 0.0.0.0:3000 0.0.0.0:* users:(("node",pid=18432,fd=23))`.
pub fn parse_ss(text: &str) -> Vec<Raw> {
    text.lines()
        .filter_map(|line| {
            let cols: Vec<&str> = line.split_whitespace().collect();
            let proto = if cols.first()?.starts_with("tcp") { "TCP" } else { "UDP" };
            let (addr, port) = split_addr(cols.get(4)?)?;
            let pid = line.split("pid=").nth(1)?.split(|c: char| !c.is_ascii_digit()).next()?.parse().ok()?;
            Some(Raw { proto, addr, port, pid })
        })
        .collect()
}

fn listeners() -> Vec<Raw> {
    if cfg!(windows) {
        return run("netstat", &["-ano"], None, QUICK).map(|o| parse_netstat(&o.stdout)).unwrap_or_default();
    }
    if cfg!(target_os = "linux") {
        if let Some(o) = run("ss", &["-H", "-tulnp"], None, QUICK).filter(|o| o.ok) {
            return parse_ss(&o.stdout);
        }
    }
    let args = ["-nP", "-iTCP", "-sTCP:LISTEN", "-iUDP", "-FpPn"];
    run("lsof", &args, None, QUICK).map(|o| parse_lsof(&o.stdout)).unwrap_or_default()
}

struct Info {
    name: String,
    cmd: String,
    cwd: String,
    ppid: u32,
    mem: u64,
}

fn processes(pids: &HashSet<u32>) -> HashMap<u32, Info> {
    let kind = ProcessRefreshKind::nothing().with_memory().with_cmd(UpdateKind::Always).with_cwd(UpdateKind::Always);
    let Ok(mut sys) = System::new_with_specifics(RefreshKind::nothing()) else { return HashMap::new() };
    sys.refresh_processes_specifics(ProcessesToUpdate::All, true, kind);
    sys.processes()
        .iter()
        .filter(|(p, _)| pids.contains(&p.as_u32()))
        .map(|(p, proc)| {
            let cmd: Vec<String> = proc.cmd().iter().map(|a| a.to_string_lossy().into_owned()).collect();
            let info = Info {
                name: proc.name().to_string_lossy().into_owned(),
                cmd: cmd.join(" "),
                cwd: proc.cwd().map(|c| c.to_string_lossy().into_owned()).unwrap_or_default(),
                ppid: proc.parent().map_or(0, |p| p.as_u32()),
                mem: proc.memory(),
            };
            (p.as_u32(), info)
        })
        .collect()
}

/// One row per (protocol, port, process): `0.0.0.0` and `::` both listening count once, and the wider one wins.
fn merge(raw: Vec<Raw>, info: &HashMap<u32, Info>) -> Vec<PortEntry> {
    let mut seen: HashMap<(&'static str, u16, u32), PortEntry> = HashMap::new();
    for r in raw {
        let i = info.get(&r.pid);
        let entry = PortEntry {
            port: r.port,
            proto: r.proto.into(),
            exposed: !is_loopback(&r.addr),
            addr: r.addr,
            pid: r.pid,
            ppid: i.map_or(0, |i| i.ppid),
            name: i.map_or_else(|| format!("PID {}", r.pid), |i| i.name.clone()),
            cmd: i.map(|i| i.cmd.clone()).unwrap_or_default(),
            cwd: i.map(|i| i.cwd.clone()).unwrap_or_default(),
            mem: i.map_or(0, |i| i.mem),
        };
        let slot = seen.entry((r.proto, r.port, r.pid)).or_insert_with(|| entry.clone());
        if entry.exposed {
            slot.exposed = true;
            slot.addr = entry.addr;
        }
    }
    let mut all: Vec<PortEntry> = seen.into_values().collect();
    all.sort_by(|a, b| a.port.cmp(&b.port).then_with(|| a.proto.cmp(&b.proto)).then_with(|| a.pid.cmp(&b.pid)));
    all
}

pub fn list() -> Vec<PortEntry> {
    let raw = listeners();
    let pids: HashSet<u32> = raw.iter().map(|r| r.pid).collect();
    merge(raw, &processes(&pids))
}

/// The process and, with `tree`, every descendant (a dev server's workers die with it).
fn family(sys: &System, root: u32, tree: bool) -> Vec<Pid> {
    let mut found = vec![Pid::from_u32(root)];
    if tree {
        let mut i = 0;
        while i < found.len() {
            let parent = found[i];
            let kids = sys.processes().values().filter(|p| p.parent() == Some(parent)).map(|p| p.pid());
            let fresh: Vec<Pid> = kids.filter(|k| !found.contains(k)).collect();
            found.extend(fresh);
            i += 1;
        }
    }
    found
}

/// Only a process that holds a port right now, never the app itself or the OS's own (PID 0, 1, 4).
pub fn kill(pid: u32, tree: bool) -> Result<usize> {
    if pid <= 4 || pid == std::process::id() || !list().iter().any(|e| e.pid == pid) {
        return Err(AppError::Config(tr("esse processo não pode ser encerrado", "that process can't be ended").into()));
    }
    let Ok(mut sys) = System::new_with_specifics(RefreshKind::nothing()) else {
        return Err(AppError::Config(tr("não foi possível ler os processos", "could not read the processes").into()));
    };
    sys.refresh_processes_specifics(ProcessesToUpdate::All, true, ProcessRefreshKind::nothing());
    let own = std::process::id();
    let targets = family(&sys, pid, tree);
    let ended =
        targets.iter().rev().filter(|p| p.as_u32() != own).filter_map(|p| sys.process(*p)).filter(|p| p.kill()).count();
    if ended == 0 {
        return Err(AppError::Config(
            tr("o sistema recusou encerrar o processo", "the system refused to end the process").into(),
        ));
    }
    Ok(ended)
}

#[cfg(test)]
#[path = "ports_tests.rs"]
mod tests;
