use base64::{engine::general_purpose::STANDARD as B64, Engine};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::path::{Path, PathBuf};
use zeroize::Zeroizing;

use crate::crypto::VaultKey;
use crate::error::{AppError, Result};
use crate::store;

const AAD: &[u8] = b"canto.biometria.v1";
const DOMAIN: &[u8] = b"canto.hello.kdf.v1";
const VERSION: u32 = 1;

/// Whoever signs the challenge with a key pinned to hardware, unlocked only by biometrics/PIN.
pub trait Signer {
    fn sign(&self, challenge: &[u8]) -> Result<Vec<u8>>;
}

/// Encrypted with a key derived from the challenge signature; useless without the TPM and user gesture, and never goes into an exported backup.
#[derive(Serialize, Deserialize)]
struct Envelope {
    #[serde(rename = "versao", alias = "versao")]
    version: u32,
    #[serde(alias = "desafio")]
    challenge: String,
    nonce: String,
    #[serde(alias = "cifrado")]
    ciphertext: String,
}

pub fn path(dir: &Path) -> PathBuf {
    dir.join("biometria.json")
}

pub fn enabled(dir: &Path) -> bool {
    path(dir).exists()
}

/// For a backend that doesn't use the envelope below (macOS's Keychain stores the password itself):
/// just the presence marker `enabled`/`disable` already check for.
#[cfg(target_os = "macos")]
pub fn mark(dir: &Path) -> Result<()> {
    store::write_json_atomic(&path(dir), &serde_json::json!({ "versao": VERSION }))
}

/// Requires a deterministic signature (RSA PKCS#1 v1.5, like Windows Hello's) so the key can be reconstructed.
fn derive_key(signature: &[u8]) -> VaultKey {
    let mut h = Sha256::new();
    h.update(DOMAIN);
    h.update(signature);
    let mut bytes: [u8; 32] = h.finalize().into();
    let k = VaultKey::from_bytes(bytes);
    zeroize::Zeroize::zeroize(&mut bytes);
    k
}

pub fn enable(dir: &Path, password: &str, signer: &dyn Signer) -> Result<()> {
    let mut challenge = [0u8; 32];
    rand::fill(&mut challenge);
    let signature = Zeroizing::new(signer.sign(&challenge)?);
    let (nonce, ciphertext) = derive_key(&signature).encrypt(password.as_bytes(), AAD)?;
    let env = Envelope {
        version: VERSION,
        challenge: B64.encode(challenge),
        nonce: B64.encode(nonce),
        ciphertext: B64.encode(ciphertext),
    };
    store::write_json_atomic(&path(dir), &env)
}

/// Enables and immediately reopens, so hardware whose signature changes per call (e.g. RSA-PSS) is rejected here, not on the lock screen.
pub fn enable_verified(dir: &Path, password: &str, signer: &dyn Signer) -> Result<()> {
    enable(dir, password, signer)?;
    match open(dir, signer) {
        Ok(back) if back.as_str() == password => Ok(()),
        other => {
            let _ = disable(dir);
            Err(match other {
                Err(AppError::Config(m)) if m.contains("não confere") => AppError::Config(
                    "este dispositivo não gera assinatura estável; biometria não pode proteger a senha aqui".into(),
                ),
                Err(e) => e,
                Ok(_) => AppError::Crypto("biometria devolveu outra senha".into()),
            })
        }
    }
}

pub fn open(dir: &Path, signer: &dyn Signer) -> Result<Zeroizing<String>> {
    let env: Envelope = store::read_json(&path(dir))?
        .ok_or_else(|| AppError::Config("desbloqueio por biometria não está ativo".into()))?;
    if env.version != VERSION {
        return Err(AppError::Format("biometria de versão desconhecida; ative de novo".into()));
    }
    let b = |s: &str| B64.decode(s).map_err(|e| AppError::Format(e.to_string()));
    let signature = Zeroizing::new(signer.sign(&b(&env.challenge)?)?);
    let plain = derive_key(&signature)
        .decrypt(&b(&env.nonce)?, &b(&env.ciphertext)?, AAD)
        .map_err(|_| AppError::Config("a biometria não confere com a deste cofre; ative de novo".into()))?;
    String::from_utf8(plain).map(Zeroizing::new).map_err(|_| AppError::Format("biometria corrompida".into()))
}

pub fn disable(dir: &Path) -> Result<()> {
    match std::fs::remove_file(path(dir)) {
        Err(e) if e.kind() != std::io::ErrorKind::NotFound => Err(e.into()),
        _ => Ok(()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Fake, deterministic signer, like Hello's RSA.
    struct Fake(&'static [u8]);
    impl Signer for Fake {
        fn sign(&self, challenge: &[u8]) -> Result<Vec<u8>> {
            Ok(Sha256::new().chain_update(self.0).chain_update(challenge).finalize().to_vec())
        }
    }
    struct Canceled;
    impl Signer for Canceled {
        fn sign(&self, _: &[u8]) -> Result<Vec<u8>> {
            Err(AppError::Config("cancelado".into()))
        }
    }

    fn dir(name: &str) -> PathBuf {
        let d = std::env::temp_dir().join(format!("canto-bio-{name}-{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&d);
        d
    }

    #[test]
    fn same_hardware_key_returns_the_password() {
        let d = dir("ok");
        enable(&d, "senha-mestra-ç", &Fake(b"tpm-1")).unwrap();
        assert_eq!(open(&d, &Fake(b"tpm-1")).unwrap().as_str(), "senha-mestra-ç");
        let _ = std::fs::remove_dir_all(&d);
    }

    #[test]
    fn file_does_not_store_the_password_in_plaintext() {
        let d = dir("claro");
        enable(&d, "senha-mestra", &Fake(b"tpm-1")).unwrap();
        let raw = std::fs::read_to_string(path(&d)).unwrap();
        assert!(!raw.contains("senha-mestra") && !raw.contains(&B64.encode("senha-mestra")));
        let _ = std::fs::remove_dir_all(&d);
    }

    #[test]
    fn different_hardware_key_or_tampered_file_does_not_open() {
        let d = dir("outra");
        enable(&d, "senha-mestra", &Fake(b"tpm-1")).unwrap();
        assert!(open(&d, &Fake(b"tpm-2")).is_err(), "opened with another machine's key");
        let mut env: Envelope = store::read_json(&path(&d)).unwrap().unwrap();
        let mut ct = B64.decode(&env.ciphertext).unwrap();
        ct[0] ^= 1;
        env.ciphertext = B64.encode(ct);
        store::write_json_atomic(&path(&d), &env).unwrap();
        assert!(open(&d, &Fake(b"tpm-1")).is_err(), "accepted a tampered envelope");
        let _ = std::fs::remove_dir_all(&d);
    }

    /// Signs with a random salt, like RSA-PSS: the key never reconstructs.
    struct Unstable;
    impl Signer for Unstable {
        fn sign(&self, challenge: &[u8]) -> Result<Vec<u8>> {
            let mut salt = [0u8; 16];
            rand::fill(&mut salt);
            Ok(Sha256::new().chain_update(salt).chain_update(challenge).finalize().to_vec())
        }
    }

    #[test]
    fn unstable_signature_is_rejected_on_enable_without_leaving_a_file() {
        let d = dir("instavel");
        let err = enable_verified(&d, "senha-mestra", &Unstable).unwrap_err();
        assert!(err.to_string().contains("assinatura estável"), "{err}");
        assert!(!enabled(&d), "left biometric enabled but it will never open");
        enable_verified(&d, "senha-mestra", &Fake(b"tpm-1")).unwrap();
        assert!(enabled(&d));
        let _ = std::fs::remove_dir_all(&d);
    }

    #[test]
    fn canceling_the_prompt_creates_or_deletes_nothing() {
        let d = dir("cancela");
        assert!(enable(&d, "senha-mestra", &Canceled).is_err());
        assert!(!enabled(&d));
        enable(&d, "senha-mestra", &Fake(b"tpm-1")).unwrap();
        assert!(open(&d, &Canceled).is_err());
        assert!(enabled(&d), "canceling the prompt disabled biometric");
        disable(&d).unwrap();
        disable(&d).unwrap();
        assert!(!enabled(&d));
        let _ = std::fs::remove_dir_all(&d);
    }

    #[test]
    fn envelope_deserializes_legacy_portuguese_keys() {
        let legacy = r#"{"versao":1,"desafio":"YQ==","nonce":"Yg==","cifrado":"Yw=="}"#;
        let env: Envelope = serde_json::from_str(legacy).unwrap();
        assert_eq!(env.version, 1);
        assert_eq!(env.challenge, "YQ==");
        assert_eq!(env.ciphertext, "Yw==");
    }
}
