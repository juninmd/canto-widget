//! Who wrote a mention. GitLab hands the author over with the to-do; on GitHub the search only knows the thread's
//! author, so the comment that carries `@login` is looked up. Every failure leaves the alert as it was, without a face.
use std::collections::HashMap;

use serde::Deserialize;

use crate::calendar::Sender;
use crate::forge::ForgeItem;
use crate::github::{client, network, response, API};
use crate::gitlab_todos::Mention;

/// Remembered per avatar URL so a repeated author costs no download; bounded so it cannot grow for ever.
const CACHE_MAX: usize = 64;
/// The mention may be older than the last update (others replied meanwhile); look this far before it.
const LOOKBACK_MINUTES: i64 = 60;
/// How much of the text before the mention a cut preview keeps, so the sentence still makes sense.
const CONTEXT_BEFORE: usize = 60;

#[derive(Deserialize)]
pub(crate) struct Author {
    pub login: String,
    #[serde(default)]
    pub avatar_url: String,
}

#[derive(Deserialize)]
pub(crate) struct Text {
    #[serde(default)]
    pub body: Option<String>,
    #[serde(default)]
    pub user: Option<Author>,
}

#[derive(Deserialize)]
struct Profile {
    #[serde(default)]
    name: Option<String>,
}

/// Who wrote the text that mentions the user, and what it says (flattened and cut around the mention).
#[derive(Debug, Clone, PartialEq)]
pub struct Mentioned {
    pub sender: Sender,
    pub excerpt: String,
}

/// Byte offset of the first `@login` as a whole word, any case; `a@login` (an e-mail) and `@login-bot` do not count.
/// Logins are ASCII, so lowercasing ASCII only keeps the offsets valid for `body`.
fn mention_at(body: &str, login: &str) -> Option<usize> {
    if login.is_empty() {
        return None;
    }
    let (lower, needle) = (body.to_ascii_lowercase(), format!("@{}", login.to_ascii_lowercase()));
    let word = |c: char| c.is_alphanumeric() || c == '_' || c == '-';
    lower.match_indices(&needle).map(|(i, _)| i).find(|&i| {
        !lower[..i].chars().next_back().is_some_and(word) && !lower[i + needle.len()..].chars().next().is_some_and(word)
    })
}

pub fn mentions_login(body: &str, login: &str) -> bool {
    mention_at(body, login).is_some()
}

/// The user's `login` and the `org/team` handles that also reach them; the earliest one in the text counts.
fn first_mention(body: &str, names: &[String]) -> Option<usize> {
    names.iter().filter_map(|n| mention_at(body, n)).min()
}

/// One line of at most `max` characters; a longer text keeps the stretch around the mention, with "…" for what was cut.
pub fn excerpt(body: &str, login: &str, max: usize) -> String {
    excerpt_any(body, &[login.to_string()], max)
}

pub fn excerpt_any(body: &str, names: &[String], max: usize) -> String {
    let flat = body.split_whitespace().collect::<Vec<_>>().join(" ");
    let chars: Vec<char> = flat.chars().collect();
    if chars.len() <= max {
        return flat;
    }
    let at = first_mention(&flat, names).map_or(0, |b| flat[..b].chars().count());
    let start = at.saturating_sub(CONTEXT_BEFORE).min(chars.len() - max);
    let end = start + max;
    let text: String = chars[start..end].iter().collect();
    format!("{}{text}{}", if start > 0 { "…" } else { "" }, if end < chars.len() { "…" } else { "" })
}

/// The newest text that mentions one of `names`.
fn pick(texts: Vec<Text>, names: &[String]) -> Option<(Author, String)> {
    let text =
        texts.into_iter().rev().find(|t| t.body.as_deref().is_some_and(|b| first_mention(b, names).is_some()))?;
    Some((text.user?, text.body.unwrap_or_default()))
}

pub(crate) fn since(updated_at: &str) -> Option<String> {
    let t = chrono::DateTime::parse_from_rfc3339(updated_at).ok()?;
    Some((t - chrono::Duration::minutes(LOOKBACK_MINUTES)).to_rfc3339_opts(chrono::SecondsFormat::Secs, true))
}

pub(crate) fn get<T: for<'de> Deserialize<'de>>(token: &str, path: &str, params: &[(&str, &str)]) -> Option<T> {
    let url = url::Url::parse_with_params(&format!("{API}{path}"), params).ok()?;
    response(client().ok()?.get(url).bearer_auth(token).send().map_err(network).ok()?).ok()
}

/// Comments first (newest mention wins); the thread's own text only when no comment mentions the user. `names` is
/// the user's login followed by their team handles when team mentions are on.
pub fn github_mention(token: &str, item: &ForgeItem, names: &[String], max: usize) -> Option<Mentioned> {
    let base = format!("/repos/{}/issues/{}", item.repo, item.number);
    let mut params = vec![("per_page", "100")];
    let from = since(&item.updated_at);
    if let Some(f) = from.as_deref() {
        params.push(("since", f));
    }
    let comments: Vec<Text> = get(token, &format!("{base}/comments"), &params).unwrap_or_default();
    let (author, body) = pick(comments, names).or_else(|| pick(vec![get(token, &base, &[])?], names))?;
    let name = get::<Profile>(token, &format!("/users/{}", author.login), &[]).and_then(|p| p.name).unwrap_or_default();
    let sender = Sender { name, login: author.login, avatar: author.avatar_url };
    Some(Mentioned { sender, excerpt: excerpt_any(&body, names, max) })
}

/// GitHub's CDN for profile pictures (`avatars.githubusercontent.com`, `avatars0`…).
pub fn trusted_github_avatar(url: &str) -> bool {
    reqwest::Url::parse(url).is_ok_and(|u| {
        u.scheme() == "https"
            && u.host_str().is_some_and(|h| h.starts_with("avatars") && h.ends_with(".githubusercontent.com"))
    })
}

/// The instance itself (uploaded avatars) or Gravatar, which gitlab.com uses for everyone else.
pub fn trusted_gitlab_avatar(url: &str, base: &str) -> bool {
    let host = |s: &str| {
        reqwest::Url::parse(s).ok().filter(|u| u.scheme() == "https").and_then(|u| u.host_str().map(String::from))
    };
    host(url)
        .is_some_and(|h| host(base).is_some_and(|b| b == h) || h == "secure.gravatar.com" || h == "www.gravatar.com")
}

pub fn gitlab_sender(m: &Mention) -> Option<Sender> {
    (!m.author.is_empty()).then(|| Sender {
        name: m.author_name.clone(),
        login: m.author.clone(),
        avatar: m.avatar_url.clone(),
    })
}

/// Turns each sender's avatar URL into a `data:` URL (or nothing); `download` is only called for trusted URLs.
pub fn resolve_avatars<'a>(
    senders: impl IntoIterator<Item = &'a mut Sender>,
    cache: &mut HashMap<String, String>,
    trusted: impl Fn(&str) -> bool,
    download: impl Fn(&str) -> Option<String>,
) {
    for s in senders {
        let url = std::mem::take(&mut s.avatar);
        if !trusted(&url) {
            continue;
        }
        if cache.len() >= CACHE_MAX && !cache.contains_key(&url) {
            cache.clear();
        }
        // A failed download is not remembered: the next mention from the same person tries again.
        if !cache.contains_key(&url) {
            let Some(data) = download(&url) else { continue };
            cache.insert(url.clone(), data);
        }
        s.avatar = cache[&url].clone();
    }
}

#[cfg(test)]
#[path = "mention_sender_tests.rs"]
mod tests;
