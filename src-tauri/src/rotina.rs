use tauri::State;

use crate::error::{AppError, Result};
use crate::model::{now_ms, Repetir, Task, VaultData};
use crate::vault::AppState;

/// "YYYY-MM-DD" valido, ou `None`. O dia vem da webview: nao confiar no formato.
fn civil(dia: &str) -> Option<(i64, u32, u32)> {
    let b = dia.as_bytes();
    if b.len() != 10 || b[4] != b'-' || b[7] != b'-' {
        return None;
    }
    let num = |r: std::ops::Range<usize>| dia.get(r)?.parse::<u32>().ok();
    let (a, m, d) = (num(0..4)?, num(5..7)?, num(8..10)?);
    ((1..=12).contains(&m) && (1..=31).contains(&d)).then_some((a as i64, m, d))
}

/// 0 = domingo ... 6 = sabado (algoritmo days_from_civil de Howard Hinnant).
pub fn dia_da_semana(dia: &str) -> Option<u8> {
    let (a, m, d) = civil(dia)?;
    let a = if m <= 2 { a - 1 } else { a };
    let era = a.div_euclid(400);
    let yoe = a - era * 400;
    let mp = (m as i64 + 9) % 12;
    let doy = (153 * mp + 2) / 5 + d as i64 - 1;
    let doe = yoe * 365 + yoe / 4 - yoe / 100 + doy;
    let dias = era * 146_097 + doe - 719_468;
    Some((dias + 4).rem_euclid(7) as u8)
}

impl Repetir {
    pub fn vale_em(&self, dia: &str) -> bool {
        match (self, dia_da_semana(dia)) {
            (_, None) => false,
            (Repetir::Diaria, _) => true,
            (Repetir::DiasUteis, Some(s)) => (1..=5).contains(&s),
            (Repetir::Semanal { dia: alvo }, Some(s)) => *alvo == s,
        }
    }
}

pub fn id_da_instancia(serie: &str, dia: &str) -> String {
    format!("{serie}-{dia}")
}

/// Cria em `dia` a proxima tarefa de cada serie, copiando a instancia mais recente.
/// Id deterministico: duas maquinas geram o mesmo item e o merge nao duplica; a lapide
/// de uma instancia excluida impede que ela renasca.
pub fn materializar(d: &mut VaultData, dia: &str, agora: i64) -> usize {
    if civil(dia).is_none() {
        return 0;
    }
    let mut ultimas: std::collections::HashMap<&str, &Task> = Default::default();
    let mut com_hoje = std::collections::HashSet::new();
    for t in &d.tasks {
        let Some(serie) = t.serie.as_deref() else { continue };
        if t.day.as_str() == dia {
            com_hoje.insert(serie);
        } else if t.day.as_str() < dia && ultimas.get(serie).is_none_or(|u| u.day < t.day) {
            ultimas.insert(serie, t);
        }
    }
    let novas: Vec<Task> = ultimas
        .into_iter()
        .filter(|(serie, _)| !com_hoje.contains(serie))
        .filter(|(_, t)| t.repetir.is_some_and(|r| r.vale_em(dia)))
        .map(|(serie, t)| Task {
            id: id_da_instancia(serie, dia),
            day: dia.to_string(),
            done: false,
            created_at: agora,
            updated_at: agora,
            ..t.clone()
        })
        .filter(|t| !d.deleted.contains_key(&t.id))
        .collect();
    let n = novas.len();
    d.tasks.extend(novas);
    n
}

/// "HH:MM" em 24h. Qualquer outra coisa e recusada antes de chegar ao cofre.
pub fn validar_hora(hora: &str) -> Result<String> {
    let b = hora.as_bytes();
    let ok = b.len() == 5
        && b[2] == b':'
        && [0, 1, 3, 4].iter().all(|&i| b[i].is_ascii_digit())
        && matches!((hora[..2].parse::<u8>(), hora[3..].parse::<u8>()), (Ok(h), Ok(m)) if h < 24 && m < 60);
    if !ok {
        return Err(AppError::Config("horario invalido, use HH:MM".into()));
    }
    Ok(hora.to_string())
}

pub fn definir_detalhes(t: &mut Task, hora: Option<String>, repetir: Option<Repetir>, agora: i64) -> Result<()> {
    if let Some(Repetir::Semanal { dia }) = repetir {
        if dia > 6 {
            return Err(AppError::Config("dia da semana invalido".into()));
        }
    }
    t.hora = hora.filter(|h| !h.is_empty()).map(|h| validar_hora(&h)).transpose()?;
    t.repetir = repetir;
    if repetir.is_some() && t.serie.is_none() {
        t.serie = Some(t.id.clone());
    }
    t.updated_at = agora;
    Ok(())
}

#[tauri::command]
pub fn task_set_detalhes(
    state: State<'_, AppState>,
    id: String,
    hora: Option<String>,
    repetir: Option<Repetir>,
) -> Result<()> {
    state.mutate(|d| match d.tasks.iter_mut().find(|t| t.id == id) {
        Some(t) => definir_detalhes(t, hora, repetir, now_ms()),
        None => Err(AppError::NotFound),
    })?
}

/// Tarefas de `dia` com horario e em aberto, para o vigia de lembretes. Roda em fundo:
/// nao adia o auto-lock, e trancado devolve lista vazia em vez de erro a cada 30 s.
#[tauri::command]
pub fn tasks_lembretes(state: State<'_, AppState>, day: String) -> Result<Vec<Task>> {
    let lista = state.em_fundo(|d| {
        let criadas = materializar(d, &day, now_ms());
        let lista = d
            .tasks
            .iter()
            .filter(|t| t.day == day && !t.done && t.hora.is_some())
            .cloned()
            .collect();
        (lista, criadas > 0)
    });
    match lista {
        Err(AppError::Locked) => Ok(vec![]),
        outro => outro,
    }
}
