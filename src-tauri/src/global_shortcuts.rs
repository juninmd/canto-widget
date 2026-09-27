use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

use crate::{paste_plain, tray_live, window};

fn toggle_shortcut() -> Shortcut {
    #[cfg(target_os = "macos")]
    let mods = Modifiers::SUPER | Modifiers::SHIFT;
    #[cfg(not(target_os = "macos"))]
    let mods = Modifiers::CONTROL | Modifiers::ALT;
    Shortcut::new(Some(mods), Code::Space)
}

pub const TOGGLE_SHORTCUT_LABEL: &str =
    if cfg!(target_os = "macos") { "Cmd+Shift+Espaço" } else { "Ctrl+Alt+Espaço" };

fn join_shortcut() -> Shortcut {
    #[cfg(target_os = "macos")]
    let mods = Modifiers::SUPER | Modifiers::CONTROL;
    #[cfg(not(target_os = "macos"))]
    let mods = Modifiers::CONTROL | Modifiers::ALT;
    Shortcut::new(Some(mods), Code::KeyM)
}

fn join_fallback_shortcut() -> Shortcut {
    #[cfg(target_os = "macos")]
    let mods = Modifiers::SUPER | Modifiers::CONTROL | Modifiers::SHIFT;
    #[cfg(not(target_os = "macos"))]
    let mods = Modifiers::CONTROL | Modifiers::ALT | Modifiers::SHIFT;
    Shortcut::new(Some(mods), Code::KeyM)
}

const JOIN_LABEL: &str = if cfg!(target_os = "macos") { "Ctrl+Cmd+M" } else { "Ctrl+Alt+M" };
const JOIN_FALLBACK_LABEL: &str = if cfg!(target_os = "macos") { "Ctrl+Cmd+Shift+M" } else { "Ctrl+Alt+Shift+M" };

fn paste_plain_shortcut() -> Shortcut {
    #[cfg(target_os = "macos")]
    let mods = Modifiers::SUPER | Modifiers::CONTROL;
    #[cfg(not(target_os = "macos"))]
    let mods = Modifiers::CONTROL | Modifiers::ALT;
    Shortcut::new(Some(mods), Code::KeyV)
}

const PASTE_PLAIN_LABEL: &str = if cfg!(target_os = "macos") { "Ctrl+Cmd+V" } else { "Ctrl+Alt+V" };

fn register_with_fallback<E>(
    primary: Shortcut,
    fallback: Shortcut,
    mut register: impl FnMut(Shortcut) -> Result<(), E>,
) -> Result<Shortcut, (E, E)> {
    match register(primary) {
        Ok(()) => Ok(primary),
        Err(primary_error) => match register(fallback) {
            Ok(()) => Ok(fallback),
            Err(fallback_error) => Err((primary_error, fallback_error)),
        },
    }
}

pub fn register(app: &tauri::AppHandle) -> tauri::Result<()> {
    let (toggle, join, join_fallback, paste_plain) =
        (toggle_shortcut(), join_shortcut(), join_fallback_shortcut(), paste_plain_shortcut());
    app.plugin(
        tauri_plugin_global_shortcut::Builder::new()
            .with_handler(move |app, shortcut, event| {
                if event.state != ShortcutState::Pressed {
                    return;
                }
                if shortcut == &toggle {
                    let _ = window::toggle(app);
                } else if shortcut == &join || shortcut == &join_fallback {
                    tray_live::join_next_meeting(app);
                } else if shortcut == &paste_plain {
                    paste_plain::strip_formatting(app);
                }
            })
            .build(),
    )?;

    for (shortcut, label) in [(toggle_shortcut(), TOGGLE_SHORTCUT_LABEL), (paste_plain_shortcut(), PASTE_PLAIN_LABEL)] {
        if let Err(error) = app.global_shortcut().register(shortcut) {
            eprintln!("atalho global indisponivel ({label}): {error}");
        }
    }

    if let Err((primary, fallback)) = register_with_fallback(join_shortcut(), join_fallback_shortcut(), |shortcut| {
        app.global_shortcut().register(shortcut)
    }) {
        eprintln!("atalhos de reuniao indisponiveis ({JOIN_LABEL}: {primary}; {JOIN_FALLBACK_LABEL}: {fallback})");
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn meeting_shortcut_uses_fallback_when_primary_is_taken() {
        let primary = join_shortcut();
        let fallback = join_fallback_shortcut();
        let mut attempts = Vec::new();

        let selected = register_with_fallback(primary, fallback, |shortcut| {
            attempts.push(shortcut);
            if shortcut == primary {
                Err("ocupado")
            } else {
                Ok(())
            }
        });

        assert_eq!(selected, Ok(fallback));
        assert_eq!(attempts, vec![primary, fallback]);
    }

    #[test]
    fn meeting_shortcut_does_not_reserve_fallback_when_primary_works() {
        let primary = join_shortcut();
        let fallback = join_fallback_shortcut();
        let mut attempts = Vec::new();

        let selected = register_with_fallback(primary, fallback, |shortcut| {
            attempts.push(shortcut);
            Ok::<_, ()>(())
        });

        assert_eq!(selected, Ok(primary));
        assert_eq!(attempts, vec![primary]);
    }
}
