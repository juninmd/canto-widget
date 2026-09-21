//! Touch ID via a Keychain item gated by biometry: no signing needed, the OS prompts on read.
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

fn failure(e: impl std::fmt::Display) -> AppError {
    AppError::Crypto(format!("{NAME}: {e}"))
}

/// No cheap, non-prompting hardware check without `LocalAuthentication`: optimistic here, and
/// `enable_verified` below is where an actual absence of Touch ID surfaces, as a clear error.
pub fn available() -> bool {
    true
}

/// Stores the password, then reopens right away: proves the prompt really unlocks it before the
/// caller marks biometric as enabled, matching `biometric::enable_verified`'s Windows Hello contract.
pub fn enable_verified(password: &str) -> Result<()> {
    let mut opts = options();
    opts.set_access_control_options(AccessControlOptions::BIOMETRY_CURRENT_SET);
    passwords::set_generic_password_options(password.as_bytes(), opts).map_err(failure)?;
    match open() {
        Ok(back) if back.as_str() == password => Ok(()),
        other => {
            delete();
            Err(match other {
                Err(e) => e,
                Ok(_) => failure("devolveu outra senha"),
            })
        }
    }
}

/// Reading a biometry-gated item triggers the system Touch ID prompt on its own; nothing else to call.
pub fn open() -> Result<Zeroizing<String>> {
    let bytes = passwords::generic_password(options()).map_err(failure)?;
    String::from_utf8(bytes)
        .map(Zeroizing::new)
        .map_err(|_| AppError::Format(format!("{NAME}: senha corrompida")))
}

pub fn delete() {
    let _ = passwords::delete_generic_password(SERVICE, ACCOUNT);
}
