import { average, fixed, level, peak, type AppSort } from "../lib/system";
import type { SystemSnapshot } from "../lib/systemTypes";
import { t } from "../i18n";
import { Big, Card, Foot, Stat, lastMinute } from "./SystemBits";
import SystemSpark from "./SystemSpark";
import SystemApps from "./SystemApps";

/** Usage and temperature over the last minute, the clock, the average and peak, and the apps that use it most. */
export default function SystemCpu({ snap, sort, onSort }: { snap: SystemSnapshot; sort: AppSort; onSort: (by: AppSort) => void }) {
  const temp = snap.cpu.temp_c;
  return (
    <div className="flex flex-col gap-2" data-system-cpu>
      <Card index={0} title={t("system.cpu.usage")} aside={<Big value={fixed(snap.cpu.usage)} unit="%" level={level(snap.cpu.usage, 80, 95)} />}>
        <SystemSpark values={snap.history.cpu} max={100} height={44} label={t("system.cpu.usage")} />
        <Foot left={snap.cpu.brand} right={t("system.cpu.cores", { n: snap.cpu.cores })} />
      </Card>
      <Card index={1} title={t("system.cpu.temp")} aside={temp !== null ? <Big value={fixed(temp)} unit="°C" level={level(temp, 85, 95)} /> : undefined}>
        {temp !== null ? (
          <SystemSpark values={snap.history.cpu_temp} max={110} height={30} tone="var(--color-warn)" />
        ) : (
          <p className="text-[11px] leading-snug text-muted">{t("system.cpu.noTemp")}</p>
        )}
      </Card>
      <div className="grid grid-cols-3 gap-2">
        <Stat index={2} label={t("system.cpu.freq")} value={fixed(snap.cpu.freq_mhz / 1000, 1)} unit="GHz" />
        <Stat index={2} label={t("system.cpu.avg")} value={fixed(average(snap.history.cpu))} unit="%" />
        <Stat index={2} label={t("system.cpu.peak")} value={fixed(peak(snap.history.cpu))} unit="%" />
      </div>
      <SystemApps apps={snap.apps} by={sort} onSort={onSort} />
      <span className="sr-only">{lastMinute()}</span>
    </div>
  );
}
