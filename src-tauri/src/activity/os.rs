//! What the OS says about focus: the frontmost application's name and how long the user has been idle.
//! Windows asks the Win32 API; macOS and Linux run one small system tool, so there is no extra dependency.
//! `None` means "unknown", which the sampler treats as no sample (foreground) or as active (idle).

/// Name of a process from its executable path: `C:\Program Files\Code\Code.exe` -> `Code`.
pub fn exe_stem(path: &str) -> Option<String> {
    let file = path.rsplit(['\\', '/']).next()?.trim();
    let stem = match file.rsplit_once('.') {
        Some((stem, ext)) if ext.eq_ignore_ascii_case("exe") => stem,
        _ => file,
    };
    (!stem.is_empty()).then(|| stem.to_string())
}

/// `lsappinfo info -only name <asn>` prints `"LSDisplayName"="Safari"`.
pub fn parse_lsappinfo_name(out: &str) -> Option<String> {
    let value = out.split_once('=')?.1.trim().trim_matches('"').trim();
    (!value.is_empty()).then(|| value.to_string())
}

/// `ioreg -rc IOHIDSystem` carries `"HIDIdleTime" = 1234567890` in nanoseconds.
pub fn parse_hid_idle_secs(out: &str) -> Option<u64> {
    let rest = out.split("\"HIDIdleTime\"").nth(1)?.trim_start().strip_prefix('=')?.trim_start();
    let digits: String = rest.chars().take_while(char::is_ascii_digit).collect();
    digits.parse::<u64>().ok().map(|ns| ns / 1_000_000_000)
}

/// `xprop -root _NET_ACTIVE_WINDOW` prints `... window id # 0x3a00007`; `0x0` means no window has focus.
pub fn parse_active_window_id(out: &str) -> Option<String> {
    let id = out.rsplit('#').next()?.trim();
    let hex = id.strip_prefix("0x")?;
    (!hex.is_empty() && hex.chars().all(|c| c.is_ascii_hexdigit()) && hex.chars().any(|c| c != '0'))
        .then(|| id.to_string())
}

/// `WM_CLASS(STRING) = "code", "Code"`: the second value is the class users recognise.
pub fn parse_wm_class(out: &str) -> Option<String> {
    let values: Vec<&str> = out.split_once('=')?.1.split(',').map(|v| v.trim().trim_matches('"')).collect();
    values.get(1).or(values.first()).filter(|v| !v.is_empty()).map(|v| v.to_string())
}

pub fn foreground_app() -> Option<String> {
    imp::foreground_app()
}

pub fn idle_secs() -> Option<u64> {
    imp::idle_secs()
}

#[cfg(windows)]
mod imp {
    use windows::core::PWSTR;
    use windows::Win32::Foundation::CloseHandle;
    use windows::Win32::System::Diagnostics::ToolHelp::{
        CreateToolhelp32Snapshot, Process32FirstW, Process32NextW, PROCESSENTRY32W, TH32CS_SNAPPROCESS,
    };
    use windows::Win32::System::SystemInformation::GetTickCount;
    use windows::Win32::System::Threading::{
        OpenProcess, QueryFullProcessImageNameW, PROCESS_NAME_WIN32, PROCESS_QUERY_LIMITED_INFORMATION,
    };
    use windows::Win32::UI::Input::KeyboardAndMouse::{GetLastInputInfo, LASTINPUTINFO};
    use windows::Win32::UI::WindowsAndMessaging::{GetForegroundWindow, GetWindowThreadProcessId};

    pub fn foreground_app() -> Option<String> {
        // SAFETY: plain Win32 calls with valid out-pointers; the handle is closed before returning.
        unsafe {
            let hwnd = GetForegroundWindow();
            if hwnd.is_invalid() {
                return None;
            }
            let mut pid = 0u32;
            GetWindowThreadProcessId(hwnd, Some(&mut pid));
            if pid == 0 {
                return None;
            }
            // Games under an anti-cheat driver refuse the handle; the process list still names them.
            query_path(pid).and_then(|p| super::exe_stem(&p)).or_else(|| name_from_snapshot(pid))
        }
    }

    unsafe fn query_path(pid: u32) -> Option<String> {
        let process = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid).ok()?;
        let mut buf = [0u16; 520];
        let mut len = buf.len() as u32;
        let queried = QueryFullProcessImageNameW(process, PROCESS_NAME_WIN32, PWSTR(buf.as_mut_ptr()), &mut len);
        let _ = CloseHandle(process);
        queried.ok()?;
        Some(String::from_utf16_lossy(&buf[..len as usize]))
    }

    /// The executable name from the process list, which needs no access to the process itself.
    fn name_from_snapshot(pid: u32) -> Option<String> {
        // SAFETY: the snapshot handle is closed before returning and `entry` is sized as the API requires.
        unsafe {
            let snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0).ok()?;
            let mut entry =
                PROCESSENTRY32W { dwSize: std::mem::size_of::<PROCESSENTRY32W>() as u32, ..Default::default() };
            let mut name = None;
            let mut more = Process32FirstW(snapshot, &mut entry).is_ok();
            while more {
                if entry.th32ProcessID == pid {
                    let len = entry.szExeFile.iter().position(|&c| c == 0).unwrap_or(entry.szExeFile.len());
                    name = super::exe_stem(&String::from_utf16_lossy(&entry.szExeFile[..len]));
                    break;
                }
                more = Process32NextW(snapshot, &mut entry).is_ok();
            }
            let _ = CloseHandle(snapshot);
            name
        }
    }

    pub fn idle_secs() -> Option<u64> {
        let mut info = LASTINPUTINFO { cbSize: std::mem::size_of::<LASTINPUTINFO>() as u32, dwTime: 0 };
        // SAFETY: `info` is initialised with its size, as the API requires.
        unsafe {
            if !GetLastInputInfo(&mut info).as_bool() {
                return None;
            }
            Some(u64::from(GetTickCount().wrapping_sub(info.dwTime)) / 1000)
        }
    }
}

#[cfg(target_os = "macos")]
mod imp {
    use std::process::Command;

    fn run(program: &str, args: &[&str]) -> Option<String> {
        let out = Command::new(program).args(args).output().ok().filter(|o| o.status.success())?;
        String::from_utf8(out.stdout).ok()
    }

    pub fn foreground_app() -> Option<String> {
        let front = run("lsappinfo", &["front"])?;
        let asn = front.trim();
        if asn.is_empty() {
            return None;
        }
        super::parse_lsappinfo_name(&run("lsappinfo", &["info", "-only", "name", asn])?)
    }

    pub fn idle_secs() -> Option<u64> {
        super::parse_hid_idle_secs(&run("ioreg", &["-rc", "IOHIDSystem"])?)
    }
}

#[cfg(all(unix, not(target_os = "macos")))]
mod imp {
    use std::process::Command;

    fn run(program: &str, args: &[&str]) -> Option<String> {
        let out = Command::new(program).args(args).output().ok().filter(|o| o.status.success())?;
        String::from_utf8(out.stdout).ok()
    }

    /// X11 only: Wayland does not let one application see another's focus, so there is simply no sample.
    pub fn foreground_app() -> Option<String> {
        let id = super::parse_active_window_id(&run("xprop", &["-root", "_NET_ACTIVE_WINDOW"])?)?;
        super::parse_wm_class(&run("xprop", &["-id", &id, "WM_CLASS"])?)
    }

    /// Without `xprintidle` the user counts as active.
    pub fn idle_secs() -> Option<u64> {
        run("xprintidle", &[])?.trim().parse::<u64>().ok().map(|ms| ms / 1000)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn an_executable_path_becomes_the_program_name() {
        assert_eq!(exe_stem(r"C:\Program Files\Microsoft VS Code\Code.exe").as_deref(), Some("Code"));
        assert_eq!(exe_stem("/usr/bin/firefox").as_deref(), Some("firefox"));
        assert_eq!(exe_stem(r"C:\a\Slack.EXE").as_deref(), Some("Slack"));
        assert_eq!(exe_stem(r"C:\a\"), None);
        assert_eq!(exe_stem(""), None);
    }

    #[test]
    fn macos_tool_output_is_parsed() {
        assert_eq!(parse_lsappinfo_name("\"LSDisplayName\"=\"Safari\"\n").as_deref(), Some("Safari"));
        assert_eq!(parse_lsappinfo_name("\"LSDisplayName\"=\"\"\n"), None);
        assert_eq!(parse_lsappinfo_name("no equals"), None);
        assert_eq!(parse_hid_idle_secs("    | \"HIDIdleTime\" = 7500000000\n").unwrap(), 7);
        assert_eq!(parse_hid_idle_secs("nothing here"), None);
    }

    #[test]
    fn x11_tool_output_is_parsed() {
        let id = parse_active_window_id("_NET_ACTIVE_WINDOW(WINDOW): window id # 0x3a00007\n");
        assert_eq!(id.as_deref(), Some("0x3a00007"));
        assert_eq!(parse_active_window_id("_NET_ACTIVE_WINDOW(WINDOW): window id # 0x0\n"), None);
        assert_eq!(parse_active_window_id("_NET_ACTIVE_WINDOW: not found.\n"), None);
        assert_eq!(parse_wm_class("WM_CLASS(STRING) = \"code\", \"Code\"\n").as_deref(), Some("Code"));
        assert_eq!(parse_wm_class("WM_CLASS(STRING) = \"solo\"\n").as_deref(), Some("solo"));
        assert_eq!(parse_wm_class("WM_CLASS:  not found.\n"), None);
    }
}
