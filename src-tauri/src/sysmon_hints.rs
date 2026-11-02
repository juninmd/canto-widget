//! When the machine itself deserves a heads-up: memory or disk almost full, a hot or pegged CPU, a battery running
//! out or worn. Pure, so every threshold is tested; `sysmon_alert.rs` decides when each hint rings.
use crate::lang::tr;
use crate::sysmon::{percent, Snapshot};

/// Every kind the Sistema tab can switch on, in the order the switches are shown.
pub const KINDS: [&str; 6] = ["memory", "disk", "cpu", "cpu_temp", "battery_low", "battery_health"];

const MEMORY: f32 = 90.0;
const MEMORY_SEVERE: f32 = 95.0;
/// Free space left on the system volume, in %.
const DISK_FREE: f32 = 10.0;
const DISK_FREE_SEVERE: f32 = 5.0;
const CPU_BUSY: f32 = 90.0;
/// Minutes of readings the CPU has to stay busy for (the watcher reads once a minute).
pub const CPU_MINUTES: usize = 5;
const CPU_HOT: f32 = 85.0;
const CPU_HOT_SEVERE: f32 = 95.0;
const BATTERY_LOW: f32 = 20.0;
const BATTERY_LOW_SEVERE: f32 = 10.0;
/// Below this the battery holds less than 80% of what it did new, the usual "replace soon" mark.
const BATTERY_WORN: f32 = 80.0;

#[derive(Debug, Clone, PartialEq)]
pub struct Hint {
    pub kind: &'static str,
    pub severe: bool,
    pub title: String,
    pub body: String,
    /// The one number that sums it up ("93%", "88 °C"), shown big on the pop-up.
    pub value: String,
}

fn fill(text: &str, pairs: &[(&str, String)]) -> String {
    pairs.iter().fold(text.to_string(), |acc, (k, v)| acc.replace(k, v))
}

/// Binary units with one decimal, as the tab shows them.
pub fn size(bytes: u64) -> String {
    const UNITS: [&str; 5] = ["B", "KB", "MB", "GB", "TB"];
    let mut value = bytes as f64;
    let mut unit = 0;
    while value >= 1024.0 && unit < UNITS.len() - 1 {
        value /= 1024.0;
        unit += 1;
    }
    if unit == 0 {
        format!("{bytes} B")
    } else {
        format!("{value:.1} {}", UNITS[unit])
    }
}

fn hint(kind: &'static str, severe: bool, title: &str, body: String, value: String) -> Hint {
    Hint { kind, severe, title: title.to_string(), body, value }
}

fn top_by_memory(s: &Snapshot) -> Option<&str> {
    s.apps.iter().max_by_key(|a| a.memory).map(|a| a.name.as_str())
}

fn top_by_cpu(s: &Snapshot) -> Option<&str> {
    s.apps.iter().max_by(|a, b| a.cpu.total_cmp(&b.cpu)).map(|a| a.name.as_str())
}

fn memory(s: &Snapshot) -> Option<Hint> {
    let used = percent(s.memory.used, s.memory.total);
    if used < MEMORY {
        return None;
    }
    let mut body = fill(
        tr("{used} de {total} em uso.", "{used} of {total} in use."),
        &[("{used}", size(s.memory.used)), ("{total}", size(s.memory.total))],
    );
    if let Some(app) = top_by_memory(s) {
        body = format!(
            "{body} {}",
            fill(tr("{app} é o que mais ocupa.", "{app} takes the most."), &[("{app}", app.into())])
        );
    }
    Some(hint(
        "memory",
        used >= MEMORY_SEVERE,
        tr("Memória quase cheia", "Memory almost full"),
        body,
        format!("{used:.0}%"),
    ))
}

fn disk(s: &Snapshot) -> Option<Hint> {
    let d = s.disks.iter().find(|d| d.system)?;
    let free = percent(d.available, d.total);
    if d.total == 0 || free > DISK_FREE {
        return None;
    }
    let body = fill(
        tr("Restam {free} livres em {mount}.", "Only {free} left on {mount}."),
        &[("{free}", size(d.available)), ("{mount}", drive(&d.mount))],
    );
    let used = 100.0 - free;
    Some(hint(
        "disk",
        free <= DISK_FREE_SEVERE,
        tr("Disco quase cheio", "Disk almost full"),
        body,
        format!("{used:.0}%"),
    ))
}

/// `C:` rather than `C:\`: the pop-up reads the body as Markdown, where `\.` is an escaped period.
fn drive(mount: &str) -> String {
    match mount.strip_suffix('\\') {
        Some(drive) if !drive.is_empty() => drive.to_string(),
        _ => mount.to_string(),
    }
}

/// `window` is the last readings, one a minute: all of them busy means minutes of a pegged CPU, not a spike.
fn cpu(s: &Snapshot, window: &[f32]) -> Option<Hint> {
    if window.len() < CPU_MINUTES || window.iter().rev().take(CPU_MINUTES).any(|u| *u < CPU_BUSY) {
        return None;
    }
    let mut body = fill(
        tr("Acima de {p}% há {m} minutos.", "Above {p}% for {m} minutes."),
        &[("{p}", format!("{CPU_BUSY:.0}")), ("{m}", CPU_MINUTES.to_string())],
    );
    if let Some(app) = top_by_cpu(s) {
        body =
            format!("{body} {}", fill(tr("{app} é o que mais usa.", "{app} uses the most."), &[("{app}", app.into())]));
    }
    Some(hint("cpu", false, tr("CPU no limite", "CPU maxed out"), body, format!("{:.0}%", s.cpu.usage)))
}

fn cpu_temp(s: &Snapshot) -> Option<Hint> {
    let t = s.cpu.temp_c.filter(|t| *t >= CPU_HOT)?;
    let body =
        tr("Verifique a ventilação e o que está pesando na CPU.", "Check the airflow and what is loading the CPU.");
    Some(hint(
        "cpu_temp",
        t >= CPU_HOT_SEVERE,
        tr("CPU muito quente", "CPU running hot"),
        body.into(),
        format!("{t:.0} °C"),
    ))
}

fn battery_low(s: &Snapshot) -> Option<Hint> {
    let b = s.battery.as_ref().filter(|b| b.state == "discharging" && b.percent <= BATTERY_LOW)?;
    let body = match b.minutes {
        Some(m) => fill(
            tr("Cerca de {m} min restantes. Ligue o carregador.", "About {m} min left. Plug in the charger."),
            &[("{m}", m.to_string())],
        ),
        None => tr("Ligue o carregador.", "Plug in the charger.").to_string(),
    };
    let severe = b.percent <= BATTERY_LOW_SEVERE;
    Some(hint("battery_low", severe, tr("Bateria fraca", "Battery low"), body, format!("{:.0}%", b.percent)))
}

fn battery_health(s: &Snapshot) -> Option<Hint> {
    let b = s.battery.as_ref().filter(|b| b.design_wh > 0.0 && b.health > 0.0 && b.health < BATTERY_WORN)?;
    let body = fill(
        tr(
            "Ela guarda {full} de {design} Wh, {h}% do que guardava nova.",
            "It holds {full} of {design} Wh, {h}% of what it held new.",
        ),
        &[
            ("{full}", format!("{:.0}", b.full_wh)),
            ("{design}", format!("{:.0}", b.design_wh)),
            ("{h}", format!("{:.0}", b.health)),
        ],
    );
    Some(hint("battery_health", false, tr("Bateria desgastada", "Battery worn"), body, format!("{:.0}%", b.health)))
}

pub fn hints(s: &Snapshot, cpu_window: &[f32]) -> Vec<Hint> {
    [memory(s), disk(s), cpu(s, cpu_window), cpu_temp(s), battery_low(s), battery_health(s)]
        .into_iter()
        .flatten()
        .collect()
}

#[cfg(test)]
#[path = "sysmon_hints_tests.rs"]
mod tests;
