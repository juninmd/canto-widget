//! Guards the rule in AGENTS.md: a sealed file missing from `password.rs` becomes unreadable after a master password change.
use std::fs;
use std::path::Path;

/// Sealed with their own key or not with the vault key at all, so a password change has nothing to re-seal.
const EXEMPT: &[&str] = &["VAULT_AAD", "biometric.rs", "crypto.rs"];

fn aad_consts(src: &Path) -> Vec<(String, String)> {
    let mut found = Vec::new();
    for entry in fs::read_dir(src).unwrap().flatten() {
        let path = entry.path();
        let file = path.file_name().unwrap().to_string_lossy().into_owned();
        if path.extension().is_none_or(|e| e != "rs") || file.ends_with("_tests.rs") || EXEMPT.contains(&file.as_str())
        {
            continue;
        }
        for line in fs::read_to_string(&path).unwrap().lines() {
            let line = line.trim_start().trim_start_matches("pub ");
            if let Some(rest) =
                line.strip_prefix("const ").filter(|r| r.contains("AAD: &[u8]") && r.contains("b\"canto."))
            {
                let name = rest.split(':').next().unwrap().to_string();
                if !EXEMPT.contains(&name.as_str()) {
                    found.push((file.trim_end_matches(".rs").to_string(), name));
                }
            }
        }
    }
    found
}

#[test]
fn every_sealed_file_is_resealed_on_password_change() {
    let src = Path::new(env!("CARGO_MANIFEST_DIR")).join("src");
    let password = fs::read_to_string(src.join("password.rs")).unwrap();
    let consts = aad_consts(&src);
    assert!(consts.len() >= 8, "the scan found only {consts:?}: the pattern drifted from the source");
    let missing: Vec<_> = consts
        .iter()
        .filter(|(module, name)| {
            // A bare `AAD` is only meaningful with its module; the longer names are unique across the crate.
            let by_module = password.contains(&format!("{module}::{name}"));
            !(by_module || (name != "AAD" && password.contains(name.as_str())))
        })
        .collect();
    assert!(missing.is_empty(), "sealed files absent from password.rs (module, AAD): {missing:?}");
}
