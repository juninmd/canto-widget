import { bytes, fixed, level, percent, pressure, rate, systemDisk } from "../lib/system";
import type { SystemSnapshot } from "../lib/systemTypes";
import { t } from "../i18n";
import { Big, Card, Foot, Meter, lastMinute } from "./SystemBits";
import SystemSpark from "./SystemSpark";
import SystemAlerts from "./SystemAlerts";
import type { SystemSub } from "./SystemTab";

const PRESSURE_DOT = { normal: "bg-ok", elevated: "bg-warn", high: "bg-danger" };

/** Every part of the machine on one card each, as a task manager's summary; each card opens its own sub-tab. */
export default function SystemOverview({ snap, onOpen }: { snap: SystemSnapshot; onOpen: (sub: SystemSub) => void }) {
  const mem = percent(snap.memory.used, snap.memory.total);
  const disk = systemDisk(snap.disks);
  const diskUsed = disk ? percent(disk.total - disk.available, disk.total) : 0;
  const gpu = snap.gpus[0];
  const p = pressure(mem);
  return (
    <div className="flex flex-col gap-2" data-system-overview>
      <div className="grid grid-cols-2 gap-2">
        <Card index={0} title={t("system.sub.cpu")} onOpen={() => onOpen("cpu")} aside={<Big value={fixed(snap.cpu.usage)} unit="%" level={level(snap.cpu.usage, 80, 95)} />}>
          <SystemSpark values={snap.history.cpu} max={100} height={30} />
          <Foot left={snap.cpu.brand} right={snap.cpu.temp_c !== null ? `${fixed(snap.cpu.temp_c)} °C` : undefined} />
        </Card>
        {gpu ? (
          <Card index={1} title={t("system.sub.gpu")} onOpen={() => onOpen("gpu")} aside={<Big value={gpu.usage !== null ? fixed(gpu.usage) : "–"} unit={gpu.usage !== null ? "%" : undefined} />}>
            <Meter value={gpu.mem_used && gpu.mem_total ? percent(gpu.mem_used, gpu.mem_total) : 0} />
            <Foot left={gpu.name} right={gpu.mem_used !== null ? bytes(gpu.mem_used) : undefined} />
          </Card>
        ) : (
          <Card index={1} title={t("system.sub.power")} onOpen={() => onOpen("power")} aside={<Big value={snap.battery ? fixed(snap.battery.percent) : "–"} unit={snap.battery ? "%" : undefined} />}>
            <Meter value={snap.battery?.percent ?? 0} level={snap.battery && snap.battery.percent <= 20 ? "danger" : "ok"} />
            <Foot left={snap.battery ? t(`system.power.state.${snap.battery.state}`) : t("system.power.none").split(":")[0]} />
          </Card>
        )}
      </div>
      <Card index={2} title={t("system.sub.memory")} onOpen={() => onOpen("memory")} aside={<Big value={fixed(mem)} unit="%" level={level(mem, 90, 95)} />}>
        <Meter value={mem} level={level(mem, 90, 95)} label={t("system.sub.memory")} />
        <Foot
          left={t("system.memory.used", { used: bytes(snap.memory.used), total: bytes(snap.memory.total) })}
          right={
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className={`size-1.5 rounded-full ${PRESSURE_DOT[p]}`} />
              {t(`system.memory.pressure.${p}`)}
            </span>
          }
        />
      </Card>
      {disk && (
        <Card
          index={3}
          title={
            <>
              {t("system.sub.disk")} <span className="font-normal text-muted">{disk.system ? t("system.disk.system") : disk.mount}</span>
            </>
          }
          onOpen={() => onOpen("disk")}
          aside={<Big value={fixed(diskUsed)} unit="%" level={level(diskUsed, 90, 95)} />}
        >
          <Meter value={diskUsed} level={level(diskUsed, 90, 95)} label={t("system.sub.disk")} />
          <Foot left={t("system.disk.free", { free: bytes(disk.available), total: bytes(disk.total) })} right={`${disk.mount}`} />
        </Card>
      )}
      <Card
        index={4}
        title={t("system.sub.network")}
        onOpen={() => onOpen("network")}
        aside={
          <span className="flex shrink-0 items-baseline gap-2 text-[13px] font-semibold tabular-nums">
            <span className="text-accent-text">↓ {rate(snap.network.down_bps)}</span>
            <span className="text-cat-meet">↑ {rate(snap.network.up_bps)}</span>
          </span>
        }
      >
        <SystemSpark values={snap.history.net_down} under={snap.history.net_up} height={30} />
        <Foot left={snap.interface || t("system.net.none")} right={lastMinute()} />
      </Card>
      <SystemAlerts index={5} />
    </div>
  );
}
