//! Opens the system terminal inside a repository folder: Windows Terminal or `cmd`, Terminal.app, or the first
//! terminal emulator found on Linux.
use std::path::Path;
use std::process::{Command, Stdio};

use crate::error::{AppError, Result};
use crate::lang::tr;

pub type Launch = (&'static str, Vec<String>);

/// Programs to try, in order, for one OS (`windows`, `macos`, anything else is Linux/BSD).
pub fn candidates(os: &str, dir: &str) -> Vec<Launch> {
    let with = |program: &'static str, args: &[&str]| -> Launch {
        (program, args.iter().map(|a| (*a).to_string()).chain(std::iter::once(dir.to_string())).collect())
    };
    let bare =
        |program: &'static str, args: &[&str]| -> Launch { (program, args.iter().map(|a| (*a).to_string()).collect()) };
    match os {
        "windows" => vec![
            with("wt.exe", &["-d"]),
            (("cmd.exe"), ["/C", "start", "", "/D", dir, "cmd.exe"].map(String::from).to_vec()),
        ],
        "macos" => vec![with("open", &["-a", "Terminal"])],
        _ => vec![
            bare("x-terminal-emulator", &[]),
            with("gnome-terminal", &["--working-directory"]),
            with("konsole", &["--workdir"]),
            with("xfce4-terminal", &["--working-directory"]),
            with("kitty", &["--directory"]),
            with("alacritty", &["--working-directory"]),
            bare("xterm", &[]),
        ],
    }
}

pub fn open(dir: &Path) -> Result<()> {
    let text = dir.to_string_lossy().trim_start_matches(r"\\?\").to_string();
    for (program, args) in candidates(std::env::consts::OS, &text) {
        let mut cmd = Command::new(program);
        cmd.args(&args).current_dir(dir).stdin(Stdio::null()).stdout(Stdio::null()).stderr(Stdio::null());
        #[cfg(windows)]
        {
            use std::os::windows::process::CommandExt;
            cmd.creation_flags(0x0800_0000);
        }
        if let Ok(mut child) = cmd.spawn() {
            std::thread::spawn(move || {
                let _ = child.wait();
            });
            return Ok(());
        }
    }
    Err(AppError::Config(tr("nenhum terminal encontrado", "no terminal found").into()))
}

#[cfg(test)]
#[path = "terminal_tests.rs"]
mod tests;
