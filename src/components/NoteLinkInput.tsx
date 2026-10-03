import { useState } from "react";
import type { Editor } from "@tiptap/react";
import { api } from "../lib/api";
import { isHttpUrl } from "../lib/noteSchema";
import { MOD_KEY } from "../lib/platform";
import { t } from "../i18n";

/** Sets, edits or removes the link at the selection; only http(s) is accepted, like every link Canto opens. */
export default function NoteLinkInput({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const current = String(editor.getAttributes("link").href ?? "");
  const [url, setUrl] = useState(current);
  const [invalid, setInvalid] = useState(false);

  function apply() {
    const href = url.trim();
    if (!href) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      onClose();
      return;
    }
    if (!isHttpUrl(href)) {
      setInvalid(true);
      return;
    }
    const chain = editor.chain().focus().extendMarkRange("link");
    // With nothing selected the address itself becomes the link text, like pasting a bare URL.
    if (editor.state.selection.empty && !editor.isActive("link")) chain.insertContent({ type: "text", text: href, marks: [{ type: "link", attrs: { href } }] }).run();
    else chain.setLink({ href }).run();
    onClose();
  }

  return (
    <div className="flex flex-wrap items-center gap-1 text-xs">
      <input
        autoFocus
        type="url"
        value={url}
        aria-label={t("notes.linkUrl")}
        aria-invalid={invalid}
        placeholder="https://"
        title={t("notes.linkHint", { mod: MOD_KEY })}
        onChange={(e) => {
          setUrl(e.target.value);
          setInvalid(false);
        }}
        onKeyDown={(e) => {
          // Enter and Esc belong to this field here, not to the note form (save / cancel the whole note).
          if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            apply();
          } else if (e.key === "Escape") {
            e.stopPropagation();
            editor.commands.focus();
            onClose();
          }
        }}
        className="min-w-0 flex-1 canto-field !rounded-md px-2 py-1"
      />
      <button type="button" onClick={apply} className="min-h-[24px] rounded bg-edge px-2 text-fg">
        {t("notes.linkApply")}
      </button>
      {current && (
        <>
          {isHttpUrl(current) && (
            <button type="button" onClick={() => void api.openLink(current)} className="min-h-[24px] px-1 text-muted canto-hit rounded-md px-1.5 hover:bg-hover hover:text-fg active:bg-active">
              {t("notes.linkOpen")}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
              onClose();
            }}
            className="min-h-[24px] px-1 text-muted hover:text-danger"
          >
            {t("notes.linkRemove")}
          </button>
        </>
      )}
      {invalid && (
        <span role="alert" className="w-full text-danger">
          {t("notes.linkInvalid")}
        </span>
      )}
    </div>
  );
}
