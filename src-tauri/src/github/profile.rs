//! Who a person on a PR is: the public profile card behind a name.
use serde::{Deserialize, Serialize};

use crate::error::{AppError, Result};
use crate::github::{client, network, response, API};

const MAX_BIO: usize = 300;
const MAX_FIELD: usize = 80;

#[derive(Debug, Serialize, PartialEq)]
pub struct Profile {
    pub login: String,
    pub name: String,
    pub bio: String,
    pub company: String,
    pub location: String,
    pub public_repos: u64,
    pub followers: u64,
    /// Year the account was created.
    pub since: u32,
    pub url: String,
}

#[derive(Deserialize)]
struct User {
    login: String,
    #[serde(default)]
    name: Option<String>,
    #[serde(default)]
    bio: Option<String>,
    #[serde(default)]
    company: Option<String>,
    #[serde(default)]
    location: Option<String>,
    #[serde(default)]
    public_repos: u64,
    #[serde(default)]
    followers: u64,
    #[serde(default)]
    created_at: String,
    #[serde(default)]
    html_url: String,
}

/// GitHub logins: letters, digits and single hyphens, up to 39, plus the `[bot]` suffix of apps.
pub fn valid_login(login: &str) -> bool {
    let name = login.strip_suffix("[bot]").unwrap_or(login);
    !name.is_empty()
        && name.len() <= 39
        && name.chars().all(|c| c.is_ascii_alphanumeric() || c == '-')
        && !name.starts_with('-')
}

fn clip(text: &Option<String>, max: usize) -> String {
    text.as_deref().unwrap_or("").trim().chars().take(max).collect()
}

fn profile(u: User) -> Profile {
    let url = if u.html_url.starts_with("https://github.com/") { u.html_url } else { String::new() };
    Profile {
        name: clip(&u.name, MAX_FIELD),
        bio: clip(&u.bio, MAX_BIO),
        company: clip(&u.company, MAX_FIELD),
        location: clip(&u.location, MAX_FIELD),
        public_repos: u.public_repos,
        followers: u.followers,
        since: u.created_at.get(..4).and_then(|y| y.parse().ok()).unwrap_or(0),
        login: u.login,
        url,
    }
}

pub fn fetch(token: &str, login: &str) -> Result<Profile> {
    if !valid_login(login) || login.ends_with("[bot]") {
        return Err(AppError::Github("usuário inválido".into()));
    }
    let user: User =
        response(client()?.get(format!("{API}/users/{login}")).bearer_auth(token).send().map_err(network)?)?;
    Ok(profile(user))
}

#[cfg(test)]
#[path = "profile_tests.rs"]
mod tests;
