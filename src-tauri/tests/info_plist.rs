//! The macOS bundle must declare itself a UI element: otherwise the widget sits in the Dock and Cmd+Tab
//! even while hidden in the menu bar.

#[test]
fn macos_bundle_hides_the_dock_icon() {
    let plist = include_str!("../Info.plist");
    let compact: String = plist.split_whitespace().collect();
    assert!(compact.contains("<key>LSUIElement</key><true/>"), "LSUIElement must be true in src-tauri/Info.plist");
}
