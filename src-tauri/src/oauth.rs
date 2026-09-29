use base64::{engine::general_purpose::URL_SAFE_NO_PAD as B64U, Engine};
use rand::{rngs::SysRng, TryRng};
use sha2::{Digest, Sha256};
use std::io::{BufRead, BufReader, Read, Write};
use std::net::{TcpListener, TcpStream};
use std::time::{Duration, Instant};

use crate::error::{AppError, Result};

/// Minimum scope: read-only calendar, identity and the Workspace directory (only for guests' photos); the rest of
/// Drive stays inaccessible.
pub const SCOPE: &str = "https://www.googleapis.com/auth/calendar.events.readonly \
https://www.googleapis.com/auth/directory.readonly openid email profile";
/// A desktop app's client secret isn't confidential to Google; the flow is protected by PKCE + state.
pub fn embedded_client() -> Option<(&'static str, &'static str)> {
    Some((option_env!("CANTO_GOOGLE_CLIENT_ID")?, option_env!("CANTO_GOOGLE_CLIENT_SECRET").unwrap_or("")))
}

pub const AUTH_URL: &str = "https://accounts.google.com/o/oauth2/v2/auth";
pub const TOKEN_URL: &str = "https://oauth2.googleapis.com/token";
const WAIT_TIMEOUT: Duration = Duration::from_secs(180);
/// A preconnected socket that never speaks only holds the wait this long.
const READ_TIMEOUT: Duration = Duration::from_secs(3);
const MAX_REQUEST_LINE: u64 = 8 * 1024;

pub struct Pkce {
    pub verifier: String,
    pub challenge: String,
    pub state: String,
}

impl Default for Pkce {
    fn default() -> Self {
        Self::new()
    }
}

impl Pkce {
    pub fn new() -> Self {
        let verifier = random_b64(64);
        Self { challenge: challenge(&verifier), verifier, state: random_b64(24) }
    }
}

/// S256 method of RFC 7636: base64url(SHA-256(verifier)) without padding.
fn challenge(verifier: &str) -> String {
    B64U.encode(Sha256::digest(verifier.as_bytes()))
}

fn random_b64(bytes: usize) -> String {
    let mut buf = vec![0u8; bytes];
    SysRng.try_fill_bytes(&mut buf).expect("o sistema nao forneceu aleatoriedade");
    B64U.encode(buf)
}

pub struct Loopback {
    listener: TcpListener,
    pub redirect_uri: String,
}

impl Loopback {
    pub fn bind() -> Result<Self> {
        let listener = TcpListener::bind("127.0.0.1:0")?;
        listener.set_nonblocking(true)?;
        let port = listener.local_addr()?.port();
        Ok(Self { redirect_uri: format!("http://127.0.0.1:{port}"), listener })
    }

    /// `state` is checked here: without that, any local page could inject a code from another account on this port.
    /// Browsers preconnect idle sockets and ask for `/favicon.ico`: those are answered 400 and the wait goes on.
    pub fn wait_for_code(&self, expected_state: &str) -> Result<String> {
        let deadline = Instant::now() + WAIT_TIMEOUT;
        loop {
            if Instant::now() > deadline {
                return Err(AppError::Drive("tempo esgotado aguardando o login".into()));
            }
            match self.listener.accept() {
                Ok((stream, _)) => {
                    if let Some(result) = answer(stream, expected_state) {
                        return result;
                    }
                }
                Err(e) if e.kind() == std::io::ErrorKind::WouldBlock => {
                    std::thread::sleep(Duration::from_millis(120));
                }
                // A connection reset before accept completed belongs to someone else: keep waiting.
                Err(_) => std::thread::sleep(Duration::from_millis(120)),
            }
        }
    }
}

/// `None` when the connection isn't the callback (empty, too slow, other path or state).
fn answer(mut stream: TcpStream, expected_state: &str) -> Option<Result<String>> {
    // Accepted sockets inherit non-blocking from the listener on Windows and macOS.
    stream.set_nonblocking(false).ok()?;
    stream.set_read_timeout(Some(READ_TIMEOUT)).ok()?;
    let mut line = String::new();
    let read = BufReader::new((&stream).take(MAX_REQUEST_LINE)).read_line(&mut line);
    let Some(result) = read.ok().and_then(|_| parse_callback(&line, expected_state)) else {
        let _ = write!(stream, "HTTP/1.1 400 Bad Request\r\nContent-Length: 0\r\nConnection: close\r\n\r\n");
        return None;
    };
    let body = match &result {
        Ok(_) => "Conta conectada. Pode fechar esta aba.",
        Err(_) => "Falha no login. Volte ao widget e tente de novo.",
    };
    let _ = write!(
        stream,
        "HTTP/1.1 200 OK\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",
        body.len(),
        body
    );
    Some(result)
}

/// `None` for anything but a request to `/` carrying our `state`; Google's refusal is `Some(Err)`.
fn parse_callback(request_line: &str, expected_state: &str) -> Option<Result<String>> {
    let path = request_line.split_whitespace().nth(1)?;
    let url = url::Url::parse(&format!("http://127.0.0.1{path}")).ok()?;
    if url.path() != "/" {
        return None;
    }
    let mut code = None;
    let mut state = None;
    let mut error = None;
    for (k, v) in url.query_pairs() {
        match k.as_ref() {
            "code" => code = Some(v.to_string()),
            "state" => state = Some(v.to_string()),
            "error" => error = Some(v.to_string()),
            _ => {}
        }
    }
    if state.as_deref() != Some(expected_state) {
        return None;
    }
    if let Some(e) = error {
        return Some(Err(AppError::Drive(format!("login recusado: {e}"))));
    }
    Some(code.ok_or_else(|| AppError::Drive("callback sem authorization code".into())))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn extracts_code_when_state_matches() {
        let line = "GET /?state=abc&code=xyz HTTP/1.1";
        assert_eq!(parse_callback(line, "abc").unwrap().unwrap(), "xyz");
    }

    #[test]
    fn ignores_mismatched_state_other_paths_and_garbage() {
        assert!(parse_callback("GET /?state=intruso&code=xyz HTTP/1.1", "abc").is_none());
        assert!(parse_callback("GET /?error=access_denied&state=intruso HTTP/1.1", "abc").is_none());
        assert!(parse_callback("GET /favicon.ico?state=abc&code=xyz HTTP/1.1", "abc").is_none());
        assert!(parse_callback("", "abc").is_none());
    }

    #[test]
    fn propagates_googles_error() {
        let line = "GET /?error=access_denied&state=abc HTTP/1.1";
        assert!(parse_callback(line, "abc").unwrap().is_err());
    }

    #[test]
    fn stray_connections_before_the_callback_do_not_end_the_login() {
        let loopback = Loopback::bind().unwrap();
        let addr = loopback.listener.local_addr().unwrap();
        let client = std::thread::spawn(move || {
            drop(TcpStream::connect(addr).unwrap());
            let mut stray = TcpStream::connect(addr).unwrap();
            write!(stray, "GET /favicon.ico HTTP/1.1\r\n\r\n").unwrap();
            let mut reply = String::new();
            stray.read_to_string(&mut reply).unwrap();
            assert!(reply.starts_with("HTTP/1.1 400"), "{reply}");
            let mut valid = TcpStream::connect(addr).unwrap();
            write!(valid, "GET /?state=abc&code=xyz HTTP/1.1\r\n\r\n").unwrap();
            let mut reply = String::new();
            valid.read_to_string(&mut reply).unwrap();
            assert!(reply.starts_with("HTTP/1.1 200"), "{reply}");
        });
        assert_eq!(loopback.wait_for_code("abc").unwrap(), "xyz");
        client.join().unwrap();
    }

    #[test]
    fn pkce_challenge_matches_the_rfc_7636_example() {
        let verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
        assert_eq!(challenge(verifier), "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM");
    }

    #[test]
    fn pkce_challenge_is_the_sha256_of_the_verifier() {
        let p = Pkce::new();
        assert_eq!(p.challenge, B64U.encode(Sha256::digest(p.verifier.as_bytes())));
        assert!(p.verifier.len() >= 43 && p.verifier.len() <= 128);
    }
}
