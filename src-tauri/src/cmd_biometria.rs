use tauri::{Manager, State};

use crate::biometria;
use crate::error::{AppError, Result};
use crate::vault::AppState;

#[derive(serde::Serialize)]
pub struct StatusBiometria {
    disponivel: bool,
    ativa: bool,
    /// Nome mostrado no botao: "Windows Hello".
    nome: &'static str,
}

#[cfg(windows)]
use crate::hello::{apagar, criar, disponivel, COFRE, NOME};

#[cfg(not(windows))]
mod plataforma {
    use crate::error::{AppError, Result};
    pub const NOME: &str = "biometria";
    pub struct Plataforma;
    pub const COFRE: Plataforma = Plataforma;
    impl crate::biometria::Assinante for Plataforma {
        fn assinar(&self, _: &[u8]) -> Result<Vec<u8>> {
            Err(AppError::Config("biometria indisponivel neste sistema".into()))
        }
    }
    pub fn disponivel() -> bool {
        false
    }
    pub fn criar() -> Result<Plataforma> {
        Err(AppError::Config("biometria indisponivel neste sistema".into()))
    }
    pub fn apagar() {}
}
#[cfg(not(windows))]
use plataforma::{apagar, criar, disponivel, COFRE, NOME};

/// O prompt do sistema nasce atras de uma janela "sempre no topo"; solta durante o gesto.
fn sem_topo<T>(app: &tauri::AppHandle, f: impl FnOnce() -> T) -> T {
    let win = app.get_webview_window("main");
    let topo = app.state::<crate::janela::Janela>().cfg().sempre_no_topo;
    if let Some(w) = &win {
        let _ = w.set_always_on_top(false);
    }
    let out = f();
    if let Some(w) = &win {
        let _ = w.set_always_on_top(topo);
    }
    out
}

#[tauri::command(async)]
pub fn biometria_status(state: State<'_, AppState>) -> StatusBiometria {
    StatusBiometria { disponivel: disponivel(), ativa: biometria::ativa(&state.dir), nome: NOME }
}

/// Assincrono de proposito: o prompt bloqueia ate o gesto e nao pode travar a thread da UI.
#[tauri::command(async)]
pub fn biometria_ativar(app: tauri::AppHandle, state: State<'_, AppState>) -> Result<()> {
    let senha = state.senha_da_sessao()?;
    sem_topo(&app, || {
        let chave = criar()?;
        biometria::ativar_verificado(&state.dir, &senha, &chave)
    })
}

#[tauri::command(async)]
pub fn biometria_desbloquear(app: tauri::AppHandle, state: State<'_, AppState>) -> Result<()> {
    let senha = sem_topo(&app, || biometria::abrir(&state.dir, &COFRE))?;
    match state.unlock(&senha) {
        // Cofre recriado com outra senha: a copia guardada nao serve mais para nada.
        Err(AppError::WrongPassword) => {
            let _ = biometria::desativar(&state.dir);
            Err(AppError::Config(format!("a senha mestra mudou; ative o {NOME} de novo em Ajustes")))
        }
        outro => outro,
    }
}

#[tauri::command(async)]
pub fn biometria_desativar(state: State<'_, AppState>) -> Result<()> {
    // Credencial do TPM primeiro: se apagar o arquivo falhar, nao sobra chave orfa no sistema.
    apagar();
    biometria::desativar(&state.dir)
}
