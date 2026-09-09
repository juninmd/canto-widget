use tauri::{Emitter, LogicalPosition, Manager, WebviewWindow};

use crate::calendar::AgendaItem;

const MARGIN: f64 = 16.0;

/// Ancora a janela no canto inferior direito do monitor onde ela esta,
/// respeitando a area util (fora da barra de tarefas / dock).
pub fn anchor_bottom_right(win: &WebviewWindow) -> tauri::Result<()> {
    let Some(monitor) = win.current_monitor()?.or(win.primary_monitor()?) else {
        return Ok(());
    };
    let scale = monitor.scale_factor();
    let size = win.outer_size()?.to_logical::<f64>(scale);
    let area = monitor.work_area();
    let origin = area.position.to_logical::<f64>(scale);
    let bounds = area.size.to_logical::<f64>(scale);

    let x = origin.x + bounds.width - size.width - MARGIN;
    let y = origin.y + bounds.height - size.height - MARGIN;
    win.set_position(LogicalPosition::new(x, y))?;
    Ok(())
}

pub fn toggle(app: &tauri::AppHandle) -> tauri::Result<()> {
    let Some(win) = app.get_webview_window("main") else {
        return Ok(());
    };
    if win.is_visible()? {
        win.hide()?;
    } else {
        anchor_bottom_right(&win)?;
        win.show()?;
        win.set_focus()?;
    }
    Ok(())
}

pub const EVENTO_ALERTA: &str = "canto://alerta";

/// Aviso de reuniao: guarda o evento, traz o widget para a frente e avisa a UI.
/// Um overlay na propria janela evita depender de criar webview em runtime,
/// que se comporta de forma diferente em cada plataforma.
pub fn abrir_alerta(app: &tauri::AppHandle, evento: AgendaItem) -> tauri::Result<()> {
    if let Some(state) = app.try_state::<crate::vault::AppState>() {
        *state.alerta.lock().unwrap() = Some(evento);
    }
    if let Some(win) = app.get_webview_window("main") {
        anchor_bottom_right(&win)?;
        win.show()?;
        win.set_focus()?;
    }
    app.emit(EVENTO_ALERTA, ())?;
    Ok(())
}

pub fn fechar_alerta(app: &tauri::AppHandle) -> tauri::Result<()> {
    if let Some(state) = app.try_state::<crate::vault::AppState>() {
        *state.alerta.lock().unwrap() = None;
    }
    Ok(())
}
