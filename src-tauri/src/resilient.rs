//! Keeps one panic from taking a feature down for the rest of the session: locks that ignore poisoning and
//! background watchers that come back after a crash.
use std::panic::{catch_unwind, AssertUnwindSafe};
use std::sync::{Mutex, MutexGuard};
use std::time::Duration;

/// Long enough that a watcher panicking on every tick does not spin a core.
const RESTART_DELAY: Duration = Duration::from_secs(5);

pub trait LockExt<T> {
    /// A panic while holding the lock poisons it; `lock().unwrap()` then panics in every later caller, turning one
    /// bad tick into a dead feature. The guarded data stays usable: each writer leaves it in a valid state.
    fn lock_safe(&self) -> MutexGuard<'_, T>;
}

impl<T> LockExt<T> for Mutex<T> {
    fn lock_safe(&self) -> MutexGuard<'_, T> {
        self.lock().unwrap_or_else(|e| e.into_inner())
    }
}

/// Runs `body` on its own named thread and starts it again after a panic, so an alert or watcher does not go
/// quiet until the app restarts. A body that returns normally ends the thread.
pub fn supervise<F>(name: &'static str, body: F)
where
    F: Fn() + Send + 'static,
{
    let spawned = std::thread::Builder::new().name(name.into()).spawn(move || run(name, &body, RESTART_DELAY));
    if let Err(e) = spawned {
        eprintln!("{name} nao iniciou: {e}");
    }
}

/// How many times `body` panicked before it returned.
fn run(name: &str, body: &dyn Fn(), delay: Duration) -> usize {
    let mut panics = 0;
    while catch_unwind(AssertUnwindSafe(body)).is_err() {
        panics += 1;
        eprintln!("{name} entrou em panico; reiniciando");
        std::thread::sleep(delay);
    }
    panics
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicUsize, Ordering};
    use std::sync::Arc;

    #[test]
    fn a_poisoned_lock_still_hands_out_its_data() {
        let shared = Arc::new(Mutex::new(vec![1]));
        let clone = shared.clone();
        let _ = std::thread::spawn(move || {
            let mut guard = clone.lock().unwrap();
            guard.push(2);
            panic!("tick quebrado");
        })
        .join();
        assert!(shared.is_poisoned());
        shared.lock_safe().push(3);
        assert_eq!(*shared.lock_safe(), vec![1, 2, 3]);
    }

    #[test]
    fn a_watcher_comes_back_after_panicking() {
        let calls = AtomicUsize::new(0);
        let body = || {
            if calls.fetch_add(1, Ordering::SeqCst) < 2 {
                panic!("falha passageira");
            }
        };
        assert_eq!(run("teste", &body, Duration::ZERO), 2);
        assert_eq!(calls.load(Ordering::SeqCst), 3);
    }
}
