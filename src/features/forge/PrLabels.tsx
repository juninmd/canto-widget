import { useEffect, useState } from "react";
import { errText, type PrLabel } from "../../lib/api";
import { t } from "../../i18n";
import type { PrBackend } from "./prApi";

/** A label as the forge colors it: the tint is the label's own color, the text stays readable on any theme. */
export function LabelChip({ label }: { label: PrLabel }) {
  const c = label.color ? `#${label.color}` : "var(--faint)";
  return (
    <span className="inline-flex items-center gap-1 rounded-full border px-2 text-[10.5px] font-medium leading-[18px] text-fg" style={{ borderColor: `color-mix(in srgb, ${c} 45%, transparent)`, background: `color-mix(in srgb, ${c} 16%, transparent)` }}>
      <span aria-hidden="true" className="size-1.5 rounded-full" style={{ background: c }} />
      {label.name}
    </span>
  );
}

/** The labels of the PR/MR and a picker over the repository's: each toggle writes at once and the view reloads. */
export default function PrLabels({ back, labels, onChanged }: { back: PrBackend; labels: PrLabel[]; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [all, setAll] = useState<PrLabel[] | null>(null);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState("");
  useEffect(() => {
    if (!open || all) return;
    let live = true;
    back.repoLabels().then(
      (l) => live && setAll(l),
      (e) => live && (setFailed(errText(e)), setAll([])),
    );
    return () => {
      live = false;
    };
  }, [open, all, back]);

  async function toggle(name: string, on: boolean) {
    setBusy(true);
    setFailed("");
    try {
      await back.act(on ? { kind: "label_remove", name } : { kind: "label_add", name });
      onChanged();
    } catch (e) {
      setFailed(errText(e));
    } finally {
      setBusy(false);
    }
  }

  const names = new Set(labels.map((l) => l.name));
  const shown = (all ?? []).filter((l) => l.name.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-1.5">
        {labels.length === 0 && <span className="text-[11px] text-faint">{t("forge.pr.labelsNone")}</span>}
        {labels.map((l) => (
          <LabelChip key={l.name} label={l} />
        ))}
        <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="canto-hit ml-auto min-h-[24px] rounded-md border border-edge px-2 text-[11px] text-muted hover:bg-hover hover:text-fg">
          {t("forge.pr.labelsEdit")}
        </button>
      </div>
      {open && (
        <div role="group" aria-label={t("forge.pr.labels")} className="absolute right-0 z-20 mt-1 w-60 space-y-1 rounded-xl border border-edge bg-panel p-1.5 shadow-2xl">
          <input value={q} onChange={(e) => setQ(e.target.value)} aria-label={t("forge.pr.labelsFilter")} placeholder={t("forge.pr.labelsFilter")} className="canto-field w-full px-2 py-1 text-xs" />
          <ul className="m-0 max-h-48 list-none overflow-y-auto p-0">
            {all === null && <li className="px-2 py-1 text-[11px] text-faint">{t("forge.pr.labelsLoading")}</li>}
            {all !== null && shown.length === 0 && <li className="px-2 py-1 text-[11px] text-faint">{t("forge.pr.labelsEmpty")}</li>}
            {shown.map((l) => (
              <li key={l.name}>
                <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-xs hover:bg-hover">
                  <input type="checkbox" disabled={busy} checked={names.has(l.name)} onChange={() => void toggle(l.name, names.has(l.name))} />
                  <LabelChip label={l} />
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
      {failed && (
        <p role="alert" className="m-0 mt-1 text-[11px] text-danger">
          {failed}
        </p>
      )}
    </div>
  );
}
