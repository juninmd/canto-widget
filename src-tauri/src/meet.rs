//! Descoberta do link do Meet em um evento do Google Calendar.

pub fn meet_link(raw_hangout: Option<&str>, entradas: &[&str], textos: &[&str]) -> String {

    if let Some(l) = raw_hangout.filter(|l| !l.is_empty()) {
        return l.to_string();
    }
    if let Some(l) = entradas.iter().find(|u| u.contains("meet.google.com")) {
        return l.to_string();
    }
    textos
        .iter()
        .filter_map(|t| extrair_meet(t))
        .next()
        .unwrap_or_default()
}

/// Encontra uma URL do Meet solta no texto do convite.
fn extrair_meet(texto: &str) -> Option<String> {
    let pos = texto.find("https://meet.google.com/")?;
    let resto = &texto[pos..];
    let fim = resto
        .find(|c: char| c.is_whitespace() || c == '<' || c == '"' || c == ')')
        .unwrap_or(resto.len());
    Some(resto[..fim].trim_end_matches(['.', ',']).to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn prefere_o_hangout_link_oficial() {
        assert_eq!(
            meet_link(Some("https://meet.google.com/abc-defg-hij"), &[], &[]),
            "https://meet.google.com/abc-defg-hij"
        );
    }

    #[test]
    fn cai_para_o_entry_point_de_video() {
        assert_eq!(
            meet_link(None, &["https://meet.google.com/xyz-1234-abc"], &[]),
            "https://meet.google.com/xyz-1234-abc"
        );
    }

    #[test]
    fn extrai_meet_solto_na_descricao() {
        let desc = "Pauta do time. Entre por https://meet.google.com/qwe-rtyu-iop, ate mais.";
        assert_eq!(meet_link(None, &[], &[desc]), "https://meet.google.com/qwe-rtyu-iop");
    }

    #[test]
    fn sem_meet_devolve_vazio() {
        assert_eq!(meet_link(None, &[], &["reuniao presencial na sala 3"]), "");
    }

    #[test]
    fn ignora_link_de_outro_dominio() {
        assert_eq!(meet_link(None, &["https://zoom.us/j/123"], &[]), "");
    }
}
