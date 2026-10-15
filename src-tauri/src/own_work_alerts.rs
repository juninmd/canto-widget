//! One background reader for everything that happens to the user's own work on GitHub and GitLab, besides the
//! mentions: verdicts, merge state, comments, assignments, replies, review requests and broken pipelines. Polls the
//! same cached lists the tabs use, only with the vault open; the first reading of each only seeds.
use std::time::{Duration, Instant};

use tauri::{AppHandle, Manager};

use crate::my_pr_alerts::MyPrAlerts;
use crate::own_work_github as github;
use crate::own_work_gitlab as gitlab;
use crate::vault::AppState;

const POLL: Duration = Duration::from_secs(30);
const INTERVAL: Duration = Duration::from_secs(5 * 60);

pub fn watch(app: AppHandle) {
    std::thread::spawn(move || {
        let (mut gh, mut gl) = (github::Seen::default(), gitlab::Seen::default());
        let mut last: Option<Instant> = None;
        loop {
            std::thread::sleep(POLL);
            let state = app.state::<AppState>();
            // Locked: keep what was seen, so what happened meanwhile still rings after the unlock.
            if !state.is_unlocked() || last.is_some_and(|t| t.elapsed() < INTERVAL) {
                continue;
            }
            last = Some(Instant::now());
            let cfg = app.state::<MyPrAlerts>().get();
            github::run(&app, &state, &cfg, &mut gh);
            gitlab::run(&app, &state, &cfg, &mut gl);
        }
    });
}
