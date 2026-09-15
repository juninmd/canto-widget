//! Windows Hello via KeyCredentialManager: um par RSA no TPM, liberado por rosto, digital ou PIN.
use windows::core::{Array, HSTRING};
use windows::Security::Credentials::{KeyCredentialCreationOption, KeyCredentialManager, KeyCredentialStatus};
use windows::Security::Cryptography::CryptographicBuffer;

use crate::error::{AppError, Result};

pub const NOME: &str = "Windows Hello";
const CREDENCIAL: &str = "com.junin.canto.cofre";

pub struct Hello(&'static str);

fn falha(e: windows::core::Error) -> AppError {
    AppError::Crypto(format!("{NOME}: {}", e.message()))
}

fn conferir(status: KeyCredentialStatus) -> Result<()> {
    let msg = match status {
        KeyCredentialStatus::Success => return Ok(()),
        KeyCredentialStatus::UserCanceled | KeyCredentialStatus::UserPrefersPassword => "cancelado; use a senha mestra",
        KeyCredentialStatus::NotFound => "credencial nao encontrada; ative de novo em Ajustes",
        KeyCredentialStatus::SecurityDeviceLocked => "dispositivo bloqueado por tentativas; use a senha mestra",
        _ => "falhou; use a senha mestra",
    };
    Err(AppError::Config(format!("{NOME}: {msg}")))
}

/// O dialogo do Hello abre sem foco quando chamado de um app de bandeja; traz para frente.
fn focar_dialogo() {
    use windows::Win32::UI::WindowsAndMessaging::{FindWindowW, SetForegroundWindow};
    std::thread::spawn(|| {
        for _ in 0..30 {
            std::thread::sleep(std::time::Duration::from_millis(100));
            // SAFETY: nomes de classe estaticos; FindWindowW so le as strings.
            if let Ok(hwnd) = unsafe { FindWindowW(&HSTRING::from("Credential Dialog Xaml Host"), None) } {
                // SAFETY: hwnd vem do proprio FindWindowW acima.
                let _ = unsafe { SetForegroundWindow(hwnd) };
                return;
            }
        }
    });
}

pub fn disponivel() -> bool {
    KeyCredentialManager::IsSupportedAsync().and_then(|op| op.get()).unwrap_or(false)
}

/// Cria (ou substitui) o par de chaves; o Windows pede o gesto do usuario aqui.
pub fn criar() -> Result<Hello> {
    criar_com(CREDENCIAL)
}

/// Credencial padrao do cofre, para desbloquear.
pub const COFRE: Hello = Hello(CREDENCIAL);

fn criar_com(nome: &'static str) -> Result<Hello> {
    focar_dialogo();
    let r = KeyCredentialManager::RequestCreateAsync(&HSTRING::from(nome), KeyCredentialCreationOption::ReplaceExisting)
        .and_then(|op| op.get())
        .map_err(falha)?;
    conferir(r.Status().map_err(falha)?)?;
    Ok(Hello(nome))
}

pub fn apagar() {
    let _ = KeyCredentialManager::DeleteAsync(&HSTRING::from(CREDENCIAL)).and_then(|op| op.get());
}

impl crate::biometria::Assinante for Hello {
    fn assinar(&self, desafio: &[u8]) -> Result<Vec<u8>> {
        let aberta = KeyCredentialManager::OpenAsync(&HSTRING::from(self.0))
            .and_then(|op| op.get())
            .map_err(falha)?;
        conferir(aberta.Status().map_err(falha)?)?;
        let credencial = aberta.Credential().map_err(falha)?;
        focar_dialogo();
        let dados = CryptographicBuffer::CreateFromByteArray(desafio).map_err(falha)?;
        let assinado = credencial.RequestSignAsync(&dados).and_then(|op| op.get()).map_err(falha)?;
        conferir(assinado.Status().map_err(falha)?)?;
        let mut bytes = Array::<u8>::new();
        CryptographicBuffer::CopyToByteArray(&assinado.Result().map_err(falha)?, &mut bytes).map_err(falha)?;
        Ok(bytes.to_vec())
    }
}

#[cfg(test)]
mod tests {
    /// Consulta real ao sistema, sem prompt: `cargo test -- --ignored hello`.
    #[test]
    #[ignore]
    fn consulta_disponibilidade_sem_abrir_prompt() {
        println!("windows hello disponivel = {}", super::disponivel());
    }

    /// Manual, pede o gesto 3 vezes: prova que a assinatura e deterministica,
    /// premissa da chave do cofre. Usa credencial propria e apaga no fim.
    #[test]
    #[ignore]
    fn assinatura_do_hello_e_deterministica() {
        use crate::biometria::Assinante;
        const TESTE: &str = "com.junin.canto.teste-determinismo";
        let h = super::criar_com(TESTE).unwrap();
        let (a, b) = (h.assinar(b"desafio fixo").unwrap(), h.assinar(b"desafio fixo").unwrap());
        let _ = windows::Security::Credentials::KeyCredentialManager::DeleteAsync(&windows::core::HSTRING::from(TESTE)).and_then(|op| op.get());
        assert_eq!(a, b, "assinatura mudou entre chamadas: a chave do cofre nao se reconstruiria");
    }
}
