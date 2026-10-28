//! The Wi-Fi network the computer is on. Each OS answers through one small system tool, so there is no extra
//! dependency; `None` means "unknown" (no adapter, not connected, or the OS hides the name), and never matches.

/// `netsh wlan show interfaces` lists `SSID : name` (and `BSSID : mac`, which is not it) per adapter.
pub fn parse_netsh_ssid(out: &str) -> Option<String> {
    out.lines().filter_map(|l| l.split_once(':')).find(|(k, _)| k.trim() == "SSID").and_then(|(_, v)| name(v))
}

/// `nmcli -t -f active,ssid dev wifi` prints `yes:name`, escaping a colon in the name as `\:`.
pub fn parse_nmcli_ssid(out: &str) -> Option<String> {
    let line = out.lines().find_map(|l| l.strip_prefix("yes:"))?;
    name(&line.replace("\\:", ":").replace("\\\\", "\\"))
}

/// `networksetup -getairportnetwork en0` prints `Current Wi-Fi Network: name`; macOS 14.4+ may answer `<redacted>`.
pub fn parse_networksetup_ssid(out: &str) -> Option<String> {
    name(out.trim().strip_prefix("Current Wi-Fi Network:")?).filter(|n| n != "<redacted>")
}

fn name(raw: &str) -> Option<String> {
    let n = raw.trim();
    (!n.is_empty()).then(|| n.to_string())
}

pub fn current_ssid() -> Option<String> {
    imp::current_ssid()
}

#[cfg(windows)]
mod imp {
    use std::os::windows::process::CommandExt;
    use std::process::Command;

    /// Keeps a console window from flashing at every probe.
    const CREATE_NO_WINDOW: u32 = 0x0800_0000;

    pub fn current_ssid() -> Option<String> {
        let out = Command::new("netsh")
            .args(["wlan", "show", "interfaces"])
            .creation_flags(CREATE_NO_WINDOW)
            .output()
            .ok()
            .filter(|o| o.status.success())?;
        super::parse_netsh_ssid(&String::from_utf8_lossy(&out.stdout))
    }
}

#[cfg(target_os = "macos")]
mod imp {
    use std::process::Command;

    pub fn current_ssid() -> Option<String> {
        ["en0", "en1"].iter().find_map(|device| {
            let out = Command::new("networksetup").args(["-getairportnetwork", device]).output().ok()?;
            super::parse_networksetup_ssid(&String::from_utf8_lossy(&out.stdout))
        })
    }
}

#[cfg(all(unix, not(target_os = "macos")))]
mod imp {
    use std::process::Command;

    fn run(program: &str, args: &[&str]) -> Option<String> {
        let out = Command::new(program).args(args).output().ok().filter(|o| o.status.success())?;
        String::from_utf8(out.stdout).ok()
    }

    pub fn current_ssid() -> Option<String> {
        run("nmcli", &["-t", "-f", "active,ssid", "dev", "wifi"])
            .and_then(|out| super::parse_nmcli_ssid(&out))
            .or_else(|| run("iwgetid", &["-r"]).and_then(|out| super::name(&out)))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn netsh_names_the_ssid_and_not_the_bssid() {
        let out = "    Name                   : Wi-Fi\n    State                  : connected\n    SSID                   : Casa 5G\n    BSSID                  : aa:bb:cc:dd:ee:ff\n";
        assert_eq!(parse_netsh_ssid(out).as_deref(), Some("Casa 5G"));
        assert_eq!(parse_netsh_ssid("    Name : Wi-Fi\n    State : disconnected\n"), None);
    }

    #[test]
    fn netsh_keeps_a_colon_inside_the_name() {
        assert_eq!(parse_netsh_ssid("    SSID                   : Loja: Filial\n").as_deref(), Some("Loja: Filial"));
    }

    #[test]
    fn nmcli_picks_the_active_network_and_unescapes_colons() {
        assert_eq!(parse_nmcli_ssid("no:Vizinho\nyes:Escritorio\n").as_deref(), Some("Escritorio"));
        assert_eq!(parse_nmcli_ssid("yes:Loja\\: Filial\n").as_deref(), Some("Loja: Filial"));
        assert_eq!(parse_nmcli_ssid("no:Vizinho\n"), None);
        assert_eq!(parse_nmcli_ssid("yes:\n"), None);
    }

    #[test]
    fn networksetup_handles_connected_off_and_redacted() {
        assert_eq!(parse_networksetup_ssid("Current Wi-Fi Network: Casa\n").as_deref(), Some("Casa"));
        assert_eq!(parse_networksetup_ssid("You are not associated with an AirPort network.\n"), None);
        assert_eq!(parse_networksetup_ssid("Current Wi-Fi Network: <redacted>\n"), None);
    }
}
