use serde::Serialize;
use std::path::{Path, PathBuf};

use crate::error::{AppError, Result};
use crate::model::now_ms;
use crate::store::{self, SealedBlob};
use crate::vault::AppState;

pub const EXTENSAO: &str = "canto";
/// Cofre de tarefas e notas em texto fica na casa dos KB; o teto so impede
/// que um arquivo errado escolhido no dialogo seja lido inteiro para a RAM.
const MAX_BYTES: u64 = 32 * 1024 * 1024;
/// Copias diarias e de antes de importar, somadas.
pub const MANTER: usize = 10;

#[derive(Debug, Serialize, PartialEq)]
pub struct ResumoImport {
    pub tarefas: usize,
    pub notas: usize,
}

pub fn backups_dir(dir: &Path) -> PathBuf {
    dir.join("backups")
}

/// O envelope em disco ja e cifrado e reflete cada mutacao: exportar e copiar.
pub fn exportar(dir: &Path, destino: &Path) -> Result<()> {
    let bytes = ler_envelope_local(dir)?.ok_or(AppError::NotFound)?;
    store::write_bytes_atomic(destino, &bytes)
}

/// Funde o backup no cofre destrancado (last-write-wins, com lapides). Reimportar
/// o mesmo arquivo nao muda nada; o estado anterior fica guardado em `backups/`.
pub fn importar(state: &AppState, origem: &Path) -> Result<ResumoImport> {
    let tamanho = std::fs::metadata(origem)?.len();
    if tamanho > MAX_BYTES {
        return Err(AppError::Config("arquivo grande demais para ser um backup do Canto".into()));
    }
    let blob: SealedBlob = serde_json::from_slice(&std::fs::read(origem)?)
        .map_err(|_| AppError::Format("o arquivo nao e um backup do Canto".into()))?;
    let vindo = state.abrir_envelope(&blob)?;
    // So depois de abrir: senha errada nao deixa copia inutil para tras.
    guardar(&state.dir, &format!("{}T{}-import", hoje_utc(), now_ms()))?;
    state.mutate(|local| {
        *local = std::mem::take(local).merge(vindo);
        ResumoImport { tarefas: local.tasks.len(), notas: local.notes.len() }
    })
}

/// Uma copia por dia (UTC), sem precisar da chave. Devolve `true` se gravou.
pub fn diario(dir: &Path, dia: &str) -> Result<bool> {
    if backups_dir(dir).join(format!("{dia}.{EXTENSAO}")).exists() {
        return Ok(false);
    }
    guardar(dir, dia)
}

pub fn hoje_utc() -> String {
    let d = time::OffsetDateTime::now_utc().date();
    format!("{:04}-{:02}-{:02}", d.year(), u8::from(d.month()), d.day())
}

fn ler_envelope_local(dir: &Path) -> Result<Option<Vec<u8>>> {
    match std::fs::read(store::vault_path(dir)) {
        Ok(b) => Ok(Some(b)),
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(None),
        Err(e) => Err(e.into()),
    }
}

fn guardar(dir: &Path, nome: &str) -> Result<bool> {
    let Some(bytes) = ler_envelope_local(dir)? else {
        return Ok(false);
    };
    let pasta = backups_dir(dir);
    store::write_bytes_atomic(&pasta.join(format!("{nome}.{EXTENSAO}")), &bytes)?;
    podar(&pasta, MANTER)?;
    Ok(true)
}

/// Nomes comecam pela data ISO: a ordem alfabetica e a cronologica.
fn podar(pasta: &Path, manter: usize) -> Result<()> {
    let mut nomes: Vec<PathBuf> = std::fs::read_dir(pasta)?
        .filter_map(|e| e.ok().map(|e| e.path()))
        .filter(|p| p.extension().is_some_and(|x| x == EXTENSAO))
        .collect();
    nomes.sort();
    let excesso = nomes.len().saturating_sub(manter);
    for velho in &nomes[..excesso] {
        std::fs::remove_file(velho)?;
    }
    Ok(())
}
