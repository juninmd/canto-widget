import { useCallback, useEffect, useState } from "react";
import type { Draft } from "../components/NoteEditor";

export const EMPTY_DRAFT: Draft = { id: undefined, title: "", body: "", tags: "", link: null };

export type NoteDraft = {
  draft: Draft;
  editing: boolean;
  setDraft: (d: Draft) => void;
  open: (d?: Draft) => void;
  close: () => void;
};

/**
 * The note being edited, owned above the Notes tab so switching tabs doesn't unmount it away.
 * Dropped when `active` turns false: a locked vault must not leave note text behind in the UI.
 */
export function useNoteDraft(active = true): NoteDraft {
  const [state, setState] = useState({ draft: EMPTY_DRAFT, editing: false });
  const setDraft = useCallback((draft: Draft) => setState((s) => ({ ...s, draft })), []);
  const open = useCallback((draft: Draft = EMPTY_DRAFT) => setState({ draft, editing: true }), []);
  const close = useCallback(() => setState({ draft: EMPTY_DRAFT, editing: false }), []);
  useEffect(() => {
    if (!active) close();
  }, [active, close]);
  return { ...state, setDraft, open, close };
}
