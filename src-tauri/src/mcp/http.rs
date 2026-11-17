//! A deliberately tiny HTTP/1.1 listener for the MCP endpoint: loopback only, one request per connection, and
//! every request checked (Host, Origin, bearer token) before a byte of JSON is looked at.
use std::io::{Read, Write};
use std::net::{Ipv4Addr, SocketAddr, TcpListener, TcpStream};
use std::sync::atomic::{AtomicBool, AtomicUsize, Ordering};
use std::sync::Arc;
use std::time::Duration;

use serde_json::{json, Value};
use tauri::{AppHandle, Manager};

use super::{agents, rpc, tools::AppBackend, McpState};

const MAX_HEAD: usize = 16 * 1024;
const MAX_BODY: usize = 256 * 1024;
const MAX_CONNECTIONS: usize = 8;
pub const PATH: &str = "/mcp";

pub struct Request {
    pub method: String,
    pub path: String,
    pub headers: Vec<(String, String)>,
    pub body: Vec<u8>,
}

impl Request {
    pub fn header(&self, name: &str) -> Option<&str> {
        self.headers.iter().find(|(k, _)| k.eq_ignore_ascii_case(name)).map(|(_, v)| v.as_str())
    }
}

pub struct Response {
    pub status: u16,
    pub body: String,
    pub extra: Vec<(&'static str, &'static str)>,
}

fn plain(status: u16, text: &str) -> Response {
    Response { status, body: json!({ "error": text }).to_string(), extra: vec![] }
}

fn reason(status: u16) -> &'static str {
    match status {
        200 => "OK",
        202 => "Accepted",
        400 => "Bad Request",
        401 => "Unauthorized",
        403 => "Forbidden",
        404 => "Not Found",
        405 => "Method Not Allowed",
        413 => "Payload Too Large",
        _ => "Error",
    }
}

/// Same length, same time: a wrong token must not reveal how many leading bytes were right.
pub fn same(a: &str, b: &str) -> bool {
    a.len() == b.len() && a.bytes().zip(b.bytes()).fold(0u8, |acc, (x, y)| acc | (x ^ y)) == 0
}

/// A browser page can reach 127.0.0.1 too (DNS rebinding): only our own host names are served.
pub fn host_ok(host: Option<&str>, port: u16) -> bool {
    let Some(host) = host else { return false };
    let host = host.to_ascii_lowercase();
    [format!("127.0.0.1:{port}"), format!("localhost:{port}"), format!("[::1]:{port}")].contains(&host)
}

pub fn bearer(req: &Request) -> Option<&str> {
    let value = req.header("authorization")?.trim();
    let (scheme, token) = value.split_once(' ')?;
    scheme.eq_ignore_ascii_case("bearer").then_some(token.trim())
}

/// Everything after the bytes are read: auth first, then the JSON-RPC body.
pub fn handle(
    req: &Request,
    port: u16,
    creds: &[agents::Cred],
    perms: &super::Perms,
    backend: &dyn rpc::Backend,
    log: &dyn Fn(agents::CallEntry),
) -> Response {
    if !host_ok(req.header("host"), port) {
        return plain(403, "host not allowed");
    }
    // MCP clients are not browsers: an Origin header means a web page is calling.
    if req.header("origin").is_some() {
        return plain(403, "origin not allowed");
    }
    let supplied = bearer(req).map(super::hash_token).unwrap_or_default();
    let Some(cred) = agents::identify(creds, &supplied) else {
        return Response {
            status: 401,
            body: json!({ "error": "invalid or missing token" }).to_string(),
            extra: vec![("WWW-Authenticate", "Bearer")],
        };
    };
    // A read-only agent is stripped of the write switches before anything is listed or called.
    let perms = &perms.for_cred(cred);
    let dispatch = |m: &Value| {
        let reply = rpc::dispatch(m, perms, backend);
        if let (Some(r), Some("tools/call")) = (&reply, m.get("method").and_then(Value::as_str)) {
            let tool = m["params"]["name"].as_str().unwrap_or_default();
            let write = rpc::TOOLS.iter().any(|t| t.name == tool && t.write);
            log(agents::entry(cred, tool, agents::outcome_of(r), write));
        }
        reply
    };
    if req.path != PATH {
        return plain(404, "not found");
    }
    if req.method != "POST" {
        return Response { extra: vec![("Allow", "POST")], ..plain(405, "use POST") };
    }
    let Ok(msg) = serde_json::from_slice::<Value>(&req.body) else {
        return Response {
            status: 400,
            body: json!({ "jsonrpc": "2.0", "id": null, "error": { "code": -32700, "message": "parse error" } })
                .to_string(),
            extra: vec![],
        };
    };
    let replies: Vec<Value> = match &msg {
        Value::Array(list) => list.iter().filter_map(dispatch).collect(),
        one => dispatch(one).into_iter().collect(),
    };
    match (&msg, replies.len()) {
        (_, 0) => Response { status: 202, body: String::new(), extra: vec![] },
        (Value::Array(_), _) => Response { status: 200, body: Value::Array(replies).to_string(), extra: vec![] },
        _ => Response { status: 200, body: replies[0].to_string(), extra: vec![] },
    }
}

fn read_request(stream: &mut TcpStream) -> Result<Request, Response> {
    let mut buf = Vec::new();
    let mut chunk = [0u8; 4096];
    let head_end = loop {
        if let Some(i) = buf.windows(4).position(|w| w == b"\r\n\r\n") {
            break i;
        }
        if buf.len() > MAX_HEAD {
            return Err(plain(413, "headers too large"));
        }
        match stream.read(&mut chunk) {
            Ok(0) | Err(_) => return Err(plain(400, "incomplete request")),
            Ok(n) => buf.extend_from_slice(&chunk[..n]),
        }
    };
    let head = String::from_utf8_lossy(&buf[..head_end]).to_string();
    let mut lines = head.split("\r\n");
    let mut first = lines.next().unwrap_or_default().split(' ');
    let method = first.next().unwrap_or_default().to_string();
    let path = first.next().unwrap_or_default().split('?').next().unwrap_or_default().to_string();
    let headers: Vec<(String, String)> =
        lines.filter_map(|l| l.split_once(':')).map(|(k, v)| (k.trim().to_string(), v.trim().to_string())).collect();
    let mut req = Request { method, path, headers, body: Vec::new() };
    if req.header("transfer-encoding").is_some() {
        return Err(plain(400, "chunked bodies are not supported"));
    }
    let length: usize = req.header("content-length").and_then(|v| v.parse().ok()).unwrap_or(0);
    if length > MAX_BODY {
        return Err(plain(413, "body too large"));
    }
    let mut body = buf[head_end + 4..].to_vec();
    while body.len() < length {
        match stream.read(&mut chunk) {
            Ok(0) | Err(_) => return Err(plain(400, "incomplete body")),
            Ok(n) => body.extend_from_slice(&chunk[..n]),
        }
    }
    body.truncate(length);
    req.body = body;
    Ok(req)
}

fn write_response(stream: &mut TcpStream, res: &Response) {
    let mut head = format!(
        "HTTP/1.1 {} {}\r\nContent-Type: application/json\r\nContent-Length: {}\r\nCache-Control: no-store\r\nConnection: close\r\n",
        res.status,
        reason(res.status),
        res.body.len()
    );
    for (k, v) in &res.extra {
        head.push_str(&format!("{k}: {v}\r\n"));
    }
    head.push_str("\r\n");
    let _ = stream.write_all(head.as_bytes());
    let _ = stream.write_all(res.body.as_bytes());
    let _ = stream.flush();
}

fn serve(app: &AppHandle, mut stream: TcpStream) {
    let _ = stream.set_nonblocking(false);
    let _ = stream.set_read_timeout(Some(Duration::from_secs(5)));
    let _ = stream.set_write_timeout(Some(Duration::from_secs(5)));
    let state = app.state::<McpState>();
    let res = match read_request(&mut stream) {
        Ok(req) => {
            let (port, creds, perms) = state.snapshot();
            handle(&req, port, &creds, &perms, &AppBackend(app.clone()), &|e| state.log_call(e))
        }
        Err(res) => res,
    };
    write_response(&mut stream, &res);
}

/// Handle of a running listener; dropping the flag's `true` stops the accept loop.
pub struct Running {
    pub stop: Arc<AtomicBool>,
}

pub fn start(app: &AppHandle, port: u16) -> Result<Running, String> {
    let addr = SocketAddr::from((Ipv4Addr::LOCALHOST, port));
    let listener = TcpListener::bind(addr).map_err(|e| e.to_string())?;
    listener.set_nonblocking(true).map_err(|e| e.to_string())?;
    let stop = Arc::new(AtomicBool::new(false));
    let flag = stop.clone();
    let app = app.clone();
    std::thread::Builder::new()
        .name("canto-mcp".into())
        .spawn(move || {
            let active = Arc::new(AtomicUsize::new(0));
            while !flag.load(Ordering::Relaxed) {
                match listener.accept() {
                    Ok((stream, _)) => {
                        if active.load(Ordering::Relaxed) >= MAX_CONNECTIONS {
                            continue;
                        }
                        active.fetch_add(1, Ordering::Relaxed);
                        let (app, active) = (app.clone(), active.clone());
                        let _ = std::thread::Builder::new().name("canto-mcp-conn".into()).spawn(move || {
                            serve(&app, stream);
                            active.fetch_sub(1, Ordering::Relaxed);
                        });
                    }
                    Err(_) => std::thread::sleep(Duration::from_millis(50)),
                }
            }
        })
        .map_err(|e| e.to_string())?;
    Ok(Running { stop })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::mcp::Perms;

    struct Fake;
    impl rpc::Backend for Fake {
        fn call(&self, _: &str, _: &Value) -> Result<Value, String> {
            Ok(json!({}))
        }
    }

    const TOKEN: &str = "canto_secret";

    fn req(method: &str, path: &str, headers: &[(&str, &str)], body: &str) -> Request {
        let mut h: Vec<(String, String)> = vec![("Host".into(), "127.0.0.1:47615".into())];
        h.extend(headers.iter().map(|(k, v)| (k.to_string(), v.to_string())));
        Request { method: method.into(), path: path.into(), headers: h, body: body.as_bytes().to_vec() }
    }

    fn creds(read_only: bool) -> Vec<agents::Cred> {
        vec![
            agents::Cred {
                id: "default".into(),
                name: "default".into(),
                token_hash: crate::mcp::hash_token(TOKEN),
                read_only,
            },
            agents::Cred {
                id: "ro".into(),
                name: "Agente leitor".into(),
                token_hash: crate::mcp::hash_token("canto_leitor"),
                read_only: true,
            },
        ]
    }

    fn run(r: &Request) -> Response {
        handle(r, 47615, &creds(false), &Perms::default(), &Fake, &|_| {})
    }

    const AUTH: (&str, &str) = ("Authorization", "Bearer canto_secret");
    const PING: &str = r#"{"jsonrpc":"2.0","id":1,"method":"ping"}"#;

    #[test]
    fn a_request_without_the_right_token_is_refused() {
        assert_eq!(run(&req("POST", "/mcp", &[], PING)).status, 401);
        assert_eq!(run(&req("POST", "/mcp", &[("Authorization", "Bearer nope")], PING)).status, 401);
        assert_eq!(run(&req("POST", "/mcp", &[("Authorization", "Basic canto_secret")], PING)).status, 401);
        assert_eq!(run(&req("POST", "/mcp", &[AUTH], PING)).status, 200);
    }

    #[test]
    fn no_token_configured_refuses_everything() {
        let r = req("POST", "/mcp", &[("Authorization", "Bearer ")], PING);
        let none = [agents::Cred {
            id: "default".into(),
            name: "default".into(),
            token_hash: String::new(),
            read_only: false,
        }];
        assert_eq!(handle(&r, 47615, &none, &Perms::default(), &Fake, &|_| {}).status, 401);
    }

    #[test]
    fn foreign_hosts_and_browser_origins_are_refused_even_with_the_token() {
        let mut r = req("POST", "/mcp", &[AUTH], PING);
        r.headers[0].1 = "evil.example:47615".into();
        assert_eq!(run(&r).status, 403);
        assert_eq!(run(&req("POST", "/mcp", &[AUTH, ("Origin", "https://evil.example")], PING)).status, 403);
        let mut r = req("POST", "/mcp", &[AUTH], PING);
        r.headers[0].1 = "localhost:47615".into();
        assert_eq!(run(&r).status, 200);
    }

    #[test]
    fn only_post_on_the_mcp_path_and_notifications_get_202() {
        assert_eq!(run(&req("GET", "/mcp", &[AUTH], "")).status, 405);
        assert_eq!(run(&req("POST", "/other", &[AUTH], PING)).status, 404);
        assert_eq!(
            run(&req("POST", "/mcp", &[AUTH], r#"{"jsonrpc":"2.0","method":"notifications/initialized"}"#)).status,
            202
        );
        assert_eq!(run(&req("POST", "/mcp", &[AUTH], "{oops")).status, 400);
    }

    const READER: (&str, &str) = ("Authorization", "Bearer canto_leitor");

    fn call_body(tool: &str) -> String {
        json!({"jsonrpc":"2.0","id":7,"method":"tools/call","params":{"name":tool,"arguments":{}}}).to_string()
    }

    /// Backend that notes which tools actually ran: a refused call must never reach it.
    struct Counting(std::cell::RefCell<Vec<String>>);
    impl rpc::Backend for Counting {
        fn call(&self, name: &str, _: &Value) -> Result<Value, String> {
            self.0.borrow_mut().push(name.to_string());
            Ok(json!({}))
        }
    }

    fn call_as(
        header: (&str, &str),
        read_only_default: bool,
        tool: &str,
    ) -> (Value, Vec<String>, Vec<agents::CallEntry>) {
        let perms = Perms { tasks_write: true, ..Perms::default() };
        let backend = Counting(Default::default());
        let log = std::cell::RefCell::new(Vec::new());
        let res = handle(
            &req("POST", "/mcp", &[header], &call_body(tool)),
            47615,
            &creds(read_only_default),
            &perms,
            &backend,
            &|e| log.borrow_mut().push(e),
        );
        (serde_json::from_str(&res.body).unwrap(), backend.0.into_inner(), log.into_inner())
    }

    #[test]
    fn a_read_only_agent_cannot_write_even_with_the_write_switch_on() {
        let (reply, ran, log) = call_as(READER, false, "create_task");
        assert_eq!(reply["result"]["isError"], true);
        assert!(ran.is_empty(), "the write reached the backend: {ran:?}");
        assert_eq!(
            (log[0].agent.as_str(), log[0].tool.as_str(), log[0].outcome, log[0].write),
            ("Agente leitor", "create_task", "blocked", true)
        );
        let (_, ran, _) = call_as(READER, false, "list_tasks");
        assert_eq!(ran, ["list_tasks"], "reads keep working");
    }

    #[test]
    fn the_shared_token_can_be_made_read_only_too() {
        let (_, ran, _) = call_as(AUTH, true, "create_task");
        assert!(ran.is_empty());
        let (_, ran, log) = call_as(AUTH, false, "create_task");
        assert_eq!(ran, ["create_task"]);
        assert_eq!((log[0].agent.as_str(), log[0].outcome), ("default", "ok"));
    }

    #[test]
    fn a_read_only_agent_does_not_even_list_the_write_tools() {
        let perms = Perms { tasks_write: true, ..Perms::default() };
        let body = json!({"jsonrpc":"2.0","id":1,"method":"tools/list"}).to_string();
        let r = |h| handle(&req("POST", "/mcp", &[h], &body), 47615, &creds(false), &perms, &Fake, &|_| {});
        assert!(r(AUTH).body.contains("create_task"));
        assert!(!r(READER).body.contains("create_task"));
    }

    #[test]
    fn only_tool_calls_are_logged_and_without_arguments() {
        let (_, _, log) = call_as(AUTH, false, "list_tasks");
        assert_eq!(log.len(), 1);
        assert!(!format!("{:?}", log[0]).contains("arguments"));
        let log = std::cell::RefCell::new(Vec::new());
        handle(&req("POST", "/mcp", &[AUTH], PING), 47615, &creds(false), &Perms::default(), &Fake, &|e| {
            log.borrow_mut().push(e)
        });
        assert!(log.borrow().is_empty());
    }

    #[test]
    fn token_comparison_needs_equal_strings() {
        assert!(same("abc", "abc"));
        assert!(!same("abc", "abd") && !same("abc", "ab"));
    }
}
