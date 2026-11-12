//! Runs a program with a deadline and returns what it printed. The Dev tab reads the machine through each OS's own
//! tools (`docker`, `git`, `lsof`, `crontab`...), and a stuck one must never freeze the tab.
use std::io::{Read, Write};
use std::process::{Command, Stdio};
use std::time::{Duration, Instant};

/// More than a tab can show; a runaway `docker logs` stops here.
const MAX_OUT: u64 = 4 * 1024 * 1024;

pub struct Out {
    pub ok: bool,
    pub stdout: String,
    pub stderr: String,
}

impl Out {
    /// The text to show after a failure: the tool's own words, or its output when it printed nothing to stderr.
    pub fn message(&self) -> String {
        let text = if self.stderr.trim().is_empty() { &self.stdout } else { &self.stderr };
        text.trim().lines().last().unwrap_or_default().to_string()
    }
}

fn drain<R: Read + Send + 'static>(pipe: Option<R>) -> std::thread::JoinHandle<String> {
    std::thread::spawn(move || {
        let mut buf = Vec::new();
        if let Some(p) = pipe {
            let _ = p.take(MAX_OUT).read_to_end(&mut buf);
        }
        String::from_utf8_lossy(&buf).into_owned()
    })
}

/// `None` when the program is missing or ran past `timeout` (it is killed).
pub fn run(program: &str, args: &[&str], stdin: Option<&str>, timeout: Duration) -> Option<Out> {
    let mut cmd = Command::new(program);
    cmd.args(args).stdin(if stdin.is_some() { Stdio::piped() } else { Stdio::null() });
    cmd.stdout(Stdio::piped()).stderr(Stdio::piped());
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x0800_0000);
    }
    let mut child = cmd.spawn().ok()?;
    if let (Some(text), Some(mut pipe)) = (stdin, child.stdin.take()) {
        let _ = pipe.write_all(text.as_bytes());
    }
    let (out, err) = (drain(child.stdout.take()), drain(child.stderr.take()));
    let started = Instant::now();
    let status = loop {
        match child.try_wait() {
            Ok(Some(s)) => break s,
            Ok(None) if started.elapsed() < timeout => std::thread::sleep(Duration::from_millis(15)),
            _ => {
                let _ = child.kill();
                let _ = child.wait();
                return None;
            }
        }
    };
    Some(Out { ok: status.success(), stdout: out.join().unwrap_or_default(), stderr: err.join().unwrap_or_default() })
}

pub const QUICK: Duration = Duration::from_secs(6);
pub const SLOW: Duration = Duration::from_secs(60);

#[cfg(test)]
mod tests {
    use super::*;

    #[cfg(unix)]
    #[test]
    fn captures_output_and_stdin() {
        let out = run("cat", &[], Some("oi"), QUICK).unwrap();
        assert!(out.ok && out.stdout == "oi");
    }

    #[cfg(unix)]
    #[test]
    fn kills_what_outlives_the_deadline() {
        assert!(run("sleep", &["5"], None, Duration::from_millis(100)).is_none());
    }

    #[test]
    fn a_missing_program_is_none() {
        assert!(run("canto-no-such-tool", &[], None, QUICK).is_none());
    }

    #[test]
    fn message_prefers_stderr() {
        let o = Out { ok: false, stdout: "a".into(), stderr: "x\nerro final\n".into() };
        assert_eq!(o.message(), "erro final");
    }
}
