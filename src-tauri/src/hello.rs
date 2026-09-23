//! Windows Hello via KeyCredentialManager: an RSA pair in the TPM, unlocked by face, fingerprint or PIN.
use windows::core::{Array, HSTRING};
use windows::Security::Credentials::{KeyCredentialCreationOption, KeyCredentialManager, KeyCredentialStatus};
use windows::Security::Cryptography::CryptographicBuffer;

use crate::error::{AppError, Result};

pub const NAME: &str = "Windows Hello";
const CREDENTIAL: &str = "com.junin.canto.cofre";

pub struct Hello(&'static str);

fn failure(e: windows::core::Error) -> AppError {
    AppError::Crypto(format!("{NAME}: {}", e.message()))
}

fn check(status: KeyCredentialStatus) -> Result<()> {
    let msg = match status {
        KeyCredentialStatus::Success => return Ok(()),
        KeyCredentialStatus::UserCanceled | KeyCredentialStatus::UserPrefersPassword => "cancelado; use a senha mestra",
        KeyCredentialStatus::NotFound => "credencial não encontrada; ative de novo em Ajustes",
        KeyCredentialStatus::SecurityDeviceLocked => "dispositivo bloqueado por tentativas; use a senha mestra",
        _ => "falhou; use a senha mestra",
    };
    Err(AppError::Config(format!("{NAME}: {msg}")))
}

/// The Hello dialog opens without focus when called from a tray app; bring it to front.
fn focus_dialog() {
    use windows::Win32::UI::WindowsAndMessaging::{FindWindowW, SetForegroundWindow};
    std::thread::spawn(|| {
        for _ in 0..30 {
            std::thread::sleep(std::time::Duration::from_millis(100));
            // SAFETY: static class names; FindWindowW only reads the strings.
            if let Ok(hwnd) = unsafe { FindWindowW(&HSTRING::from("Credential Dialog Xaml Host"), None) } {
                // SAFETY: hwnd comes from the FindWindowW call above.
                let _ = unsafe { SetForegroundWindow(hwnd) };
                return;
            }
        }
    });
}

pub fn available() -> bool {
    KeyCredentialManager::IsSupportedAsync().and_then(|op| op.get()).unwrap_or(false)
}

/// Creates (or replaces) the key pair; Windows prompts for the user gesture here.
pub fn create() -> Result<Hello> {
    create_with(CREDENTIAL)
}

/// Default vault credential, for unlocking.
pub const VAULT: Hello = Hello(CREDENTIAL);

fn create_with(name: &'static str) -> Result<Hello> {
    focus_dialog();
    let r = KeyCredentialManager::RequestCreateAsync(&HSTRING::from(name), KeyCredentialCreationOption::ReplaceExisting)
        .and_then(|op| op.get())
        .map_err(failure)?;
    check(r.Status().map_err(failure)?)?;
    Ok(Hello(name))
}

pub fn delete() {
    let _ = KeyCredentialManager::DeleteAsync(&HSTRING::from(CREDENTIAL)).and_then(|op| op.get());
}

impl crate::biometric::Signer for Hello {
    fn sign(&self, challenge: &[u8]) -> Result<Vec<u8>> {
        let opened = KeyCredentialManager::OpenAsync(&HSTRING::from(self.0))
            .and_then(|op| op.get())
            .map_err(failure)?;
        check(opened.Status().map_err(failure)?)?;
        let credential = opened.Credential().map_err(failure)?;
        focus_dialog();
        let data = CryptographicBuffer::CreateFromByteArray(challenge).map_err(failure)?;
        let signed = credential.RequestSignAsync(&data).and_then(|op| op.get()).map_err(failure)?;
        check(signed.Status().map_err(failure)?)?;
        let mut bytes = Array::<u8>::new();
        CryptographicBuffer::CopyToByteArray(&signed.Result().map_err(failure)?, &mut bytes).map_err(failure)?;
        Ok(bytes.to_vec())
    }
}

#[cfg(test)]
mod tests {
    /// Real system query, no prompt: `cargo test -- --ignored hello`.
    #[test]
    #[ignore]
    fn queries_availability_without_opening_a_prompt() {
        println!("windows hello disponivel = {}", super::available());
    }

    /// Manual, prompts for the gesture 3 times to prove signing is deterministic (the vault key's assumption); uses its own credential and deletes it at the end.
    #[test]
    #[ignore]
    fn hello_signature_is_deterministic() {
        use crate::biometric::Signer;
        const TEST_CREDENTIAL: &str = "com.junin.canto.teste-determinismo";
        let h = super::create_with(TEST_CREDENTIAL).unwrap();
        let (a, b) = (h.sign(b"desafio fixo").unwrap(), h.sign(b"desafio fixo").unwrap());
        let _ = windows::Security::Credentials::KeyCredentialManager::DeleteAsync(&windows::core::HSTRING::from(TEST_CREDENTIAL)).and_then(|op| op.get());
        assert_eq!(a, b, "signature changed between calls: the vault key would not be reconstructible");
    }
}
