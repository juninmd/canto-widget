//! Discovering the Meet link in a Google Calendar event.

pub fn meet_link(raw_hangout: Option<&str>, entries: &[&str], texts: &[&str]) -> String {
    if let Some(l) = raw_hangout.filter(|l| !l.is_empty()) {
        return l.to_string();
    }
    if let Some(l) = entries.iter().find(|u| u.contains("meet.google.com")) {
        return l.to_string();
    }
    texts
        .iter()
        .filter_map(|t| extract_meet(t))
        .next()
        .unwrap_or_default()
}

fn extract_meet(text: &str) -> Option<String> {
    let pos = text.find("https://meet.google.com/")?;
    let rest = &text[pos..];
    let end = rest
        .find(|c: char| c.is_whitespace() || c == '<' || c == '"' || c == ')')
        .unwrap_or(rest.len());
    Some(rest[..end].trim_end_matches(['.', ',']).to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn prefers_the_official_hangout_link() {
        assert_eq!(
            meet_link(Some("https://meet.google.com/abc-defg-hij"), &[], &[]),
            "https://meet.google.com/abc-defg-hij"
        );
    }

    #[test]
    fn falls_back_to_the_video_entry_point() {
        assert_eq!(
            meet_link(None, &["https://meet.google.com/xyz-1234-abc"], &[]),
            "https://meet.google.com/xyz-1234-abc"
        );
    }

    #[test]
    fn extracts_a_loose_meet_link_from_the_description() {
        let desc = "Pauta do time. Entre por https://meet.google.com/qwe-rtyu-iop, ate mais.";
        assert_eq!(meet_link(None, &[], &[desc]), "https://meet.google.com/qwe-rtyu-iop");
    }

    #[test]
    fn returns_empty_without_a_meet_link() {
        assert_eq!(meet_link(None, &[], &["reuniao presencial na sala 3"]), "");
    }

    #[test]
    fn ignores_a_link_from_another_domain() {
        assert_eq!(meet_link(None, &["https://zoom.us/j/123"], &[]), "");
    }
}
