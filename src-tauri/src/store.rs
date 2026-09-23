use base64::{engine::general_purpose::STANDARD as B64, Engine};
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};

use crate::crypto::{random_salt, VaultKey};
use crate::error::{AppError, Result};

pub const VAULT_AAD: &[u8] = b"canto.vault.v1";
pub const DRIVE_AAD: &[u8] = b"canto.drive.v1";
pub const GITHUB_AAD: &[u8] = b"canto.github.v1";
pub const GITLAB_AAD: &[u8] = b"canto.gitlab.v1";
const FORMAT_VERSION: u32 = 1;

/// Written to disk and sent to Drive; salt and nonce are public by design, the key never leaves memory.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SealedBlob {
    pub version: u32,
    pub kdf: KdfParams,
    pub salt: String,
    pub nonce: String,
    pub ciphertext: String,
    /// Logical content timestamp, used to decide sync direction.
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
                "versão de cofre {} não suportada",
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

pub fn github_path(dir: &Path) -> PathBuf {
    dir.join("github.json")
}

pub fn gitlab_path(dir: &Path) -> PathBuf {
    dir.join("gitlab.json")
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

/// Writes to a temp file and renames so a crash mid-write can't truncate the vault (total loss without the GCM tag).
pub fn write_json_atomic<T: Serialize>(path: &Path, value: &T) -> Result<()> {
    write_bytes_atomic(path, &serde_json::to_vec_pretty(value)?)
}

pub fn write_bytes_atomic(path: &Path, bytes: &[u8]) -> Result<()> {
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    let tmp = tmp_path(path);
    {
        use std::io::Write;
        let mut f = std::fs::File::create(&tmp)?;
        f.write_all(bytes)?;
        // Without flushing before the rename, a power loss could leave the new name pointing at empty content.
        f.sync_all()?;
    }
    std::fs::rename(&tmp, path)?;
    Ok(())
}

/// Suffix instead of swapping the extension: exporting `x.canto`, `x.tmp` could be a user's own file and get overwritten.
fn tmp_path(path: &Path) -> PathBuf {
    let mut name = path.file_name().unwrap_or_default().to_os_string();
    name.push(".tmp");
    path.with_file_name(name)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn tmpdir(name: &str) -> PathBuf {
        let d = std::env::temp_dir().join(format!("canto-store-{name}-{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&d);
        d
    }

    #[test]
    fn writes_and_reads_back_without_leaving_a_temp_file() {
        let dir = tmpdir("roundtrip");
        let target = vault_path(&dir);
        write_json_atomic(&target, &KdfParams::default()).unwrap();
        let read: KdfParams = read_json(&target).unwrap().unwrap();
        assert_eq!(read.m_kib, KdfParams::default().m_kib);
        assert!(!tmp_path(&target).exists(), "temp file was left behind");
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn rewriting_replaces_the_previous_content() {
        let dir = tmpdir("overwrite");
        let target = settings_path(&dir);
        write_json_atomic(&target, &KdfParams { t: 1, ..Default::default() }).unwrap();
        write_json_atomic(&target, &KdfParams { t: 9, ..Default::default() }).unwrap();
        let read: KdfParams = read_json(&target).unwrap().unwrap();
        assert_eq!(read.t, 9);
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn temp_file_does_not_clobber_a_neighboring_user_file() {
        let dir = tmpdir("vizinho");
        std::fs::create_dir_all(&dir).unwrap();
        std::fs::write(dir.join("backup.tmp"), b"do usuario").unwrap();
        write_bytes_atomic(&dir.join("backup.canto"), b"envelope").unwrap();
        assert_eq!(std::fs::read(dir.join("backup.tmp")).unwrap(), b"do usuario");
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn missing_file_returns_none() {
        let missing = tmpdir("vazio").join("nada.json");
        assert!(read_json::<KdfParams>(&missing).unwrap().is_none());
    }
}
