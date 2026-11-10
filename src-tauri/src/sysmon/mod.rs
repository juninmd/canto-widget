//! The Sistema tab: one snapshot of CPU, GPU, memory, disks, network, battery and the heaviest apps, plus the last
//! minute of each curve. Nothing leaves the machine and nothing is written to disk; the probe is created on first use.
#[cfg(desktop)]
pub mod alert;
#[cfg(desktop)]
pub mod hints;
#[cfg(desktop)]
pub mod probe;
#[cfg(desktop)]
pub mod procs;

use std::collections::VecDeque;
use std::sync::Mutex;

use serde::Serialize;
use tauri::State;

use crate::resilient::LockExt;
use crate::sysmon::probe::Probe;

/// The tab asks every 2 s: 30 points draw the last minute.
pub const HISTORY: usize = 30;

#[derive(Debug, Clone, Default, Serialize, PartialEq)]
pub struct Cpu {
    pub usage: f32,
    pub brand: String,
    pub cores: usize,
    pub freq_mhz: u64,
    /// Windows only hands it to elevated tools, so it is often missing there.
    pub temp_c: Option<f32>,
}

#[derive(Debug, Clone, Default, Serialize, PartialEq)]
pub struct Gpu {
    pub name: String,
    pub usage: Option<f32>,
    pub mem_used: Option<u64>,
    pub mem_total: Option<u64>,
}

#[derive(Debug, Clone, Default, Serialize, PartialEq)]
pub struct Memory {
    pub used: u64,
    pub total: u64,
    pub swap_used: u64,
    pub swap_total: u64,
}

#[derive(Debug, Clone, Default, Serialize, PartialEq)]
pub struct Disk {
    pub name: String,
    pub mount: String,
    pub fs: String,
    pub total: u64,
    pub available: u64,
    /// The volume the operating system runs from: the one the overview and the alert watch.
    pub system: bool,
    pub removable: bool,
    pub ssd: Option<bool>,
}

/// Bytes per second since the previous reading, and since boot.
#[derive(Debug, Clone, Default, Serialize, PartialEq)]
pub struct Flow {
    pub down_bps: u64,
    pub up_bps: u64,
    pub down_total: u64,
    pub up_total: u64,
}

#[derive(Debug, Clone, Default, Serialize, PartialEq)]
pub struct Battery {
    pub percent: f32,
    /// "charging", "discharging", "full", "empty", "paused" or "unknown".
    pub state: String,
    pub rate_w: f32,
    pub temp_c: Option<f32>,
    /// Full-charge capacity over design capacity, in %.
    pub health: f32,
    pub cycles: Option<u32>,
    pub voltage_v: f32,
    pub full_wh: f32,
    pub design_wh: f32,
    /// Minutes to empty while discharging, to full while charging.
    pub minutes: Option<u32>,
}

/// One app, its processes added up ("Chrome (61)").
#[derive(Debug, Clone, Default, Serialize, PartialEq)]
pub struct App {
    pub name: String,
    pub count: u32,
    /// Share of the whole machine, 0-100 (not of one core).
    pub cpu: f32,
    pub memory: u64,
}

#[derive(Debug, Clone, Default, Serialize, PartialEq)]
pub struct History {
    pub cpu: Vec<f32>,
    pub memory: Vec<f32>,
    pub cpu_temp: Vec<f32>,
    pub net_down: Vec<u64>,
    pub net_up: Vec<u64>,
    pub disk_read: Vec<u64>,
    pub disk_write: Vec<u64>,
}

#[derive(Debug, Clone, Default, Serialize, PartialEq)]
pub struct Snapshot {
    pub at: i64,
    pub uptime_secs: u64,
    pub cpu: Cpu,
    pub gpus: Vec<Gpu>,
    pub memory: Memory,
    pub disks: Vec<Disk>,
    /// Read is `down`, written is `up`.
    pub disk_io: Flow,
    pub network: Flow,
    /// The busiest interface right now.
    pub interface: String,
    pub battery: Option<Battery>,
    pub apps: Vec<App>,
    pub history: History,
}

#[derive(Default)]
struct Curves {
    cpu: VecDeque<f32>,
    memory: VecDeque<f32>,
    cpu_temp: VecDeque<f32>,
    net_down: VecDeque<u64>,
    net_up: VecDeque<u64>,
    disk_read: VecDeque<u64>,
    disk_write: VecDeque<u64>,
}

fn push<T: Copy>(list: &mut VecDeque<T>, value: T) {
    if list.len() == HISTORY {
        list.pop_front();
    }
    list.push_back(value);
}

impl Curves {
    fn add(&mut self, s: &Snapshot) {
        push(&mut self.cpu, s.cpu.usage);
        push(&mut self.memory, percent(s.memory.used, s.memory.total));
        if let Some(t) = s.cpu.temp_c {
            push(&mut self.cpu_temp, t);
        }
        push(&mut self.net_down, s.network.down_bps);
        push(&mut self.net_up, s.network.up_bps);
        push(&mut self.disk_read, s.disk_io.down_bps);
        push(&mut self.disk_write, s.disk_io.up_bps);
    }

    fn history(&self) -> History {
        History {
            cpu: self.cpu.iter().copied().collect(),
            memory: self.memory.iter().copied().collect(),
            cpu_temp: self.cpu_temp.iter().copied().collect(),
            net_down: self.net_down.iter().copied().collect(),
            net_up: self.net_up.iter().copied().collect(),
            disk_read: self.disk_read.iter().copied().collect(),
            disk_write: self.disk_write.iter().copied().collect(),
        }
    }
}

pub fn percent(part: u64, whole: u64) -> f32 {
    if whole == 0 {
        0.0
    } else {
        (part as f64 / whole as f64 * 100.0) as f32
    }
}

#[derive(Default)]
pub struct SystemMonitor {
    inner: Mutex<Option<(Probe, Curves)>>,
}

impl SystemMonitor {
    /// A fresh reading, added to the curves. The tab and the alert watcher share it, so neither resets the other's rates.
    pub fn read(&self) -> Snapshot {
        let mut guard = self.inner.lock_safe();
        let (probe, curves) = guard.get_or_insert_with(|| (Probe::new(), Curves::default()));
        let mut snap = probe.read();
        curves.add(&snap);
        snap.history = curves.history();
        snap
    }
}

#[tauri::command(async)]
pub fn system_get(monitor: State<'_, SystemMonitor>) -> Snapshot {
    monitor.read()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_curves_keep_only_the_last_minute() {
        let mut curves = Curves::default();
        for i in 0..(HISTORY + 5) {
            let mut s = Snapshot::default();
            s.cpu.usage = i as f32;
            s.memory = Memory { used: 1, total: 4, ..Default::default() };
            curves.add(&s);
        }
        let h = curves.history();
        assert_eq!(h.cpu.len(), HISTORY);
        assert_eq!(h.cpu[0], 5.0);
        assert_eq!(h.memory[0], 25.0);
        assert!(h.cpu_temp.is_empty(), "no sensor, no curve");
    }

    #[test]
    fn a_real_reading_sees_this_machine() {
        let monitor = SystemMonitor::default();
        monitor.read();
        let s = monitor.read();
        assert!(s.memory.total > 0 && s.cpu.cores > 0);
        assert_eq!(s.history.cpu.len(), 2, "both readings went into the curve");
        assert!(s.apps.iter().all(|a| a.count > 0 && a.cpu <= 100.0));
    }

    #[test]
    fn percent_of_nothing_is_zero() {
        assert_eq!(percent(5, 0), 0.0);
        assert_eq!(percent(1, 2), 50.0);
    }
}
