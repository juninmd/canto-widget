//! HTTP clients share tauri-plugin-updater's TLS setup: rustls with no built-in provider, ring installed here.
use std::sync::OnceLock;

use reqwest::blocking::Client;

/// Idempotent: the first call installs ring for the process, later ones (or the updater's own) are no-ops.
pub fn client_builder() -> reqwest::blocking::ClientBuilder {
    let _ = rustls::crypto::ring::default_provider().install_default();
    reqwest::blocking::Client::builder()
}

/// One client per call site for the whole process: building one spawns a runtime thread and loads the TLS roots,
/// and only a kept client reuses its pooled keep-alive connections (no new TLS handshake per request or page).
/// A failed build is not cached, so the next call tries again. The kept client is never dropped, which also keeps
/// it clear of the "dropped on a tokio thread" panic.
pub fn shared(
    cell: &'static OnceLock<Client>,
    build: impl FnOnce() -> reqwest::Result<Client>,
) -> reqwest::Result<Client> {
    if let Some(client) = cell.get() {
        return Ok(client.clone());
    }
    let built = build()?;
    // A racing caller may have stored its own first; everyone then uses that one (a clone is an Arc bump).
    Ok(cell.get_or_init(|| built).clone())
}

#[cfg(test)]
mod tests {
    use std::sync::atomic::{AtomicUsize, Ordering};
    use std::sync::OnceLock;

    #[test]
    fn a_client_builds_without_the_updater_having_run_first() {
        assert!(super::client_builder().build().is_ok());
        assert!(super::client_builder().build().is_ok());
    }

    #[test]
    fn a_shared_client_is_built_once_and_reused() {
        static CELL: OnceLock<reqwest::blocking::Client> = OnceLock::new();
        let builds = AtomicUsize::new(0);
        for _ in 0..3 {
            let client = super::shared(&CELL, || {
                builds.fetch_add(1, Ordering::SeqCst);
                super::client_builder().build()
            });
            assert!(client.is_ok());
        }
        assert_eq!(builds.load(Ordering::SeqCst), 1);
    }

    #[test]
    fn a_failed_build_is_not_cached_and_the_next_call_retries() {
        static CELL: OnceLock<reqwest::blocking::Client> = OnceLock::new();
        // An unparsable proxy URL fails without touching the network.
        let broken = || reqwest::Proxy::all("http://[::1").and_then(|p| super::client_builder().proxy(p).build());
        assert!(super::shared(&CELL, broken).is_err());
        assert!(CELL.get().is_none());
        assert!(super::shared(&CELL, || super::client_builder().build()).is_ok());
        assert!(CELL.get().is_some());
    }
}

#[cfg(test)]
mod live {
    /// Hits the real endpoints the app talks to; run with `cargo test -- --ignored` after touching TLS or reqwest.
    #[test]
    #[ignore = "needs network"]
    fn tls_handshake_with_github_and_google_succeeds() {
        let client = super::client_builder().user_agent("canto-widget").build().unwrap();
        for url in ["https://api.github.com/zen", "https://www.googleapis.com/discovery/v1/apis?name=calendar"] {
            let status = client.get(url).send().unwrap_or_else(|e| panic!("{url}: {e}")).status();
            assert!(status.is_success(), "{url}: {status}");
        }
    }
}
