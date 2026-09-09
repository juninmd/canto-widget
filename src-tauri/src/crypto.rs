use aes_gcm::aead::{Aead, AeadCore, KeyInit, OsRng};
use aes_gcm::{Aes256Gcm, Key, Nonce};
use argon2::{Algorithm, Argon2, Params, Version};
use rand::RngCore;
use zeroize::{Zeroize, ZeroizeOnDrop};

use crate::error::{AppError, Result};

pub const SALT_LEN: usize = 16;
pub const NONCE_LEN: usize = 12;
/// Argon2id: 19 MiB, 2 passes, 1 lane (perfil "interactive" recomendado pela RFC 9106).
const KDF_MEM_KIB: u32 = 19 * 1024;
const KDF_TIME: u32 = 2;
const KDF_LANES: u32 = 1;

#[derive(Zeroize, ZeroizeOnDrop)]
pub struct VaultKey([u8; 32]);

impl VaultKey {
    /// Deriva a chave do cofre a partir da senha mestra. Custo fixo por design:
    /// mudar estes parametros invalida cofres existentes.
    pub fn derive(password: &str, salt: &[u8]) -> Result<Self> {
        if salt.len() != SALT_LEN {
            return Err(AppError::Crypto("salt com tamanho invalido".into()));
        }
        let params = Params::new(KDF_MEM_KIB, KDF_TIME, KDF_LANES, Some(32))
            .map_err(|e| AppError::Crypto(e.to_string()))?;
        let argon = Argon2::new(Algorithm::Argon2id, Version::V0x13, params);
        let mut out = [0u8; 32];
        argon
            .hash_password_into(password.as_bytes(), salt, &mut out)
            .map_err(|e| AppError::Crypto(e.to_string()))?;
        let key = VaultKey(out);
        out.zeroize();
        Ok(key)
    }

    fn cipher(&self) -> Aes256Gcm {
        Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(&self.0))
    }

    pub fn encrypt(&self, plaintext: &[u8], aad: &[u8]) -> Result<(Vec<u8>, Vec<u8>)> {
        let nonce = Aes256Gcm::generate_nonce(&mut OsRng);
        let ciphertext = self
            .cipher()
            .encrypt(
                &nonce,
                aes_gcm::aead::Payload {
                    msg: plaintext,
                    aad,
                },
            )
            .map_err(|_| AppError::Crypto("falha ao cifrar".into()))?;
        Ok((nonce.to_vec(), ciphertext))
    }

    pub fn decrypt(&self, nonce: &[u8], ciphertext: &[u8], aad: &[u8]) -> Result<Vec<u8>> {
        if nonce.len() != NONCE_LEN {
            return Err(AppError::Crypto("nonce com tamanho invalido".into()));
        }
        self.cipher()
            .decrypt(
                Nonce::from_slice(nonce),
                aes_gcm::aead::Payload {
                    msg: ciphertext,
                    aad,
                },
            )
            .map_err(|_| AppError::WrongPassword)
    }
}

pub fn random_salt() -> [u8; SALT_LEN] {
    let mut salt = [0u8; SALT_LEN];
    OsRng.fill_bytes(&mut salt);
    salt
}

#[cfg(test)]
mod tests {
    use super::*;

    const AAD: &[u8] = b"canto.v1";

    #[test]
    fn roundtrip_recupera_o_texto_original() {
        let salt = random_salt();
        let key = VaultKey::derive("senha-mestra", &salt).unwrap();
        let (nonce, ct) = key.encrypt(b"tarefa secreta", AAD).unwrap();
        assert_ne!(ct, b"tarefa secreta");
        assert_eq!(key.decrypt(&nonce, &ct, AAD).unwrap(), b"tarefa secreta");
    }

    #[test]
    fn senha_errada_nao_decifra() {
        let salt = random_salt();
        let (nonce, ct) = VaultKey::derive("certa", &salt)
            .unwrap()
            .encrypt(b"dado", AAD)
            .unwrap();
        let err = VaultKey::derive("errada", &salt)
            .unwrap()
            .decrypt(&nonce, &ct, AAD);
        assert!(matches!(err, Err(AppError::WrongPassword)));
    }

    #[test]
    fn ciphertext_adulterado_e_rejeitado() {
        let salt = random_salt();
        let key = VaultKey::derive("senha", &salt).unwrap();
        let (nonce, mut ct) = key.encrypt(b"saldo: 10", AAD).unwrap();
        ct[0] ^= 0xff;
        assert!(key.decrypt(&nonce, &ct, AAD).is_err());
    }

    #[test]
    fn aad_diferente_e_rejeitado() {
        let salt = random_salt();
        let key = VaultKey::derive("senha", &salt).unwrap();
        let (nonce, ct) = key.encrypt(b"dado", AAD).unwrap();
        assert!(key.decrypt(&nonce, &ct, b"canto.v2").is_err());
    }

    #[test]
    fn salts_distintos_geram_chaves_distintas() {
        let (a, b) = (random_salt(), random_salt());
        assert_ne!(a, b);
        let ka = VaultKey::derive("mesma-senha", &a).unwrap();
        let kb = VaultKey::derive("mesma-senha", &b).unwrap();
        assert_ne!(ka.0, kb.0);
    }

    #[test]
    fn nonce_nunca_se_repete_entre_gravacoes() {
        let key = VaultKey::derive("senha", &random_salt()).unwrap();
        let (n1, _) = key.encrypt(b"x", AAD).unwrap();
        let (n2, _) = key.encrypt(b"x", AAD).unwrap();
        assert_ne!(n1, n2);
        assert_eq!(n1.len(), NONCE_LEN);
    }
}
