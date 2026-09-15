//! Rede sincrona (`reqwest::blocking`) fora das threads do runtime async do Tauri.
use crate::error::{AppError, Result};

/// `reqwest::blocking` entra em panico ao ser descartado numa thread do tokio, e comando
/// `async` roda justamente ali: o login do Google morria logo depois do consentimento.
pub async fn rodar<T: Send + 'static>(f: impl FnOnce() -> Result<T> + Send + 'static) -> Result<T> {
    tauri::async_runtime::spawn_blocking(f)
        .await
        .map_err(|e| AppError::Io(format!("tarefa interrompida: {e}")))?
}

#[cfg(test)]
mod tests {
    #[test]
    fn cliente_http_bloqueante_nao_derruba_o_comando_async() {
        let tarefa = tauri::async_runtime::spawn(async {
            super::rodar(|| {
                drop(reqwest::blocking::Client::new());
                Ok(7)
            })
            .await
        });
        let volta = tauri::async_runtime::block_on(tarefa).expect("a thread do runtime entrou em panico");
        assert_eq!(volta.unwrap(), 7);
    }
}
