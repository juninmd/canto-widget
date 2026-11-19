//! Windows: the text rides in a child window of the taskbar itself (`Shell_TrayWnd`), left of the notification area
//! (`TrayNotifyWnd`), the way other taskbar widgets do it. A top-level window over the bar loses to the taskbar, which
//! sits in the topmost band; a child of it is drawn with it. It lives on its own thread with a message loop, and is
//! rebuilt when Explorer restarts. A vertical or missing taskbar leaves `unavailable()` true for the tray-icon fallback.
use std::sync::atomic::{AtomicBool, AtomicU32, Ordering};
use std::sync::{Mutex, Once};

use windows::core::{w, PCWSTR};
use windows::Win32::Foundation::{COLORREF, HINSTANCE, HWND, LPARAM, LRESULT, RECT, SIZE, WPARAM};
use windows::Win32::Graphics::Gdi::*;
use windows::Win32::System::LibraryLoader::GetModuleHandleW;
use windows::Win32::System::Registry::{RegGetValueW, HKEY_CURRENT_USER, RRF_RT_REG_DWORD};
use windows::Win32::System::Threading::GetCurrentThreadId;
use windows::Win32::UI::HiDpi::GetDpiForWindow;
use windows::Win32::UI::WindowsAndMessaging::*;

use crate::resilient::LockExt;

const CLASS: PCWSTR = w!("CantoTaskbarAgenda");
const WM_REFRESH: u32 = WM_APP + 1;
/// Explorer can restart or the notification area can grow, so the placement is rechecked now and then.
const RECHECK_MS: u32 = 4000;
const PAD: i32 = 10;
const GAP: i32 = 8;

static TEXT: Mutex<String> = Mutex::new(String::new());
static THREAD: AtomicU32 = AtomicU32::new(0);
static UNAVAILABLE: AtomicBool = AtomicBool::new(false);
static START: Once = Once::new();

/// True once the widget has found no horizontal taskbar to sit on.
pub fn unavailable() -> bool {
    UNAVAILABLE.load(Ordering::Relaxed)
}

/// `None` (or empty) hides the widget.
pub fn set_text(text: Option<&str>) {
    *TEXT.lock_safe() = text.unwrap_or_default().to_string();
    START.call_once(|| {
        let _ = std::thread::Builder::new().name("bar-taskbar".into()).spawn(run);
    });
    let id = THREAD.load(Ordering::Relaxed);
    if id != 0 {
        // SAFETY: posts a plain message to our own message-loop thread.
        unsafe {
            let _ = PostThreadMessageW(id, WM_REFRESH, WPARAM(0), LPARAM(0));
        }
    }
}

fn run() {
    // SAFETY: a classic Win32 message loop owned by this thread; every handle is created and used here only.
    unsafe {
        THREAD.store(GetCurrentThreadId(), Ordering::Relaxed);
        let Ok(module) = GetModuleHandleW(None) else { return };
        let inst = HINSTANCE(module.0);
        let class = WNDCLASSW {
            lpfnWndProc: Some(proc),
            hInstance: inst,
            lpszClassName: CLASS,
            hCursor: LoadCursorW(None, IDC_ARROW).unwrap_or_default(),
            ..Default::default()
        };
        RegisterClassW(&class);
        SetTimer(None, 1, RECHECK_MS, None);
        let mut own = HWND::default();
        let mut msg = MSG::default();
        while GetMessageW(&mut msg, None, 0, 0).0 > 0 {
            if msg.hwnd.0.is_null() && (msg.message == WM_REFRESH || msg.message == WM_TIMER) {
                own = place(inst, own);
            } else {
                let _ = TranslateMessage(&msg);
                DispatchMessageW(&msg);
            }
        }
    }
}

fn dark_taskbar() -> bool {
    let mut light = 0u32;
    let mut len = 4u32;
    // SAFETY: reads one DWORD into a local; a missing value leaves "light" at 0, which reads as dark.
    unsafe {
        let _ = RegGetValueW(
            HKEY_CURRENT_USER,
            w!("Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize"),
            w!("SystemUsesLightTheme"),
            RRF_RT_REG_DWORD,
            None,
            Some((&mut light as *mut u32).cast()),
            Some(&mut len),
        );
    }
    light == 0
}

fn colors() -> (COLORREF, COLORREF) {
    if dark_taskbar() {
        (COLORREF(0x0020_2020), COLORREF(0x00FF_FFFF))
    } else {
        (COLORREF(0x00F3_F3F3), COLORREF(0x0020_2020))
    }
}

unsafe fn font(dpi: u32) -> HFONT {
    let height = -((12 * dpi / 96) as i32);
    CreateFontW(
        height,
        0,
        0,
        0,
        400,
        0,
        0,
        0,
        DEFAULT_CHARSET,
        OUT_DEFAULT_PRECIS,
        CLIP_DEFAULT_PRECIS,
        CLEARTYPE_QUALITY,
        DEFAULT_PITCH.0 as u32,
        w!("Segoe UI"),
    )
}

unsafe fn rect_of(hwnd: HWND) -> Option<RECT> {
    let mut r = RECT::default();
    GetWindowRect(hwnd, &mut r).ok().map(|()| r)
}

/// Finds (or builds) the child and puts it left of the notification area; hides it when there is nothing to say.
unsafe fn place(inst: HINSTANCE, own: HWND) -> HWND {
    let text = TEXT.lock_safe().clone();
    let tray = FindWindowW(w!("Shell_TrayWnd"), None).unwrap_or_default();
    let notify = FindWindowExW(Some(tray), None, w!("TrayNotifyWnd"), None).unwrap_or_default();
    let (tray_r, notify_r) = (rect_of(tray), rect_of(notify));
    let horizontal = matches!((tray_r, notify_r), (Some(t), Some(_)) if t.right - t.left > t.bottom - t.top);
    UNAVAILABLE.store(!text.is_empty() && !horizontal, Ordering::Relaxed);

    let alive = !own.0.is_null() && IsWindow(Some(own)).as_bool() && GetParent(own).ok() == Some(tray);
    if text.is_empty() || !horizontal {
        if alive {
            let _ = ShowWindow(own, SW_HIDE);
        }
        return if alive { own } else { HWND::default() };
    }
    let own = if alive {
        own
    } else {
        let made = CreateWindowExW(
            WS_EX_NOACTIVATE,
            CLASS,
            w!(""),
            WS_CHILD | WS_VISIBLE | WS_CLIPSIBLINGS,
            0,
            0,
            10,
            10,
            Some(tray),
            None,
            Some(inst),
            None,
        );
        match made {
            Ok(h) => h,
            Err(_) => return HWND::default(),
        }
    };
    let (tray_r, notify_r) = (tray_r.unwrap_or_default(), notify_r.unwrap_or_default());
    let dpi = GetDpiForWindow(tray).max(96);
    let (hdc, old) = (GetDC(Some(own)), font(dpi));
    let prev = SelectObject(hdc, old.into());
    let mut size = SIZE::default();
    let wide: Vec<u16> = text.encode_utf16().collect();
    let _ = GetTextExtentPoint32W(hdc, &wide, &mut size);
    SelectObject(hdc, prev);
    let _ = DeleteObject(old.into());
    ReleaseDC(Some(own), hdc);

    let bar_h = tray_r.bottom - tray_r.top;
    let (pad, gap) = (PAD * dpi as i32 / 96, GAP * dpi as i32 / 96);
    let h = (size.cy + pad / 2).min(bar_h);
    let w = (size.cx + 2 * pad).min(notify_r.left - tray_r.left - gap);
    let x = (notify_r.left - tray_r.left - w - gap).max(0);
    let _ = SetWindowPos(own, Some(HWND_TOP), x, (bar_h - h) / 2, w, h, SWP_NOACTIVATE | SWP_SHOWWINDOW);
    let _ = InvalidateRect(Some(own), None, true);
    own
}

unsafe extern "system" fn proc(hwnd: HWND, msg: u32, wparam: WPARAM, lparam: LPARAM) -> LRESULT {
    match msg {
        WM_ERASEBKGND => LRESULT(1),
        WM_NCHITTEST => LRESULT(-1),
        WM_PAINT => {
            let mut ps = PAINTSTRUCT::default();
            let hdc = BeginPaint(hwnd, &mut ps);
            let mut r = RECT::default();
            let _ = GetClientRect(hwnd, &mut r);
            let (bg, fg) = colors();
            let brush = CreateSolidBrush(bg);
            FillRect(hdc, &r, brush);
            let _ = DeleteObject(brush.into());
            let f = font(GetDpiForWindow(hwnd).max(96));
            let prev = SelectObject(hdc, f.into());
            SetBkMode(hdc, TRANSPARENT);
            SetTextColor(hdc, fg);
            let mut wide: Vec<u16> = TEXT.lock_safe().encode_utf16().collect();
            DrawTextW(hdc, &mut wide, &mut r, DT_SINGLELINE | DT_VCENTER | DT_CENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
            SelectObject(hdc, prev);
            let _ = DeleteObject(f.into());
            let _ = EndPaint(hwnd, &ps);
            LRESULT(0)
        }
        _ => DefWindowProcW(hwnd, msg, wparam, lparam),
    }
}
