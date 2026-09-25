//! Who is connected to Google: name, email and photo for the account card.
use base64::{engine::general_purpose::STANDARD as B64, Engine};
use serde::Deserialize;
use std::time::Duration;

use crate::error::{AppError, Result};

const USERINFO_URL: &str = "https://openidconnect.googleapis.com/v1/userinfo";
const REVOKE_URL: &str = "https://oauth2.googleapis.com/revoke";
/// A Google profile photo is a few KB; the cap stops the vault from bloating with junk.
const AVATAR_MAX_BYTES: usize = 256 * 1024;
const IMAGE_TYPES: &[&str] = &["image/png", "image/jpeg", "image/webp", "image/gif"];

#[derive(Debug, Default, PartialEq, Deserialize)]
pub struct Profile {
    #[serde(default)]
    pub email: String,
    #[serde(default, rename = "name")]
    pub name: String,
    #[serde(default, rename = "picture")]
    pub photo: String,
}

pub(crate) fn client() -> Result<reqwest::blocking::Client> {
    crate::net::client_builder()
        .timeout(Duration::from_secs(15))
        // A redirect would send the "trusted" photo to any host, including the local network.
        .redirect(reqwest::redirect::Policy::none())
        .build()
        .map_err(|e| AppError::Drive(e.to_string()))
}

fn drive(e: reqwest::Error) -> AppError {
    AppError::Drive(e.to_string())
}

pub fn fetch_profile(token: &str) -> Result<Profile> {
    client()?
        .get(USERINFO_URL)
        .bearer_auth(token)
        .send()
        .map_err(drive)?
        .error_for_status()
        .map_err(drive)?
        .json()
        .map_err(drive)
}

/// The URL comes from Google's response, but we only download from its photo CDN, over HTTPS.
pub fn is_trusted_photo(url: &str) -> bool {
    reqwest::Url::parse(url).is_ok_and(|u| {
        u.scheme() == "https"
            && u.host_str().is_some_and(|h| h == "googleusercontent.com" || h.ends_with(".googleusercontent.com"))
    })
}

/// The widget's CSP only accepts `data:` images; type and size are checked before embedding.
pub fn as_data_url(content_type: &str, bytes: &[u8]) -> Option<String> {
    let content_type = content_type.split(';').next()?.trim().to_ascii_lowercase();
    (IMAGE_TYPES.contains(&content_type.as_str()) && !bytes.is_empty() && bytes.len() <= AVATAR_MAX_BYTES)
        .then(|| format!("data:{content_type};base64,{}", B64.encode(bytes)))
}

/// The photo is decorative: any failure becomes `None` and the UI shows the initial.
pub fn download_avatar(url: &str) -> Option<String> {
    if !is_trusted_photo(url) {
        return None;
    }
    let res = client().ok()?.get(url).send().ok()?.error_for_status().ok()?;
    let content_type = res.headers().get(reqwest::header::CONTENT_TYPE)?.to_str().ok()?.to_string();
    // Without Content-Length the body might not end: read at most one byte past the cap.
    let mut bytes = Vec::new();
    std::io::Read::read_to_end(&mut std::io::Read::take(res, AVATAR_MAX_BYTES as u64 + 1), &mut bytes).ok()?;
    as_data_url(&content_type, &bytes)
}

/// Real sign-out: revokes the refresh token on Google, not just forgets it locally.
pub fn revoke(token: &str) -> Result<()> {
    client()?.post(REVOKE_URL).form(&[("token", token)]).send().map_err(drive)?.error_for_status().map_err(drive)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn only_downloads_photo_from_googles_cdn_over_https() {
        assert!(is_trusted_photo("https://lh3.googleusercontent.com/a/abc=s96-c"));
        assert!(!is_trusted_photo("http://lh3.googleusercontent.com/a/abc"), "no TLS");
        assert!(!is_trusted_photo("https://googleusercontent.com.evil.io/a"), "fake suffix");
        assert!(!is_trusted_photo("https://evilgoogleusercontent.com/a"), "no dot before the domain");
        assert!(!is_trusted_photo("https://127.0.0.1/a"));
        assert!(!is_trusted_photo("file:///C:/segredo.png"));
        assert!(!is_trusted_photo(""));
    }

    #[test]
    fn only_embeds_a_small_image_of_a_known_type() {
        assert_eq!(as_data_url("image/png", b"png").as_deref(), Some("data:image/png;base64,cG5n"));
        assert!(as_data_url("Image/JPEG; charset=binary", b"x").unwrap().starts_with("data:image/jpeg;"));
        assert!(as_data_url("image/svg+xml", b"<svg onload=alert(1)>").is_none(), "svg carrega script");
        assert!(as_data_url("text/html", b"x").is_none());
        assert!(as_data_url("image/png", b"").is_none());
        assert!(as_data_url("image/png", &vec![0; AVATAR_MAX_BYTES + 1]).is_none());
    }

    #[test]
    fn profile_without_the_profile_scope_comes_with_only_email() {
        let p: Profile = serde_json::from_str(r#"{"sub":"1","email":"a@b.com"}"#).unwrap();
        assert_eq!(p, Profile { email: "a@b.com".into(), ..Default::default() });
    }
}
