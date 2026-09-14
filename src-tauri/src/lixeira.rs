use std::collections::VecDeque;
use std::sync::Mutex;
use tauri::State;

use crate::clipboard::{ClipHistory, ClipItem};
use crate::commands::new_id;
use crate::error::Result;
use crate::model::{now_ms, Note, Task, VaultData};
use crate::vault::AppState;

/// Poucas remocoes bastam para desfazer pelo aviso; o teto impede que a lixeira cresca sem fim.
const CAPACIDADE: usize = 20;

pub enum Removido {
    Tarefa(Task),
    Nota(Note),
    Clips(Vec<ClipItem>),
}

/// Remocoes recentes, so em RAM. A webview so conhece a chave: desfazer nunca
/// aceita conteudo vindo dela, entao nao ha payload para forjar.
#[derive(Default)]
pub struct Lixeira(Mutex<VecDeque<(String, Removido)>>);

impl Lixeira {
    pub fn guardar(&self, item: Removido) -> String {
        let chave = new_id();
        let mut fila = self.0.lock().unwrap();
        if fila.len() == CAPACIDADE {
            fila.pop_front();
        }
        fila.push_back((chave.clone(), item));
        chave
    }

    pub fn retirar(&self, chave: &str) -> Option<Removido> {
        let mut fila = self.0.lock().unwrap();
        let pos = fila.iter().position(|(c, _)| c == chave)?;
        fila.remove(pos).map(|(_, item)| item)
    }

    /// Chamado ao trancar: conteudo em claro nao sobrevive ao cofre fechado.
    pub fn esvaziar(&self) {
        self.0.lock().unwrap().clear();
    }
}

impl AppState {
    /// Guarda segurando a sessao: o `lock()` ou vem antes (e nada entra) ou depois (e esvazia).
    /// Sem isso o watchdog de auto-lock podia trancar no meio e o texto em claro ficava na RAM.
    pub fn guardar_na_lixeira(&self, item: Removido) -> Option<String> {
        let sessao = self.session.lock().unwrap();
        sessao.as_ref()?;
        Some(self.lixeira.guardar(item))
    }
}

impl VaultData {
    pub fn remover(&mut self, id: &str, at: i64) -> Option<Removido> {
        let achado = self
            .tasks
            .iter()
            .find(|t| t.id == id)
            .cloned()
            .map(Removido::Tarefa)
            .or_else(|| self.notes.iter().find(|n| n.id == id).cloned().map(Removido::Nota));
        self.tombstone(id, at);
        achado
    }

    /// Carimbo novo: um backup antigo com a lapide nao apaga o item de novo no merge.
    pub fn restaurar(&mut self, item: Removido, at: i64) {
        match item {
            Removido::Tarefa(mut t) => {
                self.deleted.remove(&t.id);
                t.updated_at = at;
                self.tasks.retain(|x| x.id != t.id);
                self.tasks.push(t);
            }
            Removido::Nota(mut n) => {
                self.deleted.remove(&n.id);
                n.updated_at = at;
                self.notes.retain(|x| x.id != n.id);
                self.notes.push(n);
            }
            Removido::Clips(_) => {}
        }
    }
}

impl ClipHistory {
    /// Devolve os itens na posicao cronologica, sem duplicar o que ja voltou a ser copiado.
    pub fn restaurar(&mut self, itens: Vec<ClipItem>) {
        for item in itens {
            if !self.items.iter().any(|i| i.id == item.id || i.text == item.text) {
                self.items.push(item);
            }
        }
        self.items.sort_by_key(|i| std::cmp::Reverse(i.copied_at));
        self.podar();
    }
}

/// Desfaz uma remocao recente. `false` quando a chave ja foi usada ou o cofre trancou no meio.
#[tauri::command]
pub fn lixeira_desfazer(state: State<'_, AppState>, chave: String) -> Result<bool> {
    desfazer(&state, &chave)
}

pub fn desfazer(state: &AppState, chave: &str) -> Result<bool> {
    // Trancado: a lixeira ja foi (ou sera) esvaziada; responde "nao da mais" em vez de erro generico.
    if !state.is_unlocked() {
        return Ok(false);
    }
    let Some(item) = state.lixeira.retirar(chave) else {
        return Ok(false);
    };
    match item {
        Removido::Clips(itens) => {
            let mut hist = state.clip_load()?;
            hist.restaurar(itens);
            state.clip_save(&hist)?;
        }
        vault => state.mutate(|d| d.restaurar(vault, now_ms()))?,
    }
    Ok(true)
}
