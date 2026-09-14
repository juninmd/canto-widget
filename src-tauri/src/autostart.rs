use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use tauri::Manager;
use tauri_plugin_autostart::ManagerExt;

use crate::error::{AppError, Result};
use crate::store;
use crate::vault::AppState;

/// Argumento entregue ao Windows/launcher: a app precisa saber que nao foi o
/// usuario que a abriu, para subir so na bandeja em vez de pular na tela.
pub const ARG_AUTOSTART: &str = "--autostart";

#[derive(Debug, Default, Serialize, Deserialize)]
struct AutostartPrefs {
    /// Marca que existe escolha explicita do usuario. Gravada *antes* de mexer
    /// no SO: se a gravacao falhar, nada muda; se a mudanca falhar, o proximo
    /// boot ainda assim nao volta a ligar o que ele mandou desligar.
    decidido: bool,
}

fn prefs_path(dir: &Path) -> PathBuf {
    dir.join("autostart.json")
}

/// Primeira execucao liga o autostart; depois disso a escolha do usuario manda.
pub fn ensure_default(app: &tauri::AppHandle) -> Result<()> {
    let dir = app
        .try_state::<AppState>()
        .ok_or_else(|| AppError::Config("estado nao inicializado".into()))?
        .dir
        .clone();
    let path = prefs_path(&dir);
    let prefs: AutostartPrefs = store::read_json(&path)?.unwrap_or_default();
    if prefs.decidido {
        return Ok(());
    }
    // Marca so depois de ligar de verdade: sem escolha do usuario registrada,
    // repetir o padrao no proximo boot nao atropela ninguem.
    set(app, true)?;
    marcar_decidido(&dir)
}

fn marcar_decidido(dir: &Path) -> Result<()> {
    store::write_json_atomic(&prefs_path(dir), &AutostartPrefs { decidido: true })
}

fn set(app: &tauri::AppHandle, enabled: bool) -> Result<()> {
    let manager = app.autolaunch();
    let r = if enabled {
        manager.enable()
    } else {
        manager.disable()
    };
    r.map_err(|e| AppError::Io(e.to_string()))
}

#[tauri::command]
pub fn autostart_status(app: tauri::AppHandle) -> Result<bool> {
    app.autolaunch()
        .is_enabled()
        .map_err(|e| AppError::Io(e.to_string()))
}

#[tauri::command]
pub fn autostart_set(app: tauri::AppHandle, enabled: bool) -> Result<()> {
    // Escolha do usuario e registrada antes da mudanca: uma falha ao gravar o
    // marcador aborta o toggle em vez de deixar o padrao reverte-lo no boot.
    if let Some(state) = app.try_state::<AppState>() {
        marcar_decidido(&state.dir)?;
    }
    set(&app, enabled)
}

/// Aberto pelo sistema no boot: fica quieto na bandeja.
pub fn iniciado_pelo_sistema() -> bool {
    std::env::args().any(|a| a == ARG_AUTOSTART)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn tmpdir(nome: &str) -> PathBuf {
        let d = std::env::temp_dir().join(format!("canto-autostart-{nome}-{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&d);
        d
    }

    fn decidido(dir: &Path) -> bool {
        store::read_json::<AutostartPrefs>(&prefs_path(dir))
            .unwrap()
            .unwrap_or_default()
            .decidido
    }

    #[test]
    fn primeira_execucao_ainda_nao_decidiu() {
        let dir = tmpdir("virgem");
        assert!(!decidido(&dir), "sem arquivo o padrao tem de poder ligar");
    }

    #[test]
    fn escolha_do_usuario_sobrevive_ao_proximo_boot() {
        let dir = tmpdir("decidido");
        marcar_decidido(&dir).unwrap();
        assert!(decidido(&dir), "o padrao voltaria a ligar o que foi desligado");
        let _ = std::fs::remove_dir_all(&dir);
    }
}
