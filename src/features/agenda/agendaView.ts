const KEY = "canto.agendaView";

export type AgendaView = "today" | "meetings";

/** The old list and day views merged into one; whoever had either saved lands on it. */
export const readView = (): AgendaView => (localStorage.getItem(KEY) === "meetings" ? "meetings" : "today");

export const saveView = (view: AgendaView) => localStorage.setItem(KEY, view);
