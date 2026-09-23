//! Google Calendar descriptions arrive as HTML; the webview only ever gets plain text.

const BREAKS: [&str; 6] = ["<br>", "<br/>", "<br />", "</p>", "</li>", "</div>"];
const ENTITIES: [(&str, &str); 6] =
    [("&nbsp;", " "), ("&lt;", "<"), ("&gt;", ">"), ("&quot;", "\""), ("&#39;", "'"), ("&amp;", "&")];

/// Tags become nothing, block ends become line breaks, and the result is cut at `max` characters.
pub fn plain_text(html: &str, max: usize) -> String {
    let mut s = html.to_string();
    for b in BREAKS {
        s = replace_ci(&s, b, "\n");
    }
    let mut out = String::with_capacity(s.len());
    let mut in_tag = false;
    for c in s.chars() {
        match c {
            '<' => in_tag = true,
            '>' if in_tag => in_tag = false,
            _ if !in_tag => out.push(c),
            _ => {}
        }
    }
    for (from, to) in ENTITIES {
        out = out.replace(from, to);
    }
    let lines: Vec<&str> = out.lines().map(str::trim).collect();
    let mut text = lines.join("\n");
    while text.contains("\n\n\n") {
        text = text.replace("\n\n\n", "\n\n");
    }
    let text = text.trim();
    match text.char_indices().nth(max) {
        Some((i, _)) => format!("{}…", text[..i].trim_end()),
        None => text.to_string(),
    }
}

fn replace_ci(s: &str, pat: &str, to: &str) -> String {
    let lower = s.to_ascii_lowercase();
    let mut out = String::with_capacity(s.len());
    let mut last = 0;
    for (i, _) in lower.match_indices(pat) {
        out.push_str(&s[last..i]);
        out.push_str(to);
        last = i + pat.len();
    }
    out.push_str(&s[last..]);
    out
}

#[cfg(test)]
mod tests {
    use super::plain_text;

    #[test]
    fn markup_from_calendar_becomes_readable_lines() {
        let html =
            "Pauta:<br><ul><li>Roadmap</li><li>Riscos &amp; prazos</li></ul><p>Link: <a href=\"https://x\">doc</a></p>";
        assert_eq!(plain_text(html, 500), "Pauta:\nRoadmap\nRiscos & prazos\nLink: doc");
    }

    #[test]
    fn a_script_tag_cannot_survive_as_markup() {
        let out = plain_text("<script>alert(1)</script>oi <b>x</b>", 500);
        assert!(!out.contains('<'), "{out}");
    }

    #[test]
    fn escaped_brackets_are_shown_as_text_not_parsed() {
        assert_eq!(plain_text("a &lt;b&gt; c", 500), "a <b> c");
    }

    #[test]
    fn long_text_is_cut_on_a_character_boundary() {
        let out = plain_text(&"ç".repeat(50), 10);
        assert_eq!(out, format!("{}…", "ç".repeat(10)));
    }

    #[test]
    fn blank_runs_collapse_to_one_empty_line() {
        assert_eq!(plain_text("a<br><br><br><br>b", 500), "a\n\nb");
    }
}
