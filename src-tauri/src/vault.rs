use std::path::PathBuf;
use std::sync::Mutex;
use zeroize::Zeroizing;

use crate::crypto::VaultKey;
use crate::drive::DriveTokens;
use crate::error::{AppError, Result};
use crate::model::{now_ms, VaultData};
use crate::store::{self, SealedBlob, DRIVE_AAD, VAULT_AAD};

/// Piso da senha mestra. Curto por escolha do dono do cofre: o envelope fica em
/// disco e sai da maquina em backups exportados, entao a senha e atacavel offline e nenhum limite
/// de tentativas protege. O Argon2id encarece cada palpite, nao o total deles.
pub const MIN_SENHA: usize = 4;

#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize)]
pub struct DriveConfig {
    #[serde(default)]
    pub client_id: String,
    #[serde(default)]
    pub client_secret: String,
    /// Salvo pelo usuario em Ajustes. Credencial antiga, de antes do cliente embutido, nao conta.
    #[serde(default)]
    pub cliente_proprio: bool,
    #[serde(default)]
    pub tokens: Option<DriveTokens>,
    #[serde(default)]
    pub email: String,
    #[serde(default)]
    pub nome: String,
    /// Foto da conta como `data:` URL; vazia quando nao veio ou nao passou na checagem.
    #[serde(default)]
    pub avatar: String,
}

pub struct Session {
    key: VaultKey,
    /// Necessaria para derivar a chave de um backup importado, que tem salt proprio.
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
    pub lixeira: crate::lixeira::Lixeira,
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
            lixeira: Default::default(),
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

    /// Copia da senha da sessao, para cifra-la com a biometria. Nunca sai do processo.
    pub(crate) fn senha_da_sessao(&self) -> Result<Zeroizing<String>> {
        let guard = self.session.lock().unwrap();
        let session = guard.as_ref().ok_or(AppError::Locked)?;
        Ok(session.password.clone())
    }

    pub fn lock(&self) {
        *self.session.lock().unwrap() = None;
        self.lixeira.esvaziar();
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

    /// Para vigias de fundo: nao conta como uso (auto-lock segue correndo) e so grava
    /// em disco quando a closure diz que mudou algo.
    pub fn em_fundo<T>(&self, f: impl FnOnce(&mut VaultData) -> (T, bool)) -> Result<T> {
        let mut guard = self.session.lock().unwrap();
        let session = guard.as_mut().ok_or(AppError::Locked)?;
        let (out, mudou) = f(&mut session.data);
        if mudou {
            self.persist(session)?;
        }
        Ok(out)
    }

    /// Mutacao do usuario que talvez nao mude nada: grava so se `f` devolver `true`.
    pub fn mutate_se(&self, f: impl FnOnce(&mut VaultData) -> bool) -> Result<()> {
        self.touch();
        let mut guard = self.session.lock().unwrap();
        let session = guard.as_mut().ok_or(AppError::Locked)?;
        if f(&mut session.data) {
            self.persist(session)?;
        }
        Ok(())
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

    /// Abre um envelope de fora (backup importado) com a senha da sessao. O salt
    /// e o do envelope: um backup feito em outra maquina tem salt proprio.
    pub fn abrir_envelope(&self, blob: &SealedBlob) -> Result<VaultData> {
        let guard = self.session.lock().unwrap();
        let session = guard.as_ref().ok_or(AppError::Locked)?;
        let key = VaultKey::derive(&session.password, &blob.salt_bytes()?)?;
        let plain = blob.open(&key, VAULT_AAD).map_err(|e| match e {
            AppError::WrongPassword => {
                AppError::Config("o backup foi criado com outra senha mestra".into())
            }
            outro => outro,
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
    fn vigia_de_lembretes_nao_adia_o_auto_lock_nem_grava_sem_mudanca() {
        let st = estado("em-fundo");
        st.create("senha-mestra").unwrap();
        let antes = std::fs::metadata(store::vault_path(&st.dir)).unwrap().modified().unwrap();
        *st.last_active.lock().unwrap() = now_ms() - 61_000;
        std::thread::sleep(std::time::Duration::from_millis(20));
        st.em_fundo(|d| (d.tasks.len(), false)).unwrap();
        let depois = std::fs::metadata(store::vault_path(&st.dir)).unwrap().modified().unwrap();
        assert_eq!(antes, depois, "regravou o cofre sem nada mudar");
        assert!(st.lock_if_idle(60_000), "o vigia de fundo segurou o cofre aberto");
        assert!(matches!(st.em_fundo(|_| ((), true)), Err(AppError::Locked)));
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
