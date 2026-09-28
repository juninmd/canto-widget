import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, type Editor } from "@tiptap/react";
import { Placeholder } from "@tiptap/extensions";
import { TextSelection } from "@tiptap/pm/state";
import { api } from "./api";
import { t } from "../i18n";
import { CodeHighlight } from "./codeHighlightExt";
import { noteExtensions, isHttpUrl } from "./noteSchema";
import { parseNote, serializeNote } from "./noteMarkdown";

// Mirrors MAX_BODY_CHARS in cmd_notes.rs; the backend is the real guard.
export const MAX_BODY = 100_000;
// Serializing a 50 KB note takes tens of ms on WebKit; doing it once typing pauses keeps keystrokes smooth.
const EMIT_DELAY_MS = 150;

type Options = {
  body: string;
  /** Hidden while the raw markdown textarea is shown: nothing is synced into the editor meanwhile. */
  active: boolean;
  onBody: (body: string) => void;
  onLinkShortcut: () => void;
  onImages: (files: File[]) => void;
};

/** Anchors in the editor never navigate the webview; Ctrl/Cmd+click opens http(s) through the validated command. */
function clickLink(event: MouseEvent): boolean {
  const anchor = (event.target as HTMLElement | null)?.closest?.("a");
  if (!anchor) return false;
  event.preventDefault();
  const href = anchor.getAttribute("href");
  if ((event.ctrlKey || event.metaKey) && isHttpUrl(href)) void api.openLink(href);
  return true;
}

function pastedImages(list: FileList | null | undefined): File[] {
  return Array.from(list ?? []).filter((f) => f.type.startsWith("image/"));
}

/** The TipTap editor for a note body kept in markdown: parsed once on open, serialized back as the user edits. */
export function useRichNote({ body, active, onBody, onLinkShortcut, onImages }: Options) {
  const emitted = useRef(body);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accepted = useRef<Editor["state"]["doc"] | null>(null);
  const handlers = useRef({ onBody, onLinkShortcut, onImages });
  handlers.current = { onBody, onLinkShortcut, onImages };
  const [tooLong, setTooLong] = useState(false);
  const flushRef = useRef<() => string>(() => emitted.current);
  // Parsed once: the options object is rebuilt every render, and a big note costs real time to parse.
  const [initial] = useState(() => parseNote(body));

  const editor = useEditor({
    injectCSS: false,
    immediatelyRender: true,
    shouldRerenderOnTransaction: false,
    content: initial,
    extensions: [
      ...noteExtensions(),
      CodeHighlight,
      Placeholder.configure({ placeholder: t("notes.bodyPlaceholder") }),
    ],
    editorProps: {
      attributes: { role: "textbox", "aria-multiline": "true", "aria-label": t("notes.bodyLabel"), class: "note-rich" },
      handleDOMEvents: { click: (_view, event) => clickLink(event) },
      handleKeyDown: (_view, event) => {
        if (!(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey || event.code !== "KeyK") return false;
        // Inside the note Mod+K means "link", so the app-wide global search must not see it too.
        event.stopPropagation();
        handlers.current.onLinkShortcut();
        return true;
      },
      handlePaste: (_view, event) => {
        const files = pastedImages(event.clipboardData?.files);
        if (files.length === 0) return false;
        handlers.current.onImages(files);
        return true;
      },
      handleDrop: (view, event) => {
        const files = pastedImages(event.dataTransfer?.files);
        if (files.length === 0) return false;
        const at = view.posAtCoords({ left: event.clientX, top: event.clientY });
        if (at) view.dispatch(view.state.tr.setSelection(TextSelection.near(view.state.doc.resolve(at.pos))));
        handlers.current.onImages(files);
        return true;
      },
    },
    onUpdate: () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => flushRef.current(), EMIT_DELAY_MS);
    },
  });

  /** Serializes now if an edit is pending; returns the body the draft should hold. */
  const flush = useCallback((): string => {
    if (timer.current) clearTimeout(timer.current);
    const pending = timer.current !== null;
    timer.current = null;
    if (!pending || !editor || editor.isDestroyed) return emitted.current;
    const markdown = serializeNote(editor.getJSON());
    if (markdown.length > MAX_BODY) {
      setTooLong(true);
      // Back to the last text that fit, without an undo step, like a textarea's maxLength refusing the input.
      const last = accepted.current ?? editor.schema.nodeFromJSON(parseNote(emitted.current));
      editor.view.dispatch(editor.state.tr.replaceWith(0, editor.state.doc.content.size, last.content).setMeta("addToHistory", false));
      return emitted.current;
    }
    setTooLong(false);
    accepted.current = editor.state.doc;
    if (markdown !== emitted.current) {
      emitted.current = markdown;
      handlers.current.onBody(markdown);
    }
    return markdown;
  }, [editor]);

  flushRef.current = flush;

  /** Drops an edit still waiting to be serialized (cancel): nothing should reach the draft after that. */
  const discard = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  useEffect(() => {
    if (!active || !editor || body === emitted.current) return;
    emitted.current = body;
    editor.commands.setContent(parseNote(body), { emitUpdate: false });
    accepted.current = editor.state.doc;
  }, [active, body, editor]);

  useEffect(() => () => void flush(), [flush]);

  return { editor, flush, discard, tooLong };
}
