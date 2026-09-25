//! Taskbar/dock badge for tasks still open today + PRs/MRs with review requested.
//!
//! Windows has no cross-platform "set a number" API (`Window::set_badge_count` is explicitly
//! unsupported there) — only `set_overlay_icon`, which takes an image. Drawing digits needs a
//! font we don't ship, so Windows/Linux get a plain red dot ("something needs you"); macOS's
//! Dock renders the real count natively.
use tauri::{AppHandle, Manager};

#[cfg(any(target_os = "windows", test))]
const DOT_SIZE: u32 = 20;
#[cfg(any(target_os = "windows", test))]
const RED: [u8; 4] = [220, 38, 38, 255];

/// A filled circle on a transparent square, computed by hand: no image/font crate needed for one dot.
#[cfg(any(target_os = "windows", test))]
fn red_dot() -> tauri::image::Image<'static> {
    let r = DOT_SIZE as i32 / 2;
    let mut rgba = vec![0u8; (DOT_SIZE * DOT_SIZE * 4) as usize];
    for y in 0..DOT_SIZE as i32 {
        for x in 0..DOT_SIZE as i32 {
            let (dx, dy) = (x - r, y - r);
            if dx * dx + dy * dy <= r * r {
                let i = ((y as u32 * DOT_SIZE + x as u32) * 4) as usize;
                rgba[i..i + 4].copy_from_slice(&RED);
            }
        }
    }
    tauri::image::Image::new_owned(rgba, DOT_SIZE, DOT_SIZE)
}

/// `total` 0 clears the badge. Errors are swallowed: an unsupported platform must not be noisy.
pub fn apply(app: &AppHandle, total: u32) {
    let Some(win) = app.get_webview_window("main") else { return };
    #[cfg(target_os = "windows")]
    let _ = win.set_overlay_icon(if total > 0 { Some(red_dot()) } else { None });
    #[cfg(not(target_os = "windows"))]
    let _ = win.set_badge_count(if total > 0 { Some(total as i64) } else { None });
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_dot_is_square_and_carries_only_red_or_fully_transparent_pixels() {
        let img = red_dot();
        assert_eq!((img.width(), img.height()), (DOT_SIZE, DOT_SIZE));
        for px in img.rgba().chunks_exact(4) {
            assert!(px == RED || px == [0, 0, 0, 0], "unexpected pixel {px:?}");
        }
    }

    #[test]
    fn the_dot_actually_covers_most_of_the_square_not_just_the_corners() {
        let img = red_dot();
        let opaque = img.rgba().chunks_exact(4).filter(|px| *px == RED).count();
        let area = (DOT_SIZE * DOT_SIZE) as usize;
        // A circle inscribed in the square covers ~78% of it; a hollow/degenerate shape would fall short.
        assert!(opaque * 100 >= area * 60, "only {opaque}/{area} pixels painted");
    }
}
