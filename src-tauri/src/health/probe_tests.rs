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
