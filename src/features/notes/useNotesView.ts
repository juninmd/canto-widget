import { useState } from "react";

export type NotesView = "list" | "grid";
export const NOTES_VIEW_KEY = "canto.notesView";

function read(): NotesView {
  try {
    return localStorage.getItem(NOTES_VIEW_KEY) === "grid" ? "grid" : "list";
  } catch {
    return "list";
  }
}

/** List or two-column grid, remembered between sessions; storage can be blocked, so it never throws. */
export function useNotesView(): [NotesView, (view: NotesView) => void] {
  const [view, setView] = useState<NotesView>(read);
  return [
    view,
    (next) => {
      setView(next);
      try {
        localStorage.setItem(NOTES_VIEW_KEY, next);
      } catch {
        // the choice just lasts until the tab closes
      }
    },
  ];
}
