import type { ReactNode } from "react";
import type { ClipItem } from "../lib/api";
import { t } from "../i18n";

/** Pinned items first under "Fixados", the rest under "Recentes"; a group with nothing in it leaves no label. */
export default function ClipGroups({ items, card }: { items: ClipItem[]; card: (item: ClipItem) => ReactNode }) {
  const groups = [
    { id: "pinned", label: t("clipui.pinned"), items: items.filter((i) => i.pinned) },
    { id: "recent", label: t("clipui.recent"), items: items.filter((i) => !i.pinned) },
  ].filter((g) => g.items.length > 0);
  return (
    <>
      {groups.map((g) => (
        <section key={g.id} aria-labelledby={`clip-group-${g.id}`}>
          <h3 id={`clip-group-${g.id}`} className="mb-1 px-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-faint">
            {g.label}
          </h3>
          <ul className="space-y-1.5">{g.items.map(card)}</ul>
        </section>
      ))}
    </>
  );
}
