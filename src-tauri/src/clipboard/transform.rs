//! Rewrites a clipboard history item before it goes back to the clipboard. Pure string work, no pattern matching:
//! the UI offers only the modes that make sense for the item's kind.
use serde::Deserialize;

use crate::error::{AppError, Result};

#[derive(Debug, Clone, Copy, PartialEq, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Mode {
    JsonPretty,
    JsonCompact,
    OneLine,
    Upper,
    Lower,
}

pub fn apply(text: &str, mode: Mode) -> Result<String> {
    match mode {
        Mode::JsonPretty => reformat(text, serde_json::to_string_pretty),
        Mode::JsonCompact => reformat(text, serde_json::to_string),
        Mode::OneLine => Ok(text.split_whitespace().collect::<Vec<_>>().join(" ")),
        Mode::Upper => Ok(text.to_uppercase()),
        Mode::Lower => Ok(text.to_lowercase()),
    }
}

fn reformat(text: &str, write: fn(&serde_json::Value) -> serde_json::Result<String>) -> Result<String> {
    let value: serde_json::Value =
        serde_json::from_str(text.trim()).map_err(|_| AppError::Config("o item não é um JSON válido".into()))?;
    write(&value).map_err(|e| AppError::Io(e.to_string()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn json_goes_both_ways_and_keeps_key_order() {
        let compact = r#"{"b":1,"a":[true,null]}"#;
        let pretty = apply(compact, Mode::JsonPretty).unwrap();
        assert_eq!(pretty, "{\n  \"b\": 1,\n  \"a\": [\n    true,\n    null\n  ]\n}");
        assert_eq!(apply(&format!("  {pretty}\n"), Mode::JsonCompact).unwrap(), compact);
    }

    #[test]
    fn invalid_json_is_refused_with_a_message_for_the_user() {
        let err = apply("{oops", Mode::JsonPretty).unwrap_err().to_string();
        assert!(err.contains("não é um JSON válido"), "{err}");
    }

    #[test]
    fn one_line_collapses_every_run_of_whitespace() {
        assert_eq!(apply("  olá \n\n  mundo\t\tcruel  ", Mode::OneLine).unwrap(), "olá mundo cruel");
    }

    #[test]
    fn case_modes_handle_accents() {
        assert_eq!(apply("Ação rápida", Mode::Upper).unwrap(), "AÇÃO RÁPIDA");
        assert_eq!(apply("AÇÃO Rápida", Mode::Lower).unwrap(), "ação rápida");
    }
}
