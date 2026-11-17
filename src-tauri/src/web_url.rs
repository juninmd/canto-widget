//! The one gate for http(s) links that come from outside (calendar invites, PR text, shared contacts) before
//! they are opened or stored. A string prefix check let through `https://google.com@evil.example/`, control
//! characters and megabyte-long values; the parsed form does not.
use url::Url;

use crate::error::{AppError, Result};

/// Generous for real links (long query strings), short enough to keep a hostile value out of the OS handler.
pub const MAX_LEN: usize = 2048;

fn unsupported() -> AppError {
    AppError::Config("link não suportado".into())
}

/// Edge spaces trimmed (not newlines: a trailing CRLF is refused like one inside), bounded, http(s) only, no userinfo, with a host. Callers open or store `.as_str()`, the normalized form.
pub fn parse_web_url(raw: &str) -> Result<Url> {
    let raw = raw.trim_matches(' ');
    if raw.len() > MAX_LEN || raw.chars().any(|c| c.is_control() || c.is_whitespace()) {
        return Err(unsupported());
    }
    let url = Url::parse(raw).map_err(|_| unsupported())?;
    let plain = matches!(url.scheme(), "https" | "http")
        && url.username().is_empty()
        && url.password().is_none()
        && url.host_str().is_some_and(|h| !h.is_empty());
    if plain {
        Ok(url)
    } else {
        Err(unsupported())
    }
}

/// For filters over lists of links: the normalized form when valid, `None` otherwise.
pub fn web_url_or_none(raw: &str) -> Option<String> {
    parse_web_url(raw).ok().map(String::from)
}

#[cfg(test)]
#[path = "web_url_tests.rs"]
mod tests;
