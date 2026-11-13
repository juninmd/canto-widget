use super::candidates;

#[test]
fn windows_prefers_windows_terminal_then_cmd_in_the_folder() {
    let c = candidates("windows", r"C:\code\app");
    assert_eq!(c[0], ("wt.exe", vec!["-d".to_string(), r"C:\code\app".to_string()]));
    assert_eq!(c[1].0, "cmd.exe");
    assert!(c[1].1.contains(&r"C:\code\app".to_string()));
}

#[test]
fn macos_opens_terminal_app_with_the_folder() {
    assert_eq!(
        candidates("macos", "/Users/a/app"),
        vec![("open", vec!["-a".into(), "Terminal".into(), "/Users/a/app".into()])]
    );
}

#[test]
fn linux_falls_back_through_common_emulators() {
    let c = candidates("linux", "/home/a/app");
    assert_eq!(c[0], ("x-terminal-emulator", vec![]));
    assert_eq!(c[1].1, vec!["--working-directory".to_string(), "/home/a/app".to_string()]);
    assert_eq!(c.last().unwrap().0, "xterm");
}
