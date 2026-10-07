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
            Err(e) => last = short(&e.to_string()),
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
        ("dns", "o nome não resolve"),
        ("certificate", "certificado inválido"),
    ];
    known.iter().find(|(k, _)| lower.contains(k)).map_or_else(|| msg.chars().take(80).collect(), |(_, v)| v.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::net::TcpListener;

    fn ep(target: Target) -> Endpoint {
        Endpoint {
            id: "e".into(),
            name: "x".into(),
            target,
            every_secs: 60,
            limit_ms: 500,
            alert_down: true,
            alert_slow: true,
            alert_cert: true,
        }
    }

    #[test]
    fn tcp_up_when_something_listens_and_down_when_nothing_does() {
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let port = listener.local_addr().unwrap().port();
        let up = probe(&ep(Target::Tcp { host: "127.0.0.1".into(), port }), 1_000);
        assert!(up.ms.is_some() && up.err.is_none(), "{up:?}");
        drop(listener);
        let down = probe(&ep(Target::Tcp { host: "127.0.0.1".into(), port }), 2_000);
        assert!(down.ms.is_none());
        assert_eq!(down.err.as_deref(), Some("conexão recusada"));
    }

    #[test]
    fn http_reads_the_status_line_of_a_local_server() {
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let port = listener.local_addr().unwrap().port();
        std::thread::spawn(move || {
            for (i, stream) in listener.incoming().take(2).enumerate() {
                let mut s = stream.unwrap();
                let mut buf = [0u8; 1024];
                let _ = std::io::Read::read(&mut s, &mut buf);
                let line = if i == 0 { "200 OK" } else { "503 Service Unavailable" };
                let _ = std::io::Write::write_all(
                    &mut s,
                    format!("HTTP/1.1 {line}\r\nContent-Length: 0\r\nConnection: close\r\n\r\n").as_bytes(),
                );
            }
        });
        let e = ep(Target::Http { url: format!("http://127.0.0.1:{port}/health") });
        assert!(probe(&e, 0).ms.is_some());
        assert_eq!(probe(&e, 0).err.as_deref(), Some("HTTP 503"));
    }

    #[test]
    fn a_name_that_does_not_resolve_is_down_with_a_reason() {
        let s = probe(&ep(Target::Dns { host: "nao-existe.invalid".into(), port: 443 }), 0);
        assert_eq!((s.ms, s.err.as_deref()), (None, Some("o nome não resolve")));
    }

    #[test]
    #[ignore = "needs network"]
    fn the_certificate_of_a_real_host_has_days_left() {
        let s = probe(&ep(Target::Dns { host: "github.com".into(), port: 443 }), chrono::Utc::now().timestamp_millis());
        assert!(s.cert_days.is_some_and(|d| d > -1), "{s:?}");
    }
}
