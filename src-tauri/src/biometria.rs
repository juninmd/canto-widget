use base64::{engine::general_purpose::STANDARD as B64, Engine};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::path::{Path, PathBuf};
use zeroize::Zeroizing;

use crate::crypto::VaultKey;
use crate::error::{AppError, Result};
use crate::store;

const AAD: &[u8] = b"canto.biometria.v1";
const DOMINIO: &[u8] = b"canto.hello.kdf.v1";
const VERSAO: u32 = 1;

/// Quem assina o desafio com uma chave presa ao hardware, liberada so por biometria/PIN.
pub trait Assinante {
    fn assinar(&self, desafio: &[u8]) -> Result<Vec<u8>>;
}

/// A senha mestra cifrada com uma chave derivada da assinatura do desafio. Sem o TPM e
/// o gesto do usuario, o arquivo e inutil; ele nunca entra em backup exportado.
#[derive(Serialize, Deserialize)]
struct Envelope {
    versao: u32,
    desafio: String,
    nonce: String,
    cifrado: String,
}

pub fn caminho(dir: &Path) -> PathBuf {
    dir.join("biometria.json")
}

pub fn ativa(dir: &Path) -> bool {
    caminho(dir).exists()
}

/// Exige assinatura deterministica (RSA PKCS#1 v1.5, como a do Windows Hello):
/// a mesma assinatura precisa sair de novo para reconstruir a chave.
fn chave(assinatura: &[u8]) -> VaultKey {
    let mut h = Sha256::new();
    h.update(DOMINIO);
    h.update(assinatura);
    let mut bytes: [u8; 32] = h.finalize().into();
    let k = VaultKey::from_bytes(bytes);
    zeroize::Zeroize::zeroize(&mut bytes);
    k
}

pub fn ativar(dir: &Path, senha: &str, assinante: &dyn Assinante) -> Result<()> {
    let mut desafio = [0u8; 32];
    rand::RngCore::fill_bytes(&mut rand::thread_rng(), &mut desafio);
    let assinatura = Zeroizing::new(assinante.assinar(&desafio)?);
    let (nonce, cifrado) = chave(&assinatura).encrypt(senha.as_bytes(), AAD)?;
    let env = Envelope { versao: VERSAO, desafio: B64.encode(desafio), nonce: B64.encode(nonce), cifrado: B64.encode(cifrado) };
    store::write_json_atomic(&caminho(dir), &env)
}

/// Ativa e ja reabre: so fica ligado se a senha volta identica. Hardware cuja assinatura
/// muda a cada chamada (ex.: RSA-PSS) e recusado aqui, e nao descoberto na tela de bloqueio.
pub fn ativar_verificado(dir: &Path, senha: &str, assinante: &dyn Assinante) -> Result<()> {
    ativar(dir, senha, assinante)?;
    match abrir(dir, assinante) {
        Ok(volta) if volta.as_str() == senha => Ok(()),
        outro => {
            let _ = desativar(dir);
            Err(match outro {
                Err(AppError::Config(m)) if m.contains("nao confere") => AppError::Config(
                    "este dispositivo nao gera assinatura estavel; biometria nao pode proteger a senha aqui".into(),
                ),
                Err(e) => e,
                Ok(_) => AppError::Crypto("biometria devolveu outra senha".into()),
            })
        }
    }
}

pub fn abrir(dir: &Path, assinante: &dyn Assinante) -> Result<Zeroizing<String>> {
    let env: Envelope = store::read_json(&caminho(dir))?
        .ok_or_else(|| AppError::Config("desbloqueio por biometria nao esta ativo".into()))?;
    if env.versao != VERSAO {
        return Err(AppError::Format("biometria de versao desconhecida; ative de novo".into()));
    }
    let b = |s: &str| B64.decode(s).map_err(|e| AppError::Format(e.to_string()));
    let assinatura = Zeroizing::new(assinante.assinar(&b(&env.desafio)?)?);
    let plano = chave(&assinatura)
        .decrypt(&b(&env.nonce)?, &b(&env.cifrado)?, AAD)
        .map_err(|_| AppError::Config("a biometria nao confere com a deste cofre; ative de novo".into()))?;
    String::from_utf8(plano)
        .map(Zeroizing::new)
        .map_err(|_| AppError::Format("biometria corrompida".into()))
}

pub fn desativar(dir: &Path) -> Result<()> {
    match std::fs::remove_file(caminho(dir)) {
        Err(e) if e.kind() != std::io::ErrorKind::NotFound => Err(e.into()),
        _ => Ok(()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Assinante falso e deterministico, como o RSA do Hello.
    struct Falso(&'static [u8]);
    impl Assinante for Falso {
        fn assinar(&self, desafio: &[u8]) -> Result<Vec<u8>> {
            Ok(Sha256::new().chain_update(self.0).chain_update(desafio).finalize().to_vec())
        }
    }
    struct Cancelado;
    impl Assinante for Cancelado {
        fn assinar(&self, _: &[u8]) -> Result<Vec<u8>> {
            Err(AppError::Config("cancelado".into()))
        }
    }

    fn dir(nome: &str) -> PathBuf {
        let d = std::env::temp_dir().join(format!("canto-bio-{nome}-{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&d);
        d
    }

    #[test]
    fn mesma_chave_de_hardware_devolve_a_senha() {
        let d = dir("ok");
        ativar(&d, "senha-mestra-ç", &Falso(b"tpm-1")).unwrap();
        assert_eq!(abrir(&d, &Falso(b"tpm-1")).unwrap().as_str(), "senha-mestra-ç");
        let _ = std::fs::remove_dir_all(&d);
    }

    #[test]
    fn arquivo_nao_guarda_a_senha_em_claro() {
        let d = dir("claro");
        ativar(&d, "senha-mestra", &Falso(b"tpm-1")).unwrap();
        let bruto = std::fs::read_to_string(caminho(&d)).unwrap();
        assert!(!bruto.contains("senha-mestra") && !bruto.contains(&B64.encode("senha-mestra")));
        let _ = std::fs::remove_dir_all(&d);
    }

    #[test]
    fn outra_chave_de_hardware_ou_arquivo_adulterado_nao_abre() {
        let d = dir("outra");
        ativar(&d, "senha-mestra", &Falso(b"tpm-1")).unwrap();
        assert!(abrir(&d, &Falso(b"tpm-2")).is_err(), "abriu com a chave de outra maquina");
        let mut env: Envelope = store::read_json(&caminho(&d)).unwrap().unwrap();
        let mut ct = B64.decode(&env.cifrado).unwrap();
        ct[0] ^= 1;
        env.cifrado = B64.encode(ct);
        store::write_json_atomic(&caminho(&d), &env).unwrap();
        assert!(abrir(&d, &Falso(b"tpm-1")).is_err(), "aceitou envelope adulterado");
        let _ = std::fs::remove_dir_all(&d);
    }

    /// Assina com sal aleatorio, como RSA-PSS: a chave nunca se reconstroi.
    struct Instavel;
    impl Assinante for Instavel {
        fn assinar(&self, desafio: &[u8]) -> Result<Vec<u8>> {
            let mut sal = [0u8; 16];
            rand::RngCore::fill_bytes(&mut rand::thread_rng(), &mut sal);
            Ok(Sha256::new().chain_update(sal).chain_update(desafio).finalize().to_vec())
        }
    }

    #[test]
    fn assinatura_instavel_e_recusada_na_ativacao_sem_deixar_arquivo() {
        let d = dir("instavel");
        let erro = ativar_verificado(&d, "senha-mestra", &Instavel).unwrap_err();
        assert!(erro.to_string().contains("assinatura estavel"), "{erro}");
        assert!(!ativa(&d), "deixou biometria ligada que nunca vai abrir");
        ativar_verificado(&d, "senha-mestra", &Falso(b"tpm-1")).unwrap();
        assert!(ativa(&d));
        let _ = std::fs::remove_dir_all(&d);
    }

    #[test]
    fn cancelar_no_prompt_nao_cria_nem_apaga_nada() {
        let d = dir("cancela");
        assert!(ativar(&d, "senha-mestra", &Cancelado).is_err());
        assert!(!ativa(&d));
        ativar(&d, "senha-mestra", &Falso(b"tpm-1")).unwrap();
        assert!(abrir(&d, &Cancelado).is_err());
        assert!(ativa(&d), "cancelar o prompt desligou a biometria");
        desativar(&d).unwrap();
        desativar(&d).unwrap();
        assert!(!ativa(&d));
        let _ = std::fs::remove_dir_all(&d);
    }
}
