//! In-memory pause after repeated wrong master passwords. It slows someone sitting at the machine (or a script
//! talking to the webview); it does nothing against an offline attack on a copied vault, which only the KDF cost resists.

/// Failures in a row that cost nothing, so a typo or two never locks the owner out.
const FREE_TRIES: u32 = 3;
const MAX_WAIT_SECS: i64 = 30;

/// 0 s for the first three misses, then 1, 2, 4, 8 ... capped at 30 s.
pub fn wait_secs(failures: u32) -> i64 {
    if failures <= FREE_TRIES {
        return 0;
    }
    (1i64 << (failures - FREE_TRIES - 1).min(5)).min(MAX_WAIT_SECS)
}

#[derive(Default)]
pub struct Throttle {
    failures: u32,
    blocked_until: i64,
}

impl Throttle {
    /// Seconds left to wait at `now` (ms), 0 when an attempt is allowed. Rounded up so "wait 1 s" never means 0.5.
    pub fn remaining_secs(&self, now: i64) -> i64 {
        ((self.blocked_until - now).max(0) + 999) / 1000
    }

    pub fn failed(&mut self, now: i64) {
        self.failures = self.failures.saturating_add(1);
        self.blocked_until = now + wait_secs(self.failures) * 1000;
    }

    pub fn succeeded(&mut self) {
        *self = Self::default();
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_wait_grows_after_three_free_misses_and_is_capped() {
        let waits: Vec<i64> = (1..=10).map(wait_secs).collect();
        assert_eq!(waits, [0, 0, 0, 1, 2, 4, 8, 16, 30, 30]);
        assert_eq!(wait_secs(u32::MAX), 30);
    }

    #[test]
    fn three_misses_do_not_block_but_the_fourth_does_until_the_clock_passes() {
        let mut t = Throttle::default();
        for _ in 0..3 {
            t.failed(1_000);
            assert_eq!(t.remaining_secs(1_000), 0);
        }
        t.failed(1_000);
        assert_eq!(t.remaining_secs(1_000), 1);
        assert_eq!(t.remaining_secs(1_500), 1);
        assert_eq!(t.remaining_secs(2_000), 0);
    }

    #[test]
    fn success_clears_the_count() {
        let mut t = Throttle::default();
        for _ in 0..5 {
            t.failed(0);
        }
        t.succeeded();
        t.failed(10);
        assert_eq!(t.remaining_secs(10), 0);
    }
}
