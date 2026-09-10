use std::path::PathBuf;
use tauri::{Manager, State};
use tauri_plugin_clipboard_manager::ClipboardExt;

use crate::calendar::{self, AgendaItem};
use crate::clipboard::ClipItem;
use crate::commands::new_id;
use crate::drive;
use crate::error::{AppError, Result};
use crate::transcripts::{self, TranscriptMeta, TranscriptSettings};
use crate::vault::AppState;
use crate::{store, window};

// ---------- area de transferencia (sempre local, nunca vai para o Drive) ----------

#[tauri::command]
pub fn clip_list(state: State<'_, AppState>, query: String) -> Result<Vec<ClipItem>> {
    let q = query.trim().to_lowercase();
    let hist = state.clip_load()?;
    Ok(hist
        .items
        .into_iter()
        .filter(|i| q.is_empty() || i.text.to_lowercase().contains(&q))
        .collect())
}

#[tauri::command]
pub fn clip_copy(app: tauri::AppHandle, state: State<'_, AppState>, id: String) -> Result<()> {
    let hist = state.clip_load()?;
    let item = hist
        .items
        .iter()
        .find(|i| i.id == id)
        .ok_or(AppError::NotFound)?;
    app.clipboard()
        .write_text(item.text.clone())
        .map_err(|e| AppError::Io(e.to_string()))
}

#[tauri::command]
pub fn clip_pin(state: State<'_, AppState>, id: String) -> Result<()> {
    let mut hist = state.clip_load()?;
    if let Some(i) = hist.items.iter_mut().find(|i| i.id == id) {
        i.pinned = !i.pinned;
    }
    state.clip_save(&hist)
}

#[tauri::command]
pub fn clip_delete(state: State<'_, AppState>, id: String) -> Result<()> {
    let mut hist = state.clip_load()?;
    hist.items.retain(|i| i.id != id);
    state.clip_save(&hist)
}

#[tauri::command]
pub fn clip_clear(state: State<'_, AppState>) -> Result<()> {
    let mut hist = state.clip_load()?;
    hist.items.retain(|i| i.pinned);
    state.clip_save(&hist)
}

/// Vigia o clipboard do sistema enquanto o cofre estiver destrancado.
/// So decifra o historico quando o texto realmente mudou: sem isso o widget
/// pagaria uma leitura + AES-GCM do arquivo inteiro 50 vezes por minuto.
pub fn watch_clipboard(app: tauri::AppHandle) {
    std::thread::spawn(move || {
        let mut ultimo = String::new();
        loop {
            std::thread::sleep(std::time::Duration::from_millis(1200));
            let Some(state) = app.try_state::<AppState>() else {
                continue;
            };
            if !state.is_unlocked() {
                // Cofre trancado no meio do caminho: esquece o ultimo visto para
                // nao perder a proxima copia por parecer repetida.
                ultimo.clear();
                continue;
            }
            let Ok(texto) = app.clipboard().read_text() else {
                continue;
            };
            if texto == ultimo {
                continue;
            }
            ultimo = texto.clone();
            let Ok(mut hist) = state.clip_load() else { continue };
            if hist.push(&texto, new_id()) {
                let _ = state.clip_save(&hist);
            }
        }
    });
}

// ---------- transcricoes de reuniao (leitura local de uma pasta) ----------

fn transcript_dir(state: &AppState) -> PathBuf {
    let cfg: Option<TranscriptSettings> =
        store::read_json(&store::settings_path(&state.dir)).unwrap_or_default();
    match cfg.map(|c| c.dir).filter(|d| !d.is_empty()) {
        Some(d) => PathBuf::from(d),
        None => transcripts::default_dir(),
    }
}

#[tauri::command]
pub fn transcripts_dir(state: State<'_, AppState>) -> String {
    transcript_dir(&state).to_string_lossy().to_string()
}

#[tauri::command]
pub fn transcripts_set_dir(state: State<'_, AppState>, dir: String) -> Result<()> {
    let caminho = PathBuf::from(dir.trim());
    if !caminho.is_dir() {
        return Err(AppError::Config("pasta inexistente".into()));
    }
    store::write_json_atomic(
        &store::settings_path(&state.dir),
        &TranscriptSettings {
            dir: caminho.to_string_lossy().to_string(),
        },
    )
}

#[tauri::command]
pub fn transcripts_list(state: State<'_, AppState>, query: String) -> Result<Vec<TranscriptMeta>> {
    transcripts::listar(&transcript_dir(&state), &query)
}

#[tauri::command]
pub fn transcript_read(state: State<'_, AppState>, name: String) -> Result<String> {
    transcripts::ler(&transcript_dir(&state), &name)
}

// ---------- agenda do dia ----------

#[tauri::command(async)]
pub fn agenda_today(
    state: State<'_, AppState>,
    time_min: String,
    time_max: String,
) -> Result<Vec<AgendaItem>> {
    let mut cfg = state.drive_config()?;
    let tokens = cfg
        .tokens
        .as_mut()
        .ok_or_else(|| AppError::Config("entre com o Google para ver a agenda".into()))?;
    let token = drive::fresh_access_token(tokens, &cfg.client_id, &cfg.client_secret)?;
    let eventos = calendar::eventos(&token, &time_min, &time_max)?;
    state.save_drive_config(&cfg)?;
    Ok(eventos)
}

#[tauri::command]
pub fn alerta_abrir(app: tauri::AppHandle, evento: AgendaItem) -> Result<()> {
    window::abrir_alerta(&app, evento).map_err(|e| AppError::Io(e.to_string()))
}

#[tauri::command]
pub fn alerta_payload(state: State<'_, AppState>) -> Option<AgendaItem> {
    state.alerta.lock().unwrap().clone()
}

#[tauri::command]
pub fn alerta_fechar(app: tauri::AppHandle) -> Result<()> {
    window::fechar_alerta(&app).map_err(|e| AppError::Io(e.to_string()))
}

#[tauri::command]
pub fn abrir_link(url: String) -> Result<()> {
    // So links http(s): o alerta nunca deve virar um executor de esquemas locais.
    if !(url.starts_with("https://") || url.starts_with("http://")) {
        return Err(AppError::Config("link nao suportado".into()));
    }
    tauri_plugin_opener::open_url(url, None::<&str>).map_err(|e| AppError::Io(e.to_string()))
}
