//! MCP over JSON-RPC 2.0: the protocol half of the server, with no sockets and no app state, so tests drive it
//! with a fake backend.
use serde_json::{json, Value};

use super::Perms;

pub const LATEST: &str = "2025-06-18";
const SUPPORTED: [&str; 3] = ["2025-06-18", "2025-03-26", "2024-11-05"];

/// Where a tool's data comes from; the app implements it, tests fake it.
pub trait Backend {
    fn call(&self, name: &str, args: &Value) -> Result<Value, String>;
}

pub struct Tool {
    pub name: &'static str,
    pub description: &'static str,
    /// The permission that gates it (see `Perms::allows`).
    pub perm: &'static str,
    pub write: bool,
    /// JSON Schema of the arguments, as a literal.
    pub schema: &'static str,
}

const NONE: &str = r#"{"type":"object","properties":{}}"#;

pub const TOOLS: &[Tool] = &[
    Tool {
        name: "list_notifications",
        description: "Alerts Canto showed today (meetings, PRs, reminders, system) and what became of each one. Memory only: empty after Canto restarts.",
        perm: "notifications",
        write: false,
        schema: NONE,
    },
    Tool {
        name: "list_tasks",
        description: "Tasks from the Canto vault. Open ones by default; pass `day` (YYYY-MM-DD) to see a single day.",
        perm: "tasks",
        write: false,
        schema: r#"{"type":"object","properties":{"day":{"type":"string","description":"YYYY-MM-DD"},"include_done":{"type":"boolean"},"limit":{"type":"integer","minimum":1,"maximum":200}}}"#,
    },
    Tool {
        name: "list_notes",
        description: "Notes from the Canto vault with a short snippet. Use get_note for the full text.",
        perm: "notes",
        write: false,
        schema: r##"{"type":"object","properties":{"query":{"type":"string","description":"text to search, or #tag"},"limit":{"type":"integer","minimum":1,"maximum":100}}}"##,
    },
    Tool {
        name: "get_note",
        description: "The full text of one note.",
        perm: "notes",
        write: false,
        schema: r#"{"type":"object","properties":{"id":{"type":"string"}},"required":["id"]}"#,
    },
    Tool {
        name: "list_agenda",
        description: "Upcoming Google Calendar events as last read by Canto (needs Google connected). Meeting links included.",
        perm: "agenda",
        write: false,
        schema: NONE,
    },
    Tool {
        name: "list_pull_requests",
        description: "Pull requests from the connected GitHub account: yours, awaiting your review, or assigned to you.",
        perm: "prs",
        write: false,
        schema: r#"{"type":"object","properties":{"section":{"type":"string","enum":["my_prs","review_requested","assigned"]}}}"#,
    },
    Tool {
        name: "get_system_status",
        description: "CPU, memory, disks, network and battery of this computer right now (desktop only).",
        perm: "system",
        write: false,
        schema: NONE,
    },
    Tool {
        name: "get_weather",
        description: "Current weather and the next days for the city chosen in Canto.",
        perm: "weather",
        write: false,
        schema: NONE,
    },
    Tool {
        name: "list_agents",
        description: "Coding-agent CLIs Canto tracks (Claude Code, Codex, OpenCode...): installed on this machine or not, latest release.",
        perm: "agents",
        write: false,
        schema: NONE,
    },
    Tool {
        name: "get_ai_models",
        description: "AI model ranking (Intelligence Index) as shown in the Models tab, best first.",
        perm: "models",
        write: false,
        schema: r#"{"type":"object","properties":{"limit":{"type":"integer","minimum":1,"maximum":100}}}"#,
    },
    Tool {
        name: "get_api_status",
        description: "Status of the public APIs/services followed in the Status tab: operational, degraded, outage.",
        perm: "status",
        write: false,
        schema: NONE,
    },
    Tool {
        name: "get_market",
        description: "Quotes of the Market tab (stocks, crypto, currencies) with the day's change.",
        perm: "market",
        write: false,
        schema: NONE,
    },
    Tool {
        name: "list_mentions",
        description: "GitHub notifications where someone mentioned you.",
        perm: "mentions",
        write: false,
        schema: NONE,
    },
    Tool {
        name: "list_repositories",
        description: "Repositories of the connected GitHub account (first page of 100).",
        perm: "repos",
        write: false,
        schema: NONE,
    },
    Tool {
        name: "list_steam_deals",
        description: "Steam wishlist deals as shown in the Steam tab.",
        perm: "steam",
        write: false,
        schema: NONE,
    },
    Tool {
        name: "list_steam_trending",
        description: "Steam top sellers right now.",
        perm: "steam",
        write: false,
        schema: NONE,
    },
    Tool {
        name: "list_health",
        description: "Your monitored endpoints (HTTP/TCP/DNS) with the latest checks.",
        perm: "health",
        write: false,
        schema: NONE,
    },
    Tool {
        name: "list_clipboard",
        description: "Clipboard history, newest first. Private: anything you copied can be in it.",
        perm: "clipboard",
        write: false,
        schema: r#"{"type":"object","properties":{"query":{"type":"string"},"limit":{"type":"integer","minimum":1,"maximum":100}}}"#,
    },
    Tool {
        name: "list_emails",
        description: "Unread count and important e-mails from Gmail (needs Google connected).",
        perm: "gmail",
        write: false,
        schema: r#"{"type":"object","properties":{"view":{"type":"string","enum":["inbox","important","starred"]},"search":{"type":"string"},"limit":{"type":"integer","minimum":1,"maximum":50}}}"#,
    },
    Tool {
        name: "list_contacts",
        description: "Google contacts, optionally filtered by text.",
        perm: "contacts",
        write: false,
        schema: r#"{"type":"object","properties":{"query":{"type":"string"},"limit":{"type":"integer","minimum":1,"maximum":100}}}"#,
    },
    Tool {
        name: "complete_task",
        description: "Marks a task as done (never deletes or reopens).",
        perm: "tasks_write",
        write: true,
        schema: r#"{"type":"object","properties":{"id":{"type":"string"}},"required":["id"]}"#,
    },
    Tool {
        name: "append_to_note",
        description: "Adds text at the end of an existing note (never replaces or deletes).",
        perm: "notes_write",
        write: true,
        schema: r#"{"type":"object","properties":{"id":{"type":"string"},"text":{"type":"string"}},"required":["id","text"]}"#,
    },
    Tool {
        name: "create_task",
        description: "Adds a task to the Canto vault.",
        perm: "tasks_write",
        write: true,
        schema: r#"{"type":"object","properties":{"title":{"type":"string"},"day":{"type":"string","description":"YYYY-MM-DD, defaults to today"}},"required":["title"]}"#,
    },
    Tool {
        name: "create_note",
        description: "Adds a note to the Canto vault.",
        perm: "notes_write",
        write: true,
        schema: r#"{"type":"object","properties":{"title":{"type":"string"},"body":{"type":"string"},"tags":{"type":"array","items":{"type":"string"}}},"required":["title"]}"#,
    },
    Tool {
        name: "get_briefing",
        description: "The day in one call: today's tasks, upcoming agenda, alerts so far and the weather. Only the parts whose permission is on.",
        perm: "tasks",
        write: false,
        schema: NONE,
    },
    Tool {
        name: "search_all",
        description: "One text search across tasks, notes (if allowed) and the agenda. Accent-insensitive.",
        perm: "tasks",
        write: false,
        schema: r#"{"type":"object","properties":{"query":{"type":"string"},"limit":{"type":"integer","minimum":1,"maximum":50}},"required":["query"]}"#,
    },
    Tool {
        name: "get_task",
        description: "One task by id, with subtasks.",
        perm: "tasks",
        write: false,
        schema: r#"{"type":"object","properties":{"id":{"type":"string"}},"required":["id"]}"#,
    },
    Tool {
        name: "update_task",
        description: "Edits a task: title, day, reminder time (HH:MM, empty clears), priority, or `done:false` to reopen. Never deletes.",
        perm: "tasks_write",
        write: true,
        schema: r#"{"type":"object","properties":{"id":{"type":"string"},"title":{"type":"string"},"day":{"type":"string","description":"YYYY-MM-DD"},"time":{"type":"string","description":"HH:MM, empty to clear"},"done":{"type":"boolean"}},"required":["id"]}"#,
    },
    Tool {
        name: "set_reminder",
        description: "Creates a task with a reminder that rings at `time` on `day` (default today), like any Canto task reminder.",
        perm: "tasks_write",
        write: true,
        schema: r#"{"type":"object","properties":{"title":{"type":"string"},"time":{"type":"string","description":"HH:MM"},"day":{"type":"string","description":"YYYY-MM-DD, defaults to today"}},"required":["title","time"]}"#,
    },
    Tool {
        name: "notify",
        description: "Shows an OS notification from Canto, e.g. when a long agent task ends or needs the user.",
        perm: "notify_write",
        write: true,
        schema: r#"{"type":"object","properties":{"title":{"type":"string"},"body":{"type":"string"}},"required":["title"]}"#,
    },
];

pub fn tool_list(perms: &Perms) -> Value {
    let list: Vec<Value> = TOOLS
        .iter()
        .filter(|t| perms.allows(t.perm))
        .map(|t| {
            json!({
                "name": t.name,
                "description": t.description,
                "inputSchema": serde_json::from_str::<Value>(t.schema).unwrap_or(Value::Null),
                "annotations": { "readOnlyHint": !t.write, "destructiveHint": false, "openWorldHint": false },
            })
        })
        .collect();
    json!({ "tools": list })
}

fn error(id: &Value, code: i64, message: &str) -> Value {
    json!({ "jsonrpc": "2.0", "id": id, "error": { "code": code, "message": message } })
}

fn ok(id: &Value, result: Value) -> Value {
    json!({ "jsonrpc": "2.0", "id": id, "result": result })
}

/// A feed that grew past this is cut on a character boundary, with a note: an agent's context is not free.
const MAX_OUTPUT: usize = 60_000;

fn cap(text: String) -> String {
    if text.len() <= MAX_OUTPUT {
        return text;
    }
    let cut = (0..=MAX_OUTPUT).rev().find(|i| text.is_char_boundary(*i)).unwrap_or(0);
    format!("{}\n… (output cut at {MAX_OUTPUT} bytes; narrow it with `limit` or a query)", &text[..cut])
}

fn tool_result(text: String, is_error: bool) -> Value {
    json!({ "content": [{ "type": "text", "text": text }], "isError": is_error })
}

/// A successful result also travels as `structuredContent` (an object, so a bare list is wrapped in `items`),
/// so agents that read it skip re-parsing the text. Left out when the text was cut: it would be incomplete.
fn ok_result(value: Value) -> Value {
    let text = serde_json::to_string_pretty(&value).unwrap_or_default();
    let whole = text.len() <= MAX_OUTPUT;
    let mut out = tool_result(cap(text), false);
    if whole {
        out["structuredContent"] = if value.is_object() { value } else { json!({ "items": value }) };
    }
    out
}

fn call(params: &Value, perms: &Perms, backend: &dyn Backend) -> Result<Value, (i64, String)> {
    let name = params.get("name").and_then(Value::as_str).unwrap_or_default();
    let tool = TOOLS.iter().find(|t| t.name == name).ok_or((-32602, format!("unknown tool: {name}")))?;
    if !perms.allows(tool.perm) {
        // A tool result, not a protocol error: the model reads it and can tell the user what to switch on.
        return Ok(tool_result(format!("`{name}` is switched off in Canto (Settings > MCP > Permissions)."), true));
    }
    let args = params.get("arguments").cloned().unwrap_or_else(|| json!({}));
    Ok(match backend.call(name, &args) {
        Ok(value) => ok_result(value),
        Err(message) => tool_result(message, true),
    })
}

/// One JSON-RPC message in, the reply out. `None` for a notification, which gets no reply.
pub fn dispatch(msg: &Value, perms: &Perms, backend: &dyn Backend) -> Option<Value> {
    let id = msg.get("id")?;
    if id.is_null() {
        return None;
    }
    let method = msg.get("method").and_then(Value::as_str).unwrap_or_default();
    let params = msg.get("params").cloned().unwrap_or(Value::Null);
    Some(match method {
        "initialize" => {
            let asked = params.get("protocolVersion").and_then(Value::as_str).unwrap_or_default();
            let version = SUPPORTED.iter().find(|v| **v == asked).copied().unwrap_or(LATEST);
            ok(
                id,
                json!({
                    "protocolVersion": version,
                    "capabilities": { "tools": { "listChanged": false } },
                    "serverInfo": { "name": "canto", "version": env!("CARGO_PKG_VERSION") },
                    "instructions": "Canto is a personal desktop widget. Its data is private: read only what the user asked for and never repeat it elsewhere.",
                }),
            )
        }
        "ping" => ok(id, json!({})),
        "tools/list" => ok(id, tool_list(perms)),
        "tools/call" => match call(&params, perms, backend) {
            Ok(result) => ok(id, result),
            Err((code, message)) => error(id, code, &message),
        },
        _ => error(id, -32601, "method not found"),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    struct Fake;
    impl Backend for Fake {
        fn call(&self, name: &str, _: &Value) -> Result<Value, String> {
            if name == "get_weather" {
                return Err("escolha uma cidade".into());
            }
            Ok(json!({ "tool": name }))
        }
    }

    fn send(perms: &Perms, body: Value) -> Option<Value> {
        dispatch(&body, perms, &Fake)
    }

    #[test]
    fn initialize_echoes_a_supported_version_and_falls_back_to_the_latest() {
        let p = Perms::default();
        let r =
            send(&p, json!({"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05"}}))
                .unwrap();
        assert_eq!(r["result"]["protocolVersion"], "2024-11-05");
        let r = send(&p, json!({"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"1999"}}))
            .unwrap();
        assert_eq!(r["result"]["protocolVersion"], LATEST);
        assert_eq!(r["result"]["serverInfo"]["name"], "canto");
    }

    #[test]
    fn notifications_get_no_reply() {
        assert!(send(&Perms::default(), json!({"jsonrpc":"2.0","method":"notifications/initialized"})).is_none());
    }

    #[test]
    fn the_default_lists_reads_only_and_hides_notes_and_writes() {
        let r = send(&Perms::default(), json!({"jsonrpc":"2.0","id":2,"method":"tools/list"})).unwrap();
        let names: Vec<&str> =
            r["result"]["tools"].as_array().unwrap().iter().map(|t| t["name"].as_str().unwrap()).collect();
        assert!(names.contains(&"list_tasks") && names.contains(&"list_notifications"));
        assert!(!names.contains(&"create_task") && !names.contains(&"create_note") && !names.contains(&"get_note"));
        for t in r["result"]["tools"].as_array().unwrap() {
            assert_eq!(t["annotations"]["readOnlyHint"], true);
        }
    }

    #[test]
    fn a_switched_off_tool_cannot_be_called_even_by_name() {
        let r = send(&Perms::default(), json!({"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"create_task","arguments":{"title":"x"}}})).unwrap();
        assert_eq!(r["result"]["isError"], true);
        let p = Perms { tasks_write: true, ..Perms::default() };
        let r = send(&p, json!({"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"create_task","arguments":{"title":"x"}}})).unwrap();
        assert_eq!(r["result"]["isError"], false);
    }

    #[test]
    fn backend_failures_become_tool_errors_and_unknown_names_protocol_errors() {
        let r = send(
            &Perms::default(),
            json!({"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"get_weather"}}),
        )
        .unwrap();
        assert_eq!(r["result"]["isError"], true);
        assert_eq!(r["result"]["content"][0]["text"], "escolha uma cidade");
        let r =
            send(&Perms::default(), json!({"jsonrpc":"2.0","id":5,"method":"tools/call","params":{"name":"rm_rf"}}))
                .unwrap();
        assert_eq!(r["error"]["code"], -32602);
        let r = send(&Perms::default(), json!({"jsonrpc":"2.0","id":6,"method":"nope"})).unwrap();
        assert_eq!(r["error"]["code"], -32601);
    }

    #[test]
    fn results_carry_structured_content_with_lists_wrapped() {
        let r = send(
            &Perms::default(),
            json!({"jsonrpc":"2.0","id":7,"method":"tools/call","params":{"name":"list_tasks"}}),
        )
        .unwrap();
        assert_eq!(r["result"]["structuredContent"]["tool"], "list_tasks");
        assert_eq!(ok_result(json!([1, 2]))["structuredContent"]["items"], json!([1, 2]));
    }

    #[test]
    fn long_output_is_cut_on_a_char_boundary() {
        let big = "é".repeat(MAX_OUTPUT);
        let out = cap(big);
        assert!(out.len() < MAX_OUTPUT + 100 && out.contains("output cut"));
        assert_eq!(cap("short".into()), "short");
    }

    #[test]
    fn tool_names_are_unique_and_every_gate_is_a_known_permission() {
        let mut names: Vec<&str> = TOOLS.iter().map(|t| t.name).collect();
        names.sort();
        names.dedup();
        assert_eq!(names.len(), TOOLS.len());
        let all = Perms {
            clipboard: true,
            gmail: true,
            contacts: true,
            notes: true,
            tasks_write: true,
            notes_write: true,
            notify_write: true,
            ..Perms::default()
        };
        for t in TOOLS {
            assert!(all.allows(t.perm), "{} gates on an unknown permission {}", t.name, t.perm);
        }
    }

    #[test]
    fn every_schema_is_valid_json() {
        for t in TOOLS {
            assert!(serde_json::from_str::<Value>(t.schema).is_ok(), "{}", t.name);
        }
    }
}
