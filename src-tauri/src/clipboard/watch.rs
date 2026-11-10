//! What the clipboard watcher remembers between ticks, so it decrypts the history only for really new text.
use sha2::{Digest, Sha256};

#[derive(Default)]
pub struct ClipWatch {
    seq: Option<u32>,
    digest: [u8; 32],
}

impl ClipWatch {
    /// Text worth saving, if any. The OS change counter is recorded before reading, so an image (which
    /// fails `read`) costs one read per copy instead of one per tick while it stays on the clipboard.
    pub fn next(
        &mut self,
        seq: Option<u32>,
        concealed: impl Fn() -> bool,
        read: impl FnOnce() -> Option<String>,
    ) -> Option<String> {
        if seq.is_some() && seq == self.seq {
            return None;
        }
        self.seq = seq;
        if concealed() {
            return None;
        }
        let text = read()?;
        let digest: [u8; 32] = Sha256::digest(text.as_bytes()).into();
        if digest == self.digest || concealed() {
            return None;
        }
        self.digest = digest;
        Some(text)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::cell::Cell;

    #[test]
    fn a_non_text_copy_is_read_once_not_on_every_tick() {
        let mut w = ClipWatch::default();
        let reads = Cell::new(0);
        for _ in 0..5 {
            assert!(w
                .next(
                    Some(6),
                    || false,
                    || {
                        reads.set(reads.get() + 1);
                        None
                    }
                )
                .is_none());
        }
        assert_eq!(reads.get(), 1);
    }

    #[test]
    fn new_text_is_returned_once_and_a_repeat_is_skipped() {
        let mut w = ClipWatch::default();
        assert_eq!(w.next(Some(1), || false, || Some("texto fictício".into())).as_deref(), Some("texto fictício"));
        assert!(w.next(Some(1), || false, || Some("texto fictício".into())).is_none());
        assert!(w.next(Some(2), || false, || Some("texto fictício".into())).is_none());
        assert_eq!(w.next(Some(3), || false, || Some("outro".into())).as_deref(), Some("outro"));
    }

    #[test]
    fn concealed_content_is_never_read() {
        let mut w = ClipWatch::default();
        assert!(w.next(Some(1), || true, || panic!("a secret must not be read")).is_none());
    }

    #[test]
    fn without_a_counter_every_tick_reads_but_repeats_stay_out() {
        let mut w = ClipWatch::default();
        assert!(w.next(None, || false, || Some("a".into())).is_some());
        assert!(w.next(None, || false, || Some("a".into())).is_none());
    }
}
