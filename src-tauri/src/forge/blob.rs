//! A picture of the repository at a branch, for the before/after of an image in a diff: read through the forge's API
//! with the user's own token and handed over as a `data:` URL, like the pictures of a description.
use base64::{engine::general_purpose::STANDARD as B64, Engine};
use reqwest::header::ACCEPT;
use tauri::Manager;

use crate::blocking::run;
use crate::error::{AppError, Result};
use crate::forge::image::MAX_BYTES;
use crate::forge::pr_meta::encode_segment;
use crate::forge::valid_repo_path;
use crate::vault::AppState;

/// The type of a picture by its extension: SVG is left out on purpose, it can carry script.
fn mime(path: &str) -> Option<&'static str> {
    match path.rsplit('.').next()?.to_ascii_lowercase().as_str() {
        "png" => Some("image/png"),
        "jpg" | "jpeg" => Some("image/jpeg"),
        "gif" => Some("image/gif"),
        "webp" => Some("image/webp"),
        _ => None,
    }
}

pub fn valid_path(path: &str) -> bool {
    !path.is_empty()
        && path.len() <= 300
        && path.split('/').all(|s| !s.is_empty() && s != "." && s != "..")
        && !path.chars().any(|c| c.is_control() || c == '\\')
}

pub fn valid_ref(name: &str) -> bool {
    !name.is_empty()
        && name.len() <= 200
        && !name.starts_with('-')
        && !name.contains("..")
        && name.chars().all(|c| c.is_ascii_alphanumeric() || matches!(c, '.' | '_' | '-' | '/' | '+' | '@'))
}

fn read(res: reqwest::blocking::Response, kind: &str) -> Result<String> {
    let res = res.error_for_status().map_err(|_| AppError::Format("não achei a imagem nessa versão".into()))?;
    let mut bytes = Vec::new();
    std::io::Read::read_to_end(&mut std::io::Read::take(res, MAX_BYTES as u64 + 1), &mut bytes)
        .map_err(|_| AppError::Format("não deu para ler a imagem".into()))?;
    if bytes.is_empty() || bytes.len() > MAX_BYTES {
        return Err(AppError::Format("a imagem está vazia ou passa de 4 MB".into()));
    }
    Ok(format!("data:{kind};base64,{}", B64.encode(bytes)))
}

/// `repo` is `owner/repo` (GitHub) or the project path (GitLab); `git_ref` a branch name.
#[tauri::command]
pub async fn pr_blob_image(
    app: tauri::AppHandle,
    forge: String,
    repo: String,
    path: String,
    git_ref: String,
) -> Result<String> {
    let kind = mime(&path).ok_or_else(|| AppError::Format("só PNG, JPG, GIF e WebP têm prévia".into()))?;
    if !valid_repo_path(&repo, if forge == "gitlab" { 20 } else { 2 }) || !valid_path(&path) || !valid_ref(&git_ref) {
        return Err(AppError::Format("imagem inválida".into()));
    }
    run(move || {
        if forge == "gitlab" {
            let acc = crate::gitlab::cmd::account(&app)?;
            let url = format!(
                "{}/api/v4/projects/{}/repository/files/{}/raw",
                acc.base,
                encode_segment(&repo),
                encode_segment(&path)
            );
            let res = crate::gitlab::client()?
                .get(url)
                .query(&[("ref", git_ref.as_str())])
                .bearer_auth(acc.token.as_str())
                .send()
                .map_err(crate::gitlab::network)?;
            return read(res, kind);
        }
        let state = app.state::<AppState>();
        if !state.is_unlocked() {
            return Err(AppError::Locked);
        }
        let token = crate::github::cmd_lists::token(&app)?;
        let encoded: Vec<String> = path.split('/').map(encode_segment).collect();
        let res = crate::github::client()?
            .get(format!("{}/repos/{repo}/contents/{}", crate::github::API, encoded.join("/")))
            .query(&[("ref", git_ref.as_str())])
            .header(ACCEPT, "application/vnd.github.raw+json")
            .bearer_auth(token.as_str())
            .send()
            .map_err(crate::github::network)?;
        read(res, kind)
    })
    .await
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn only_raster_pictures_have_a_preview() {
        assert_eq!(mime("docs/a.PNG"), Some("image/png"));
        assert_eq!(mime("a.jpeg"), Some("image/jpeg"));
        assert_eq!(mime("logo.svg"), None);
        assert_eq!(mime("README"), None);
    }

    #[test]
    fn a_path_and_a_ref_cannot_climb_or_inject() {
        assert!(valid_path("docs/prints/a.png"));
        assert!(!valid_path("../secrets.png"));
        assert!(!valid_path("a//b.png"));
        assert!(!valid_path("a\\b.png"));
        assert!(!valid_path("a\nb.png"));
        assert!(valid_ref("claude/project-thread-27cg2r"));
        assert!(valid_ref("release/1.2+rc@1"));
        assert!(!valid_ref("-flag"));
        assert!(!valid_ref("a..b"));
        assert!(!valid_ref("a b"));
        assert!(!valid_ref("a?x=1"));
    }
}
