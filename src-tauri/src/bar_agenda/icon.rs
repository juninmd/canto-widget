//! Tray icon with the minutes to the next event drawn in it, for a Windows taskbar the widget cannot sit on
//! (vertical, or Explorer without the notification area). Pure pixels, so it is tested without a window.
const SIZE: usize = 32;
const SCALE: usize = 3;
const BG: [u8; 4] = [37, 99, 235, 255];
const FG: [u8; 4] = [255, 255, 255, 255];

/// 3x5 glyphs, one row per entry, bit 2 is the left column.
fn glyph(c: char) -> [u8; 5] {
    match c {
        '0' => [7, 5, 5, 5, 7],
        '1' => [2, 6, 2, 2, 7],
        '2' => [7, 1, 7, 4, 7],
        '3' => [7, 1, 7, 1, 7],
        '4' => [5, 5, 7, 1, 1],
        '5' => [7, 4, 7, 1, 7],
        '6' => [7, 4, 7, 5, 7],
        '7' => [7, 1, 1, 2, 2],
        '8' => [7, 5, 7, 5, 7],
        '9' => [7, 5, 7, 1, 7],
        'h' => [4, 4, 7, 5, 5],
        _ => [0, 2, 7, 2, 0],
    }
}

/// "12" for twelve minutes, "2h" from 100 minutes, "+" when it is far off.
pub fn caption(in_min: i64) -> String {
    match in_min.max(0) {
        m if m < 100 => m.to_string(),
        m if m < 600 => format!("{}h", m / 60),
        _ => "+".into(),
    }
}

/// Straight RGBA, `SIZE` x `SIZE`: a rounded square with the caption centered.
pub fn countdown(in_min: i64) -> (Vec<u8>, u32, u32) {
    let mut px = vec![0u8; SIZE * SIZE * 4];
    let corner = |x: usize, y: usize| {
        let (dx, dy) = (x.min(SIZE - 1 - x), y.min(SIZE - 1 - y));
        dx + dy >= 3 || (dx >= 2 && dy >= 2) || (dx >= 1 && dy >= 3) || (dx >= 3 && dy >= 1)
    };
    for y in 0..SIZE {
        for x in 0..SIZE {
            if corner(x, y) {
                px[(y * SIZE + x) * 4..][..4].copy_from_slice(&BG);
            }
        }
    }
    let text = caption(in_min);
    let n = text.chars().count();
    let width = n * 3 * SCALE + (n - 1) * SCALE;
    let (left, top) = ((SIZE - width) / 2, (SIZE - 5 * SCALE) / 2);
    for (i, c) in text.chars().enumerate() {
        for (row, bits) in glyph(c).iter().enumerate() {
            for col in 0..3 {
                if bits >> (2 - col) & 1 == 0 {
                    continue;
                }
                for (dy, dx) in (0..SCALE).flat_map(|a| (0..SCALE).map(move |b| (a, b))) {
                    let x = left + i * 4 * SCALE + col * SCALE + dx;
                    let y = top + row * SCALE + dy;
                    px[(y * SIZE + x) * 4..][..4].copy_from_slice(&FG);
                }
            }
        }
    }
    (px, SIZE as u32, SIZE as u32)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_caption_fits_two_glyphs() {
        assert_eq!(caption(-3), "0");
        assert_eq!(caption(12), "12");
        assert_eq!(caption(99), "99");
        assert_eq!(caption(130), "2h");
        assert_eq!(caption(900), "+");
    }

    #[test]
    fn it_draws_a_square_with_white_digits_inside() {
        let (px, w, h) = countdown(12);
        assert_eq!((w, h, px.len()), (32, 32, 32 * 32 * 4));
        let at = |x: usize, y: usize| px[(y * 32 + x) * 4..][..4].to_vec();
        assert_eq!(at(0, 0)[3], 0, "the corner is transparent");
        assert_eq!(at(16, 1), BG.to_vec());
        assert!(px.chunks(4).any(|p| p == FG), "something is written");
        assert_ne!(countdown(12).0, countdown(13).0);
    }
}
