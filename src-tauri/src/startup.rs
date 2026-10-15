pub fn create_windows(app: &tauri::AppHandle) -> tauri::Result<()> {
    // Webviews invoke commands immediately, so their managed state and tray must already exist.
    for config in &app.config().app.windows {
        tauri::WebviewWindowBuilder::from_config(app, config)?.build()?;
    }
    Ok(())
}
