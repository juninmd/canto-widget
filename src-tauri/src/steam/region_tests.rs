use super::*;

#[test]
fn every_region_is_a_distinct_code_with_a_country_language_and_currency() {
    for region in REGIONS {
        assert_eq!(parse(region.code), Some(region), "{}", region.code);
        assert_eq!(region.country.len(), 2, "{}", region.code);
        assert_eq!(region.currency.len(), 3, "{}", region.code);
        assert!(["english", "portuguese"].contains(&region.language), "{}", region.code);
    }
    for (i, a) in REGIONS.iter().enumerate() {
        for b in &REGIONS[i + 1..] {
            assert_ne!(a.code, b.code);
            assert_ne!((a.country, a.language), (b.country, b.language), "two regions reading the same store");
        }
    }
    assert_eq!(parse("xx"), None);
    assert_eq!(parse(""), None);
}

#[test]
fn the_portuguese_interface_gets_brazil_and_the_rest_starts_on_the_american_store() {
    assert_eq!(for_language("pt-BR"), parse("br").unwrap());
    assert_eq!(for_language("en"), parse("us").unwrap());
    assert_eq!(for_language("es"), parse("us").unwrap());
}

#[test]
fn a_stored_choice_wins_over_the_language_and_an_unknown_one_falls_back_to_it() {
    assert_eq!(effective("gb", "pt-BR"), parse("gb").unwrap());
    assert_eq!(effective("", "pt-BR"), parse("br").unwrap());
    assert_eq!(effective("", "en"), parse("us").unwrap());
    assert_eq!(effective("jp", "en"), parse("jp").unwrap(), "the yen store is one of the choices now");
    assert_eq!(effective("japao", "pt-BR"), parse("br").unwrap(), "a code we dropped still opens a store");
}
