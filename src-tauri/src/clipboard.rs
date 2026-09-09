use serde::{Deserialize, Serialize};

use crate::error::Result;
use crate::model::now_ms;
use crate::store::{self, SealedBlob};
use crate::vault::AppState;

pub const CLIP_AAD: &[u8] = b"canto.clip.v1";
/// Historico local, nunca sincronizado: fica so nesta maquina, sempre cifrado.
const MAX_ITENS: usize = 100;
const MAX_CHARS: usize = 8_000;

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct ClipHistory {
    #[serde(default)]
    pub items: Vec<ClipItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClipItem {
    pub id: String,
    pub text: String,
    pub copied_at: i64,
    #[serde(default)]
    pub pinned: bool,
}

impl ClipHistory {
    /// Insere o texto no topo; repetido sobe em vez de duplicar.
    pub fn push(&mut self, text: &str, id: String) -> bool {
        let text = text.trim();
        if text.is_empty() {
            return false;
        }
        let text: String = text.chars().take(MAX_CHARS).collect();
        if self.items.first().is_some_and(|i| i.text == text) {
            return false;
        }
        self.items.retain(|i| i.text != text);
        self.items.insert(
            0,
            ClipItem {
                id,
                text,
                copied_at: now_ms(),
                pinned: false,
            },
        );
        let mut kept = 0;
        self.items.retain(|i| {
            if i.pinned {
                return true;
            }
            kept += 1;
            kept <= MAX_ITENS
        });
        true
    }
}

impl AppState {
    pub fn clip_load(&self) -> Result<ClipHistory> {
        let guard = self.session.lock().unwrap();
        let Some(session) = guard.as_ref() else {
            return Ok(ClipHistory::default());
        };
        match store::read_json::<SealedBlob>(&store::clip_path(&self.dir))? {
            None => Ok(ClipHistory::default()),
            Some(blob) => match blob.open(session.key(), CLIP_AAD) {
                Ok(plain) => Ok(serde_json::from_slice(&plain)?),
                // Historico e descartavel: um envelope ilegivel nao trava o widget.
                Err(_) => Ok(ClipHistory::default()),
            },
        }
    }

    pub fn clip_save(&self, hist: &ClipHistory) -> Result<()> {
        let guard = self.session.lock().unwrap();
        let Some(session) = guard.as_ref() else {
            return Ok(());
        };
        let plain = serde_json::to_vec(hist)?;
        let blob = SealedBlob::seal(session.key(), session.salt(), &plain, CLIP_AAD, now_ms())?;
        store::write_json_atomic(&store::clip_path(&self.dir), &blob)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn hist(textos: &[&str]) -> ClipHistory {
        let mut h = ClipHistory::default();
        for (i, t) in textos.iter().enumerate() {
            h.push(t, format!("id{i}"));
        }
        h
    }

    #[test]
    fn mais_recente_fica_no_topo() {
        let h = hist(&["um", "dois"]);
        assert_eq!(h.items[0].text, "dois");
        assert_eq!(h.items.len(), 2);
    }

    #[test]
    fn repetido_sobe_sem_duplicar() {
        let mut h = hist(&["um", "dois"]);
        assert!(h.push("um", "novo".into()));
        assert_eq!(h.items.len(), 2);
        assert_eq!(h.items[0].text, "um");
    }

    #[test]
    fn ignora_vazio_e_o_mesmo_texto_seguido() {
        let mut h = hist(&["um"]);
        assert!(!h.push("   ", "x".into()));
        assert!(!h.push("um", "y".into()));
        assert_eq!(h.items.len(), 1);
    }

    #[test]
    fn respeita_o_teto_de_itens() {
        let mut h = ClipHistory::default();
        for i in 0..(MAX_ITENS + 20) {
            h.push(&format!("item {i}"), format!("id{i}"));
        }
        assert_eq!(h.items.len(), MAX_ITENS);
        assert_eq!(h.items[0].text, format!("item {}", MAX_ITENS + 19));
    }

    #[test]
    fn fixados_sobrevivem_ao_teto() {
        let mut h = ClipHistory::default();
        h.push("guardar isto", "fixo".into());
        h.items[0].pinned = true;
        for i in 0..(MAX_ITENS + 10) {
            h.push(&format!("ruido {i}"), format!("id{i}"));
        }
        assert!(h.items.iter().any(|i| i.text == "guardar isto"));
    }

    #[test]
    fn texto_gigante_e_truncado() {
        let mut h = ClipHistory::default();
        h.push(&"a".repeat(MAX_CHARS * 2), "big".into());
        assert_eq!(h.items[0].text.chars().count(), MAX_CHARS);
    }
}
