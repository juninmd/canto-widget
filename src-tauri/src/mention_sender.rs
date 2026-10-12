//! Who wrote a mention. GitLab hands the author over with the to-do; on GitHub the search only knows the thread's
//! author, so the comment that carries `@login` is looked up. Every failure leaves the alert as it was, without a face.
use std::collections::HashMap;

use serde::Deserialize;

use crate::calendar::Sender;
use crate::forge::ForgeItem;
use crate::github::{client, network, response, API};
use crate::gitlab::Mention;

/// Remembered per avatar URL so a repeated author costs no download; bounded so it cannot grow for ever.
const CACHE_MAX: usize = 64;
/// The mention may be older than the last update (others replied meanwhile); look this far before it.
const LOOKBACK_MINUTES: i64 = 60;

#[derive(Deserialize)]
struct Author {
    login: String,
    #[serde(default)]
    avatar_url: String,
}

#[derive(Deserialize)]
struct Text {
    #[serde(default)]
    body: Option<String>,
    #[serde(default)]
    user: Option<Author>,
}

#[derive(Deserialize)]
struct Profile {
    #[serde(default)]
    name: Option<String>,
}

/// `@login` as a whole word, any case; `a@login` (an e-mail) and `@login-bot` do not count.
pub fn mentions_login(body: &str, login: &str) -> bool {
    if login.is_empty() {
        return false;
    }
    let (body, needle) = (body.to_lowercase(), format!("@{}", login.to_lowercase()));
    let word = |c: char| c.is_alphanumeric() || c == '_' || c == '-';
    body.match_indices(&needle).any(|(i, _)| {
        !body[..i].chars().next_back().is_some_and(word) && !body[i + needle.len()..].chars().next().is_some_and(word)
    })
}

/// The newest text that mentions `login`.
fn pick(texts: Vec<Text>, login: &str) -> Option<Author> {
    texts.into_iter().rev().find(|t| t.body.as_deref().is_some_and(|b| mentions_login(b, login)))?.user
}

fn since(updated_at: &str) -> Option<String> {
    let t = chrono::DateTime::parse_from_rfc3339(updated_at).ok()?;
    Some((t - chrono::Duration::minutes(LOOKBACK_MINUTES)).to_rfc3339_opts(chrono::SecondsFormat::Secs, true))
}

fn get<T: for<'de> Deserialize<'de>>(token: &str, path: &str, params: &[(&str, &str)]) -> Option<T> {
    let url = url::Url::parse_with_params(&format!("{API}{path}"), params).ok()?;
    response(client().ok()?.get(url).bearer_auth(token).send().map_err(network).ok()?).ok()
}

/// Comments first (newest mention wins); the thread's own text only when no comment mentions the user.
pub fn github_sender(token: &str, item: &ForgeItem, login: &str) -> Option<Sender> {
    let base = format!("/repos/{}/issues/{}", item.repo, item.number);
    let mut params = vec![("per_page", "100")];
    let from = since(&item.updated_at);
    if let Some(f) = from.as_deref() {
        params.push(("since", f));
    }
    let comments: Vec<Text> = get(token, &format!("{base}/comments"), &params).unwrap_or_default();
    let author = pick(comments, login).or_else(|| pick(vec![get(token, &base, &[])?], login))?;
    let name = get::<Profile>(token, &format!("/users/{}", author.login), &[]).and_then(|p| p.name).unwrap_or_default();
    Some(Sender { name, login: author.login, avatar: author.avatar_url })
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
pub fn resolve_avatars(
    events: &mut [crate::calendar::AgendaItem],
    cache: &mut HashMap<String, String>,
    trusted: impl Fn(&str) -> bool,
    download: impl Fn(&str) -> Option<String>,
) {
    for s in events.iter_mut().filter_map(|e| e.sender.as_mut()) {
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
