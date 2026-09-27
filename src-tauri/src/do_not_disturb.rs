//! Do not disturb: silences OS notifications and alert pop-ups until a given time or until turned off.
//! Rust owns the state because every alert rings from a Rust thread; persisted next to the vault (not
//! secret) so a restart in the middle of a focus block doesn't start ringing again.
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use std::time::Duration;

use serde::{Deserialize, Serialize};
use tauri::menu::MenuItem;
use tauri::{AppHandle, Emitter, Manager, State};

use crate::error::{AppError, Result};
use crate::lang::tr;
use crate::model::now_ms;

const FILE: &str = "nao_perturbe.json";
pub const EVENT: &str = "canto://dnd";
pub const TRAY_ITEM_ID: &str = "dnd";
const TRAY_MS: i64 = 60 * 60 * 1000;
/// "Until tomorrow" chosen late at night still fits; anything longer is a bad value, not a choice.
pub const MAX_AHEAD_MS: i64 = 48 * 60 * 60 * 1000;
const TICK: Duration = Duration::from_secs(15);

/// `until_ms: None` means until turned off.
#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
pub struct Quiet {
    pub until_ms: Option<i64>,
}

impl Quiet {
    pub fn active_at(&self, now_ms: i64) -> bool {
        self.until_ms.is_none_or(|until| now_ms < until)
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DndState {
    pub active: bool,
    pub until_ms: Option<i64>,
}

const OFF: DndState = DndState { active: false, until_ms: None };

pub struct DoNotDisturb {
    path: PathBuf,
    quiet: Mutex<Option<Quiet>>,
}

impl DoNotDisturb {
    pub fn load(dir: &Path) -> Self {
        let path = dir.join(FILE);
        let quiet = crate::store::read_json::<Quiet>(&path).ok().flatten();
        Self { path, quiet: Mutex::new(quiet) }
    }

    /// An expired period is dropped (file included) the first time anyone looks.
    pub fn state_at(&self, now_ms: i64) -> DndState {
        let mut quiet = self.quiet.lock().unwrap();
        match *quiet {
            Some(q) if q.active_at(now_ms) => DndState { active: true, until_ms: q.until_ms },
            Some(_) => {
                *quiet = None;
                let _ = remove(&self.path);
                OFF
            }
            None => OFF,
        }
    }

    pub fn set(&self, quiet: Option<Quiet>) -> Result<()> {
        match quiet {
            Some(q) => crate::store::write_json_atomic(&self.path, &q)?,
            None => remove(&self.path)?,
        }
        *self.quiet.lock().unwrap() = quiet;
        Ok(())
    }
}

fn remove(path: &Path) -> Result<()> {
    match std::fs::remove_file(path) {
        Err(e) if e.kind() != std::io::ErrorKind::NotFound => Err(e.into()),
        _ => Ok(()),
    }
}

/// The end comes from the UI ("until tomorrow" needs the local timezone, which Rust can't trust).
pub fn validate(until_ms: Option<i64>, now_ms: i64) -> Result<Quiet> {
    if until_ms.is_some_and(|until| until <= now_ms || until > now_ms + MAX_AHEAD_MS) {
        return Err(AppError::Config("horário de fim do não perturbe inválido".into()));
    }
    Ok(Quiet { until_ms })
}

pub fn silenced(dnd: Option<&DoNotDisturb>, now_ms: i64) -> bool {
    dnd.is_some_and(|d| d.state_at(now_ms).active)
}

/// The gate every OS notification and alert pop-up goes through.
pub fn quiet(app: &AppHandle) -> bool {
    silenced(app.try_state::<DoNotDisturb>().as_deref(), now_ms())
}

pub struct DndMenuItem(pub MenuItem<tauri::Wry>);

pub fn tray_label(state: DndState) -> &'static str {
    if state.active {
        tr("Desligar não perturbe", "Turn off do not disturb")
    } else {
        tr("Não perturbe por 1 h", "Do not disturb for 1 h")
    }
}

pub fn current(app: &AppHandle) -> DndState {
    app.try_state::<DoNotDisturb>().map_or(OFF, |d| d.state_at(now_ms()))
}

pub fn refresh_tray(app: &AppHandle) {
    if let Some(item) = app.try_state::<DndMenuItem>() {
        let _ = item.0.set_text(tray_label(current(app)));
    }
}

fn changed(app: &AppHandle, state: DndState) {
    refresh_tray(app);
    let _ = app.emit(EVENT, state);
}

fn apply(app: &AppHandle, quiet: Option<Quiet>) -> Result<DndState> {
    app.state::<DoNotDisturb>().set(quiet)?;
    let state = current(app);
    changed(app, state);
    Ok(state)
}

pub fn tray_toggle(app: &AppHandle) {
    let next = (!current(app).active).then(|| Quiet { until_ms: Some(now_ms() + TRAY_MS) });
    if let Err(e) = apply(app, next) {
        eprintln!("nao perturbe pelo tray falhou: {e}");
    }
}

#[tauri::command(async)]
pub fn dnd_get(dnd: State<'_, DoNotDisturb>) -> DndState {
    dnd.state_at(now_ms())
}

#[tauri::command(async)]
pub fn dnd_set(app: AppHandle, until_ms: Option<i64>) -> Result<DndState> {
    apply(&app, Some(validate(until_ms, now_ms())?))
}

#[tauri::command(async)]
pub fn dnd_clear(app: AppHandle) -> Result<DndState> {
    apply(&app, None)
}

/// Expires on its own: the tray label and the top-bar indicator follow without anyone polling.
pub fn watch(app: AppHandle) {
    std::thread::spawn(move || {
        let mut last = current(&app);
        loop {
            std::thread::sleep(TICK);
            let now = current(&app);
            if now != last {
                changed(&app, now);
                last = now;
            }
        }
    });
}

#[cfg(test)]
#[path = "do_not_disturb_tests.rs"]
mod tests;
