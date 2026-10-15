//! One reading of an endpoint. Blocking and bounded by `TIMEOUT`; the watcher runs each probe on its own thread.
use std::net::{SocketAddr, TcpStream, ToSocketAddrs};
use std::sync::Arc;
use std::time::{Duration, Instant};

use rustls::client::danger::{HandshakeSignatureValid, ServerCertVerified, ServerCertVerifier};
use rustls::crypto::{ring, CryptoProvider};
use rustls::pki_types::{CertificateDer, ServerName, UnixTime};
use rustls::{ClientConfig, ClientConnection, DigitallySignedStruct, SignatureScheme};

use crate::health::{Endpoint, Sample, Target};
use crate::health_cert;

const TIMEOUT: Duration = Duration::from_secs(8);

fn elapsed_ms(t: Instant) -> u32 {
    t.elapsed().as_millis().min(u32::MAX as u128) as u32
}

pub fn probe(ep: &Endpoint, now_ms: i64) -> Sample {
    let (ms, cert_days) = match &ep.target {
        Target::Http { url } => (http(url), None),
        Target::Tcp { host, port } => (tcp(host, *port), None),
        Target::Dns { host, port } => dns_and_cert(host, *port, now_ms / 1000),
    };
    match ms {
        Ok(ms) => Sample { at: now_ms, ms: Some(ms), err: None, cert_days },
        Err(e) => Sample { at: now_ms, ms: None, err: Some(e), cert_days },
    }
}

fn http(url: &str) -> Result<u32, String> {
    let client =
        crate::net::client_builder().user_agent("canto-widget").timeout(TIMEOUT).build().map_err(|e| e.to_string())?;
    let start = Instant::now();
    let resp = client.get(url).send().map_err(|e| short(&e.without_url().to_string()))?;
    let ms = elapsed_ms(start);
    let status = resp.status();
    if status.as_u16() >= 400 {
        return Err(format!("HTTP {}", status.as_u16()));
    }
    Ok(ms)
}

fn resolve(host: &str, port: u16) -> Result<(Vec<SocketAddr>, u32), String> {
    let start = Instant::now();
    let addrs: Vec<SocketAddr> =
        (host, port).to_socket_addrs().map_err(|_| "o nome não resolve".to_string())?.collect();
    if addrs.is_empty() {
        return Err("o nome não resolve".into());
    }
    Ok((addrs, elapsed_ms(start)))
}

fn tcp(host: &str, port: u16) -> Result<u32, String> {
    let (addrs, _) = resolve(host, port)?;
    let start = Instant::now();
    let mut last = String::from("sem resposta");
    for addr in addrs {
        match TcpStream::connect_timeout(&addr, TIMEOUT) {
            Ok(_) => return Ok(elapsed_ms(start)),
            Err(e) => {
                last = match e.kind() {
                    std::io::ErrorKind::ConnectionRefused => "conexão recusada".into(),
                    std::io::ErrorKind::TimedOut => "tempo esgotado".into(),
                    _ => short(&e.to_string()),
                }
            }
        }
    }
    Err(last)
}

/// Latency is the name resolution; the certificate is read from the first address that answers.
fn dns_and_cert(host: &str, port: u16, now: i64) -> (Result<u32, String>, Option<i64>) {
    let (addrs, ms) = match resolve(host, port) {
        Ok(r) => r,
        Err(e) => return (Err(e), None),
    };
    match addrs.iter().find_map(|a| leaf_expiry(host, a).ok()) {
        Some(expires) => (Ok(ms), Some(health_cert::days_left(expires, now))),
        None => (Err("sem certificado TLS nessa porta".into()), None),
    }
}

/// Accepts any chain: this reads the expiry date, and an expired or self-signed certificate still has one.
#[derive(Debug)]
struct AnyCert(Arc<CryptoProvider>);

impl ServerCertVerifier for AnyCert {
    fn verify_server_cert(
        &self,
        _: &CertificateDer<'_>,
        _: &[CertificateDer<'_>],
        _: &ServerName<'_>,
        _: &[u8],
        _: UnixTime,
    ) -> Result<ServerCertVerified, rustls::Error> {
        Ok(ServerCertVerified::assertion())
    }
    fn verify_tls12_signature(
        &self,
        _: &[u8],
        _: &CertificateDer<'_>,
        _: &DigitallySignedStruct,
    ) -> Result<HandshakeSignatureValid, rustls::Error> {
        Ok(HandshakeSignatureValid::assertion())
    }
    fn verify_tls13_signature(
        &self,
        _: &[u8],
        _: &CertificateDer<'_>,
        _: &DigitallySignedStruct,
    ) -> Result<HandshakeSignatureValid, rustls::Error> {
        Ok(HandshakeSignatureValid::assertion())
    }
    fn supported_verify_schemes(&self) -> Vec<SignatureScheme> {
        self.0.signature_verification_algorithms.supported_schemes()
    }
}

fn leaf_expiry(host: &str, addr: &SocketAddr) -> Result<i64, String> {
    let provider = Arc::new(ring::default_provider());
    let config = ClientConfig::builder_with_provider(provider.clone())
        .with_safe_default_protocol_versions()
        .map_err(|e| e.to_string())?
        .dangerous()
        .with_custom_certificate_verifier(Arc::new(AnyCert(provider)))
        .with_no_client_auth();
    let name = ServerName::try_from(host.to_string()).map_err(|e| e.to_string())?;
    let mut conn = ClientConnection::new(Arc::new(config), name).map_err(|e| e.to_string())?;
    let mut sock = TcpStream::connect_timeout(addr, TIMEOUT).map_err(|e| e.to_string())?;
    sock.set_read_timeout(Some(TIMEOUT)).ok();
    sock.set_write_timeout(Some(TIMEOUT)).ok();
    while conn.is_handshaking() {
        conn.complete_io(&mut sock).map_err(|e| e.to_string())?;
    }
    let der = conn.peer_certificates().and_then(|c| c.first()).ok_or("sem certificado")?;
    health_cert::not_after(der.as_ref()).ok_or_else(|| "certificado ilegível".to_string())
}

/// The webview shows this: keep the cause, drop the noise.
fn short(msg: &str) -> String {
    let lower = msg.to_lowercase();
    let known = [
        ("timed out", "tempo esgotado"),
        ("timeout", "tempo esgotado"),
        ("refused", "conexão recusada"),
        ("recus", "conexão recusada"),
        ("dns", "o nome não resolve"),
        ("certificate", "certificado inválido"),
    ];
    known.iter().find(|(k, _)| lower.contains(k)).map_or_else(|| msg.chars().take(80).collect(), |(_, v)| v.to_string())
}

#[cfg(test)]
#[path = "health_probe_tests.rs"]
mod tests;
