import { useRef, useState } from "react";
import { EditorContent } from "@tiptap/react";
import { MOD_KEY } from "../lib/platform";
import type { AgendaItem, NoteLink, Task } from "../lib/api";
import { LOCALE, t } from "../i18n";
import { attachImage, IMAGE_TYPES, imageFiles, insertAt, storeImage } from "../lib/noteImages";
import { safeImageId } from "../lib/noteImageNode";
import { MAX_BODY, useRichNote } from "../lib/useRichNote";
import NoteLinkInput from "./NoteLinkInput";
import NoteLinkRow from "./NoteLinkRow";
import NoteThumbs from "./NoteThumbs";
import NoteToolbar from "./NoteToolbar";

// Mirrors MAX_TITLE_CHARS in cmd_notes.rs; the backend is the real guard.
const MAX_TITLE = 300;

export type Draft = { id: string | undefined; title: string; body: string; tags: string; link: NoteLink | null };

type Props = {
  draft: Draft;
  tasks: Task[];
  agenda: AgendaItem[];
  onChange: (d: Draft) => void;
  /** Gets the draft with the body as it is right now, even if the last keystrokes weren't emitted yet. */
  onSave: (d: Draft) => void | Promise<void>;
  onCancel: () => void;
};

const FIELD = "rounded-lg border border-line bg-ink text-sm text-fg outline-none focus-within:border-accent focus:border-accent";

export default function NoteEditor({ draft, tasks, agenda, onChange, onSave, onCancel }: Props) {
  const [raw, setRaw] = useState(false);
  const [linking, setLinking] = useState(false);
  const [attaching, setAttaching] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const rawRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const latest = useRef(draft);
  latest.current = draft;
  const change = (d: Draft) => {
    latest.current = d;
    onChange(d);
  };

  const { editor, flush, discard, tooLong } = useRichNote({
    body: draft.body,
    active: !raw,
    onBody: (body) => change({ ...latest.current, body }),
    onLinkShortcut: () => setLinking(true),
    onImages: (files) => void attach(files),
  });

  async function attach(files: File[]) {
    if (files.length === 0) return;
    setImageError(null);
    setAttaching(true);
    let body = latest.current.body;
    let caret = rawRef.current?.selectionStart ?? body.length;
    try {
      for (const file of files) {
        if (raw) ({ body, caret } = insertAt(body, caret, await attachImage(file)));
        else {
          const id = safeImageId(await storeImage(file));
          if (id) editor.chain().focus().insertContent({ type: "cantoImage", attrs: { id } }).run();
        }
      }
    } catch (e) {
      setImageError(e instanceof Error ? e.message : String(e));
    } finally {
      setAttaching(false);
      // Images saved before a failure stay referenced, so they aren't left as orphans.
      if (raw && body !== latest.current.body) change({ ...latest.current, body });
      if (!raw) flush();
    }
  }

  function save() {
    const body = raw ? latest.current.body : flush();
    void onSave({ ...latest.current, body });
  }

  function cancel() {
    discard();
    onCancel();
  }

  function toggleRaw() {
    if (!raw) flush();
    setLinking(false);
    setRaw(!raw);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") cancel();
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          save();
        }
      }}
      className="flex h-full flex-col gap-2"
    >
      <input
        autoFocus
        value={draft.title}
        onChange={(e) => change({ ...latest.current, title: e.target.value })}
        placeholder={t("notes.titlePlaceholder")}
        maxLength={MAX_TITLE}
        className={`${FIELD} px-3 py-1.5`}
      />
      <NoteToolbar
        editor={editor}
        raw={raw}
        attaching={attaching}
        linking={linking}
        onRaw={toggleRaw}
        onLink={() => setLinking(!linking)}
        onAttach={() => fileRef.current?.click()}
      />
      {linking && !raw && <NoteLinkInput editor={editor} onClose={() => setLinking(false)} />}
      {raw && (
        <textarea
          ref={rawRef}
          autoFocus
          value={draft.body}
          aria-label={t("notes.rawLabel")}
          onPaste={(e) => {
            const files = imageFiles(e.clipboardData?.files);
            if (files.length === 0) return;
            e.preventDefault();
            void attach(files);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            const files = imageFiles(e.dataTransfer?.files);
            if (files.length === 0) return;
            e.preventDefault();
            void attach(files);
          }}
          onChange={(e) => change({ ...latest.current, body: e.target.value })}
          maxLength={MAX_BODY}
          className={`${FIELD} flex-1 resize-none px-3 py-2 font-mono text-xs`}
        />
      )}
      {/* Hidden, not unmounted, in raw mode: remounting would rebuild the ProseMirror view and lose its state. */}
      <EditorContent
        editor={editor}
        hidden={raw}
        className={`${FIELD} min-h-0 flex-1 cursor-text overflow-y-auto px-3 py-2 ${raw ? "hidden" : ""}`}
        onClick={() => editor.commands.focus()}
      />
      {raw && <NoteThumbs body={draft.body} />}
      <input
        ref={fileRef}
        type="file"
        accept={IMAGE_TYPES.join(",")}
        multiple
        hidden
        aria-label={t("notes.imageAttach")}
        onChange={(e) => {
          const files = imageFiles(e.target.files);
          e.target.value = "";
          void attach(files);
        }}
      />
      {(imageError || tooLong) && (
        <p role="alert" className="truncate text-xs text-danger">
          {imageError ?? t("notes.bodyTooLong", { max: MAX_BODY.toLocaleString(LOCALE) })}
        </p>
      )}
      <input
        value={draft.tags}
        onChange={(e) => change({ ...latest.current, tags: e.target.value })}
        placeholder={t("notes.tagsPlaceholder")}
        className="rounded-lg border border-line bg-ink px-3 py-1.5 text-xs text-muted outline-none focus:border-accent"
      />
      <NoteLinkRow link={draft.link} tasks={tasks} agenda={agenda} onLink={(link) => change({ ...latest.current, link })} />
      <div className="flex gap-2">
        <button type="submit" title={`${MOD_KEY}+Enter`} className="flex-1 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-on-accent">
          {t("notes.save")}
        </button>
        <button type="button" onClick={cancel} title="Esc" className="rounded-lg bg-edge px-3 py-1.5 text-sm text-fg">
          {t("notes.cancel")}
        </button>
      </div>
    </form>
  );
}
