import { bytes, fixed, level, percent, pressure, type AppSort } from "../lib/system";
import type { SystemSnapshot } from "../lib/systemTypes";
import { t } from "../i18n";
import { Big, Card, Foot, Meter } from "./SystemBits";
import SystemSpark from "./SystemSpark";
import SystemApps from "./SystemApps";

const PRESSURE_TEXT = { normal: "text-ok", elevated: "text-warn", high: "text-danger" };

/** How full memory is and how it got there, then who holds it. */
export default function SystemMemory({ snap, sort, onSort }: { snap: SystemSnapshot; sort: AppSort; onSort: (by: AppSort) => void }) {
  const mem = percent(snap.memory.used, snap.memory.total);
  const p = pressure(mem);
  return (
    <div className="flex flex-col gap-2" data-system-memory>
      <Card
        index={0}
        title={
          <>
            {t("system.sub.memory")}
            <span className={`ml-1.5 inline-flex items-center gap-1 text-[11px] font-normal ${PRESSURE_TEXT[p]}`}>
              <span aria-hidden="true">●</span>
              {t(`system.memory.pressure.${p}`)}
            </span>
          </>
        }
        aside={<Big value={fixed(mem)} unit="%" level={level(mem, 90, 95)} />}
      >
        <Meter value={mem} level={level(mem, 90, 95)} label={t("system.sub.memory")} />
        <SystemSpark values={snap.history.memory} max={100} height={30} />
        <Foot
          left={t("system.memory.used", { used: bytes(snap.memory.used), total: bytes(snap.memory.total) })}
          right={snap.memory.swap_total > 0 ? t("system.memory.swap", { used: bytes(snap.memory.swap_used), total: bytes(snap.memory.swap_total) }) : undefined}
        />
      </Card>
      <SystemApps apps={snap.apps} by={sort} onSort={onSort} />
    </div>
  );
}
