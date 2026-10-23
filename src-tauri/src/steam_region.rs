//! Which storefront the widget reads: Steam takes the country for the price, the language for the
//! wording, and the currency is what the savings are written in.
//!
//! The review buckets are read back from Steam's own wording, which is only mapped for Portuguese and
//! English (`steam_review::bucket`), so every store outside Brazil reads in English. The savings are
//! read back from the printed price; `steam_store::cents` scales a price printed without decimals (yen,
//! won) so every amount reaches the interface in hundredths.

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Region {
    pub code: &'static str,
    pub country: &'static str,
    /// Steam's own language token, not a UI language.
    pub language: &'static str,
    /// ISO 4217, for `Intl.NumberFormat` on the savings.
    pub currency: &'static str,
}

pub const REGIONS: [Region; 12] = [
    Region { code: "br", country: "BR", language: "portuguese", currency: "BRL" },
    Region { code: "us", country: "US", language: "english", currency: "USD" },
    Region { code: "eu", country: "DE", language: "english", currency: "EUR" },
    Region { code: "gb", country: "GB", language: "english", currency: "GBP" },
    Region { code: "jp", country: "JP", language: "english", currency: "JPY" },
    Region { code: "cn", country: "CN", language: "english", currency: "CNY" },
    Region { code: "au", country: "AU", language: "english", currency: "AUD" },
    Region { code: "ca", country: "CA", language: "english", currency: "CAD" },
    Region { code: "ch", country: "CH", language: "english", currency: "CHF" },
    Region { code: "kr", country: "KR", language: "english", currency: "KRW" },
    Region { code: "in", country: "IN", language: "english", currency: "INR" },
    Region { code: "mx", country: "MX", language: "english", currency: "MXN" },
];

pub fn parse(code: &str) -> Option<Region> {
    REGIONS.iter().copied().find(|region| region.code == code)
}

/// The region a stored choice means: an unknown code (an older install, or a typo) falls back to the
/// language, so the store is never left without a country.
pub fn effective(stored: &str, language: &str) -> Region {
    parse(stored).unwrap_or_else(|| for_language(language))
}

/// Portuguese gets the Brazilian store; every other language starts on the American one, one picker
/// away in the tab.
pub fn for_language(language: &str) -> Region {
    if language == "pt-BR" {
        REGIONS[0]
    } else {
        REGIONS[1]
    }
}

#[cfg(test)]
#[path = "steam_region_tests.rs"]
mod tests;
