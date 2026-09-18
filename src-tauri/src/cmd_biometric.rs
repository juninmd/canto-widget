use tauri::{Manager, State};

use crate::biometric;
use crate::error::{AppError, Result};
use crate::vault::AppState;

#[derive(serde::Serialize)]
pub struct BiometricStatus {
    available: bool,
    enabled: bool,
    name: &'static str,
}

#[cfg(windows)]
use crate::hello::{available, create, delete, NAME, VAULT};

#[cfg(not(windows))]
mod platform {
    use crate::error::{AppError, Result};
    pub const NAME: &str = "biometria";
    pub struct Platform;
    pub const VAULT: Platform = Platform;
    impl crate::biometric::Signer for Platform {
        fn sign(&self, _: &[u8]) -> Result<Vec<u8>> {
            Err(AppError::Config("biometria indisponivel neste sistema".into()))
        }
    }
    pub fn available() -> bool {
        false
    }
    pub fn create() -> Result<Platform> {
        Err(AppError::Config("biometria indisponivel neste sistema".into()))
    }
    pub fn delete() {}
}
#[cfg(not(windows))]
use platform::{available, create, delete, NAME, VAULT};

/// The system prompt opens behind an "always on top" window; release it during the gesture.
fn without_always_on_top<T>(app: &tauri::AppHandle, f: impl FnOnce() -> T) -> T {
    let win = app.get_webview_window("main");
    let always_on_top = app.state::<crate::window_state::WindowState>().cfg().always_on_top;
    if let Some(w) = &win {
        let _ = w.set_always_on_top(false);
    }
    let out = f();
    if let Some(w) = &win {
        let _ = w.set_always_on_top(always_on_top);
    }
    out
}

#[tauri::command(async)]
pub fn biometric_status(state: State<'_, AppState>) -> BiometricStatus {
    BiometricStatus { available: available(), enabled: biometric::enabled(&state.dir), name: NAME }
}

/// Async on purpose: the prompt blocks until the gesture and must not stall the UI thread.
#[tauri::command(async)]
pub fn biometric_enable(app: tauri::AppHandle, state: State<'_, AppState>) -> Result<()> {
    let password = state.session_password()?;
    without_always_on_top(&app, || {
        let key = create()?;
        biometric::enable_verified(&state.dir, &password, &key)
    })
}

#[tauri::command(async)]
pub fn biometric_unlock(app: tauri::AppHandle, state: State<'_, AppState>) -> Result<()> {
    let password = without_always_on_top(&app, || biometric::open(&state.dir, &VAULT))?;
    match state.unlock(&password) {
        // Vault recreated with another password: the stored copy is now useless.
        Err(AppError::WrongPassword) => {
            let _ = biometric::disable(&state.dir);
            Err(AppError::Config(format!("a senha mestra mudou; ative o {NAME} de novo em Ajustes")))
        }
        other => other,
    }
}

#[tauri::command(async)]
pub fn biometric_disable(state: State<'_, AppState>) -> Result<()> {
    // TPM credential first: if deleting the file fails, no orphan key is left on the system.
    delete();
    biometric::disable(&state.dir)
}

/// Deletes the real system credential. Never call from tests: it shares the name with the installed app.
pub fn delete_credential() {
    delete();
}
