use std::path::PathBuf;
use std::sync::Mutex;
use zeroize::Zeroizing;

use crate::crypto::VaultKey;
use crate::drive::{self, DriveTokens};
use crate::error::{AppError, Result};
use crate::model::{now_ms, VaultData};
use crate::store::{self, SealedBlob, DRIVE_AAD, VAULT_AAD};

/// Piso da senha mestra. Curto por escolha do dono do cofre: o envelope fica em
/// disco e sobe para o Drive, entao a senha e atacavel offline e nenhum limite
/// de tentativas protege. O Argon2id encarece cada palpite, nao o total deles.
pub const MIN_SENHA: usize = 4;

#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize)]
pub struct DriveConfig {
    #[serde(default)]
    pub client_id: String,
    #[serde(default)]
    pub client_secret: String,
    #[serde(default)]
    pub tokens: Option<DriveTokens>,
    #[serde(default)]
    pub email: String,
}

pub struct Session {
    key: VaultKey,
    /// Necessaria para derivar a chave do envelope remoto, que tem salt proprio.
    password: Zeroizing<String>,
    salt: Vec<u8>,
    pub data: VaultData,
}

impl Session {
    pub fn key(&self) -> &VaultKey {
        &self.key
    }
    pub fn salt(&self) -> &[u8] {
        &self.salt
    }
}

pub struct AppState {
    pub dir: PathBuf,
    pub session: Mutex<Option<Session>>,
    /// Ultimo evento que disparou o pop-up, lido pela janela de alerta.
    pub alerta: Mutex<Option<crate::calendar::AgendaItem>>,
    /// Instante do ultimo uso deliberado do cofre, base do auto-lock.
    /// Pollings de fundo (clipboard, agenda) de proposito nao mexem aqui.
    last_active: Mutex<i64>,
}

impl AppState {
    pub fn new(dir: PathBuf) -> Self {
        Self {
            dir,
            session: Mutex::new(None),
            alerta: Mutex::new(None),
            last_active: Mutex::new(now_ms()),
        }
    }

    pub fn touch(&self) {
        *self.last_active.lock().unwrap() = now_ms();
    }

    pub fn idle_ms(&self) -> i64 {
        now_ms() - *self.last_active.lock().unwrap()
    }

    /// Tranca o cofre se ficou parado alem do limite. Devolve `true` so na
    /// transicao, para o watchdog avisar a UI uma vez por vez.
    pub fn lock_if_idle(&self, limite_ms: i64) -> bool {
        if !self.is_unlocked() || self.idle_ms() < limite_ms {
            return false;
        }
        self.lock();
        true
    }

    pub fn vault_exists(&self) -> bool {
        store::vault_path(&self.dir).exists()
    }

    pub fn create(&self, password: &str) -> Result<()> {
        if self.vault_exists() {
            return Err(AppError::AlreadyExists);
        }
        if password.chars().count() < MIN_SENHA {
            return Err(AppError::Config(format!(
                "a senha mestra precisa de ao menos {MIN_SENHA} caracteres"
            )));
        }
        let salt = store::new_salt();
        let key = VaultKey::derive(password, &salt)?;
        let session = Session {
            key,
            password: Zeroizing::new(password.to_string()),
            salt,
            data: VaultData::default(),
        };
        self.persist(&session)?;
        *self.session.lock().unwrap() = Some(session);
        self.touch();
        Ok(())
    }

    pub fn unlock(&self, password: &str) -> Result<()> {
        let blob: SealedBlob = store::read_json(&store::vault_path(&self.dir))?
            .ok_or(AppError::NotFound)?;
        let salt = blob.salt_bytes()?;
        let key = VaultKey::derive(password, &salt)?;
        let plain = blob.open(&key, VAULT_AAD)?;
        let data: VaultData = serde_json::from_slice(&plain)?;
        *self.session.lock().unwrap() = Some(Session {
            key,
            password: Zeroizing::new(password.to_string()),
            salt,
            data,
        });
        self.touch();
        Ok(())
    }

    pub fn lock(&self) {
        *self.session.lock().unwrap() = None;
    }

    pub fn is_unlocked(&self) -> bool {
        self.session.lock().unwrap().is_some()
    }

    fn persist(&self, session: &Session) -> Result<()> {
        let plain = serde_json::to_vec(&session.data)?;
        let blob = SealedBlob::seal(&session.key, &session.salt, &plain, VAULT_AAD, now_ms())?;
        store::write_json_atomic(&store::vault_path(&self.dir), &blob)
    }

    /// Aplica uma mutacao no cofre destrancado e grava em disco no mesmo passo.
    pub fn mutate<T>(&self, f: impl FnOnce(&mut VaultData) -> T) -> Result<T> {
        self.touch();
        let mut guard = self.session.lock().unwrap();
        let session = guard.as_mut().ok_or(AppError::Locked)?;
        let out = f(&mut session.data);
        self.persist(session)?;
        Ok(out)
    }

    pub fn read<T>(&self, f: impl FnOnce(&VaultData) -> T) -> Result<T> {
        self.touch();
        let guard = self.session.lock().unwrap();
        let session = guard.as_ref().ok_or(AppError::Locked)?;
        Ok(f(&session.data))
    }

    pub fn drive_config(&self) -> Result<DriveConfig> {
        let guard = self.session.lock().unwrap();
        let session = guard.as_ref().ok_or(AppError::Locked)?;
        match store::read_json::<SealedBlob>(&store::drive_path(&self.dir))? {
            None => Ok(DriveConfig::default()),
            Some(blob) => Ok(serde_json::from_slice(&blob.open(&session.key, DRIVE_AAD)?)?),
        }
    }

    pub fn save_drive_config(&self, cfg: &DriveConfig) -> Result<()> {
        let guard = self.session.lock().unwrap();
        let session = guard.as_ref().ok_or(AppError::Locked)?;
        let plain = serde_json::to_vec(cfg)?;
        let blob = SealedBlob::seal(&session.key, &session.salt, &plain, DRIVE_AAD, now_ms())?;
        store::write_json_atomic(&store::drive_path(&self.dir), &blob)
    }

    /// Puxa o envelope remoto, funde e devolve o novo estado ja cifrado para subir.
    /// O Drive so ve bytes opacos: a fusao acontece inteira em memoria local.
    pub fn sync(&self) -> Result<i64> {
        let mut cfg = self.drive_config()?;
        let tokens = cfg.tokens.as_mut().ok_or_else(|| {
            AppError::Config("conecte a conta do Google antes de sincronizar".into())
        })?;
        let token = drive::fresh_access_token(tokens, &cfg.client_id, &cfg.client_secret)?;
        let remote = drive::find_vault(&token)?;

        if let Some(meta) = &remote {
            let bytes = drive::download(&token, &meta.id)?;
            let blob: SealedBlob = serde_json::from_slice(&bytes)
                .map_err(|e| AppError::Drive(format!("envelope remoto ilegivel: {e}")))?;
            let remote_data = self.open_remote(&blob)?;
            self.mutate(|local| {
                let merged = std::mem::take(local).merge(remote_data);
                *local = merged;
            })?;
        }

        let payload = std::fs::read(store::vault_path(&self.dir))?;
        let id = drive::upload(&token, remote.as_ref().map(|m| m.id.as_str()), &payload)?;
        cfg.tokens.as_mut().unwrap().access_token = token;
        self.save_drive_config(&cfg)?;
        let _ = id;
        Ok(now_ms())
    }

    fn open_remote(&self, blob: &SealedBlob) -> Result<VaultData> {
        let guard = self.session.lock().unwrap();
        let session = guard.as_ref().ok_or(AppError::Locked)?;
        let remote_salt = blob.salt_bytes()?;
        let key = if remote_salt == session.salt {
            VaultKey::derive(&session.password, &session.salt)?
        } else {
            VaultKey::derive(&session.password, &remote_salt)?
        };
        let plain = blob.open(&key, VAULT_AAD).map_err(|_| {
            AppError::Drive("o cofre no Drive foi criado com outra senha mestra".into())
        })?;
        Ok(serde_json::from_slice(&plain)?)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn estado(nome: &str) -> AppState {
        let dir = std::env::temp_dir().join(format!(
            "canto-vault-{nome}-{}-{}",
            std::process::id(),
            now_ms()
        ));
        let _ = std::fs::remove_dir_all(&dir);
        AppState::new(dir)
    }

    #[test]
    fn senha_curta_nao_cria_cofre() {
        let st = estado("curta");
        assert!(st.create("abc").is_err(), "aceitou senha abaixo do piso");
        assert!(!st.vault_exists());
        let _ = std::fs::remove_dir_all(&st.dir);
    }

    #[test]
    fn senha_no_piso_exato_e_aceita() {
        let st = estado("piso");
        let senha: String = "a".repeat(MIN_SENHA);
        st.create(&senha).unwrap();
        assert!(st.is_unlocked());
        let _ = std::fs::remove_dir_all(&st.dir);
    }

    #[test]
    fn o_piso_conta_caracteres_e_nao_bytes() {
        let st = estado("unicode");
        // 4 caracteres, 16 bytes em UTF-8: precisa passar.
        assert!(st.create("🔐🔐🔐🔐").is_ok());
        let _ = std::fs::remove_dir_all(&st.dir);
    }

    #[test]
    fn cofre_criado_abre_com_a_mesma_senha_e_recusa_outra() {
        let st = estado("abre");
        st.create("senha-mestra").unwrap();
        st.lock();
        assert!(matches!(st.unlock("outra-senha"), Err(AppError::WrongPassword)));
        st.unlock("senha-mestra").unwrap();
        assert!(st.is_unlocked());
        let _ = std::fs::remove_dir_all(&st.dir);
    }

    #[test]
    fn auto_lock_dispara_uma_vez_depois_do_limite() {
        let st = estado("idle");
        st.create("senha-mestra").unwrap();
        assert!(!st.lock_if_idle(60_000), "trancou com o cofre recem-usado");
        *st.last_active.lock().unwrap() = now_ms() - 61_000;
        assert!(st.lock_if_idle(60_000), "nao trancou apos o limite");
        assert!(!st.is_unlocked());
        assert!(!st.lock_if_idle(60_000), "avisou duas vezes pela mesma trancada");
        let _ = std::fs::remove_dir_all(&st.dir);
    }

    #[test]
    fn uso_do_cofre_adia_o_auto_lock() {
        let st = estado("adia");
        st.create("senha-mestra").unwrap();
        *st.last_active.lock().unwrap() = now_ms() - 61_000;
        st.read(|d| d.tasks.len()).unwrap();
        assert!(!st.lock_if_idle(60_000), "leitura do usuario nao adiou o timer");
        let _ = std::fs::remove_dir_all(&st.dir);
    }

    #[test]
    fn clipboard_de_fundo_nao_adia_o_auto_lock() {
        let st = estado("fundo");
        st.create("senha-mestra").unwrap();
        *st.last_active.lock().unwrap() = now_ms() - 61_000;
        // Polling de fundo: le e grava o historico sem passar por read/mutate.
        let hist = st.clip_load().unwrap();
        st.clip_save(&hist).unwrap();
        assert!(st.lock_if_idle(60_000), "o vigia do clipboard segurou o cofre aberto");
        let _ = std::fs::remove_dir_all(&st.dir);
    }
}
