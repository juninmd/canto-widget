//! The sealed disk copy of the repository pages: opening the subtab after a restart paints at once and revalidates
//! with ETags instead of downloading thousands of repositories again. Sealed with the vault key (private repository
//! names), re-sealed on a password change and disposable: an unreadable copy is just dropped.
use crate::repos::cache::Saved;
use crate::store;
use crate::vault::AppState;

pub const AAD: &[u8] = b"canto.repos.v1";

/// Reads the disk copy into RAM once per unlocked session.
pub fn hydrate(state: &AppState) {
    state.forges.repos.pages.hydrate(|| state.sealed::<Saved>(&store::repos_path(&state.dir), AAD).ok().flatten());
}

/// Writes what RAM holds; best effort, because the cache is only a head start.
pub fn save(state: &AppState) {
    let _ = state.save_sealed(&store::repos_path(&state.dir), AAD, &state.forges.repos.pages.snapshot());
}

/// A disconnected account leaves nothing behind on disk either.
pub fn forget(state: &AppState, forge: &str) {
    hydrate(state);
    state.forges.repos.pages.forget(forge);
    let saved = state.forges.repos.pages.snapshot();
    if saved.forges.is_empty() {
        let _ = std::fs::remove_file(store::repos_path(&state.dir));
    } else {
        save(state);
    }
}
