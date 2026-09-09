use base64::{engine::general_purpose::URL_SAFE_NO_PAD as B64U, Engine};
use rand::RngCore;
use sha2::{Digest, Sha256};
use std::io::{BufRead, BufReader, Write};
use std::net::TcpListener;
use std::time::{Duration, Instant};

use crate::error::{AppError, Result};

/// Escopo minimo para o que o widget faz: pasta privada do app, leitura da agenda
/// e identidade (so para exibir a conta). O resto do Drive continua inacessivel.
pub const SCOPE: &str = "https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/calendar.events.readonly openid email";
pub const AUTH_URL: &str = "https://accounts.google.com/o/oauth2/v2/auth";
pub const TOKEN_URL: &str = "https://oauth2.googleapis.com/token";
const WAIT_TIMEOUT: Duration = Duration::from_secs(180);

pub struct Pkce {
    pub verifier: String,
    pub challenge: String,
    pub state: String,
}

impl Pkce {
    pub fn new() -> Self {
        let verifier = random_b64(64);
        let challenge = B64U.encode(Sha256::digest(verifier.as_bytes()));
        Self {
            verifier,
            challenge,
            state: random_b64(24),
        }
    }
}

fn random_b64(bytes: usize) -> String {
    let mut buf = vec![0u8; bytes];
    rand::rngs::OsRng.fill_bytes(&mut buf);
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
        Ok(Self {
            redirect_uri: format!("http://127.0.0.1:{port}"),
            listener,
        })
    }

    /// Espera o redirect do Google e devolve o authorization code.
    /// O `state` e conferido aqui: sem isso, qualquer pagina local poderia
    /// injetar um code de outra conta nesta porta.
    pub fn wait_for_code(&self, expected_state: &str) -> Result<String> {
        let deadline = Instant::now() + WAIT_TIMEOUT;
        loop {
            if Instant::now() > deadline {
                return Err(AppError::Drive("tempo esgotado aguardando o login".into()));
            }
            match self.listener.accept() {
                Ok((stream, _)) => {
                    let mut reader = BufReader::new(&stream);
                    let mut line = String::new();
                    reader.read_line(&mut line)?;
                    let result = parse_callback(&line, expected_state);
                    let body = match &result {
                        Ok(_) => "Conta conectada. Pode fechar esta aba.",
                        Err(_) => "Falha no login. Volte ao widget e tente de novo.",
                    };
                    let mut stream = stream;
                    let _ = write!(
                        stream,
                        "HTTP/1.1 200 OK\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",
                        body.len(),
                        body
                    );
                    return result;
                }
                Err(e) if e.kind() == std::io::ErrorKind::WouldBlock => {
                    std::thread::sleep(Duration::from_millis(120));
                }
                Err(e) => return Err(e.into()),
            }
        }
    }
}

fn parse_callback(request_line: &str, expected_state: &str) -> Result<String> {
    let path = request_line
        .split_whitespace()
        .nth(1)
        .ok_or_else(|| AppError::Drive("requisicao de callback invalida".into()))?;
    let url = url::Url::parse(&format!("http://127.0.0.1{path}"))
        .map_err(|e| AppError::Drive(e.to_string()))?;
    let mut code = None;
    let mut state = None;
    for (k, v) in url.query_pairs() {
        match k.as_ref() {
            "code" => code = Some(v.to_string()),
            "state" => state = Some(v.to_string()),
            "error" => return Err(AppError::Drive(format!("login recusado: {v}"))),
            _ => {}
        }
    }
    if state.as_deref() != Some(expected_state) {
        return Err(AppError::Drive("state divergente no callback".into()));
    }
    code.ok_or_else(|| AppError::Drive("callback sem authorization code".into()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn extrai_code_quando_state_confere() {
        let line = "GET /?state=abc&code=xyz HTTP/1.1";
        assert_eq!(parse_callback(line, "abc").unwrap(), "xyz");
    }

    #[test]
    fn rejeita_state_divergente() {
        let line = "GET /?state=intruso&code=xyz HTTP/1.1";
        assert!(parse_callback(line, "abc").is_err());
    }

    #[test]
    fn propaga_erro_do_google() {
        let line = "GET /?error=access_denied&state=abc HTTP/1.1";
        assert!(parse_callback(line, "abc").is_err());
    }

    #[test]
    fn pkce_challenge_e_o_sha256_do_verifier() {
        let p = Pkce::new();
        assert_eq!(p.challenge, B64U.encode(Sha256::digest(p.verifier.as_bytes())));
        assert!(p.verifier.len() >= 43 && p.verifier.len() <= 128);
    }
}
