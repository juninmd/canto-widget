use std::fmt;

use serde::{Serialize, Serializer};

use crate::lang;

#[derive(Debug)]
pub enum AppError {
    WrongPassword,
    Locked,
    AlreadyExists,
    NotFound,
    Crypto(String),
    Io(String),
    Format(String),
    Drive(String),
    Github(String),
    Gitlab(String),
    Steam(String),
    /// The forge's quota ran out; `reset_at` (ms) tells the cache when to try again.
    RateLimited {
        message: String,
        reset_at: i64,
    },
    /// Shown after "Não foi possível verificar:" or "A atualização não foi instalada:", so no prefix of its own.
    Update(String),
    Config(String),
}

pub type Result<T> = std::result::Result<T, AppError>;

impl AppError {
    /// The text for `code`. Split out of `Display` so a test can assert two languages without touching the
    /// process-wide one. A language with no translation of the English text falls back to it, exactly like the
    /// tray labels and the alerts (`lang::tr`).
    pub fn text(&self, code: &str) -> String {
        match self {
            AppError::WrongPassword => {
                lang::translate(code, "senha incorreta ou cofre corrompido", "wrong password or corrupted vault")
                    .to_string()
            }
            AppError::Locked => lang::translate(code, "cofre trancado", "vault locked").to_string(),
            AppError::AlreadyExists => lang::translate(code, "cofre já existe", "vault already exists").to_string(),
            AppError::NotFound => {
                lang::translate(code, "cofre ainda não foi criado", "vault has not been created yet").to_string()
            }
            AppError::Crypto(inner) => {
                format!("{}: {inner}", lang::translate(code, "erro de criptografia", "encryption error"))
            }
            AppError::Io(inner) => format!("{}: {inner}", lang::translate(code, "erro de arquivo", "file error")),
            AppError::Format(inner) => {
                format!("{}: {inner}", lang::translate(code, "formato inválido", "invalid format"))
            }
            // Brands and the forge's own diagnostics stay as they are: nothing translates them.
            AppError::Drive(inner) => format!("google: {inner}"),
            AppError::Github(inner) => format!("github: {inner}"),
            AppError::Gitlab(inner) => format!("gitlab: {inner}"),
            AppError::Steam(inner) => format!("steam: {inner}"),
            AppError::RateLimited { message, .. } => message.clone(),
            AppError::Update(inner) | AppError::Config(inner) => inner.clone(),
        }
    }
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.text(lang::current()))
    }
}

impl std::error::Error for AppError {}

impl From<std::io::Error> for AppError {
    fn from(e: std::io::Error) -> Self {
        AppError::Io(e.to_string())
    }
}

impl From<serde_json::Error> for AppError {
    fn from(e: serde_json::Error) -> Self {
        AppError::Format(e.to_string())
    }
}

impl Serialize for AppError {
    fn serialize<S: Serializer>(&self, s: S) -> std::result::Result<S::Ok, S::Error> {
        s.serialize_str(&self.to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn user_facing_messages_are_accented_pt_br() {
        assert_eq!(AppError::AlreadyExists.text("pt-BR"), "cofre já existe");
        assert_eq!(AppError::NotFound.text("pt-BR"), "cofre ainda não foi criado");
        assert_eq!(AppError::Format("x".into()).text("pt-BR"), "formato inválido: x");
        assert_eq!(AppError::Locked.text("pt-BR"), "cofre trancado");
    }

    #[test]
    fn english_serves_english_and_every_language_without_a_translation() {
        assert_eq!(AppError::AlreadyExists.text("en"), "vault already exists");
        assert_eq!(AppError::Locked.text("en"), "vault locked");
        assert_eq!(AppError::Crypto("boom".into()).text("en"), "encryption error: boom");
        assert_eq!(AppError::WrongPassword.text("en"), "wrong password or corrupted vault");
        // No catalog translates these strings yet, so the fallback is the English text, as for the tray labels.
        assert_eq!(AppError::AlreadyExists.text("ja"), "vault already exists");
    }

    #[test]
    fn the_language_in_force_decides_what_display_returns() {
        // Without `language_set` the process keeps the pt-BR default, which the vault errors assume.
        assert_eq!(AppError::Locked.to_string(), "cofre trancado");
    }

    #[test]
    fn messages_that_come_from_elsewhere_are_not_rewritten() {
        assert_eq!(AppError::Config("algo".into()).text("en"), "algo");
        assert_eq!(AppError::Io("disco cheio".into()).text("pt-BR"), "erro de arquivo: disco cheio");
        assert_eq!(AppError::Github("403".into()).text("en"), "github: 403");
        assert_eq!(AppError::RateLimited { message: "espere".into(), reset_at: 0 }.text("en"), "espere");
    }
}
