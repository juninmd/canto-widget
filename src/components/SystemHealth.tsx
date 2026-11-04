import type { CSSProperties } from "react";
import { fixed, issues, worst, type Issue, type SystemPart } from "../lib/system";
import type { SystemSnapshot } from "../lib/systemTypes";
import { t } from "../i18n";
import { PulseCheckIcon } from "./SystemIcons";
import type { SystemSub } from "./SystemTab";

const SUB: Record<SystemPart, SystemSub> = { cpu: "cpu", cpu_temp: "cpu", memory: "memory", disk: "disk", gpu: "gpu", battery: "power" };
const TONE = {
  ok: { box: "border-accent/30 from-accent/14", badge: "bg-accent/18 text-accent-text" },
  warn: { box: "border-warn/40 from-warn/16", badge: "bg-warn/20 text-warn" },
  danger: { box: "border-danger/45 from-danger/18", badge: "bg-danger/20 text-danger" },
};
const CHIP = { warn: "border-warn/40 bg-warn/10 text-warn hover:bg-warn/20", danger: "border-danger/45 bg-danger/10 text-danger hover:bg-danger/20" };

const issueText = (i: Issue) => t(`system.issue.${i.part}`, { v: fixed(i.value) });

/** One line on how the machine is doing: all calm, or each part that needs a look as a chip that opens its sub-tab. */
export default function SystemHealth({ snap, onOpen }: { snap: SystemSnapshot; onOpen: (sub: SystemSub) => void }) {
  const list = issues(snap);
  const lvl = worst(list);
  const tone = TONE[lvl];
  const title = list.length === 0 ? t("system.health.ok") : list.length === 1 ? t("system.health.one") : t("system.health.many", { n: list.length });
  return (
    <section
      data-system-health={lvl}
      style={{ "--i": 0 } as CSSProperties}
      className={`wx-rise flex flex-col gap-2 rounded-2xl border bg-gradient-to-br to-transparent p-3 transition-colors duration-500 ${tone.box}`}
    >
      <div className="flex items-center gap-2.5">
        <span aria-hidden="true" className={`relative grid size-8 shrink-0 place-items-center rounded-xl ${tone.badge} canto-pop`}>
          <PulseCheckIcon ok={lvl === "ok"} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold leading-tight text-fg">{title}</p>
          <p className="truncate text-[11px] text-muted">{list.length === 0 ? t("system.health.okHint") : t("system.health.hint")}</p>
        </div>
      </div>
      {list.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {list.map((i, n) => (
            <button
              key={i.part}
              type="button"
              onClick={() => onOpen(SUB[i.part])}
              style={{ "--i": n } as CSSProperties}
              className={`canto-hit canto-pop inline-flex min-h-6 items-center gap-1 rounded-full border px-2 text-[11px] font-medium transition-colors ${CHIP[i.level]}`}
            >
              <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
              {issueText(i)}
              <span aria-hidden="true">›</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
