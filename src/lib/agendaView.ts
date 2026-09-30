const KEY = "canto.agendaView";

export type AgendaView = "list" | "day";

/** The list stays the default: it is what the agenda always was. */
export const readView = (): AgendaView => (localStorage.getItem(KEY) === "day" ? "day" : "list");

export const saveView = (view: AgendaView) => localStorage.setItem(KEY, view);
