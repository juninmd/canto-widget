import { useEditorState, type Editor } from "@tiptap/react";
import { MOD_KEY } from "../lib/platform";
import { t, type MessageKey } from "../i18n";

type Props = {
  editor: Editor;
  raw: boolean;
  attaching: boolean;
  linking: boolean;
  onRaw: () => void;
  onLink: () => void;
  onAttach: () => void;
};

type Tool = { key: string; label: MessageKey; glyph: string; keys?: string; run: (e: Editor) => void; active: (e: Editor) => boolean };

const TOOLS: Tool[] = [
  { key: "bold", label: "notes.fmtBold", glyph: "B", keys: "B", run: (e) => e.chain().focus().toggleBold().run(), active: (e) => e.isActive("bold") },
  { key: "italic", label: "notes.fmtItalic", glyph: "I", keys: "I", run: (e) => e.chain().focus().toggleItalic().run(), active: (e) => e.isActive("italic") },
  { key: "code", label: "notes.fmtCode", glyph: "`", keys: "E", run: (e) => e.chain().focus().toggleCode().run(), active: (e) => e.isActive("code") },
  {
    key: "heading",
    label: "notes.fmtHeading",
    glyph: "H",
    run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
    active: (e) => e.isActive("heading"),
  },
  { key: "bullet", label: "notes.fmtBullet", glyph: "•", run: (e) => e.chain().focus().toggleBulletList().run(), active: (e) => e.isActive("bulletList") },
  { key: "ordered", label: "notes.fmtOrdered", glyph: "1.", run: (e) => e.chain().focus().toggleOrderedList().run(), active: (e) => e.isActive("orderedList") },
  { key: "task", label: "notes.fmtTask", glyph: "☑", run: (e) => e.chain().focus().toggleTaskList().run(), active: (e) => e.isActive("taskList") },
  { key: "codeBlock", label: "notes.fmtCodeBlock", glyph: "{}", run: (e) => e.chain().focus().toggleCodeBlock().run(), active: (e) => e.isActive("codeBlock") },
];

const BTN = "grid h-7 min-w-7 place-items-center rounded px-1 text-xs disabled:opacity-40";
const on = (pressed: boolean) => (pressed ? "bg-edge text-accent-text" : "text-muted hover:bg-edge hover:text-fg");

/** Compact formatting bar sized for the ~420px widget; every button mirrors a shortcut or markdown input rule. */
export default function NoteToolbar({ editor, raw, attaching, linking, onRaw, onLink, onAttach }: Props) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }): Record<string, boolean> => ({
      ...Object.fromEntries(TOOLS.map((tool) => [tool.key, tool.active(e)])),
      link: e.isActive("link"),
    }),
  });
  return (
    <div role="toolbar" aria-label={t("notes.toolbar")} className="flex flex-wrap items-center gap-0.5 rounded-lg border border-line bg-ink p-0.5">
      {TOOLS.map((tool) => (
        <button
          key={tool.key}
          type="button"
          disabled={raw}
          aria-label={t(tool.label)}
          aria-pressed={!raw && !!state[tool.key]}
          title={tool.keys ? `${t(tool.label)} (${MOD_KEY}+${tool.keys})` : t(tool.label)}
          // mousedown would move focus out of the editor and lose the selection the command acts on.
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => tool.run(editor)}
          className={`${BTN} ${tool.key === "bold" ? "font-bold" : tool.key === "italic" ? "italic" : tool.key === "code" || tool.key === "codeBlock" ? "font-mono" : ""} ${on(!raw && !!state[tool.key])}`}
        >
          {tool.glyph}
        </button>
      ))}
      <button
        type="button"
        disabled={raw}
        aria-label={t("notes.fmtLink")}
        aria-pressed={!raw && (linking || state.link)}
        aria-expanded={linking}
        title={`${t("notes.fmtLink")} (${MOD_KEY}+K)`}
        onMouseDown={(e) => e.preventDefault()}
        onClick={onLink}
        className={`${BTN} ${on(!raw && (linking || state.link))}`}
      >
        🔗
      </button>
      <button
        type="button"
        disabled={attaching}
        aria-label={t("notes.imageAttach")}
        title={attaching ? t("notes.imageAttaching") : t("notes.imageAttach")}
        onMouseDown={(e) => e.preventDefault()}
        onClick={onAttach}
        className={`${BTN} ${on(false)}`}
      >
        🖼
      </button>
      <button
        type="button"
        aria-label={t("notes.fmtRaw")}
        aria-pressed={raw}
        title={t("notes.fmtRaw")}
        onClick={onRaw}
        className={`${BTN} ml-auto font-mono ${on(raw)}`}
      >
        MD
      </button>
    </div>
  );
}
