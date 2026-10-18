//! Which account the typed value means, with no network and no vault: a SteamID64, a
//! `steamcommunity.com` profile link or a vanity name. Pure, so `steam_id_tests.rs` covers every shape.

pub enum SteamId {
    Id(String),
    /// A vanity name: only the Web API can resolve it, so a key is required.
    Vanity(String),
}

/// Accepts a SteamID64, a `steamcommunity.com` link or a bare vanity name.
pub fn classify(input: &str) -> Option<SteamId> {
    let text = input.trim().trim_end_matches('/');
    if text.is_empty() {
        return None;
    }
    let body = text.split_once("://").map_or(text, |(_, rest)| rest);
    let body = body.trim_start_matches("www.");
    let path = body.strip_prefix("steamcommunity.com").unwrap_or(body);
    let parts: Vec<&str> = path.trim_start_matches('/').split('/').filter(|s| !s.is_empty()).collect();
    match parts.as_slice() {
        ["profiles", id] => is_steamid(id).then(|| SteamId::Id((*id).to_string())),
        ["id", name] => is_vanity(name).then(|| SteamId::Vanity((*name).to_string())),
        [only] if is_steamid(only) => Some(SteamId::Id((*only).to_string())),
        // A run of digits that is not a valid id is a mistyped id, never a vanity name.
        [only] if !only.bytes().all(|b| b.is_ascii_digit()) => {
            is_vanity(only).then(|| SteamId::Vanity((*only).to_string()))
        }
        _ => None,
    }
}

/// Every SteamID64 is 17 digits and starts with 7656119.
pub fn is_steamid(text: &str) -> bool {
    text.len() == 17 && text.starts_with("7656119") && text.bytes().all(|b| b.is_ascii_digit())
}

fn is_vanity(text: &str) -> bool {
    !text.is_empty() && text.len() <= 64 && text.chars().all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '-')
}

#[cfg(test)]
#[path = "steam_id_tests.rs"]
mod tests;
