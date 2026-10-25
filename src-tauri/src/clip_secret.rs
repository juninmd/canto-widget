//! Copies that are credentials by their shape stay out of the clipboard history, like the ones a password
//! manager tags as concealed: the history outlives the copy and lists it in plain sight.

/// Prefixes that providers stamp on their tokens, with the shortest body each one can have after it.
const PREFIXES: [(&str, usize); 14] = [
    ("ghp_", 30),
    ("gho_", 30),
    ("ghu_", 30),
    ("ghs_", 30),
    ("ghr_", 30),
    ("github_pat_", 40),
    ("glpat-", 20),
    ("AIza", 30),
    ("sk-ant-", 30),
    ("sk-proj-", 30),
    ("xoxb-", 20),
    ("xoxp-", 20),
    ("ya29.", 30),
    ("1//", 30),
];

const MAX_SECRET_LEN: usize = 8 * 1024;

fn token_char(c: char) -> bool {
    c.is_ascii_alphanumeric() || matches!(c, '_' | '-' | '.' | '/' | '+' | '=')
}

fn aws_access_key(t: &str) -> bool {
    t.len() == 20
        && (t.starts_with("AKIA") || t.starts_with("ASIA"))
        && t[4..].chars().all(|c| c.is_ascii_uppercase() || c.is_ascii_digit())
}

/// Three base64url parts, the first one a JSON header (`{"` encodes to `eyJ`).
fn jwt(t: &str) -> bool {
    let parts: Vec<&str> = t.split('.').collect();
    parts.len() == 3
        && parts[0].starts_with("eyJ")
        && parts.iter().all(|p| p.len() >= 10 && p.chars().all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '-'))
}

/// Whether `text`, as copied, is a credential: a private key block or a single token of a known shape.
/// Text that merely mentions a token (a log line, a snippet of config) is kept, since it is the context
/// someone wants back later.
pub fn looks_like_secret(text: &str) -> bool {
    let t = text.trim();
    // Even a 4096-bit RSA key block fits; anything longer is a document, and the check stays cheap on huge copies.
    if t.len() > MAX_SECRET_LEN {
        return false;
    }
    if t.starts_with("-----BEGIN") && t.contains("PRIVATE KEY-----") {
        return true;
    }
    if t.is_empty() || !t.chars().all(token_char) {
        return false;
    }
    PREFIXES.iter().any(|(prefix, body)| t.strip_prefix(prefix).is_some_and(|rest| rest.len() >= *body))
        || aws_access_key(t)
        || jwt(t)
}

#[cfg(test)]
mod tests {
    use super::looks_like_secret;

    /// Built at run time so the repository holds no string a secret scanner would flag.
    fn samples() -> Vec<String> {
        let body = |n: usize| "aB3".repeat(n).chars().take(n).collect::<String>();
        let (part, jwt_head) = (body(20), format!("eyJ{}", body(17)));
        vec![
            format!("ghp_{}", body(36)),
            format!("github_pat_{}", body(60)),
            format!("glpat-{}", body(20)),
            format!("AIza{}", body(35)),
            format!("sk-ant-api03-{}", body(40)),
            format!("xoxb-{}", body(24)),
            format!("AKIA{}", "Q7".repeat(8)),
            format!("{jwt_head}.{part}.{part}"),
            format!("  ghp_{}\n", body(36)),
        ]
    }

    #[test]
    fn provider_tokens_are_recognised() {
        for secret in samples() {
            assert!(looks_like_secret(&secret), "{secret}");
        }
    }

    #[test]
    fn a_token_inside_other_text_is_kept() {
        let line = format!("export GITHUB_TOKEN={} # rotate later", samples()[0]);
        assert!(!looks_like_secret(&line));
    }

    #[test]
    fn a_private_key_block_is_recognised() {
        let kind = "OPENSSH PRIVATE";
        assert!(looks_like_secret(&format!("-----BEGIN {kind} KEY-----\nb3BlbnNzaC1rZXk\n-----END {kind} KEY-----")));
        assert!(!looks_like_secret("-----BEGIN PUBLIC KEY-----\nMIIBIjAN\n-----END PUBLIC KEY-----"));
    }

    #[test]
    fn ordinary_text_and_text_around_a_token_are_kept() {
        for kept in [
            "",
            "ghp_",
            "ghp_short",
            "sk-",
            "https://github.com/juninmd/canto-widget",
            "AKIA is the prefix of an AWS key",
            "a.b.c",
            "reuniao amanha as 10h",
        ] {
            assert!(!looks_like_secret(kept), "{kept}");
        }
    }
}
