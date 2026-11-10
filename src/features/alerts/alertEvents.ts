/** Events between the pop-up window and the widget window; they live apart so the widget needn't load the pop-up. */
export const TASKS_CHANGED_EVENT = "canto://tasks-changed";
export const OPEN_TAB_EVENT = "canto://open-tab";
/** Sent to the capture window each time the shortcut opens it, so it starts empty and focused. */
export const CAPTURE_EVENT = "canto://capture";
