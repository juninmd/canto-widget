use std::path::Path;

/// Cliente OAuth "App para computador" baixado do Google Cloud, fora do git (repo publico).
/// Presente: vira o padrao embutido e a tela de ajustes so pede "entrar com o Google".
/// Ausente (CI, forks): o app continua pedindo Client ID nos ajustes.
const ARQUIVO_OAUTH: &str = "google-oauth.json";

fn main() {
    println!("cargo:rerun-if-changed={ARQUIVO_OAUTH}");
    // Client ID publico do GitHub App (device flow), lido por option_env! em github_auth.rs.
    println!("cargo:rerun-if-env-changed=CANTO_GITHUB_CLIENT_ID");
    if let Some((id, secret)) = ler_cliente(Path::new(ARQUIVO_OAUTH)) {
        println!("cargo:rustc-env=CANTO_GOOGLE_CLIENT_ID={id}");
        println!("cargo:rustc-env=CANTO_GOOGLE_CLIENT_SECRET={secret}");
    }
    tauri_build::build()
}

fn ler_cliente(caminho: &Path) -> Option<(String, String)> {
    let bruto = std::fs::read_to_string(caminho).ok()?;
    let json: serde_json::Value = match serde_json::from_str(&bruto) {
        Ok(v) => v,
        Err(e) => panic!("{ARQUIVO_OAUTH} invalido: {e}"),
    };
    // O JSON do Console vem como {"installed": {...}}; so cliente desktop serve para o loopback.
    let c = json.get("installed").unwrap_or_else(|| panic!("{ARQUIVO_OAUTH}: esperado cliente do tipo 'App para computador' (chave \"installed\")"));
    let campo = |k: &str| c.get(k).and_then(|v| v.as_str()).map(str::to_string);
    let id = campo("client_id").filter(|id| id.ends_with(".apps.googleusercontent.com"))?;
    Some((id, campo("client_secret").unwrap_or_default()))
}
