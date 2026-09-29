use crate::cmd_drive::DriveConfig;
use crate::drive::{self, DriveTokens};
use crate::error::{AppError, Result};
use crate::vault::AppState;

/// A fresh Google access token; a refresh is persisted so the next call doesn't repeat it.
pub fn fresh(state: &AppState) -> Result<String> {
    let cfg = state.drive_config()?;
    let mut tokens = cfg.tokens.ok_or_else(|| AppError::Config("entre com o Google para ver a agenda".into()))?;
    let before = tokens.access_token.clone();
    let token = drive::fresh_access_token(&mut tokens, &cfg.client_id, &cfg.client_secret)?;
    if tokens.access_token != before {
        store_refreshed(state, tokens)?;
    }
    Ok(token)
}

/// Re-reads under the lock: the refresh ran on the network while a disconnect or reconnect may have landed.
pub(crate) fn store_refreshed(state: &AppState, fresh: DriveTokens) -> Result<()> {
    let _serial = state.drive_lock.lock().unwrap();
    let mut current = state.drive_config()?;
    if adopt_refresh(&mut current, fresh) {
        state.save_drive_config(&current)?;
    }
    Ok(())
}

/// Only the same grant (same refresh token) may take the new access token.
fn adopt_refresh(current: &mut DriveConfig, fresh: DriveTokens) -> bool {
    match current.tokens.as_mut() {
        Some(t) if t.refresh_token == fresh.refresh_token => {
            *t = fresh;
            true
        }
        _ => false,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn tokens(refresh: &str, access: &str) -> DriveTokens {
        DriveTokens { refresh_token: refresh.into(), access_token: access.into(), expires_at: 1 }
    }

    #[test]
    fn refresh_after_disconnect_does_not_resurrect_the_account() {
        let dir = std::env::temp_dir().join(format!("canto-gtoken-{}-{}", std::process::id(), crate::model::now_ms()));
        let st = AppState::new(dir);
        st.create("senha-mestra").unwrap();
        st.save_drive_config(&DriveConfig { tokens: Some(tokens("r1", "velho")), ..Default::default() }).unwrap();
        st.save_drive_config(&DriveConfig::default()).unwrap();
        store_refreshed(&st, tokens("r1", "novo")).unwrap();
        assert!(st.drive_config().unwrap().tokens.is_none(), "refresh brought the disconnected account back");
        let _ = std::fs::remove_dir_all(&st.dir);
    }

    #[test]
    fn only_the_same_grant_takes_the_new_access_token() {
        let mut cfg = DriveConfig { tokens: Some(tokens("r2", "outra")), ..Default::default() };
        assert!(!adopt_refresh(&mut cfg, tokens("r1", "novo")));
        assert_eq!(cfg.tokens.as_ref().unwrap().access_token, "outra");
        assert!(adopt_refresh(&mut cfg, tokens("r2", "novo")));
        assert_eq!(cfg.tokens.unwrap().access_token, "novo");
    }
}
