//! Health checks of the user's own endpoints: what is watched, what a reading means and when it deserves an alert.
//! Pure, so every rule has a unit test; the probes live in `health_probe` and the timer in `health_watch`.
use std::collections::VecDeque;

use serde::{Deserialize, Serialize};

use crate::error::{AppError, Result};

pub const AAD: &[u8] = b"canto.health.v1";
pub const MAX_ENDPOINTS: usize = 30;
/// Readings kept per endpoint (a few hours at the default interval); memory only.
pub const HISTORY: usize = 120;
/// Consecutive readings that must agree before an alert: one dropped packet is not an outage.
pub const CONFIRM: usize = 2;
pub const CERT_WARN_DAYS: i64 = 14;
const INTERVALS: [u64; 3] = [30, 60, 300];

fn tls_port() -> u16 {
    443
}

/// What gets probed. `Dns` resolves the name, then reads the certificate the server presents on `port`.
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(tag = "kind", rename_all = "lowercase")]
pub enum Target {
    Http {
        url: String,
    },
    Tcp {
        host: String,
        port: u16,
    },
    Dns {
        host: String,
        #[serde(default = "tls_port")]
        port: u16,
    },
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct Endpoint {
    #[serde(default)]
    pub id: String,
    pub name: String,
    #[serde(flatten)]
    pub target: Target,
    pub every_secs: u64,
    pub limit_ms: u32,
    pub alert_down: bool,
    pub alert_slow: bool,
    #[serde(default)]
    pub alert_cert: bool,
}

/// One reading: `ms` is None when the probe failed (`err` says why). `cert_days` only for `Dns`.
#[derive(Clone, Debug, Serialize, PartialEq)]
pub struct Sample {
    pub at: i64,
    pub ms: Option<u32>,
    pub err: Option<String>,
    pub cert_days: Option<i64>,
}

#[derive(Clone, Copy, Debug, Serialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Health {
    Unknown,
    Up,
    Slow,
    Down,
}

fn rank(h: Health) -> u8 {
    match h {
        Health::Unknown | Health::Up => 0,
        Health::Slow => 1,
        Health::Down => 2,
    }
}

pub fn classify(ep: &Endpoint, s: &Sample) -> Health {
    match s.ms {
        None => Health::Down,
        Some(ms) if ms > ep.limit_ms => Health::Slow,
        Some(_) => Health::Up,
    }
}

pub fn health(ep: &Endpoint, history: &VecDeque<Sample>) -> Health {
    history.back().map_or(Health::Unknown, |s| classify(ep, s))
}

fn valid_host(host: &str) -> bool {
    !host.is_empty()
        && host.len() <= 253
        && host.chars().all(|c| c.is_ascii_alphanumeric() || matches!(c, '.' | '-' | '_' | ':' | '[' | ']'))
}

/// Checks everything that came from the webview and returns the cleaned endpoint (trimmed, id left to the caller).
pub fn validate(mut ep: Endpoint) -> Result<Endpoint> {
    let bad = |m: &str| Err(AppError::Config(m.into()));
    ep.name = ep.name.trim().to_string();
    if ep.name.is_empty() || ep.name.chars().count() > 60 {
        return bad("o nome precisa ter de 1 a 60 caracteres");
    }
    if !INTERVALS.contains(&ep.every_secs) {
        return bad("intervalo inválido: use 30 s, 1 min ou 5 min");
    }
    if !(50..=60_000).contains(&ep.limit_ms) {
        return bad("o limite de latência precisa estar entre 50 ms e 60 s");
    }
    match &mut ep.target {
        Target::Http { url } => {
            *url = url.trim().to_string();
            let parsed = url::Url::parse(url).map_err(|_| AppError::Config("endereço inválido".into()))?;
            if !matches!(parsed.scheme(), "http" | "https") || parsed.host_str().is_none() || url.len() > 2000 {
                return bad("use um endereço http:// ou https:// completo");
            }
        }
        Target::Tcp { host, port } | Target::Dns { host, port } => {
            *host = host.trim().to_string();
            if !valid_host(host) {
                return bad("host inválido: só letras, números, ponto e hífen");
            }
            if *port == 0 {
                return bad("a porta precisa estar entre 1 e 65535");
            }
        }
    }
    Ok(ep)
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum AlertKind {
    Down,
    Slow,
    Cert,
}

#[derive(Clone, Debug, PartialEq)]
pub struct Alert {
    pub kind: AlertKind,
    pub reason: String,
}

/// Remembers what was already announced so a bad state alerts once, and again only after recovering.
#[derive(Debug)]
pub struct Tracker {
    announced: Health,
    cert_announced: bool,
}

impl Default for Tracker {
    fn default() -> Self {
        Self { announced: Health::Up, cert_announced: false }
    }
}

impl Tracker {
    /// Call after each new reading; returns what to announce now.
    pub fn observe(&mut self, ep: &Endpoint, history: &VecDeque<Sample>) -> Vec<Alert> {
        let mut out = Vec::new();
        let Some(last) = history.back() else { return out };
        let recent: Vec<Health> = history.iter().rev().take(CONFIRM).map(|s| classify(ep, s)).collect();
        let confirmed = if classify(ep, last) == Health::Up {
            Some(Health::Up)
        } else if recent.len() == CONFIRM && recent.iter().all(|h| *h == Health::Down) {
            Some(Health::Down)
        } else if recent.len() == CONFIRM && recent.iter().all(|h| *h == Health::Slow) {
            Some(Health::Slow)
        } else {
            None
        };
        if let Some(state) = confirmed {
            let worse = rank(state) > rank(self.announced);
            self.announced = state;
            if worse && state == Health::Down && ep.alert_down {
                out.push(Alert { kind: AlertKind::Down, reason: last.err.clone().unwrap_or_default() });
            }
            if worse && state == Health::Slow && ep.alert_slow {
                out.push(Alert {
                    kind: AlertKind::Slow,
                    reason: format!("{} ms > {} ms", last.ms.unwrap_or(0), ep.limit_ms),
                });
            }
        }
        match last.cert_days {
            Some(days) if days <= CERT_WARN_DAYS => {
                if !self.cert_announced && ep.alert_cert {
                    out.push(Alert { kind: AlertKind::Cert, reason: days.to_string() });
                }
                self.cert_announced = true;
            }
            Some(_) => self.cert_announced = false,
            None => {}
        }
        out
    }
}

pub fn push(history: &mut VecDeque<Sample>, s: Sample) {
    history.push_back(s);
    while history.len() > HISTORY {
        history.pop_front();
    }
}

#[cfg(test)]
#[path = "health_tests.rs"]
mod tests;
