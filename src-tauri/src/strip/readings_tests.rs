use super::*;
use crate::sysmon::Gpu;

fn disk(system: bool, total: u64, available: u64) -> Disk {
    Disk { system, total, available, ..Default::default() }
}

#[test]
fn the_system_disk_wins_and_an_empty_list_has_no_number() {
    assert_eq!(system_disk(&[disk(false, 100, 90), disk(true, 200, 50)]), Some(75.0));
    assert_eq!(system_disk(&[disk(false, 100, 40)]), Some(60.0), "no marked volume: the first one");
    assert_eq!(system_disk(&[]), None);
    assert_eq!(system_disk(&[disk(true, 0, 0)]), None, "a zero-sized volume is no reading");
}

#[test]
fn the_busiest_gpu_counts_and_none_reporting_means_no_number() {
    let g = |usage| Gpu { usage, ..Default::default() };
    let mut sys = System::default();
    assert_eq!(gpu(&sys), None);
    sys.gpus = vec![g(None), g(Some(12.0)), g(Some(40.0))];
    assert_eq!(gpu(&sys), Some(40.0));
}

#[test]
fn endpoints_count_only_the_ones_down() {
    let e = endpoints([Health::Up, Health::Down, Health::Slow, Health::Unknown, Health::Down]);
    assert_eq!(e, Endpoints { down: 2, total: 5 });
    assert_eq!(endpoints([]), Endpoints::default());
}

#[test]
fn the_ticker_is_the_markets_spotlight() {
    let q = Quote { symbol: "USDBRL".into(), price: 5.1, change: -0.4, ..Default::default() };
    let t = ticker(&[q.clone(), Quote { symbol: "EUR".into(), ..q }]).unwrap();
    assert_eq!((t.symbol.as_str(), t.price, t.change), ("USDBRL", 5.1, -0.4));
    assert_eq!(ticker(&[]), None);
}
