//! What the OS bar says about the next events: pure, so the wording and the cut-offs are tested without a tray.
use time::format_description::well_known::Rfc3339;

use crate::calendar::AgendaItem;

/// A menu-bar title or a taskbar pill has little room; the full title is still in the tooltip.
const TITLE_CHARS: usize = 28;
/// Windows cuts a tray tooltip at 127 UTF-16 units.
const TOOLTIP_CHARS: usize = 120;
/// Beyond a day away an event is not "next" for a glance at the bar.
const HORIZON_MIN: i64 = 24 * 60;

#[derive(Debug, Clone, PartialEq)]
pub struct Line {
    pub title: String,
    /// "HH:MM" as the calendar wrote it (its own offset), so it matches what the agenda tab shows.
    pub clock: String,
    /// Minutes until the start, rounded up; 0 while it is under way.
    pub in_min: i64,
    pub ongoing: bool,
}

fn ms(s: &str) -> Option<i64> {
    time::OffsetDateTime::parse(s, &Rfc3339).ok().map(|t| t.unix_timestamp() * 1000)
}

/// The next `count` timed events that have not ended and were not declined, in the API's order.
pub fn upcoming(items: &[AgendaItem], now_ms: i64, count: usize) -> Vec<Line> {
    items
        .iter()
        .filter(|e| !e.all_day && e.response != "declined")
        .filter_map(|e| {
            let (start, end) = (ms(&e.start)?, ms(&e.end)?);
            let in_min = ((start - now_ms).max(0) + 59_999) / 60_000;
            (end > now_ms && in_min <= HORIZON_MIN).then(|| Line {
                title: e.title.trim().to_string(),
                clock: e.start.get(11..16).unwrap_or_default().to_string(),
                in_min,
                ongoing: start <= now_ms,
            })
        })
        .take(count)
        .collect()
}

fn cut(text: &str, max: usize) -> String {
    if text.chars().count() <= max {
        return text.to_string();
    }
    let head: String = text.chars().take(max.saturating_sub(1)).collect();
    format!("{}…", head.trim_end())
}

fn relative(line: &Line) -> String {
    use crate::lang::tr;
    match line.in_min {
        _ if line.ongoing => tr("agora", "now").into(),
        m if m < 60 => format!("{} {m} min", tr("em", "in")),
        m if m % 60 == 0 => format!("{} {} h", tr("em", "in"), m / 60),
        m => format!("{} {} h {:02}", tr("em", "in"), m / 60, m % 60),
    }
}

/// "Daily 10:30 · em 12 min".
pub fn label(line: &Line) -> String {
    let title = cut(&line.title, TITLE_CHARS);
    let when = relative(line);
    if line.ongoing || line.clock.is_empty() {
        return format!("{title} · {when}");
    }
    format!("{title} {} · {when}", line.clock)
}

/// The title or pill: the first event, plus how many more follow.
pub fn headline(lines: &[Line]) -> Option<String> {
    let first = label(lines.first()?);
    Some(match lines.len() - 1 {
        0 => first,
        n => format!("{first} (+{n})"),
    })
}

/// One event per line, under the app name, short enough for the Windows limit.
pub fn tooltip(lines: &[Line]) -> String {
    let mut out = String::from("Canto");
    for line in lines {
        let next = format!("{out}\n{}", label(line));
        if next.chars().count() > TOOLTIP_CHARS {
            break;
        }
        out = next;
    }
    out
}

#[cfg(test)]
#[path = "text_tests.rs"]
mod tests;
