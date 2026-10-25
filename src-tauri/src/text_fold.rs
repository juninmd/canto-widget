//! Accent- and case-insensitive search: "acao" finds "Ação", "reuniao" finds "reunião".
//! A small table covers the Latin-1 and Latin Extended-A letters that NFD splits into base + mark (pt-BR/es/fr/de and
//! friends) without pulling in a Unicode crate. Everything else (ø, ł, ß, Greek tonos, Cyrillic, kana, Vietnamese
//! precomposed letters) only loses its case. `fold` in src/lib/fold.ts is the same table, and both sides run the cases
//! in src/lib/fold_cases.json, so the Rust list and the frontend highlight always agree.

/// Lowercases `s`, strips combining marks U+0300–U+036F (already-decomposed text) and folds accented Latin letters
/// to their base. Lowercasing goes char by char, so the final sigma is folded to σ to keep "ΟΔΟΣ" findable as "οδος".
pub fn fold(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for c in s.chars().flat_map(char::to_lowercase) {
        if ('\u{0300}'..='\u{036F}').contains(&c) {
            continue;
        }
        out.push(base(c).unwrap_or(c));
    }
    out
}

/// `needle_folded` must already be folded: callers fold the query once, not once per item.
/// Plain ASCII on both sides (most notes and clips) is compared in place, without allocating a folded copy.
pub fn contains(haystack: &str, needle_folded: &str) -> bool {
    if needle_folded.is_empty() {
        return true;
    }
    if haystack.is_ascii() && needle_folded.is_ascii() {
        let needle = needle_folded.as_bytes();
        return haystack.as_bytes().windows(needle.len()).any(|w| w.eq_ignore_ascii_case(needle));
    }
    fold(haystack).contains(needle_folded)
}

fn base(c: char) -> Option<char> {
    Some(match c {
        'à' | 'á' | 'â' | 'ã' | 'ä' | 'å' | 'ā' | 'ă' | 'ą' => 'a',
        'ç' | 'ć' | 'ĉ' | 'ċ' | 'č' => 'c',
        'ď' => 'd',
        'è' | 'é' | 'ê' | 'ë' | 'ē' | 'ĕ' | 'ė' | 'ę' | 'ě' => 'e',
        'ĝ' | 'ğ' | 'ġ' | 'ģ' => 'g',
        'ĥ' => 'h',
        'ì' | 'í' | 'î' | 'ï' | 'ĩ' | 'ī' | 'ĭ' | 'į' => 'i',
        'ĵ' => 'j',
        'ķ' => 'k',
        'ĺ' | 'ļ' | 'ľ' => 'l',
        'ñ' | 'ń' | 'ņ' | 'ň' => 'n',
        'ò' | 'ó' | 'ô' | 'õ' | 'ö' | 'ō' | 'ŏ' | 'ő' => 'o',
        'ŕ' | 'ŗ' | 'ř' => 'r',
        'ś' | 'ŝ' | 'ş' | 'š' => 's',
        'ţ' | 'ť' => 't',
        'ù' | 'ú' | 'û' | 'ü' | 'ũ' | 'ū' | 'ŭ' | 'ů' | 'ű' | 'ų' => 'u',
        'ŵ' => 'w',
        'ý' | 'ÿ' | 'ŷ' => 'y',
        'ź' | 'ż' | 'ž' => 'z',
        'ς' => 'σ',
        _ => return None,
    })
}

#[cfg(test)]
mod tests {
    use super::{contains, fold};

    /// The same fixtures src/lib/fold.test.ts runs: a drift between the two folds fails here or there.
    #[test]
    fn shared_cases_fold_exactly_like_the_frontend() {
        let cases: Vec<(String, String)> = serde_json::from_str(include_str!("../../src/lib/fold_cases.json")).unwrap();
        assert!(cases.len() >= 5);
        for (input, want) in cases {
            assert_eq!(fold(&input), want, "fold({input:?})");
        }
    }

    #[test]
    fn a_plain_query_finds_accented_text_and_the_other_way_round() {
        assert!(contains("Pauta da Reunião", &fold("reuniao")));
        assert!(contains("acao de graças", &fold("Ação")));
        assert!(!contains("reunir", &fold("reuniao")));
    }

    #[test]
    fn the_final_sigma_still_matches_a_lowercase_query() {
        assert!(contains("ΟΔΟΣ", &fold("οδος")));
        assert!(contains("οδός", &fold("ΟΔΌΣ")));
    }

    #[test]
    fn the_ascii_shortcut_agrees_with_the_slow_path() {
        assert!(contains("Comprar LEITE amanhã", &fold("leite")));
        assert!(contains("Comprar LEITE", &fold("leite")));
        assert!(!contains("lei", &fold("leite")));
        assert!(contains("qualquer", ""));
    }
}
