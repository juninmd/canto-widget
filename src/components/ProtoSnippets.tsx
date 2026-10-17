import { useState } from "react";
import { t } from "../i18n";
import { SNIPPETS } from "../lib/protos";
import { useCopied } from "../lib/useCopied";
import ProtoFrame from "./ProtoFrame";

const LINK = "canto-hit min-h-[24px] shrink-0 rounded-md px-1.5 hover:bg-hover hover:text-fg active:bg-active";

/** Prototype: reusable snippets with one-click copy and a "paste into the focused app" shortcut. */
export default function ProtoSnippets() {
  const [term, setTerm] = useState("");
  const [copied, flash] = useCopied();
  const found = SNIPPETS.filter(
    (snippet) => snippet.title.toLowerCase().includes(term.toLowerCase()) || snippet.tags.some((tag) => tag.includes(term.toLowerCase())),
  );

  async function copy(id: string, body: string) {
    await navigator.clipboard.writeText(body);
    flash(id);
  }

  return (
    <ProtoFrame needs={t("protos.snippets.needs")}>
      <input
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        aria-label={t("protos.snippets.search")}
        placeholder={t("protos.snippets.search")}
        className="canto-box w-full rounded-md border border-edge bg-panel px-2 py-1 text-xs text-fg"
      />
      <ul className="flex flex-col gap-1">
        {found.map((snippet) => (
          <li key={snippet.id} data-proto-snippet={snippet.id} className="rounded-lg border border-edge/60 px-2 py-1.5">
            <div className="flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate text-xs font-semibold text-fg">{snippet.title}</span>
              <span className="shrink-0 text-[10px] text-faint">{t("protos.snippets.uses", { n: snippet.uses })}</span>
            </div>
            <code className="mt-1 block truncate rounded bg-edge/60 px-1.5 py-0.5 text-[10px] text-muted">{snippet.body}</code>
            <div className="mt-1 flex items-center gap-1.5">
              {snippet.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-edge px-1.5 text-[9px] text-muted">
                  {tag}
                </span>
              ))}
              <button type="button" onClick={() => void copy(snippet.id, snippet.body)} className={`${LINK} ml-auto`}>
                {copied === snippet.id ? t("protos.snippets.copy") + " ✓" : t("protos.snippets.copy")}
              </button>
              <button type="button" className={`${LINK} text-faint`} title={t("protos.snippets.paste")}>
                {t("protos.snippets.paste")}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </ProtoFrame>
  );
}
