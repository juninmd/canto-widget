import { t } from "../../i18n";
import { waitLabel } from "./reviewRadar";
import type { NextAction } from "./forgeNext";

type Props = { next: NextAction; onOpen: () => void };

/** One card that says where to start, so the lists below can be read in any order. */
export default function ForgeNextCard({ next, onOpen }: Props) {
  const { item, reason, hours } = next;
  return (
    <div className={`flex items-center gap-2.5 rounded-xl border p-2.5 ${reason === "mine" ? "border-danger/40 bg-danger/10" : "border-accent/40 bg-accent/10"}`}>
      <span className="min-w-0 flex-1">
        <span className="block text-[10.5px] font-medium text-muted">{t("forge.next.title")}</span>
        <span className="line-clamp-1 block text-xs font-semibold text-fg">{item.title}</span>
        <span className="block text-[11px] text-muted">{reason === "mine" ? t("forge.next.mine") : t("forge.next.review", { wait: waitLabel(hours) })}</span>
      </span>
      <button type="button" onClick={onOpen} aria-label={t("forge.next.openOf", { title: item.title })} className="canto-hit shrink-0 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-on-accent hover:opacity-90">
        {t("forge.next.open")}
      </button>
    </div>
  );
}
