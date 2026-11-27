//! Pictures inside a PR/MR description or comment: downloaded in Rust and handed over as `data:` URLs, so the CSP
//! keeps blocking remote images. Only the forge's own image hosts are fetched, a redirect is followed by hand and
//! only to another of those hosts, and the GitLab token goes to the configured instance and nowhere else.
use base64::{engine::general_purpose::STANDARD as B64, Engine};
use reqwest::Url;
use tauri::Manager;

use crate::blocking::run;
use crate::error::{AppError, Result};
use crate::vault::AppState;

pub const MAX_BYTES: usize = 4 * 1024 * 1024;
const MAX_HOPS: usize = 3;
const TYPES: &[&str] = &["image/png", "image/jpeg", "image/webp", "image/gif"];
const GITHUB_HOSTS: &[&str] = &[
    "avatars.githubusercontent.com",
    "user-images.githubusercontent.com",
    "private-user-images.githubusercontent.com",
    "raw.githubusercontent.com",
    "camo.githubusercontent.com",
    "objects.githubusercontent.com",
];

/// Whether the forge serves pictures from `url`: its CDN hosts, GitHub's attachment links, or the GitLab instance.
pub fn allowed(forge: &str, base: &str, url: &str) -> bool {
    let Ok(u) = Url::parse(url) else { return false };
    if u.scheme() != "https" || u.port().is_some() || !u.username().is_empty() {
        return false;
    }
    match forge {
        "github" => {
            let host = u.host_str().unwrap_or_default();
            GITHUB_HOSTS.contains(&host) || (host == "github.com" && u.path().starts_with("/user-attachments/"))
        }
        "gitlab" => !base.is_empty() && url.starts_with(&format!("{base}/")),
        _ => false,
    }
}

fn data_url(content_type: &str, bytes: &[u8]) -> Option<String> {
    let kind = content_type.split(';').next()?.trim().to_ascii_lowercase();
    (TYPES.contains(&kind.as_str()) && !bytes.is_empty() && bytes.len() <= MAX_BYTES)
        .then(|| format!("data:{kind};base64,{}", B64.encode(bytes)))
}

fn download(forge: &str, base: &str, token: Option<&str>, url: &str) -> Option<String> {
    let http = crate::gitlab::client().ok()?;
    let mut current = url.to_string();
    for _ in 0..=MAX_HOPS {
        if !allowed(forge, base, &current) {
            return None;
        }
        let mut req = http.get(&current);
        if let (true, Some(t)) = (forge == "gitlab", token) {
            req = req.bearer_auth(t);
        }
        let res = req.send().ok()?;
        if res.status().is_redirection() {
            let next = res.headers().get(reqwest::header::LOCATION)?.to_str().ok()?;
            current = Url::parse(&current).ok()?.join(next).ok()?.to_string();
            continue;
        }
        let res = res.error_for_status().ok()?;
        let kind = res.headers().get(reqwest::header::CONTENT_TYPE)?.to_str().ok()?.to_string();
        // Without Content-Length the body might not end: read at most one byte past the cap.
        let mut bytes = Vec::new();
        std::io::Read::read_to_end(&mut std::io::Read::take(res, MAX_BYTES as u64 + 1), &mut bytes).ok()?;
        return data_url(&kind, &bytes);
    }
    None
}

/// One picture of a description; a failure is an error the UI answers with a link, never a broken image.
#[tauri::command]
pub async fn forge_image(app: tauri::AppHandle, forge: String, url: String) -> Result<String> {
    run(move || {
        let state = app.state::<AppState>();
        if !state.is_unlocked() {
            return Err(AppError::Locked);
        }
        let (base, token) = match forge.as_str() {
            "gitlab" => state.gitlab_config()?.map(|c| (c.base_url.clone(), Some(c.token.clone()))).unwrap_or_default(),
            _ => (String::new(), None),
        };
        // A GitLab description links its uploads relative to the instance.
        let url = if forge == "gitlab" && url.starts_with('/') && !url.starts_with("//") {
            format!("{base}{url}")
        } else {
            url
        };
        if !allowed(&forge, &base, &url) {
            return Err(AppError::Format("imagem de um endereço não permitido".into()));
        }
        download(&forge, &base, token.as_deref(), &url)
            .ok_or_else(|| AppError::Format("não deu para baixar a imagem".into()))
    })
    .await
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn only_the_forges_picture_hosts_pass() {
        assert!(allowed("github", "", "https://user-images.githubusercontent.com/1/a.png"));
        assert!(allowed("github", "", "https://github.com/user-attachments/assets/abc"));
        assert!(!allowed("github", "", "https://github.com/juninmd/x/issues"));
        assert!(!allowed("github", "", "http://user-images.githubusercontent.com/1/a.png"));
        assert!(!allowed("github", "", "https://user-images.githubusercontent.com.evil.io/a.png"));
        assert!(!allowed("github", "", "https://user:pw@user-images.githubusercontent.com/a.png"));
        assert!(!allowed("github", "", "https://user-images.githubusercontent.com:8443/a.png"));
        assert!(allowed("gitlab", "https://gitlab.acme.io", "https://gitlab.acme.io/g/p/uploads/h/a.png"));
        assert!(!allowed("gitlab", "https://gitlab.acme.io", "https://gitlab.acme.io.evil.io/a.png"));
        assert!(!allowed("gitlab", "", "https://gitlab.acme.io/a.png"), "no instance configured");
        assert!(!allowed("steam", "", "https://user-images.githubusercontent.com/a.png"));
    }

    #[test]
    fn only_raster_pictures_within_the_cap_become_data_urls() {
        assert!(data_url("image/png", b"x").unwrap().starts_with("data:image/png;base64,"));
        assert!(data_url("image/svg+xml", b"<svg/>").is_none(), "svg can carry script");
        assert!(data_url("text/html", b"x").is_none());
        assert!(data_url("image/png", b"").is_none());
        assert!(data_url("image/gif; charset=x", &vec![0; MAX_BYTES + 1]).is_none());
    }
}
