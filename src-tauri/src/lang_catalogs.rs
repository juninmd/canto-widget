use std::collections::HashMap;
use std::sync::LazyLock;

pub const CODES: &[&str] = &[
    "en", "pt-BR", "es", "fr", "it", "ja", "zh", "de", "ru", "tr", "hi", "ar", "he", "fa", "ko", "nl", "pl", "uk",
    "cs", "sk", "ro", "hu", "sv", "da", "nb", "fi", "el", "bg", "hr", "sr", "sl", "lt", "lv", "et", "id", "ms", "vi",
    "th", "bn", "ta", "sw", "ca",
];

const SOURCES: &[(&str, &str)] = &[
    ("es", include_str!("locales/es.json")),
    ("fr", include_str!("locales/fr.json")),
    ("it", include_str!("locales/it.json")),
    ("ja", include_str!("locales/ja.json")),
    ("zh", include_str!("locales/zh.json")),
    ("de", include_str!("locales/de.json")),
    ("ru", include_str!("locales/ru.json")),
    ("tr", include_str!("locales/tr.json")),
    ("hi", include_str!("locales/hi.json")),
    ("ar", include_str!("locales/ar.json")),
    ("he", include_str!("locales/he.json")),
    ("fa", include_str!("locales/fa.json")),
    ("ko", include_str!("locales/ko.json")),
    ("nl", include_str!("locales/nl.json")),
    ("pl", include_str!("locales/pl.json")),
    ("uk", include_str!("locales/uk.json")),
    ("cs", include_str!("locales/cs.json")),
    ("sk", include_str!("locales/sk.json")),
    ("ro", include_str!("locales/ro.json")),
    ("hu", include_str!("locales/hu.json")),
    ("sv", include_str!("locales/sv.json")),
    ("da", include_str!("locales/da.json")),
    ("nb", include_str!("locales/nb.json")),
    ("fi", include_str!("locales/fi.json")),
    ("el", include_str!("locales/el.json")),
    ("bg", include_str!("locales/bg.json")),
    ("hr", include_str!("locales/hr.json")),
    ("sr", include_str!("locales/sr.json")),
    ("sl", include_str!("locales/sl.json")),
    ("lt", include_str!("locales/lt.json")),
    ("lv", include_str!("locales/lv.json")),
    ("et", include_str!("locales/et.json")),
    ("id", include_str!("locales/id.json")),
    ("ms", include_str!("locales/ms.json")),
    ("vi", include_str!("locales/vi.json")),
    ("th", include_str!("locales/th.json")),
    ("bn", include_str!("locales/bn.json")),
    ("ta", include_str!("locales/ta.json")),
    ("sw", include_str!("locales/sw.json")),
    ("ca", include_str!("locales/ca.json")),
];

static MESSAGES: LazyLock<HashMap<&'static str, HashMap<String, String>>> = LazyLock::new(|| {
    SOURCES
        .iter()
        .map(|(code, json)| (*code, serde_json::from_str(json).expect("valid static language catalog")))
        .collect()
});

pub fn translated(code: &str, key: &str) -> Option<&'static str> {
    MESSAGES.get(code)?.get(key).map(String::as_str)
}
