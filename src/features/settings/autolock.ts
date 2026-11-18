// 0 = never lock on its own. Mirrors autolock::OPTIONS in autolock.rs; Rust is the one that rejects an out-of-list value.
export const AUTOLOCK_OPTIONS = [0, 5, 15, 30, 60] as const;
