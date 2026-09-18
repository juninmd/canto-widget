//! Vaults written by earlier builds must keep opening after crypto crate upgrades.
use canto_widget_lib::crypto::VaultKey;
use canto_widget_lib::store::{SealedBlob, VAULT_AAD};

/// Sealed by v0.1.0 (argon2 0.5, aes-gcm 0.10) with the password below; never regenerate it.
const V010_VAULT: &str = r#"{"version":1,"kdf":{"alg":"argon2id","m_kib":19456,"t":2,"p":1},"salt":"Y2FudG8ta2F0LXNhbHQxNg==","nonce":"jQeb56/Berk9LxNa","ciphertext":"2piG92nwnc6B13xVcBO7cyyXnI+VrCEYJqwWN2yS2Q3CeUnDPh8ooVooEQSFVxu9fCp55g==","updated_at":1789750000000}"#;

fn open(password: &str) -> canto_widget_lib::error::Result<Vec<u8>> {
    let blob: SealedBlob = serde_json::from_str(V010_VAULT).unwrap();
    let key = VaultKey::derive(password, &blob.salt_bytes().unwrap())?;
    blob.open(&key, VAULT_AAD)
}

#[test]
fn a_vault_sealed_by_v0_1_0_still_opens_byte_for_byte() {
    let plain = open("senha-de-referencia").unwrap();
    assert_eq!(String::from_utf8(plain).unwrap(), "cofre gravado pela versão 0.1.0 ✓");
}

#[test]
fn the_old_vault_still_refuses_a_wrong_password() {
    assert!(open("senha-errada").is_err());
}
