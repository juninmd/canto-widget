use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};

use crate::error::{AppError, Result};

const EXTENSOES: [&str; 4] = ["txt", "md", "vtt", "srt"];
const PREVIEW_CHARS: usize = 400;
const MAX_ARQUIVOS: usize = 50;
const MAX_BYTES: u64 = 5 * 1024 * 1024;
/// Abrir a aba nao pode custar a leitura de 50 arquivos inteiros: para a
/// pre-visualizacao basta o comeco. A busca, essa sim, le tudo.
const PREVIEW_BYTES: u64 = 64 * 1024;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct TranscriptSettings {
    #[serde(default)]
    pub dir: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct TranscriptMeta {
    pub name: String,
    pub modified_at: i64,
    pub size: u64,
    pub preview: String,
}

pub fn default_dir() -> PathBuf {
    dirs_documents().join("Transcricoes")
}

fn dirs_documents() -> PathBuf {
    #[cfg(target_os = "windows")]
    let base = std::env::var_os("USERPROFILE").map(PathBuf::from);
    #[cfg(not(target_os = "windows"))]
    let base = std::env::var_os("HOME").map(PathBuf::from);
    base.unwrap_or_else(|| PathBuf::from(".")).join("Documents")
}

/// Resolve `name` dentro de `dir` recusando qualquer caminho que escape da pasta:
/// o nome vem do frontend e nunca deve virar um caminho arbitrario.
fn resolve_dentro(dir: &Path, name: &str) -> Result<PathBuf> {
    if name.contains('/') || name.contains(char::from(92)) || name.contains("..") {
        return Err(AppError::Config("nome de arquivo invalido".into()));
    }
    let base = dir
        .canonicalize()
        .map_err(|_| AppError::NotFound)?;
    let alvo = base.join(name).canonicalize().map_err(|_| AppError::NotFound)?;
    if !alvo.starts_with(&base) {
        return Err(AppError::Config("caminho fora da pasta de transcricoes".into()));
    }
    Ok(alvo)
}

fn e_transcricao(p: &Path) -> bool {
    p.extension()
        .and_then(|e| e.to_str())
        .map(|e| EXTENSOES.contains(&e.to_lowercase().as_str()))
        .unwrap_or(false)
}

fn mtime_ms(meta: &std::fs::Metadata) -> i64 {
    meta.modified()
        .ok()
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0)
}

/// Legendas viram texto corrido: numeracao, timestamps e cabecalho WEBVTT saem fora.
pub fn limpar_legenda(bruto: &str) -> String {
    let mut linhas = Vec::new();
    for linha in bruto.lines() {
        let t = linha.trim();
        if t.is_empty()
            || t == "WEBVTT"
            || t.contains("-->")
            || (t.chars().all(|c| c.is_ascii_digit()) && t.len() <= 5)
        {
            continue;
        }
        if linhas.last().map(|l: &String| l == t).unwrap_or(false) {
            continue;
        }
        linhas.push(t.to_string());
    }
    linhas.join(" ")
}

/// Le no maximo `teto` bytes e descarta um eventual caractere UTF-8 cortado ao meio.
fn ler_prefixo(caminho: &Path, teto: u64) -> String {
    use std::io::Read;
    let Ok(f) = std::fs::File::open(caminho) else {
        return String::new();
    };
    let mut buf = Vec::new();
    if f.take(teto).read_to_end(&mut buf).is_err() {
        return String::new();
    }
    match String::from_utf8(buf) {
        Ok(s) => s,
        Err(e) => {
            let ok = e.utf8_error().valid_up_to();
            String::from_utf8_lossy(&e.into_bytes()[..ok]).into_owned()
        }
    }
}

pub fn listar(dir: &Path, query: &str) -> Result<Vec<TranscriptMeta>> {
    let Ok(entradas) = std::fs::read_dir(dir) else {
        return Ok(vec![]);
    };
    let q = query.trim().to_lowercase();
    let mut out = Vec::new();
    for entrada in entradas.flatten() {
        let caminho = entrada.path();
        if !caminho.is_file() || !e_transcricao(&caminho) {
            continue;
        }
        let Ok(meta) = entrada.metadata() else { continue };
        let teto = if q.is_empty() { PREVIEW_BYTES } else { MAX_BYTES };
        let conteudo = if meta.len() > MAX_BYTES && !q.is_empty() {
            String::from("(arquivo grande demais para pre-visualizar)")
        } else {
            limpar_legenda(&ler_prefixo(&caminho, teto))
        };
        let name = entrada.file_name().to_string_lossy().to_string();
        if !q.is_empty() && !name.to_lowercase().contains(&q) && !conteudo.to_lowercase().contains(&q) {
            continue;
        }
        out.push(TranscriptMeta {
            name,
            modified_at: mtime_ms(&meta),
            size: meta.len(),
            preview: conteudo.chars().take(PREVIEW_CHARS).collect(),
        });
    }
    out.sort_by(|a, b| b.modified_at.cmp(&a.modified_at));
    out.truncate(MAX_ARQUIVOS);
    Ok(out)
}

pub fn ler(dir: &Path, name: &str) -> Result<String> {
    let caminho = resolve_dentro(dir, name)?;
    let meta = std::fs::metadata(&caminho)?;
    if meta.len() > MAX_BYTES {
        return Err(AppError::Config("transcricao maior que 5 MB".into()));
    }
    Ok(limpar_legenda(&std::fs::read_to_string(caminho)?))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn limpa_vtt_deixando_so_a_fala() {
        let vtt = "WEBVTT\n\n1\n00:00:01.000 --> 00:00:04.000\nBom dia pessoal\n\n2\n00:00:04.000 --> 00:00:06.000\nvamos comecar";
        assert_eq!(limpar_legenda(vtt), "Bom dia pessoal vamos comecar");
    }

    #[test]
    fn remove_repeticao_consecutiva_das_legendas() {
        let srt = "1\n00:00:01,000 --> 00:00:02,000\nteste\n\n2\n00:00:02,000 --> 00:00:03,000\nteste";
        assert_eq!(limpar_legenda(srt), "teste");
    }

    #[test]
    fn recusa_nome_que_escapa_da_pasta() {
        let dir = std::env::temp_dir();
        for malicioso in ["../segredo.txt", "sub/dir.txt", "..", "a\\b.txt"] {
            assert!(resolve_dentro(&dir, malicioso).is_err(), "aceitou {malicioso}");
        }
    }

    #[test]
    fn listar_sem_busca_nao_le_o_arquivo_inteiro() {
        let dir = std::env::temp_dir().join(format!("canto-transc-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        let grande = dir.join("longa.txt");
        // Agulha depois do teto de pre-visualizacao: so a busca deve alcanca-la.
        let mut conteudo = "a".repeat(PREVIEW_BYTES as usize + 10);
        conteudo.push_str(" agulha-no-fim");
        std::fs::write(&grande, &conteudo).unwrap();

        let sem_busca = listar(&dir, "").unwrap();
        assert_eq!(sem_busca.len(), 1);
        assert!(!sem_busca[0].preview.contains("agulha-no-fim"));

        assert_eq!(listar(&dir, "agulha-no-fim").unwrap().len(), 1);
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn prefixo_nao_quebra_caractere_multibyte() {
        let dir = std::env::temp_dir().join(format!("canto-utf8-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        let arq = dir.join("acento.txt");
        std::fs::write(&arq, "ção").unwrap();
        // 3 bytes: "ç" (2 bytes) inteiro, o "ã" cortado ao meio cai fora.
        assert_eq!(ler_prefixo(&arq, 3), "ç");
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn so_aceita_extensoes_de_transcricao() {
        assert!(e_transcricao(Path::new("reuniao.vtt")));
        assert!(e_transcricao(Path::new("REUNIAO.TXT")));
        assert!(!e_transcricao(Path::new("segredo.env")));
        assert!(!e_transcricao(Path::new("chave.pem")));
    }
}
