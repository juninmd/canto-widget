pub mod calendar;
pub mod clipboard;
pub mod cmd_drive;
pub mod cmd_extras;
pub mod commands;
pub mod crypto;
pub mod drive;
pub mod error;
pub mod meet;
pub mod model;
pub mod oauth;
pub mod store;
pub mod transcripts;
pub mod vault;
pub mod window;

use tauri::menu::{Menu, MenuItem};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};
use tauri::tray::TrayIconBuilder;
use tauri::Manager;

use crate::vault::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .setup(|app| {
            register_toggle_shortcut(app.handle())?;
            let dir = app.path().app_data_dir()?;
            std::fs::create_dir_all(&dir)?;
            app.manage(AppState::new(dir));
            cmd_extras::watch_clipboard(app.handle().clone());
            build_tray(app.handle())?;

            if let Some(win) = app.get_webview_window("main") {
                window::anchor_bottom_right(&win)?;
                win.show()?;
                win.set_focus()?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::vault_status,
            commands::vault_create,
            commands::vault_unlock,
            commands::vault_lock,
            commands::tasks_for_day,
            commands::task_add,
            commands::task_toggle,
            commands::task_rename,
            commands::tasks_carry_over,
            commands::notes_search,
            commands::note_save,
            commands::item_delete,
            cmd_drive::drive_status,
            cmd_drive::drive_configure,
            cmd_drive::drive_disconnect,
            cmd_drive::drive_connect,
            cmd_drive::drive_sync,
            cmd_extras::clip_list,
            cmd_extras::clip_copy,
            cmd_extras::clip_pin,
            cmd_extras::clip_delete,
            cmd_extras::clip_clear,
            cmd_extras::transcripts_dir,
            cmd_extras::transcripts_set_dir,
            cmd_extras::transcripts_list,
            cmd_extras::transcript_read,
            cmd_extras::agenda_today,
            cmd_extras::alerta_abrir,
            cmd_extras::alerta_payload,
            cmd_extras::alerta_fechar,
            cmd_extras::abrir_link,
        ])
        .on_window_event(|win, event| {
            // Fechar esconde o widget; sair de verdade so pela bandeja.
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = win.hide();
            }
        })
        .run(tauri::generate_context!())
        .expect("erro ao iniciar o Canto");
}

/// Atalho global de mostrar/esconder. Ctrl+Alt+Espaco (Cmd+Alt+Espaco no macOS).
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

fn register_toggle_shortcut(app: &tauri::AppHandle) -> tauri::Result<()> {
    let wanted = toggle_shortcut();
    app.plugin(
        tauri_plugin_global_shortcut::Builder::new()
            .with_handler(move |app, shortcut, event| {
                if event.state == ShortcutState::Pressed && shortcut == &wanted {
                    let _ = window::toggle(app);
                }
            })
            .build(),
    )?;
    // Atalho ja tomado por outro app nao derruba o widget: a bandeja continua servindo.
    if let Err(e) = app.global_shortcut().register(toggle_shortcut()) {
        eprintln!("atalho global indisponivel ({TOGGLE_SHORTCUT_LABEL}): {e}");
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
    let lock = MenuItem::with_id(app, "lock", "Trancar cofre", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Sair", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&toggle, &lock, &quit])?;

    TrayIconBuilder::with_id("canto-tray")
        .icon(app.default_window_icon().cloned().unwrap())
        .tooltip("Canto")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "toggle" => {
                let _ = window::toggle(app);
            }
            "lock" => {
                if let Some(state) = app.try_state::<AppState>() {
                    state.lock();
                }
            }
            "quit" => app.exit(0),
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
