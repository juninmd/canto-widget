//! Scheduled tasks of the machine: the user's `crontab` on Linux and macOS (read, add, switch off, remove) and the
//! Task Scheduler on Windows (read, run, switch off). The crontab is rewritten whole, so the old text is kept aside.
use std::path::Path;
use std::process::{Command, Stdio};

use serde::{Deserialize, Serialize};

use crate::dev::exec::{run, QUICK};
use crate::error::{AppError, Result};
use crate::lang::tr;

const OFF: &str = "#canto-off# ";
const NAME: &str = "# canto: ";

#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct Task {
    pub id: String,
    pub name: String,
    /// The cron expression, or "" for a Windows task (its own triggers aren't one).
    pub expr: String,
    pub command: String,
    pub enabled: bool,
    /// "ok", "failed" or "" when it never ran.
    pub last: String,
    /// When Windows says it runs next (ISO); cron's next runs are computed by the tab.
    pub next: String,
    /// The crontab line as read, to refuse a change if it moved meanwhile.
    pub raw: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct Listing {
    pub platform: &'static str,
    pub available: bool,
    pub can_create: bool,
    pub items: Vec<Task>,
}

fn field_ok(f: &str) -> bool {
    !f.is_empty() && f.chars().all(|c| c.is_ascii_alphanumeric() || "*/,-".contains(c))
}

/// "*/15 9-18 * * 1-5 cmd" or "@reboot cmd" into (expression, command).
pub fn split_line(line: &str) -> Option<(String, String)> {
    let line = line.trim();
    if let Some(rest) = line.strip_prefix('@') {
        let (macro_, cmd) = rest.split_once(char::is_whitespace)?;
        return Some((format!("@{macro_}"), cmd.trim().to_string())).filter(|(_, c)| !c.is_empty());
    }
    let mut parts = line.splitn(6, char::is_whitespace);
    let fields: Vec<&str> = (0..5).filter_map(|_| parts.next()).collect();
    let command = parts.next()?.trim();
    (fields.len() == 5 && fields.iter().all(|f| field_ok(f)) && !command.is_empty())
        .then(|| (fields.join(" "), command.to_string()))
}

fn is_env(line: &str) -> bool {
    line.split_once('=').is_some_and(|(k, _)| !k.is_empty() && k.chars().all(|c| c.is_ascii_alphanumeric() || c == '_'))
}

pub fn parse_crontab(text: &str) -> Vec<Task> {
    let mut out = Vec::new();
    let mut pending = String::new();
    for (i, line) in text.lines().enumerate() {
        if let Some(n) = line.strip_prefix(NAME) {
            pending = n.trim().to_string();
            continue;
        }
        let (enabled, body) = match line.strip_prefix(OFF) {
            Some(rest) => (false, rest),
            None => (true, line),
        };
        let parsed = if body.trim_start().starts_with('#') || is_env(body) { None } else { split_line(body) };
        if let Some((expr, command)) = parsed {
            let name =
                if pending.is_empty() { command.chars().take(40).collect() } else { std::mem::take(&mut pending) };
            out.push(Task {
                id: i.to_string(),
                name,
                expr,
                command,
                enabled,
                last: String::new(),
                next: String::new(),
                raw: line.to_string(),
            });
        }
        pending.clear();
    }
    out
}

fn read_crontab() -> Option<String> {
    let out = run("crontab", &["-l"], None, QUICK)?;
    // "no crontab for user" is an empty one, not a failure.
    if out.ok || out.stderr.contains("no crontab") {
        Some(out.stdout)
    } else {
        None
    }
}

fn write_crontab(lines: &[String], backup: &Path, before: &str) -> Result<()> {
    let _ = crate::store::write_bytes_atomic(backup, before.as_bytes());
    let out = run("crontab", &["-"], Some(&format!("{}\n", lines.join("\n"))), QUICK);
    if out.as_ref().is_some_and(|o| o.ok) {
        return Ok(());
    }
    let msg = out.map(|o| o.message()).unwrap_or_default();
    Err(AppError::Config(if msg.is_empty() {
        tr("não foi possível gravar o crontab", "could not write the crontab").into()
    } else {
        msg
    }))
}

/// The line to change, checked against what the tab saw so a stale list can't hit another entry.
fn locate(lines: &[String], id: &str, raw: &str) -> Result<usize> {
    let i: usize = id.parse().unwrap_or(usize::MAX);
    match lines.get(i) {
        Some(l) if l == raw => Ok(i),
        _ => Err(AppError::Config(
            tr("o crontab mudou; atualize a lista", "the crontab changed; refresh the list").into(),
        )),
    }
}

fn single_line(s: &str) -> bool {
    !s.trim().is_empty() && s.len() <= 500 && !s.contains(['\n', '\r', '\0'])
}

pub fn cron_change(action: &str, id: &str, raw: &str, new: Option<(&str, &str, &str)>, backup: &Path) -> Result<()> {
    let before = read_crontab()
        .ok_or_else(|| AppError::Config(tr("o crontab não está disponível", "crontab is not available").into()))?;
    let mut lines: Vec<String> = before.lines().map(str::to_string).collect();
    match (action, new) {
        ("add", Some((name, expr, command))) => {
            if split_line(&format!("{expr} x"))
                .is_none_or(|(e, _)| e != expr.split_whitespace().collect::<Vec<_>>().join(" "))
                || !single_line(command)
                || !single_line(name)
            {
                return Err(AppError::Config(tr("tarefa inválida", "invalid task").into()));
            }
            lines.extend([format!("{NAME}{}", name.trim()), format!("{} {}", expr.trim(), command.trim())]);
        }
        ("toggle", _) => {
            let i = locate(&lines, id, raw)?;
            lines[i] = match lines[i].strip_prefix(OFF) {
                Some(on) => on.to_string(),
                None => format!("{OFF}{}", lines[i]),
            };
        }
        ("remove", _) => {
            let i = locate(&lines, id, raw)?;
            lines.remove(i);
            if i > 0 && lines[i - 1].starts_with(NAME) {
                lines.remove(i - 1);
            }
        }
        _ => return Err(AppError::Config(tr("ação desconhecida", "unknown action").into())),
    }
    write_crontab(&lines, backup, &before)
}

/// Runs the entry now, detached: a backup job can take minutes.
pub fn cron_run(id: &str, raw: &str) -> Result<()> {
    let text = read_crontab().unwrap_or_default();
    let lines: Vec<String> = text.lines().map(str::to_string).collect();
    let i = locate(&lines, id, raw)?;
    let (_, command) = split_line(lines[i].strip_prefix(OFF).unwrap_or(&lines[i]))
        .ok_or_else(|| AppError::Config(tr("tarefa inválida", "invalid task").into()))?;
    let mut child = Command::new("sh")
        .args(["-c", &command])
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|e| AppError::Config(e.to_string()))?;
    std::thread::spawn(move || {
        let _ = child.wait();
    });
    Ok(())
}

#[derive(Deserialize, Default)]
#[serde(default, rename_all = "PascalCase")]
struct WinTask {
    name: String,
    path: String,
    state: i32,
    command: String,
    next: Option<String>,
    last: Option<String>,
    result: i64,
}

/// `Get-ScheduledTask` as JSON; PowerShell prints one object (not a list) when there is only one task.
pub fn parse_windows(json: &str) -> Vec<Task> {
    let value: serde_json::Value = serde_json::from_str(json.trim().trim_start_matches('\u{feff}')).unwrap_or_default();
    let list = match value {
        serde_json::Value::Array(a) => a,
        serde_json::Value::Object(_) => vec![value],
        _ => Vec::new(),
    };
    list.into_iter()
        .filter_map(|v| serde_json::from_value::<WinTask>(v).ok())
        .filter(|t| !t.name.is_empty())
        .map(|t| Task {
            id: format!("{}{}", t.path, t.name),
            // State 1 is Disabled in the ScheduledTask enum, whatever the system language.
            enabled: t.state != 1,
            last: match (t.last.as_deref().is_some_and(|l| !l.starts_with("1999") && !l.starts_with("0001")), t.result)
            {
                (false, _) => "",
                (true, 0) => "ok",
                (true, _) => "failed",
            }
            .into(),
            next: t.next.unwrap_or_default(),
            command: t.command.trim().to_string(),
            name: t.name,
            expr: String::new(),
            raw: String::new(),
        })
        .collect()
}

const LIST_PS: &str = "$ErrorActionPreference='SilentlyContinue'; $o=@(Get-ScheduledTask | Where-Object { $_.TaskPath -notlike '\\Microsoft\\*' } | ForEach-Object { $i=$_ | Get-ScheduledTaskInfo; $a=$_.Actions | Select-Object -First 1; [pscustomobject]@{Name=$_.TaskName;Path=$_.TaskPath;State=[int]$_.State;Command=(($a.Execute+' '+$a.Arguments).Trim());Next=$(if($i.NextRunTime){$i.NextRunTime.ToString('o')});Last=$(if($i.LastRunTime){$i.LastRunTime.ToString('o')});Result=[int64]$i.LastTaskResult} }); ConvertTo-Json -InputObject $o -Compress";

fn powershell(script: &str) -> Option<crate::dev::exec::Out> {
    run("powershell", &["-NoProfile", "-NonInteractive", "-Command", script], None, crate::dev::exec::SLOW)
}

pub fn list() -> Listing {
    if cfg!(windows) {
        let out = powershell(LIST_PS).filter(|o| o.ok);
        return Listing {
            platform: "windows",
            available: out.is_some(),
            can_create: false,
            items: out.map(|o| parse_windows(&o.stdout)).unwrap_or_default(),
        };
    }
    let text = read_crontab();
    Listing {
        platform: "cron",
        available: text.is_some(),
        can_create: true,
        items: text.map(|t| parse_crontab(&t)).unwrap_or_default(),
    }
}

/// Windows only: run now, switch on or off. The id must be one the system lists right now.
pub fn windows_change(action: &str, id: &str) -> Result<()> {
    let task = list()
        .items
        .into_iter()
        .find(|t| t.id == id)
        .ok_or_else(|| AppError::Config(tr("tarefa não encontrada", "task not found").into()))?;
    let path = id.strip_suffix(&task.name).unwrap_or("\\");
    let quote = |s: &str| format!("'{}'", s.replace('\'', "''"));
    let cmdlet = match action {
        "run" => "Start-ScheduledTask",
        "toggle" if task.enabled => "Disable-ScheduledTask",
        "toggle" => "Enable-ScheduledTask",
        _ => return Err(AppError::Config(tr("ação desconhecida", "unknown action").into())),
    };
    let out =
        powershell(&format!("{cmdlet} -TaskName {} -TaskPath {} -ErrorAction Stop", quote(&task.name), quote(path)));
    if out.as_ref().is_some_and(|o| o.ok) {
        return Ok(());
    }
    Err(AppError::Config(
        out.map(|o| o.message())
            .filter(|m| !m.is_empty())
            .unwrap_or_else(|| tr("o sistema recusou a ação", "the system refused the action").into()),
    ))
}

#[cfg(test)]
#[path = "cron_tests.rs"]
mod tests;
