//! The apps list: processes added up by name ("Chrome (61)"), so a browser's sixty helpers read as one browser.
use std::collections::HashMap;

use crate::sysmon::App;

/// Each list (by CPU and by memory) sends this many; the union is what the tab sorts.
const TOP: usize = 12;

pub struct Sample {
    pub name: String,
    pub cpu: f32,
    pub memory: u64,
}

/// `chrome.exe` and `Chrome` are the same app; the first spelling seen without `.exe` is the one shown.
fn display(name: &str) -> &str {
    let trimmed = name.trim();
    match trimmed.len().checked_sub(4) {
        Some(cut) if trimmed.is_char_boundary(cut) && trimmed[cut..].eq_ignore_ascii_case(".exe") => &trimmed[..cut],
        _ => trimmed,
    }
}

pub fn group(samples: impl Iterator<Item = Sample>) -> Vec<App> {
    let mut by_name: HashMap<String, App> = HashMap::new();
    for s in samples {
        let name = display(&s.name);
        if name.is_empty() {
            continue;
        }
        let app =
            by_name.entry(name.to_lowercase()).or_insert_with(|| App { name: name.to_string(), ..Default::default() });
        app.count += 1;
        app.cpu += s.cpu.max(0.0);
        app.memory += s.memory;
    }
    let mut all: Vec<App> = by_name.into_values().collect();
    all.sort_by(|a, b| b.cpu.total_cmp(&a.cpu).then_with(|| a.name.cmp(&b.name)));
    let mut top: Vec<App> = all.iter().take(TOP).cloned().collect();
    all.sort_by(|a, b| b.memory.cmp(&a.memory).then_with(|| a.name.cmp(&b.name)));
    for app in all.into_iter().take(TOP) {
        if !top.iter().any(|t| t.name == app.name) {
            top.push(app);
        }
    }
    for app in &mut top {
        app.cpu = app.cpu.min(100.0);
    }
    top
}

#[cfg(test)]
mod tests {
    use super::*;

    fn s(name: &str, cpu: f32, memory: u64) -> Sample {
        Sample { name: name.into(), cpu, memory }
    }

    #[test]
    fn helpers_add_up_under_one_name() {
        let apps =
            group([s("chrome.exe", 2.0, 100), s("Chrome", 1.5, 50), s("code", 0.5, 400), s("", 9.0, 9)].into_iter());
        let chrome = apps.iter().find(|a| a.name == "chrome").unwrap();
        assert_eq!((chrome.count, chrome.cpu, chrome.memory), (2, 3.5, 150));
        assert_eq!(apps[0].name, "chrome", "busiest CPU first");
        assert!(apps.iter().all(|a| !a.name.is_empty()));
    }

    #[test]
    fn the_heaviest_on_memory_stay_even_when_idle() {
        let mut list: Vec<Sample> = (0..20).map(|i| s(&format!("busy{i}"), 10.0 + i as f32, 1)).collect();
        list.push(s("idle-but-huge", 0.0, 9_000_000));
        let apps = group(list.into_iter());
        assert!(apps.iter().any(|a| a.name == "idle-but-huge"));
        assert!(apps.len() <= TOP * 2);
    }

    #[test]
    fn a_share_never_passes_the_whole_machine() {
        let apps = group([s("x", 70.0, 1), s("x", 60.0, 1)].into_iter());
        assert_eq!(apps[0].cpu, 100.0);
    }
}
