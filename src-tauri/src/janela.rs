use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Mutex;
use tauri::{LogicalPosition, LogicalSize, Manager, State, WebviewWindow};

use crate::error::{AppError, Result};
use crate::store;

pub const LARGURA_PADRAO: f64 = 420.0;
pub const ALTURA_PADRAO: f64 = 580.0;
/// Tolerancia para reconhecer a posicao ancorada pelo proprio app, e nao um arraste.
const FOLGA_PX: f64 = 4.0;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct JanelaCfg {
    /// Canto superior esquerdo em pixels logicos; `None` = ancorada no canto do monitor.
    #[serde(default)]
    pub posicao: Option<(f64, f64)>,
    #[serde(default)]
    pub tamanho: Option<(f64, f64)>,
    #[serde(default = "sim")]
    pub sempre_no_topo: bool,
}

fn sim() -> bool {
    true
}

impl Default for JanelaCfg {
    fn default() -> Self {
        Self { posicao: None, tamanho: None, sempre_no_topo: true }
    }
}

/// Retangulo logico (x, y, largura, altura).
pub type Area = (f64, f64, f64, f64);

/// Posicao salva so vale se a janela inteira cabe numa area util: monitor desconectado
/// ou resolucao menor nao podem deixar o widget perdido fora da tela.
pub fn cabe(pos: (f64, f64), tam: (f64, f64), areas: &[Area]) -> bool {
    areas.iter().any(|&(x, y, w, h)| {
        pos.0 >= x - FOLGA_PX && pos.1 >= y - FOLGA_PX && pos.0 + tam.0 <= x + w + FOLGA_PX && pos.1 + tam.1 <= y + h + FOLGA_PX
    })
}

pub fn perto(a: (f64, f64), b: (f64, f64)) -> bool {
    (a.0 - b.0).abs() <= FOLGA_PX && (a.1 - b.1).abs() <= FOLGA_PX
}

#[derive(Default)]
pub struct Janela {
    cfg: Mutex<JanelaCfg>,
    sujo: AtomicBool,
}

fn caminho(dir: &Path) -> PathBuf {
    dir.join("janela.json")
}

impl Janela {
    pub fn carregar(dir: &Path) -> Self {
        // Arquivo corrompido nao impede o widget de abrir: volta ao canto.
        let cfg = store::read_json(&caminho(dir)).ok().flatten().unwrap_or_default();
        Self { cfg: Mutex::new(cfg), sujo: AtomicBool::new(false) }
    }

    pub fn cfg(&self) -> JanelaCfg {
        self.cfg.lock().unwrap().clone()
    }

    pub fn alterar(&self, f: impl FnOnce(&mut JanelaCfg)) {
        let mut cfg = self.cfg.lock().unwrap();
        let antes = cfg.clone();
        f(&mut cfg);
        if *cfg != antes {
            self.sujo.store(true, Ordering::Relaxed);
        }
    }

    /// Grava so se mudou; o arraste gera dezenas de eventos por segundo.
    pub fn gravar_se_sujo(&self, dir: &Path) -> Result<()> {
        if self.sujo.swap(false, Ordering::Relaxed) {
            store::write_json_atomic(&caminho(dir), &self.cfg())?;
        }
        Ok(())
    }
}

fn areas(win: &WebviewWindow) -> Vec<Area> {
    win.available_monitors()
        .unwrap_or_default()
        .iter()
        .map(|m| {
            let s = m.scale_factor();
            let (p, t) = (m.work_area().position.to_logical::<f64>(s), m.work_area().size.to_logical::<f64>(s));
            (p.x, p.y, t.width, t.height)
        })
        .collect()
}

/// Aplica tamanho e posicao salvos; sem posicao valida, ancora no canto inferior direito.
pub fn posicionar(win: &WebviewWindow) -> tauri::Result<()> {
    let Some(janela) = win.try_state::<Janela>() else {
        return crate::window::anchor_bottom_right(win);
    };
    let cfg = janela.cfg();
    let tam = cfg.tamanho.unwrap_or((LARGURA_PADRAO, ALTURA_PADRAO));
    win.set_size(LogicalSize::new(tam.0, tam.1))?;
    match cfg.posicao.filter(|&p| cabe(p, tam, &areas(win))) {
        Some((x, y)) => win.set_position(LogicalPosition::new(x, y)),
        None => crate::window::anchor_bottom_right(win),
    }
}

/// Chamado nos eventos de mover/redimensionar da janela principal.
pub fn registrar(win: &tauri::Window) {
    let (Some(janela), Ok(escala)) = (win.try_state::<Janela>(), win.scale_factor()) else {
        return;
    };
    let (Ok(pos), Ok(tam)) = (win.outer_position(), win.inner_size()) else {
        return;
    };
    let pos = pos.to_logical::<f64>(escala);
    let tam = tam.to_logical::<f64>(escala);
    let ancorada = win
        .app_handle()
        .get_webview_window("main")
        .and_then(|w| crate::window::posicao_ancorada(&w).ok().flatten())
        .is_some_and(|a| perto(a, (pos.x, pos.y)));
    janela.alterar(|c| {
        c.posicao = (!ancorada).then_some((pos.x, pos.y));
        let padrao = perto((tam.width, tam.height), (LARGURA_PADRAO, ALTURA_PADRAO));
        c.tamanho = (!padrao).then_some((tam.width, tam.height));
    });
}

#[tauri::command]
pub fn janela_config(janela: State<'_, Janela>) -> JanelaCfg {
    janela.cfg()
}

#[tauri::command]
pub fn janela_sempre_no_topo(app: tauri::AppHandle, janela: State<'_, Janela>, ativo: bool) -> Result<()> {
    if let Some(win) = app.get_webview_window("main") {
        win.set_always_on_top(ativo).map_err(|e| AppError::Io(e.to_string()))?;
    }
    janela.alterar(|c| c.sempre_no_topo = ativo);
    Ok(())
}

/// Esquece posicao e tamanho: volta ao canto com o tamanho original.
#[tauri::command]
pub fn janela_restaurar(app: tauri::AppHandle, janela: State<'_, Janela>) -> Result<()> {
    janela.alterar(|c| {
        c.posicao = None;
        c.tamanho = None;
    });
    if let Some(win) = app.get_webview_window("main") {
        posicionar(&win).map_err(|e| AppError::Io(e.to_string()))?;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    const TELA: Area = (0.0, 0.0, 1920.0, 1040.0);
    const SEGUNDA: Area = (1920.0, 0.0, 1280.0, 1000.0);

    #[test]
    fn posicao_dentro_de_qualquer_monitor_vale() {
        assert!(cabe((100.0, 100.0), (420.0, 580.0), &[TELA]));
        assert!(cabe((2000.0, 300.0), (420.0, 580.0), &[TELA, SEGUNDA]));
    }

    #[test]
    fn monitor_desconectado_ou_janela_vazando_volta_para_o_canto() {
        assert!(!cabe((2000.0, 300.0), (420.0, 580.0), &[TELA]), "janela ficaria fora da tela");
        assert!(!cabe((1700.0, 100.0), (420.0, 580.0), &[TELA]), "metade da janela fora da tela");
        assert!(!cabe((100.0, 100.0), (420.0, 580.0), &[]), "sem monitor nenhum");
    }

    #[test]
    fn config_antiga_ou_vazia_fica_sempre_no_topo() {
        let cfg: JanelaCfg = serde_json::from_str("{}").unwrap();
        assert_eq!(cfg, JanelaCfg::default());
        assert!(cfg.sempre_no_topo);
    }

    #[test]
    fn so_grava_quando_algo_mudou() {
        let dir = std::env::temp_dir().join(format!("canto-janela-{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&dir);
        let j = Janela::carregar(&dir);
        j.alterar(|c| c.sempre_no_topo = true);
        j.gravar_se_sujo(&dir).unwrap();
        assert!(!caminho(&dir).exists(), "gravou sem mudanca");
        j.alterar(|c| c.posicao = Some((10.0, 20.0)));
        j.gravar_se_sujo(&dir).unwrap();
        assert_eq!(Janela::carregar(&dir).cfg().posicao, Some((10.0, 20.0)));
        let _ = std::fs::remove_dir_all(&dir);
    }
}
