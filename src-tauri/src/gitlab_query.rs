//! GitLab API v4 requests behind each tab section, and the checks on the instance address and token.
use crate::error::{AppError, Result};
use crate::forge_filter::{page, Activity, ForgeFilter, Kind, Section, Sort, PER_PAGE};

#[derive(Debug, PartialEq)]
pub struct Request {
    pub path: &'static str,
    pub params: Vec<(&'static str, String)>,
}

impl Request {
    pub fn is_mr(&self) -> bool {
        self.path == "merge_requests"
    }

    pub fn page(&self) -> u32 {
        self.params.iter().find(|(k, _)| *k == "page").and_then(|(_, v)| v.parse().ok()).unwrap_or(1)
    }
}

/// One request per item type, like GitHub: issues and MRs live on different endpoints.
pub fn requests(section: Section, username: &str, p: u32, f: &ForgeFilter) -> Result<Vec<Request>> {
    let order_by = match f.sort {
        Sort::Updated => "updated_at",
        Sort::Created => "created_at",
        Sort::Comments => return Err(AppError::Gitlab("o GitLab não ordena por comentários".into())),
    };
    let (issue, mr) = match section {
        // The MR list defaults to created_by_me; reviewer needs scope=all to look past the user's own MRs.
        Section::ReviewRequested => (None, Some(vec![("scope", "all"), ("reviewer_username", username)])),
        Section::Assigned => (Some(vec![("scope", "assigned_to_me")]), Some(vec![("scope", "assigned_to_me")])),
        Section::MyPrs => (None, Some(vec![("scope", "created_by_me")])),
        Section::MyIssues => (Some(vec![("scope", "created_by_me")]), None),
    };
    let text = f.text();
    let mut out = Vec::new();
    for (kind, who, path) in [(Kind::Issue, issue, "issues"), (Kind::Pr, mr, "merge_requests")] {
        let Some(who) = who else { continue };
        if !f.wants(kind) {
            continue;
        }
        let mut params = vec![
            ("state", "opened".to_string()),
            ("order_by", order_by.to_string()),
            ("sort", f.order.as_str().to_string()),
            ("per_page", PER_PAGE.to_string()),
            ("page", page(p).to_string()),
        ];
        params.extend(who.into_iter().map(|(k, v)| (k, v.to_string())));
        if !text.is_empty() {
            params.push(("search", text.clone()));
        }
        out.push(Request { path, params });
    }
    Ok(out)
}

/// The day summary's MRs since `since` (RFC 3339): opened in any state, merged, or reviewed/approved by me.
/// A merge bumps `updated_at`; `approved_by_usernames` is ignored on Free, where reviewer alone still narrows it.
pub fn activity_since(activity: Activity, username: &str, since: &str) -> Request {
    let params: Vec<(&'static str, &str)> = match activity {
        Activity::Opened => vec![("scope", "created_by_me"), ("state", "all"), ("created_after", since)],
        Activity::Merged => vec![("scope", "created_by_me"), ("state", "merged"), ("updated_after", since)],
        Activity::Reviewed => vec![
            ("scope", "all"),
            ("state", "all"),
            ("reviewer_username", username),
            ("approved_by_usernames[]", username),
            ("updated_after", since),
        ],
    };
    let order = if activity == Activity::Opened { "created_at" } else { "updated_at" };
    let mut params: Vec<_> = params.into_iter().map(|(k, v)| (k, v.to_string())).collect();
    params.extend([("order_by", order.to_string()), ("sort", "desc".to_string()), ("page", "1".to_string())]);
    params.push(("per_page", PER_PAGE.to_string()));
    Request { path: "merge_requests", params }
}

/// https only, no credentials, query or fragment; a path stays for instances served under a prefix.
/// Without a scheme, https is assumed: people paste `gitlab.acme.com`.
pub fn base_url(input: &str) -> Result<String> {
    let input = input.trim();
    let with_scheme = if input.contains("://") { input.to_string() } else { format!("https://{input}") };
    let bad = |m: &str| AppError::Gitlab(m.into());
    let url = url::Url::parse(&with_scheme).map_err(|_| bad("endereço inválido; use algo como https://gitlab.com"))?;
    if url.scheme() != "https" {
        return Err(bad("o endereço precisa começar com https://"));
    }
    if url.host_str().is_none_or(str::is_empty)
        || !url.username().is_empty()
        || url.password().is_some()
        || url.query().is_some()
        || url.fragment().is_some()
    {
        return Err(bad("use só o endereço da instância, sem usuário, senha ou parâmetros"));
    }
    Ok(url.as_str().trim_end_matches('/').to_string())
}

/// Personal/project/group tokens are printable ASCII; anything else is a paste accident.
pub fn token(input: &str) -> Result<&str> {
    let t = input.trim();
    if (20..=255).contains(&t.len()) && t.bytes().all(|b| b.is_ascii_graphic()) {
        Ok(t)
    } else {
        Err(AppError::Gitlab("token inválido; gere um token de acesso pessoal com o escopo read_api".into()))
    }
}

#[cfg(test)]
#[path = "gitlab_query_tests.rs"]
mod tests;
