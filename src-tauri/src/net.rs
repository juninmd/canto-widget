//! HTTP clients share tauri-plugin-updater's TLS setup: rustls with no built-in provider, ring installed here.

/// Idempotent: the first call installs ring for the process, later ones (or the updater's own) are no-ops.
pub fn client_builder() -> reqwest::blocking::ClientBuilder {
    let _ = rustls::crypto::ring::default_provider().install_default();
    reqwest::blocking::Client::builder()
}

#[cfg(test)]
mod tests {
    #[test]
    fn a_client_builds_without_the_updater_having_run_first() {
        assert!(super::client_builder().build().is_ok());
        assert!(super::client_builder().build().is_ok());
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
