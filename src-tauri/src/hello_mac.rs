//! Touch ID via a Keychain item gated by biometry. Needs the `keychain-access-groups` entitlement (Apple signing); without it `available()` is false and the app keeps the master password.
//!
//! This differs from `hello.rs` (Windows Hello) on purpose. Windows Hello's API is a
//! challenge-signing primitive (`NCryptSignHash`), which is why `biometric.rs` derives an AES key
//! from a deterministic signature. The Secure Enclave only issues EC keys, whose ECDSA signatures
//! are not deterministic across calls, so that same scheme cannot work here. The Keychain offers a
//! simpler, better-suited primitive instead: store the password directly as a Generic Password item
//! with `kSecAccessControlBiometryCurrentSet`; the OS shows the Touch ID prompt automatically the
//! next time the item is read, no manual `LocalAuthentication` calls involved.
//!
//! UNVERIFIED ON THIS MACHINE: this module only compiles under `target_os = "macos"`, so it was
//! written and reviewed against the Security.framework/`security-framework` docs but never built or
//! run — Windows has no Mac to build it on. It needs macOS CI (or a real Mac) to confirm it compiles
//! and that the prompt actually appears before anyone relies on it.
use security_framework::passwords::{self, AccessControlOptions, PasswordOptions};
use zeroize::Zeroizing;

use crate::error::{AppError, Result};

pub const NAME: &str = "Touch ID";
const SERVICE: &str = "com.junin.canto.cofre";
const ACCOUNT: &str = "senha-mestra";

fn options() -> PasswordOptions {
    PasswordOptions::new_generic_password(SERVICE, ACCOUNT)
}

/// `errSecMissingEntitlement`: a biometry-gated item lives in the data-protection keychain, which the OS only
/// opens to apps carrying the `keychain-access-groups` entitlement (needs an Apple Developer ID + profile). The
/// ad-hoc signed build ("-") never has it, so the Keychain refuses with this code.
const ERR_MISSING_ENTITLEMENT: i32 = -34018;

fn failure(e: security_framework::base::Error) -> AppError {
    if e.code() == ERR_MISSING_ENTITLEMENT {
        return AppError::Config(format!(
            "{NAME} indisponível nesta versão do app (falta a permissão do Keychain, exige assinatura Apple); use a senha mestra"
        ));
    }
    AppError::Crypto(format!("{NAME}: {e}"))
}

/// Whether the Keychain accepts a biometry-gated item here. Writing one never prompts, so a throwaway probe
/// item tells apart a build without the entitlement (the button is hidden, master password stays) from a
/// working one. Probed once: the signature cannot change while the app runs.
pub fn available() -> bool {
    static OK: std::sync::OnceLock<bool> = std::sync::OnceLock::new();
    *OK.get_or_init(|| {
        const PROBE: &str = "sonda-touch-id";
        let mut opts = PasswordOptions::new_generic_password(SERVICE, PROBE);
        opts.set_access_control_options(AccessControlOptions::BIOMETRY_CURRENT_SET);
        let res = passwords::set_generic_password_options(b"x", opts);
        let _ = passwords::delete_generic_password(SERVICE, PROBE);
        !matches!(res, Err(e) if e.code() == ERR_MISSING_ENTITLEMENT)
    })
}

/// Stores the password, then reopens right away: proves the prompt really unlocks it before the
/// caller marks biometric as enabled, matching `biometric::enable_verified`'s Windows Hello contract.
pub fn enable_verified(password: &str) -> Result<()> {
    delete();
    let mut opts = options();
    opts.set_access_control_options(AccessControlOptions::BIOMETRY_CURRENT_SET);
    passwords::set_generic_password_options(password.as_bytes(), opts).map_err(failure)?;
    match open() {
        Ok(back) if back.as_str() == password => Ok(()),
        other => {
            delete();
            Err(match other {
                Err(e) => e,
                Ok(_) => AppError::Crypto(format!("{NAME}: devolveu outra senha")),
            })
        }
    }
}

/// Reading a biometry-gated item triggers the system Touch ID prompt on its own; nothing else to call.
pub fn open() -> Result<Zeroizing<String>> {
    let bytes = passwords::generic_password(options()).map_err(failure)?;
    String::from_utf8(bytes).map(Zeroizing::new).map_err(|_| AppError::Format(format!("{NAME}: senha corrompida")))
}

pub fn delete() {
    let _ = passwords::delete_generic_password(SERVICE, ACCOUNT);
}
