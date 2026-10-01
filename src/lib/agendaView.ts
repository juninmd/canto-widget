const KEY = "canto.agendaView";

export type AgendaView = "list" | "day" | "meetings";

/** The list stays the default: it is what the agenda always was. */
export const readView = (): AgendaView => {
  const saved = localStorage.getItem(KEY);
  return saved === "day" || saved === "meetings" ? saved : "list";
};

export const saveView = (view: AgendaView) => localStorage.setItem(KEY, view);
