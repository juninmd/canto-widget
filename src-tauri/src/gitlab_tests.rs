use super::*;
use std::io::{Read, Write};
use std::net::TcpListener;
use std::sync::mpsc;

const BASE: &str = "https://gitlab.acme.io";

fn raw(iid: u64, url: &str, full: &str) -> RawItem {
    serde_json::from_value(serde_json::json!({
        "iid": iid,
        "title": "t",
        "web_url": url,
        "created_at": "2026-09-01T00:00:00.000Z",
        "updated_at": "2026-09-02T00:00:00.000Z",
        "user_notes_count": 3,
        "work_in_progress": true,
        "references": { "full": full },
        "author": { "username": "ana" }
    }))
    .unwrap()
}

fn mr_request(page: u32) -> Request {
    Request { path: "merge_requests", params: vec![("page", page.to_string())] }
}

#[test]
fn an_mr_keeps_its_gitlab_reference_and_old_style_draft_flag() {
    let list = convert(
        BASE,
        &mr_request(1),
        vec![raw(12, "https://gitlab.acme.io/g/sub/p/-/merge_requests/12", "g/sub/p!12")],
        Some(1),
        false,
    );
    let it = &list.items[0];
    assert_eq!((it.repo.as_str(), it.reference.as_str(), it.number), ("g/sub/p", "g/sub/p!12", 12));
    assert!(it.is_pr && it.draft);
    assert_eq!((it.comments, it.author.as_str()), (3, "ana"));
}

#[test]
fn links_off_the_configured_instance_are_dropped() {
    let evil = [
        "https://gitlab.acme.io.evil.com/g/p/-/issues/1",
        "javascript:alert(1)",
        "http://gitlab.acme.io/g/p/-/issues/1",
    ];
    let raws = evil.iter().map(|u| raw(1, u, "g/p#1")).collect();
    let issues = Request { path: "issues", params: vec![] };
    assert!(convert(BASE, &issues, raws, None, false).items.is_empty());
}

#[test]
fn without_x_total_show_more_still_appears_while_there_is_a_next_page() {
    let raws = (1..=3).map(|n| raw(n, "https://gitlab.acme.io/g/p/-/merge_requests/1", "g/p!1")).collect();
    assert_eq!(convert(BASE, &mr_request(2), raws, None, true).total, (PER_PAGE * 2 + 3) as u64);
    assert_eq!(convert(BASE, &mr_request(1), vec![], None, false).total, 0);
}

/// One-shot HTTP server: answers the first request with `reply` and hands back what it received.
fn serve(reply: &'static str) -> (String, mpsc::Receiver<String>) {
    let listener = TcpListener::bind("127.0.0.1:0").unwrap();
    let base = format!("http://{}", listener.local_addr().unwrap());
    let (tx, rx) = mpsc::channel();
    std::thread::spawn(move || {
        let (mut s, _) = listener.accept().unwrap();
        let mut buf = [0u8; 4096];
        let n = s.read(&mut buf).unwrap();
        s.write_all(reply.as_bytes()).unwrap();
        tx.send(String::from_utf8_lossy(&buf[..n]).to_string()).unwrap();
    });
    (base, rx)
}

fn account(base: String) -> Account {
    Account { base, token: Zeroizing::new("glpat-test-token-000000".into()), username: "ana".into() }
}

#[test]
fn a_redirect_is_not_followed_so_the_token_stays_on_the_instance() {
    let (base, rx) = serve("HTTP/1.1 302 Found\r\nLocation: https://evil.example/steal\r\nContent-Length: 0\r\n\r\n");
    let err = section(&account(base), Section::MyPrs, 1, &ForgeFilter::default()).unwrap_err();
    assert!(err.to_string().contains("redirecionou"), "{err}");
    let request = rx.recv().unwrap();
    assert!(
        request.contains("scope=created_by_me") && request.to_lowercase().contains("authorization: bearer glpat-test")
    );
}

#[test]
fn a_429_becomes_a_rate_limit_the_cache_can_wait_out() {
    let (base, _rx) = serve("HTTP/1.1 429 Too Many Requests\r\nRetry-After: 120\r\nContent-Length: 0\r\n\r\n");
    let before = now_ms();
    match section(&account(base), Section::MyPrs, 1, &ForgeFilter::default()) {
        Err(AppError::RateLimited { reset_at, message }) => {
            assert!(reset_at >= before + 120_000 && message.contains("2 min"), "{message}");
        }
        other => panic!("{:?}", other.map(|l| l.0.total)),
    }
}

#[test]
fn a_page_carries_the_total_and_the_quota_headers() {
    let (base, _rx) = serve(concat!(
        "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nX-Total: 512\r\n",
        "RateLimit-Remaining: 1999\r\nRateLimit-Reset: 1700000000\r\nContent-Length: 2\r\n\r\n[]"
    ));
    let (list, quota) = section(&account(base), Section::MyPrs, 1, &ForgeFilter::default()).unwrap();
    assert_eq!(list.total, 512);
    assert_eq!(quota, Some(Quota { remaining: 1999, reset_at: 1_700_000_000_000 }));
}
