use base64::{engine::general_purpose::STANDARD as B64, Engine};
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};

use crate::crypto::{random_salt, VaultKey};
use crate::error::{AppError, Result};

pub const VAULT_AAD: &[u8] = b"canto.vault.v1";
pub const DRIVE_AAD: &[u8] = b"canto.drive.v1";
const FORMAT_VERSION: u32 = 1;

/// Envelope gravado em disco e enviado ao Drive. Nada aqui e legivel sem a senha:
/// o salt e o nonce sao publicos por design, a chave nunca sai da memoria.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SealedBlob {
    pub version: u32,
    pub kdf: KdfParams,
    pub salt: String,
    pub nonce: String,
    pub ciphertext: String,
    /// Instante logico do conteudo, usado para decidir a direcao do sync.
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KdfParams {
    pub alg: String,
    pub m_kib: u32,
    pub t: u32,
    pub p: u32,
}

impl Default for KdfParams {
    fn default() -> Self {
        Self {
            alg: "argon2id".into(),
            m_kib: 19 * 1024,
            t: 2,
            p: 1,
        }
    }
}

impl SealedBlob {
    pub fn seal(key: &VaultKey, salt: &[u8], plaintext: &[u8], aad: &[u8], at: i64) -> Result<Self> {
        let (nonce, ciphertext) = key.encrypt(plaintext, aad)?;
        Ok(Self {
            version: FORMAT_VERSION,
            kdf: KdfParams::default(),
            salt: B64.encode(salt),
            nonce: B64.encode(nonce),
            ciphertext: B64.encode(ciphertext),
            updated_at: at,
        })
    }

    pub fn salt_bytes(&self) -> Result<Vec<u8>> {
        B64.decode(&self.salt)
            .map_err(|e| AppError::Format(e.to_string()))
    }

    pub fn open(&self, key: &VaultKey, aad: &[u8]) -> Result<Vec<u8>> {
        if self.version != FORMAT_VERSION {
            return Err(AppError::Format(format!(
                "versao de cofre {} nao suportada",
                self.version
            )));
        }
        let nonce = B64
            .decode(&self.nonce)
            .map_err(|e| AppError::Format(e.to_string()))?;
        let ct = B64
            .decode(&self.ciphertext)
            .map_err(|e| AppError::Format(e.to_string()))?;
        self.decrypt_parts(key, &nonce, &ct, aad)
    }

    fn decrypt_parts(&self, key: &VaultKey, nonce: &[u8], ct: &[u8], aad: &[u8]) -> Result<Vec<u8>> {
        key.decrypt(nonce, ct, aad)
    }
}

pub fn new_salt() -> Vec<u8> {
    random_salt().to_vec()
}

pub fn vault_path(dir: &Path) -> PathBuf {
    dir.join("vault.json")
}

pub fn drive_path(dir: &Path) -> PathBuf {
    dir.join("drive.json")
}

pub fn clip_path(dir: &Path) -> PathBuf {
    dir.join("clipboard.json")
}

pub fn settings_path(dir: &Path) -> PathBuf {
    dir.join("settings.json")
}

pub fn read_json<T: for<'de> Deserialize<'de>>(path: &Path) -> Result<Option<T>> {
    match std::fs::read(path) {
        Ok(bytes) => Ok(Some(serde_json::from_slice(&bytes)?)),
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(None),
        Err(e) => Err(e.into()),
    }
}

/// Grava em arquivo temporario e renomeia: uma queda no meio da escrita nao
/// deixa o cofre truncado (perda total, ja que sem o tag GCM nada abre).
pub fn write_json_atomic<T: Serialize>(path: &Path, value: &T) -> Result<()> {
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    let tmp = path.with_extension("tmp");
    std::fs::write(&tmp, serde_json::to_vec_pretty(value)?)?;
    std::fs::rename(&tmp, path)?;
    Ok(())
}
