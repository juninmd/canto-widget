use serde::{Serialize, Serializer};

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("senha incorreta ou cofre corrompido")]
    WrongPassword,
    #[error("cofre trancado")]
    Locked,
    #[error("cofre ja existe")]
    AlreadyExists,
    #[error("cofre ainda nao foi criado")]
    NotFound,
    #[error("erro de criptografia: {0}")]
    Crypto(String),
    #[error("erro de arquivo: {0}")]
    Io(String),
    #[error("formato invalido: {0}")]
    Format(String),
    #[error("google: {0}")]
    Drive(String),
    #[error("github: {0}")]
    Github(String),
    #[error("gitlab: {0}")]
    Gitlab(String),
    /// The forge's quota ran out; `reset_at` (ms) tells the cache when to try again.
    #[error("{message}")]
    RateLimited { message: String, reset_at: i64 },
    /// Shown after "Não foi possível verificar:" or "A atualização não foi instalada:", so no prefix of its own.
    #[error("{0}")]
    Update(String),
    #[error("{0}")]
    Config(String),
}

pub type Result<T> = std::result::Result<T, AppError>;

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
