use super::*;
use crate::sysmon::{App, Battery, Disk, Memory};

const GB: u64 = 1024 * 1024 * 1024;

fn snap() -> Snapshot {
    Snapshot {
        memory: Memory { used: 8 * GB, total: 16 * GB, ..Default::default() },
        disks: vec![Disk {
            mount: "C:\\".into(),
            total: 500 * GB,
            available: 200 * GB,
            system: true,
            ..Default::default()
        }],
        apps: vec![
            App { name: "Navegador".into(), count: 40, cpu: 12.0, memory: 5 * GB },
            App { name: "Editor".into(), count: 3, cpu: 30.0, memory: GB },
        ],
        ..Default::default()
    }
}

fn kinds(list: &[Hint]) -> Vec<&'static str> {
    list.iter().map(|h| h.kind).collect()
}

#[test]
fn a_calm_machine_rings_nothing() {
    assert!(hints(&snap(), &[10.0; 5]).is_empty());
}

#[test]
fn memory_rings_at_90_and_turns_severe_at_95() {
    let mut s = snap();
    s.memory.used = (16 * GB) * 91 / 100;
    let h = memory(&s).unwrap();
    assert!(!h.severe);
    assert_eq!(h.value, "91%");
    assert!(h.body.contains("16.0 GB") && h.body.contains("Navegador"), "{}", h.body);
    s.memory.used = (16 * GB) * 96 / 100;
    assert!(memory(&s).unwrap().severe);
}

#[test]
fn only_the_system_volume_counts_for_disk() {
    let mut s = snap();
    s.disks.push(Disk { mount: "D:\\".into(), total: 100 * GB, available: GB, ..Default::default() });
    assert!(disk(&s).is_none(), "an almost full data drive is the user's business");
    s.disks[0].available = 40 * GB;
    let h = disk(&s).unwrap();
    assert!(!h.severe && h.value == "92%", "{h:?}");
    assert!(h.body.ends_with("em C:.") || h.body.ends_with("on C:."), "{}", h.body);
    assert_eq!(drive("/"), "/");
    s.disks[0].available = 20 * GB;
    assert!(disk(&s).unwrap().severe);
}

#[test]
fn the_cpu_has_to_stay_busy_for_minutes() {
    let s = snap();
    assert!(cpu(&s, &[95.0; 4]).is_none(), "not enough readings yet");
    assert!(cpu(&s, &[95.0, 95.0, 50.0, 95.0, 95.0]).is_none(), "a dip in the window");
    let h = cpu(&s, &[20.0, 95.0, 96.0, 97.0, 98.0, 99.0]).unwrap();
    assert!(h.body.contains("Editor"), "{}", h.body);
}

#[test]
fn temperature_needs_a_sensor() {
    let mut s = snap();
    assert!(cpu_temp(&s).is_none());
    s.cpu.temp_c = Some(88.4);
    assert_eq!(cpu_temp(&s).unwrap().value, "88 °C");
    s.cpu.temp_c = Some(96.0);
    assert!(cpu_temp(&s).unwrap().severe);
}

#[test]
fn a_low_battery_only_rings_off_the_charger() {
    let mut s = snap();
    let b = Battery { percent: 15.0, state: "charging".into(), minutes: Some(42), ..Default::default() };
    s.battery = Some(b.clone());
    assert!(battery_low(&s).is_none());
    s.battery = Some(Battery { state: "discharging".into(), ..b });
    let h = battery_low(&s).unwrap();
    assert!(!h.severe && h.body.contains("42"));
    s.battery.as_mut().unwrap().percent = 8.0;
    assert!(battery_low(&s).unwrap().severe);
}

#[test]
fn a_worn_battery_is_below_80_percent_of_design() {
    let mut s = snap();
    let b = Battery { health: 84.1, full_wh: 58.0, design_wh: 69.0, ..Default::default() };
    s.battery = Some(b.clone());
    assert!(battery_health(&s).is_none());
    s.battery = Some(Battery { health: 72.0, full_wh: 50.0, ..b });
    let h = battery_health(&s).unwrap();
    assert_eq!(h.value, "72%");
    assert!(h.body.contains("50") && h.body.contains("69"));
    assert_eq!(kinds(&hints(&s, &[])), ["battery_health"]);
}

#[test]
fn sizes_read_like_the_tab() {
    assert_eq!(size(512), "512 B");
    assert_eq!(size(1536), "1.5 KB");
    assert_eq!(size(57 * GB + GB / 2), "57.5 GB");
}
