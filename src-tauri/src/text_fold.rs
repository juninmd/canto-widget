//! Accent- and case-insensitive search: "acao" finds "Ação", "reuniao" finds "reunião".
//! A small table covers the Latin-1 and Latin Extended-A letters that NFD splits into base + mark (pt-BR/es/fr/de and
//! friends) without pulling in a Unicode crate. Letters NFD keeps whole (ø, ł, ß) stay as they are, matching `fold` in
//! src/lib/fold.ts so the list and the highlight agree.

/// Lowercases `s`, strips combining marks (already-decomposed text) and folds accented Latin letters to their base.
pub fn fold(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for c in s.chars().flat_map(char::to_lowercase) {
        if ('\u{0300}'..='\u{036F}').contains(&c) {
            continue;
        }
        match base(c) {
            Some(b) => out.push_str(b),
            None => out.push(c),
        }
    }
    out
}

/// `needle_folded` must already be folded: callers fold the query once, not once per item.
pub fn contains(haystack: &str, needle_folded: &str) -> bool {
    fold(haystack).contains(needle_folded)
}

fn base(c: char) -> Option<&'static str> {
    Some(match c {
        'à' | 'á' | 'â' | 'ã' | 'ä' | 'å' | 'ā' | 'ă' | 'ą' => "a",
        'ç' | 'ć' | 'ĉ' | 'ċ' | 'č' => "c",
        'ď' => "d",
        'è' | 'é' | 'ê' | 'ë' | 'ē' | 'ĕ' | 'ė' | 'ę' | 'ě' => "e",
        'ĝ' | 'ğ' | 'ġ' | 'ģ' => "g",
        'ĥ' => "h",
        'ì' | 'í' | 'î' | 'ï' | 'ĩ' | 'ī' | 'ĭ' | 'į' => "i",
        'ĵ' => "j",
        'ķ' => "k",
        'ĺ' | 'ļ' | 'ľ' => "l",
        'ñ' | 'ń' | 'ņ' | 'ň' => "n",
        'ò' | 'ó' | 'ô' | 'õ' | 'ö' | 'ō' | 'ŏ' | 'ő' => "o",
        'ŕ' | 'ŗ' | 'ř' => "r",
        'ś' | 'ŝ' | 'ş' | 'š' => "s",
        'ţ' | 'ť' => "t",
        'ù' | 'ú' | 'û' | 'ü' | 'ũ' | 'ū' | 'ŭ' | 'ů' | 'ű' | 'ų' => "u",
        'ŵ' => "w",
        'ý' | 'ÿ' | 'ŷ' => "y",
        'ź' | 'ż' | 'ž' => "z",
        _ => return None,
    })
}

#[cfg(test)]
mod tests {
    use super::{contains, fold};

    #[test]
    fn accents_and_case_fold_to_the_plain_letter() {
        assert_eq!(fold("Ação"), "acao");
        assert_eq!(fold("REUNIÃO às 10h"), "reuniao as 10h");
        assert_eq!(fold("Çedilha Ñandu Žluť"), "cedilha nandu zlut");
    }

    #[test]
    fn decomposed_text_loses_its_combining_marks() {
        assert_eq!(fold("Ac\u{0327}a\u{0303}o"), "acao");
    }

    #[test]
    fn a_plain_query_finds_accented_text_and_the_other_way_round() {
        assert!(contains("Pauta da Reunião", &fold("reuniao")));
        assert!(contains("acao de graças", &fold("Ação")));
        assert!(!contains("reunir", &fold("reuniao")));
    }

    #[test]
    fn other_scripts_pass_through_untouched() {
        assert_eq!(fold("日本語 Ωmega"), "日本語 ωmega");
    }
}
