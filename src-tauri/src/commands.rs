use rand::Rng;
use tauri::State;

use crate::error::{AppError, Result};
use crate::model::{now_ms, Task};
use crate::vault::AppState;

/// Titulo de tarefa sempre chega aparado e nunca vazio, no cadastro e no rename.
fn titulo_de_tarefa(bruto: &str) -> Result<String> {
    let limpo = bruto.trim();
    if limpo.is_empty() {
        return Err(AppError::Config("a tarefa precisa de um titulo".into()));
    }
    Ok(limpo.to_string())
}

pub fn new_id() -> String {
    format!("{:x}{:x}", now_ms(), rand::thread_rng().gen::<u32>())
}

#[derive(serde::Serialize)]
pub struct Status {
    exists: bool,
    unlocked: bool,
}

#[tauri::command]
pub fn vault_status(state: State<'_, AppState>) -> Status {
    Status {
        exists: state.vault_exists(),
        unlocked: state.is_unlocked(),
    }
}

#[tauri::command]
pub fn vault_create(state: State<'_, AppState>, password: String) -> Result<()> {
    state.create(&password)
}

#[tauri::command]
pub fn vault_unlock(state: State<'_, AppState>, password: String) -> Result<()> {
    state.unlock(&password)
}

#[tauri::command]
pub fn vault_lock(state: State<'_, AppState>) {
    state.lock();
}

#[tauri::command]
pub fn tasks_for_day(state: State<'_, AppState>, day: String) -> Result<Vec<Task>> {
    state.mutate_se(|d| crate::rotina::materializar(d, &day, now_ms()) > 0)?;
    state.read(|d| {
        let mut list: Vec<Task> = d.tasks.iter().filter(|t| t.day == day).cloned().collect();
        list.sort_by_key(|t| (t.done, t.created_at));
        list
    })
}

#[tauri::command]
pub fn task_add(state: State<'_, AppState>, title: String, day: String) -> Result<Task> {
    let title = titulo_de_tarefa(&title)?;
    let now = now_ms();
    let task = Task {
        id: new_id(),
        title,
        done: false,
        day,
        created_at: now,
        updated_at: now,
        ..Default::default()
    };
    let created = task.clone();
    state.mutate(|d| d.tasks.push(task))?;
    Ok(created)
}

#[tauri::command]
pub fn task_toggle(state: State<'_, AppState>, id: String) -> Result<()> {
    state.mutate(|d| {
        if let Some(t) = d.tasks.iter_mut().find(|t| t.id == id) {
            t.done = !t.done;
            t.updated_at = now_ms();
        }
    })
}

/// Idempotente, ao contrario do toggle: o "concluir" do lembrete nao pode reabrir
/// uma tarefa que o usuario ja marcou pela lista.
#[tauri::command]
pub fn task_concluir(state: State<'_, AppState>, id: String) -> Result<()> {
    state.mutate_se(|d| concluir(d, &id, now_ms()))
}

pub fn concluir(d: &mut crate::model::VaultData, id: &str, agora: i64) -> bool {
    match d.tasks.iter_mut().find(|t| t.id == id && !t.done) {
        Some(t) => {
            t.done = true;
            t.updated_at = agora;
            true
        }
        None => false,
    }
}

#[tauri::command]
pub fn task_rename(state: State<'_, AppState>, id: String, title: String) -> Result<()> {
    let title = titulo_de_tarefa(&title)?;
    state.mutate(|d| {
        if let Some(t) = d.tasks.iter_mut().find(|t| t.id == id) {
            t.title = title;
            t.updated_at = now_ms();
        }
    })
}

/// Marca atividade deliberada do usuario para adiar o auto-lock.
#[tauri::command]
pub fn vault_touch(state: State<'_, AppState>) {
    if state.is_unlocked() {
        state.touch();
    }
}

/// Traz para `day` as tarefas em aberto de dias anteriores, sem duplicar nada.
#[tauri::command]
pub fn tasks_carry_over(state: State<'_, AppState>, day: String) -> Result<usize> {
    state.mutate(|d| {
        let now = now_ms();
        let mut moved = 0;
        for t in d.tasks.iter_mut() {
            // Serie recorrente ganha instancia propria no dia; arrastar duplicaria a tarefa.
            if !t.done && t.day < day && t.serie.is_none() {
                t.day = day.clone();
                t.updated_at = now;
                moved += 1;
            }
        }
        moved
    })
}

#[tauri::command]
/// Devolve a chave para desfazer, ou `None` se o id nao existia.
pub fn item_delete(state: State<'_, AppState>, id: String) -> Result<Option<String>> {
    let removido = state.mutate(|d| d.remover(&id, now_ms()))?;
    Ok(removido.and_then(|r| state.guardar_na_lixeira(r)))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn titulo_valido_chega_aparado() {
        assert_eq!(titulo_de_tarefa("  comprar leite  ").unwrap(), "comprar leite");
    }

    #[test]
    fn titulo_vazio_ou_so_espaco_e_recusado() {
        for bruto in ["", "   ", "\t\n", "\u{00a0}"] {
            assert!(
                matches!(titulo_de_tarefa(bruto), Err(AppError::Config(_))),
                "aceitou {bruto:?} como titulo"
            );
        }
    }

    #[test]
    fn ids_gerados_em_sequencia_nao_se_repetem() {
        let ids: std::collections::HashSet<String> = (0..500).map(|_| new_id()).collect();
        assert_eq!(ids.len(), 500);
    }
}
