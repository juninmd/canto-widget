//! Windows 11 gives apps no way to write on the taskbar, so the next events ride in a small click-through pill laid
//! over its free stretch, left of the tray area. Only a taskbar along the bottom edge is supported.
use tauri::{AppHandle, Emitter, Manager, PhysicalPosition, PhysicalSize};

use super::EVENT;

pub const WINDOW: &str = "bar";
/// Logical size of the pill and the gap kept to the tray area (clock, icons).
const SIZE: (f64, f64) = (280.0, 28.0);
const TRAY_GAP: f64 = 380.0;

type Rect = (i32, i32, u32, u32);

/// Where the pill goes: inside the strip between the work area and the monitor's bottom, or `None` when there is no
/// bottom taskbar to sit on (it is on another edge, or auto-hidden).
pub fn slot(monitor: Rect, work: Rect, scale: f64) -> Option<Rect> {
    let (bar_top, mon_bottom) = (work.1 + work.3 as i32, monitor.1 + monitor.3 as i32);
    let bar_h = mon_bottom - bar_top;
    // A bottom taskbar leaves the work area as wide as the monitor; anything slimmer is on a side.
    if bar_h < 24 || work.2 != monitor.2 {
        return None;
    }
    let w = (SIZE.0 * scale).round() as u32;
    let h = ((SIZE.1 * scale).round() as i32).min(bar_h - 4).max(1) as u32;
    let x = monitor.0 + monitor.2 as i32 - w as i32 - (TRAY_GAP * scale).round() as i32;
    Some((x.max(monitor.0), bar_top + (bar_h - h as i32) / 2, w, h))
}

pub fn sync(app: &AppHandle, text: Option<&str>) {
    let Some(win) = app.get_webview_window(WINDOW) else { return };
    let placed = text.filter(|_| !crate::fullscreen_guard::holding(app)).and_then(|_| {
        let m = app.primary_monitor().ok().flatten()?;
        let (p, s, wa) = (m.position(), m.size(), m.work_area());
        slot(
            (p.x, p.y, s.width, s.height),
            (wa.position.x, wa.position.y, wa.size.width, wa.size.height),
            m.scale_factor(),
        )
    });
    let Some((x, y, w, h)) = placed else {
        let _ = win.hide();
        return;
    };
    let _ = win.set_ignore_cursor_events(true);
    let _ = win.set_size(PhysicalSize::new(w, h));
    let _ = win.set_position(PhysicalPosition::new(x, y));
    let _ = win.emit_to(win.label(), EVENT, text);
    let _ = win.show();
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_sits_in_the_taskbar_strip_left_of_the_tray() {
        // 1920x1080 monitor, 48 px taskbar at the bottom, 100% scale.
        let (x, y, w, h) = slot((0, 0, 1920, 1080), (0, 0, 1920, 1032), 1.0).unwrap();
        assert_eq!((w, h), (280, 28));
        assert_eq!(y, 1032 + 10);
        assert_eq!(x, 1920 - 280 - 380);
    }

    #[test]
    fn it_scales_with_the_display_and_never_taller_than_the_bar() {
        let (_, _, _, h) = slot((0, 0, 3840, 2160), (0, 0, 3840, 2064), 2.0).unwrap();
        assert_eq!(h, 56);
        let (_, _, _, h) = slot((0, 0, 1920, 1080), (0, 0, 1920, 1050), 1.0).unwrap();
        assert_eq!(h, 26, "a 30 px bar leaves room for a margin");
    }

    #[test]
    fn no_bottom_taskbar_means_no_pill() {
        assert_eq!(slot((0, 0, 1920, 1080), (0, 0, 1920, 1080), 1.0), None, "hidden or on no edge");
        assert_eq!(slot((0, 0, 1920, 1080), (0, 40, 1920, 1040), 1.0), None, "taskbar on top");
        assert_eq!(slot((0, 0, 1920, 1080), (60, 0, 1860, 1080), 1.0), None, "taskbar on a side");
    }
}
