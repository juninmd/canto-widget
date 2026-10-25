use base64::{engine::general_purpose::STANDARD as B64, Engine};
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};

use crate::crypto::{random_salt, VaultKey};
use crate::error::{AppError, Result};

pub const VAULT_AAD: &[u8] = b"canto.vault.v1";
pub const DRIVE_AAD: &[u8] = b"canto.drive.v1";
pub const GITHUB_AAD: &[u8] = b"canto.github.v1";
pub const GITLAB_AAD: &[u8] = b"canto.gitlab.v1";
pub const MODELS_AAD: &[u8] = b"canto.models.v1";
pub const STEAM_AAD: &[u8] = b"canto.steam.v1";
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
        Self { alg: "argon2id".into(), m_kib: 19 * 1024, t: 2, p: 1 }
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
        B64.decode(&self.salt).map_err(|e| AppError::Format(e.to_string()))
    }

    pub fn open(&self, key: &VaultKey, aad: &[u8]) -> Result<Vec<u8>> {
        if self.version != FORMAT_VERSION {
            return Err(AppError::Format(format!("versão de cofre {} não suportada", self.version)));
        }
        let nonce = B64.decode(&self.nonce).map_err(|e| AppError::Format(e.to_string()))?;
        let ct = B64.decode(&self.ciphertext).map_err(|e| AppError::Format(e.to_string()))?;
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

pub fn activity_path(dir: &Path) -> PathBuf {
    dir.join("atividade.json")
}

pub fn mentions_path(dir: &Path) -> PathBuf {
    dir.join("mencoes.json")
}

pub fn health_path(dir: &Path) -> PathBuf {
    dir.join("saude.json")
}

pub fn github_path(dir: &Path) -> PathBuf {
    dir.join("github.json")
}

pub fn gitlab_path(dir: &Path) -> PathBuf {
    dir.join("gitlab.json")
}

/// Alert choice plus the last ranking and top 10 seen.
pub fn models_path(dir: &Path) -> PathBuf {
    dir.join("modelos_ia.json")
}

/// The SteamID64 and the optional Web API key; never a list, which is fetched fresh.
pub fn traffic_path(dir: &Path) -> PathBuf {
    dir.join("transito.json")
}

pub fn steam_path(dir: &Path) -> PathBuf {
    dir.join("steam.json")
}

/// The price alerts choice and the last price seen for each wishlist game.
pub fn steam_deals_path(dir: &Path) -> PathBuf {
    dir.join("steam_ofertas.json")
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
    let written = write_private(&tmp, bytes).and_then(|_| std::fs::rename(&tmp, path));
    if written.is_err() {
        // A half-written temp would sit next to the vault forever; the original file is still intact.
        let _ = std::fs::remove_file(&tmp);
    }
    Ok(written?)
}

/// Owner-only (0600) on unix: the rename keeps the temp's mode, so a sealed file never lands readable by others.
fn write_private(tmp: &Path, bytes: &[u8]) -> std::io::Result<()> {
    use std::io::Write;
    let mut options = std::fs::OpenOptions::new();
    options.write(true).create(true).truncate(true);
    #[cfg(unix)]
    std::os::unix::fs::OpenOptionsExt::mode(&mut options, 0o600);
    let mut f = options.open(tmp)?;
    // `mode` only applies on creation: a stale temp left by a crash would otherwise keep its old mode.
    #[cfg(unix)]
    f.set_permissions(std::os::unix::fs::PermissionsExt::from_mode(0o600))?;
    f.write_all(bytes)?;
    // Without flushing before the rename, a power loss could leave the new name pointing at empty content.
    f.sync_all()
}

/// Reads a file the user picked (or a synced folder holds) without trusting its size: the read stops past `max`
/// even if the file grows meanwhile, and a FIFO or device posing as one is refused instead of blocking forever.
pub fn read_capped(path: &Path, max: u64, too_big: &str) -> Result<Vec<u8>> {
    use std::io::Read;
    let mut options = std::fs::OpenOptions::new();
    options.read(true);
    // Opening a FIFO blocks until a writer shows up; non-blocking open returns at once, and the type is then
    // checked on the handle itself, so nothing can be swapped in between the check and the read.
    #[cfg(unix)]
    std::os::unix::fs::OpenOptionsExt::custom_flags(&mut options, libc::O_NONBLOCK);
    let file = options.open(path)?;
    if !file.metadata()?.is_file() {
        return Err(AppError::Config("não é um arquivo comum".into()));
    }
    let mut bytes = Vec::new();
    file.take(max + 1).read_to_end(&mut bytes)?;
    if bytes.len() as u64 > max {
        return Err(AppError::Config(too_big.into()));
    }
    Ok(bytes)
}

/// Suffix instead of swapping the extension: exporting `x.canto`, `x.tmp` could be a user's own file and get overwritten.
fn tmp_path(path: &Path) -> PathBuf {
    let mut name = path.file_name().unwrap_or_default().to_os_string();
    name.push(".tmp");
    path.with_file_name(name)
}

#[cfg(test)]
pub(crate) mod tests {
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

    #[cfg(unix)]
    #[test]
    fn written_files_are_owner_only_even_over_a_stale_temp() {
        use std::os::unix::fs::PermissionsExt;
        let dir = tmpdir("modo");
        std::fs::create_dir_all(&dir).unwrap();
        let target = vault_path(&dir);
        std::fs::write(tmp_path(&target), b"sobra de um crash").unwrap();
        std::fs::set_permissions(tmp_path(&target), std::fs::Permissions::from_mode(0o644)).unwrap();
        write_bytes_atomic(&target, b"selado").unwrap();
        assert_eq!(std::fs::metadata(&target).unwrap().permissions().mode() & 0o777, 0o600);
        assert_eq!(std::fs::read(&target).unwrap(), b"selado");
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn a_failed_write_leaves_no_temp_behind() {
        let dir = tmpdir("falha");
        // Renaming a file over a non-empty directory always fails, after the temp was written.
        let target = dir.join("ocupado");
        std::fs::create_dir_all(target.join("dentro")).unwrap();
        assert!(write_bytes_atomic(&target, b"x").is_err());
        assert!(!tmp_path(&target).exists(), "temp file was left behind");
        assert!(target.join("dentro").is_dir());
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn capped_read_refuses_oversized_files_and_non_files() {
        let dir = tmpdir("teto");
        std::fs::create_dir_all(&dir).unwrap();
        let file = dir.join("b.canto");
        std::fs::write(&file, b"12345").unwrap();
        assert_eq!(read_capped(&file, 5, "grande").unwrap(), b"12345");
        assert!(matches!(read_capped(&file, 4, "grande"), Err(AppError::Config(m)) if m == "grande"));
        assert!(read_capped(&dir, 1024, "grande").is_err(), "read a directory");
        assert!(read_capped(&dir.join("nada"), 1024, "grande").is_err());
        let _ = std::fs::remove_dir_all(&dir);
    }

    /// Creates a real FIFO; with no writer, a blocking open on it would never return.
    #[cfg(unix)]
    pub(crate) fn make_fifo(path: &Path) {
        use std::os::unix::ffi::OsStrExt;
        let c = std::ffi::CString::new(path.as_os_str().as_bytes()).unwrap();
        assert_eq!(unsafe { libc::mkfifo(c.as_ptr(), 0o600) }, 0, "mkfifo failed");
    }

    /// Runs `f` on a thread and fails the test if it hasn't returned in 5 s, instead of hanging the suite.
    #[cfg(unix)]
    pub(crate) fn within_5s<T: Send + 'static>(f: impl FnOnce() -> T + Send + 'static) -> T {
        let (tx, rx) = std::sync::mpsc::channel();
        std::thread::spawn(move || {
            let _ = tx.send(f());
        });
        rx.recv_timeout(std::time::Duration::from_secs(5)).expect("blocked on the FIFO")
    }

    #[cfg(unix)]
    #[test]
    fn capped_read_refuses_a_fifo_without_blocking() {
        let dir = tmpdir("fifo");
        std::fs::create_dir_all(&dir).unwrap();
        let fifo = dir.join("backup.canto");
        make_fifo(&fifo);
        let path = fifo.clone();
        let res = within_5s(move || read_capped(&path, 1024, "grande"));
        assert!(matches!(res, Err(AppError::Config(m)) if m == "não é um arquivo comum"));
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn missing_file_returns_none() {
        let missing = tmpdir("vazio").join("nada.json");
        assert!(read_json::<KdfParams>(&missing).unwrap().is_none());
    }
}
