//! Reads the machine through `sysinfo` and `starship-battery`. Rates are bytes since the previous reading divided
//! by the time between them, so the tab's 2 s poll and the alert watcher's minute can share one probe.
use std::time::Instant;

use sysinfo::{
    Components, DiskKind, Disks, Gpus, Networks, ProcessRefreshKind, ProcessesToUpdate, RefreshKind, System, ThreadKind,
};

use crate::sysmon::{Battery, Cpu, Disk, Gpu, Memory, Snapshot};
use crate::sysmon_procs::{group, Sample};

pub struct Probe {
    sys: Option<System>,
    disks: Option<Disks>,
    nets: Option<Networks>,
    comps: Option<Components>,
    gpus: Option<GpuProbe>,
    last: Instant,
}

/// Linux keeps the NVIDIA library handle as a raw pointer, which makes `Gpus` `!Send`.
struct GpuProbe(Gpus);

// SAFETY: the handle is only touched through `&mut self` behind `SystemMonitor`'s mutex, one thread at a time, and
// NVML itself is thread-safe.
unsafe impl Send for GpuProbe {}

fn procs_kind() -> ProcessRefreshKind {
    ProcessRefreshKind::nothing().with_cpu().with_memory()
}

impl Default for Probe {
    fn default() -> Self {
        Self::new()
    }
}

impl Probe {
    /// One refresh up front: CPU usage is a difference between two readings, so the tab's first one already means something.
    pub fn new() -> Self {
        let sys = System::new_with_specifics(RefreshKind::nothing()).ok().map(|mut s| {
            s.refresh_cpu_all();
            s.refresh_memory();
            s.refresh_processes_specifics(ProcessesToUpdate::All, true, procs_kind());
            s
        });
        Self {
            sys,
            disks: Disks::new_with_refreshed_list().ok(),
            nets: Networks::new_with_refreshed_list().ok(),
            comps: Components::new_with_refreshed_list().ok(),
            gpus: Gpus::new_with_refreshed_list().ok().map(GpuProbe),
            last: Instant::now(),
        }
    }

    pub fn read(&mut self) -> Snapshot {
        let secs = self.last.elapsed().as_secs_f64().max(0.2);
        self.last = Instant::now();
        let rate = |bytes: u64| (bytes as f64 / secs) as u64;
        let mut snap =
            Snapshot { at: crate::model::now_ms(), uptime_secs: System::uptime().unwrap_or(0), ..Default::default() };
        if let Some(sys) = self.sys.as_mut() {
            sys.refresh_cpu_all();
            sys.refresh_memory();
            sys.refresh_processes_specifics(ProcessesToUpdate::All, true, procs_kind());
            let cores = sys.cpus().len().max(1);
            snap.cpu = Cpu {
                usage: sys.global_cpu_usage(),
                brand: sys.cpus().first().map(|c| c.brand().trim().to_string()).unwrap_or_default(),
                cores,
                freq_mhz: sys.cpus().iter().map(|c| c.frequency()).max().unwrap_or(0),
                temp_c: None,
            };
            snap.memory = Memory {
                used: sys.used_memory(),
                total: sys.total_memory(),
                swap_used: sys.used_swap(),
                swap_total: sys.total_swap(),
            };
            let samples =
                sys.processes().values().filter(|p| p.thread_kind() != Some(ThreadKind::Userland)).map(|p| Sample {
                    name: p.name().to_string_lossy().into_owned(),
                    cpu: p.cpu_usage() / cores as f32,
                    memory: p.memory(),
                });
            snap.apps = group(samples);
        }
        if let Some(comps) = self.comps.as_mut() {
            comps.refresh(false);
            snap.cpu.temp_c = cpu_temp(comps.iter().map(|c| (c.label().to_string(), c.temperature())));
        }
        if let Some(GpuProbe(gpus)) = self.gpus.as_mut() {
            gpus.refresh(true);
            snap.gpus = gpus
                .iter()
                .map(|g| Gpu {
                    name: g.model().or(g.vendor()).unwrap_or("GPU").trim().to_string(),
                    usage: g.usage(),
                    mem_used: g.used_memory(),
                    mem_total: g.total_memory(),
                })
                .collect();
        }
        if let Some(disks) = self.disks.as_mut() {
            disks.refresh(true);
            let root = system_root();
            let (mut read, mut written) = (0, 0);
            for d in disks.iter() {
                let usage = d.usage();
                read += usage.read_bytes;
                written += usage.written_bytes;
                snap.disk_io.down_total += usage.total_read_bytes;
                snap.disk_io.up_total += usage.total_written_bytes;
                let mount = d.mount_point().to_string_lossy().into_owned();
                snap.disks.push(Disk {
                    name: d.name().to_string_lossy().into_owned(),
                    system: mount.eq_ignore_ascii_case(&root),
                    mount,
                    fs: d.file_system().to_string_lossy().into_owned(),
                    total: d.total_space(),
                    available: d.available_space(),
                    removable: d.is_removable(),
                    ssd: match d.kind() {
                        DiskKind::SSD => Some(true),
                        DiskKind::HDD => Some(false),
                        DiskKind::Unknown(_) => None,
                    },
                });
            }
            snap.disk_io.down_bps = rate(read);
            snap.disk_io.up_bps = rate(written);
            snap.disks = order_disks(std::mem::take(&mut snap.disks));
        }
        if let Some(nets) = self.nets.as_mut() {
            nets.refresh(true);
            let mut busiest = (0u64, String::new());
            for (name, data) in nets.iter() {
                let name = name.to_string_lossy();
                if loopback(&name) {
                    continue;
                }
                let (down, up) = (data.received(), data.transmitted());
                snap.network.down_bps += rate(down);
                snap.network.up_bps += rate(up);
                snap.network.down_total += data.total_received();
                snap.network.up_total += data.total_transmitted();
                if down + up >= busiest.0 && (down + up > 0 || busiest.1.is_empty()) {
                    busiest = (down + up, name.into_owned());
                }
            }
            snap.interface = busiest.1;
        }
        snap.battery = battery();
        snap
    }
}

fn loopback(name: &str) -> bool {
    let n = name.to_ascii_lowercase();
    n == "lo" || n.starts_with("lo0") || n.contains("loopback")
}

/// `C:\` on Windows (from `SystemDrive`), `/` elsewhere.
fn system_root() -> String {
    match std::env::var("SystemDrive") {
        Ok(drive) if cfg!(windows) && !drive.is_empty() => format!("{}\\", drive.trim_end_matches('\\')),
        _ => "/".to_string(),
    }
}

/// The system volume first, then the largest; empty pseudo-volumes (a 0-byte snap or ISO) are dropped.
pub fn order_disks(mut disks: Vec<Disk>) -> Vec<Disk> {
    disks.retain(|d| d.total > 0);
    disks.sort_by(|a, b| b.system.cmp(&a.system).then(b.total.cmp(&a.total)));
    disks.dedup_by(|a, b| a.name == b.name && a.total == b.total && !a.system && !b.system);
    disks
}

/// The CPU package sensor when one is labelled so, else the hottest core.
pub fn cpu_temp(sensors: impl Iterator<Item = (String, Option<f32>)>) -> Option<f32> {
    let mut package = None;
    let mut cores: Option<f32> = None;
    for (label, temp) in sensors {
        let Some(t) = temp.filter(|t| t.is_finite() && *t > 0.0) else { continue };
        let l = label.to_ascii_lowercase();
        if l.contains("package") || l.contains("tctl") || l.contains("tdie") || l == "cpu" {
            package = Some(package.map_or(t, |p: f32| p.max(t)));
        } else if l.contains("core") || l.contains("cpu") || l.contains("k10temp") || l.contains("coretemp") {
            cores = Some(cores.map_or(t, |c| c.max(t)));
        }
    }
    package.or(cores)
}

fn battery() -> Option<Battery> {
    use starship_battery::units::{
        electric_potential::volt, energy::watt_hour, power::watt, ratio::percent,
        thermodynamic_temperature::degree_celsius, time::minute,
    };
    use starship_battery::State;
    let b = starship_battery::Manager::new().ok()?.batteries().ok()?.flatten().next()?;
    let state = match b.state() {
        State::Charging => "charging",
        State::Discharging => "discharging",
        State::Full => "full",
        State::Empty => "empty",
        State::Paused => "paused",
        _ => "unknown",
    };
    let minutes = match b.state() {
        State::Charging => b.time_to_full(),
        State::Discharging => b.time_to_empty(),
        _ => None,
    };
    Some(Battery {
        percent: b.state_of_charge().get::<percent>(),
        state: state.to_string(),
        rate_w: b.energy_rate().get::<watt>().abs(),
        temp_c: b.temperature().map(|t| t.get::<degree_celsius>()),
        health: b.state_of_health().get::<percent>(),
        cycles: b.cycle_count(),
        voltage_v: b.voltage().get::<volt>(),
        full_wh: b.energy_full().get::<watt_hour>(),
        design_wh: b.energy_full_design().get::<watt_hour>(),
        minutes: minutes.map(|m| m.get::<minute>().round() as u32).filter(|m| *m > 0),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn disk(name: &str, total: u64, system: bool) -> Disk {
        Disk { name: name.into(), mount: name.into(), total, system, ..Default::default() }
    }

    #[test]
    fn the_system_volume_comes_first_then_the_largest() {
        let list = order_disks(vec![
            disk("D", 2000, false),
            disk("snap", 0, false),
            disk("C", 500, true),
            disk("E", 900, false),
        ]);
        assert_eq!(list.iter().map(|d| d.name.as_str()).collect::<Vec<_>>(), ["C", "D", "E"]);
    }

    #[test]
    fn the_package_sensor_wins_over_the_cores() {
        let s = |l: &str, t: f32| (l.to_string(), Some(t));
        assert_eq!(cpu_temp([s("Core 0", 70.0), s("Package id 0", 66.0), s("nvme", 80.0)].into_iter()), Some(66.0));
        assert_eq!(cpu_temp([s("Core 0", 61.0), s("Core 1", 64.0), s("acpitz", 90.0)].into_iter()), Some(64.0));
        assert_eq!(cpu_temp([("Core 0".to_string(), None), s("nvme", 50.0)].into_iter()), None);
    }

    #[test]
    fn loopback_interfaces_are_not_traffic() {
        assert!(loopback("lo") && loopback("lo0") && loopback("Loopback Pseudo-Interface 1"));
        assert!(!loopback("wlan0") && !loopback("Wi-Fi") && !loopback("eth0"));
    }
}
