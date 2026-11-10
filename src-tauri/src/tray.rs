//! Tray icon, its menu and the window events that keep the widget alive in it.
#![cfg(desktop)]
use tauri::menu::{Menu, MenuItem};
use tauri::tray::TrayIconBuilder;
use tauri::Manager;

use crate::*;

pub fn on_window_event(win: &tauri::Window, event: &tauri::WindowEvent) {
    match event {
        // Closing hides the widget; quitting for real only from the tray.
        tauri::WindowEvent::CloseRequested { api, .. } => {
            api.prevent_close();
            let _ = win.hide();
            let _ = tauri::Emitter::emit_to(win, win.label(), window::SHOWN_EVENT, false);
        }
        // Quick capture is a transient pop-up: left behind on top of other apps it covers what is under it.
        tauri::WindowEvent::Focused(false) if win.label() == capture::CAPTURE_WINDOW => {
            let _ = win.hide();
        }
        tauri::WindowEvent::Moved(_) | tauri::WindowEvent::Resized(_) if win.label() == "main" => {
            window::state::record(win);
        }
        _ => {}
    }
}

pub fn build(app: &tauri::AppHandle) -> tauri::Result<()> {
    let toggle = MenuItem::with_id(app, "toggle", lang::toggle_label(), true, None::<&str>)?;
    let join = MenuItem::with_id(app, tray_live::JOIN_ITEM_ID, tray_live::no_meeting_label(), false, None::<&str>)?;
    let dnd_label = do_not_disturb::tray_label(do_not_disturb::current(app));
    let dnd = MenuItem::with_id(app, do_not_disturb::TRAY_ITEM_ID, dnd_label, true, None::<&str>)?;
    let mini = MenuItem::with_id(app, "mini", lang::tr("Modo mini", "Mini mode"), true, None::<&str>)?;
    let lock = MenuItem::with_id(app, "lock", lang::tr("Trancar cofre", "Lock vault"), true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", lang::tr("Sair", "Quit"), true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&toggle, &mini, &join, &dnd, &lock, &quit])?;
    app.manage(tray_live::JoinMenuItem(join));
    app.manage(do_not_disturb::DndMenuItem(dnd));
    app.manage(lang::TrayLabels { toggle, mini, lock, quit });

    TrayIconBuilder::with_id("canto-tray")
        .icon(app.default_window_icon().cloned().unwrap())
        .tooltip("Canto")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "toggle" => {
                let _ = window::toggle(app);
            }
            "mini" => {
                let _ = window::mode::toggle_mini(app);
            }
            tray_live::JOIN_ITEM_ID => tray_live::join_next_meeting(app),
            do_not_disturb::TRAY_ITEM_ID => do_not_disturb::tray_toggle(app),
            "lock" => {
                background::lock_from_tray(app);
            }
            "quit" => {
                if let Ok(dir) = app.path().app_data_dir() {
                    let _ = app.state::<window::state::WindowState>().save_if_dirty(&dir);
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
