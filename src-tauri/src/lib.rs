pub mod account;
pub mod autolock;
pub mod autostart;
pub mod backup;
pub mod background;
pub mod badge;
pub mod biometric;
pub mod blocking;
pub mod calendar;
pub mod calendar_event;
pub mod clip_os;
pub mod clipboard;
pub mod cmd_biometric;
pub mod cmd_backup;
pub mod cmd_drive;
pub mod cmd_extras;
pub mod cmd_gemini;
pub mod cmd_forges;
pub mod cmd_github;
pub mod cmd_github_lists;
pub mod cmd_gitlab;
pub mod cmd_notes;
pub mod cmd_status;
pub mod cmd_sync;
pub mod commands;
pub mod crypto;
pub mod drive;
pub mod error;
pub mod forge;
pub mod forge_cache;
pub mod forge_filter;
pub mod gemini_docs;
pub mod github;
pub mod github_auth;
pub mod github_query;
pub mod gitlab;
pub mod gitlab_query;
#[cfg(windows)]
pub mod hello;
#[cfg(target_os = "macos")]
pub mod hello_mac;
pub mod meet;
pub mod model;
pub mod net;
pub mod next_meeting;
pub mod notification;
pub mod oauth;
pub mod paste_plain;
pub mod plain_text;
pub mod password;
pub mod priority;
pub mod routine;
pub mod snooze;
pub mod status_cache;
pub mod status_feed;
pub mod store;
pub mod subtask;
pub mod sync;
pub mod task_order;
pub mod transcripts;
pub mod trash;
pub mod tray_live;
pub mod unlock_log;
pub mod updater;
pub mod vault;
pub mod window;
pub mod window_state;

use tauri::menu::{Menu, MenuItem};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};
use tauri::tray::TrayIconBuilder;
use tauri::Manager;

use crate::vault::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Must be first: with autostart, reopening the app would create another tray and clipboard.json watcher.
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            let _ = window::show(app);
        }))
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(
            tauri_plugin_autostart::Builder::new()
                .args([autostart::ARG_AUTOSTART])
                .build(),
        )
        .setup(|app| {
            register_toggle_shortcut(app.handle())?;
            let dir = app.path().app_data_dir()?;
            std::fs::create_dir_all(&dir)?;
            app.manage(AppState::new(dir.clone()));
            app.manage(cmd_github::GithubState::default());
            app.manage(status_cache::StatusCache::default());
            app.manage(updater::PendingUpdate::default());
            app.manage(window_state::WindowState::load(&dir));
            background::start(app.handle().clone(), dir.clone());
            cmd_extras::watch_clipboard(app.handle().clone());
            build_tray(app.handle())?;
            tray_live::watch(app.handle().clone());
            // Debug build depends on vite being up: registering it on boot would open a broken widget.
            #[cfg(not(debug_assertions))]
            if let Err(e) = autostart::ensure_default(app.handle()) {
                // The OS registration being unavailable must not stop the widget from opening.
                eprintln!("autostart indisponivel: {e}");
            }

            if let Some(win) = app.get_webview_window("main") {
                win.set_always_on_top(app.state::<window_state::WindowState>().cfg().always_on_top)?;
                window_state::place(&win)?;
                // Boot startup stays in the tray only: nothing pops up on the user's screen.
                if !autostart::started_by_system() {
                    win.show()?;
                    win.set_focus()?;
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::vault_status,
            commands::vault_create,
            commands::vault_unlock,
            commands::vault_lock,
            commands::unlock_history,
            commands::vault_touch,
            password::vault_change_password,
            commands::tasks_for_day,
            commands::task_add,
            commands::task_toggle,
            commands::task_rename,
            commands::task_complete,
            commands::task_link_pr,
            commands::tasks_carry_over,
            subtask::subtask_add,
            subtask::subtask_toggle,
            subtask::subtask_remove,
            priority::task_set_priority,
            task_order::tasks_reorder,
            cmd_notes::notes_search,
            cmd_notes::note_save,
            cmd_notes::note_pin,
            cmd_notes::note_export_md,
            routine::task_set_schedule,
            routine::task_set_extended_repeat,
            routine::tasks_reminders,
            commands::item_delete,
            cmd_drive::drive_status,
            cmd_drive::drive_configure,
            cmd_drive::drive_disconnect,
            cmd_drive::drive_connect,
            cmd_extras::clip_list,
            cmd_extras::clip_copy,
            cmd_extras::clip_pin,
            cmd_extras::clip_delete,
            cmd_extras::clip_clear,
            cmd_extras::clip_set_max_pinned,
            cmd_extras::transcripts_dir,
            cmd_extras::transcripts_set_dir,
            cmd_extras::transcripts_list,
            cmd_extras::transcript_read,
            cmd_extras::agenda_today,
            cmd_gemini::gemini_docs,
            cmd_extras::alert_open,
            cmd_extras::alert_payload,
            cmd_extras::alert_close,
            snooze::alert_snooze,
            cmd_extras::open_link,
            autostart::autostart_status,
            updater::update_check,
            updater::update_install,
            autostart::autostart_set,
            autolock::autolock_get,
            autolock::autolock_set,
            cmd_backup::backup_export,
            cmd_backup::backup_import,
            cmd_sync::sync_get,
            cmd_sync::sync_set_folder,
            cmd_sync::sync_clear,
            cmd_sync::sync_now,
            trash::trash_undo,
            cmd_biometric::biometric_status,
            cmd_biometric::biometric_enable,
            cmd_biometric::biometric_unlock,
            cmd_biometric::biometric_disable,
            window_state::window_config,
            window_state::window_set_always_on_top,
            window_state::window_reset,
            cmd_github::github_status,
            cmd_github::github_save_token,
            cmd_github::github_device_start,
            cmd_github::github_device_finish,
            cmd_github::github_device_cancel,
            cmd_github::github_disconnect,
            cmd_github_lists::github_lists,
            cmd_github_lists::github_section,
            cmd_github_lists::github_pr_checks,
            cmd_gitlab::gitlab_status,
            cmd_gitlab::gitlab_connect,
            cmd_gitlab::gitlab_disconnect,
            cmd_gitlab::gitlab_lists,
            cmd_gitlab::gitlab_section,
            cmd_gitlab::gitlab_mr_checks,
            cmd_forges::forges_opened_since,
            cmd_status::api_status,
            tray_live::badge_set_tasks,
        ])
        .on_window_event(|win, event| match event {
            // Closing hides the widget; quitting for real only from the tray.
            tauri::WindowEvent::CloseRequested { api, .. } => {
                api.prevent_close();
                let _ = win.hide();
            }
            tauri::WindowEvent::Moved(_) | tauri::WindowEvent::Resized(_) if win.label() == "main" => {
                window_state::record(win);
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("erro ao iniciar o Canto");
}

/// Global show/hide shortcut. Ctrl+Alt+Space (Cmd+Alt+Space on macOS).
fn toggle_shortcut() -> Shortcut {
    #[cfg(target_os = "macos")]
    let mods = Modifiers::SUPER | Modifiers::ALT;
    #[cfg(not(target_os = "macos"))]
    let mods = Modifiers::CONTROL | Modifiers::ALT;
    Shortcut::new(Some(mods), Code::Space)
}

pub const TOGGLE_SHORTCUT_LABEL: &str = if cfg!(target_os = "macos") {
    "Cmd+Alt+Espaco"
} else {
    "Ctrl+Alt+Espaco"
};

/// Global "join the next meeting" shortcut. Ctrl+Alt+M (Cmd+Alt+M on macOS); does nothing without
/// a cached next meeting (see `tray_live::join_next_meeting`).
fn join_shortcut() -> Shortcut {
    #[cfg(target_os = "macos")]
    let mods = Modifiers::SUPER | Modifiers::ALT;
    #[cfg(not(target_os = "macos"))]
    let mods = Modifiers::CONTROL | Modifiers::ALT;
    Shortcut::new(Some(mods), Code::KeyM)
}

pub const JOIN_SHORTCUT_LABEL: &str = if cfg!(target_os = "macos") { "Cmd+Alt+M" } else { "Ctrl+Alt+M" };

/// Global "strip clipboard formatting" shortcut. Ctrl+Alt+V (Cmd+Alt+V on macOS).
fn paste_plain_shortcut() -> Shortcut {
    #[cfg(target_os = "macos")]
    let mods = Modifiers::SUPER | Modifiers::ALT;
    #[cfg(not(target_os = "macos"))]
    let mods = Modifiers::CONTROL | Modifiers::ALT;
    Shortcut::new(Some(mods), Code::KeyV)
}

pub const PASTE_PLAIN_SHORTCUT_LABEL: &str = if cfg!(target_os = "macos") { "Cmd+Alt+V" } else { "Ctrl+Alt+V" };

fn register_toggle_shortcut(app: &tauri::AppHandle) -> tauri::Result<()> {
    let (toggle, join, paste_plain) = (toggle_shortcut(), join_shortcut(), paste_plain_shortcut());
    app.plugin(
        tauri_plugin_global_shortcut::Builder::new()
            .with_handler(move |app, shortcut, event| {
                if event.state != ShortcutState::Pressed {
                    return;
                }
                if shortcut == &toggle {
                    let _ = window::toggle(app);
                } else if shortcut == &join {
                    tray_live::join_next_meeting(app);
                } else if shortcut == &paste_plain {
                    paste_plain::strip_formatting(app);
                }
            })
            .build(),
    )?;
    // A shortcut already taken by another app must not bring down the widget: the tray still works.
    for (shortcut, label) in [
        (toggle_shortcut(), TOGGLE_SHORTCUT_LABEL),
        (join_shortcut(), JOIN_SHORTCUT_LABEL),
        (paste_plain_shortcut(), PASTE_PLAIN_SHORTCUT_LABEL),
    ] {
        if let Err(e) = app.global_shortcut().register(shortcut) {
            eprintln!("atalho global indisponivel ({label}): {e}");
        }
    }
    Ok(())
}

fn build_tray(app: &tauri::AppHandle) -> tauri::Result<()> {
    let toggle = MenuItem::with_id(
        app,
        "toggle",
        format!("Mostrar / esconder  ({TOGGLE_SHORTCUT_LABEL})"),
        true,
        None::<&str>,
    )?;
    let join = MenuItem::with_id(app, tray_live::JOIN_ITEM_ID, "Sem reunião com Meet em breve", false, None::<&str>)?;
    let lock = MenuItem::with_id(app, "lock", "Trancar cofre", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Sair", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&toggle, &join, &lock, &quit])?;
    app.manage(tray_live::JoinMenuItem(join));

    TrayIconBuilder::with_id("canto-tray")
        .icon(app.default_window_icon().cloned().unwrap())
        .tooltip("Canto")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "toggle" => {
                let _ = window::toggle(app);
            }
            tray_live::JOIN_ITEM_ID => tray_live::join_next_meeting(app),
            "lock" => {
                if let Some(state) = app.try_state::<AppState>() {
                    state.lock();
                }
            }
            "quit" => {
                if let Ok(dir) = app.path().app_data_dir() {
                    let _ = app.state::<window_state::WindowState>().save_if_dirty(&dir);
                }
                app.exit(0)
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let tauri::tray::TrayIconEvent::Click {
                button: tauri::tray::MouseButton::Left,
                button_state: tauri::tray::MouseButtonState::Up,
                ..
            } = event
            {
                let _ = window::toggle(tray.app_handle());
            }
        })
        .build(app)?;
    Ok(())
}
