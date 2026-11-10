//! App setup: managed state and the background watchers started at boot.
use tauri::Manager;

use crate::vault::AppState;
use crate::*;

pub fn setup(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    // A tray widget: no Dock icon or Cmd+Tab entry (`skipTaskbar` is a no-op on macOS). The bundle's
    // Info.plist (LSUIElement) covers launch; this covers `tauri dev` and any later policy reset.
    #[cfg(target_os = "macos")]
    {
        app.set_activation_policy(tauri::ActivationPolicy::Accessory);
        app.set_dock_visibility(false);
    }
    let dir = app.path().app_data_dir()?;
    std::fs::create_dir_all(&dir)?;
    app.manage(AppState::new(dir.clone()));
    app.manage(prefs::PrefsLock::default());
    app.manage(github::cmd::GithubState::default());
    app.manage(status::cache::StatusCache::default());
    app.manage(status::alert::StatusAlerts::load(&dir));
    app.manage(gmail::alert::GmailAlerts::load(&dir));
    app.manage(health::watch::HealthState::default());
    app.manage(harness::cache::HarnessCache::default());
    app.manage(weather::state::WeatherState::load(&dir));
    app.manage(weather::alert::WeatherAlerts::load(&dir));
    app.manage(market::cmd::MarketState::default());
    app.manage(cmd_reads::ReadsState::load(&dir));
    app.manage(models::cmd::ModelsLock::default());
    app.manage(steam::cmd::SteamLock::default());
    app.manage(steam::cmd_more::TopHistory::default());
    app.manage(do_not_disturb::DoNotDisturb::load(&dir));
    app.manage(review_alert::ReviewAlerts::load(&dir));
    app.manage(my_pr_alerts::MyPrAlerts::load(&dir));
    app.manage(mentions::state::MentionsUnread::default());
    app.manage(morning_digest::MorningDigest::load(&dir));
    app.manage(activity::watch::ActivityState::load(&dir));
    app.manage(meeting_alert::Alerted::default());
    app.manage(meeting_cache::Upcoming::default());
    app.manage(alert_log::AlertLog::default());
    app.manage(fullscreen_guard::FullscreenHold::load(&dir));
    app.manage(task_reminder::ReminderLead::default());
    app.manage(steam::alert::SteamAlerts::default());
    #[cfg(desktop)]
    {
        app.manage(updater::PendingUpdate::default());
        app.manage(window::state::WindowState::load(&dir));
        app.manage(sysmon::SystemMonitor::default());
        app.manage(sysmon::alert::SystemAlerts::load(&dir));
        global_shortcuts::register(app.handle())?;
        tray::build(app.handle())?;
    }
    startup::create_windows(app.handle())?;
    #[cfg(mobile)]
    notification::ask_permission(app.handle().clone());
    background::start(app.handle().clone(), dir.clone());
    cmd_extras::watch_clipboard(app.handle().clone());
    #[cfg(desktop)]
    tray_live::watch(app.handle().clone());
    #[cfg(desktop)]
    sysmon::alert::watch(app.handle().clone());
    meeting_alert::watch(app.handle().clone());
    task_reminder::watch(app.handle().clone());
    context_reminder::watch(app.handle().clone());
    steam::alert::watch(app.handle().clone());
    status::alert::watch(app.handle().clone());
    gmail::alert::watch(app.handle().clone());
    health::watch::watch(app.handle().clone());
    models::alert::watch(app.handle().clone());
    weather::alert::watch(app.handle().clone());
    do_not_disturb::watch(app.handle().clone());
    fullscreen_guard::watch(app.handle().clone());
    review_alert::watch(app.handle().clone());
    my_pr_alerts::watch(app.handle().clone());
    mentions::alerts::watch(app.handle().clone());
    own_work::alerts::watch(app.handle().clone());
    morning_digest::watch(app.handle().clone());
    activity::watch::watch(app.handle().clone());
    // Debug build depends on vite being up: registering it on boot would open a broken widget.
    #[cfg(all(desktop, not(debug_assertions)))]
    if let Err(e) = autostart::ensure_default(app.handle()) {
        // The OS registration being unavailable must not stop the widget from opening.
        eprintln!("autostart indisponivel: {e}");
    }

    #[cfg(desktop)]
    if let Some(win) = app.get_webview_window("main") {
        win.set_always_on_top(app.state::<window::state::WindowState>().cfg().always_on_top)?;
        // Otherwise the global shortcut can't bring the widget over another app's fullscreen Space.
        #[cfg(target_os = "macos")]
        win.set_visible_on_all_workspaces(true)?;
        window::state::place(&win)?;
        // Boot startup stays in the tray only: nothing pops up on the user's screen.
        if !autostart::started_by_system() {
            win.show()?;
            win.set_focus()?;
        }
    }
    Ok(())
}
