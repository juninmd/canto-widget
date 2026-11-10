import type { CSSProperties, ReactNode } from "react";
import { bytes, fixed, level, percent, pressure, rate, systemDisk, type Level } from "./system";
import type { SystemSnapshot } from "./systemTypes";
import { t } from "../../i18n";
import { Badge, Card, Foot, Ring, lastMinute } from "./SystemBits";
import SystemSpark from "./SystemSpark";
import SystemAlerts from "./SystemAlerts";
import SystemHealth from "./SystemHealth";
import { SubIcon } from "./SystemIcons";
import CountUp from "../../components/CountUp";
import type { SystemSub } from "./SystemTab";

const PRESSURE_DOT = { normal: "bg-ok", elevated: "bg-warn", high: "bg-danger" };
const LEVEL_NUM: Record<Level, string> = { ok: "text-fg", warn: "text-warn", danger: "text-danger" };

type GaugeProps = {
  sub: SystemSub;
  title: string;
  value: number | null;
  lvl?: Level;
  index: number;
  detail: ReactNode;
  extra?: ReactNode;
  onOpen: (sub: SystemSub) => void;
};

/** A tile of the overview: icon and name, a ring with the share, one line under it; the whole tile opens the sub-tab. */
function Gauge({ sub, title, value, lvl = "ok", index, detail, extra, onOpen }: GaugeProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(sub)}
      data-system-gauge={sub}
      style={{ "--i": index } as CSSProperties}
      className={`group wx-glass wx-rise canto-hit canto-raise flex min-w-0 flex-col gap-2 p-3 text-left hover:border-line/60 hover:bg-hover/40 ${lvl === "danger" ? "border-danger/40" : lvl === "warn" ? "border-warn/35" : ""}`}
    >
      <span className="flex items-center gap-2 text-[12px] font-semibold text-fg">
        <Badge icon={<SubIcon sub={sub} />} level={lvl} />
        <span className="min-w-0 flex-1 truncate">{title}</span>
        <span aria-hidden="true" className="text-faint transition-transform group-hover:translate-x-0.5">
          ›
        </span>
      </span>
      <span className="flex items-center gap-3">
        <Ring value={value ?? 0} level={lvl} size={58} label={title}>
          <span className={`text-[17px] font-semibold leading-none ${LEVEL_NUM[lvl]}`}>{value === null ? "–" : <CountUp value={value} format={(n) => fixed(n)} />}</span>
          {value !== null && <span className="text-[9px] text-muted">%</span>}
        </Ring>
        <span className="min-w-0 flex-1 text-[10.5px] leading-snug text-muted">{extra}</span>
      </span>
      <span className="truncate text-[10.5px] text-muted">{detail}</span>
    </button>
  );
}

/** A health line, then every part of the machine as a gauge tile; network gets the live curve and the alerts close the list. */
export default function SystemOverview({
  snap,
  onOpen,
  alertsOpen,
  onAlertsOpen,
}: {
  snap: SystemSnapshot;
  onOpen: (sub: SystemSub) => void;
  alertsOpen: boolean;
  onAlertsOpen: (open: boolean) => void;
}) {
  const mem = percent(snap.memory.used, snap.memory.total);
  const disk = systemDisk(snap.disks);
  const diskUsed = disk ? percent(disk.total - disk.available, disk.total) : null;
  const gpu = snap.gpus[0];
  const p = pressure(mem);
  const b = snap.battery;
  return (
    <div className="flex flex-col gap-2" data-system-overview>
      <SystemHealth snap={snap} onOpen={onOpen} />
      <div className="grid grid-cols-2 gap-2">
        <Gauge
          sub="cpu"
          index={1}
          title={t("system.sub.cpu")}
          value={snap.cpu.usage}
          lvl={level(snap.cpu.usage, 80, 95)}
          onOpen={onOpen}
          extra={
            <>
              <span className="block">{t("system.cpu.cores", { n: snap.cpu.cores })}</span>
              {snap.cpu.temp_c !== null && <span className={`block ${snap.cpu.temp_c >= 85 ? "text-danger" : ""}`}>{`${fixed(snap.cpu.temp_c)} °C`}</span>}
            </>
          }
          detail={snap.cpu.brand}
        />
        <Gauge
          sub="memory"
          index={2}
          title={t("system.sub.memory")}
          value={mem}
          lvl={level(mem, 90, 95)}
          onOpen={onOpen}
          extra={
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${PRESSURE_DOT[p]}`} />
              {t(`system.memory.pressure.${p}`)}
            </span>
          }
          detail={t("system.memory.used", { used: bytes(snap.memory.used), total: bytes(snap.memory.total) })}
        />
        {disk && diskUsed !== null && (
          <Gauge
            sub="disk"
            index={3}
            title={t("system.sub.disk")}
            value={diskUsed}
            lvl={level(diskUsed, 90, 95)}
            onOpen={onOpen}
            extra={<span className="block truncate">{disk.system ? t("system.disk.system") : disk.mount}</span>}
            detail={t("system.disk.free", { free: bytes(disk.available), total: bytes(disk.total) })}
          />
        )}
        {gpu ? (
          <Gauge
            sub="gpu"
            index={4}
            title={t("system.sub.gpu")}
            value={gpu.usage}
            lvl={gpu.usage !== null ? level(gpu.usage, 85, 97) : "ok"}
            onOpen={onOpen}
            extra={gpu.mem_used !== null ? <span className="block">{t("system.gpu.vram", { n: bytes(gpu.mem_used) })}</span> : undefined}
            detail={gpu.name}
          />
        ) : (
          <Gauge
            sub="power"
            index={4}
            title={t("system.sub.power")}
            value={b ? b.percent : null}
            lvl={b && b.state === "discharging" && b.percent <= 20 ? "danger" : "ok"}
            onOpen={onOpen}
            detail={b ? t(`system.power.state.${b.state}`) : t("system.power.none").split(":")[0]}
          />
        )}
      </div>
      <Card
        index={5}
        icon={<SubIcon sub="network" />}
        title={t("system.sub.network")}
        onOpen={() => onOpen("network")}
        aside={
          <span className="flex shrink-0 items-baseline gap-2 text-[12.5px] font-semibold tabular-nums">
            <span className="text-accent-text">↓ {rate(snap.network.down_bps)}</span>
            <span className="text-cat-meet">↑ {rate(snap.network.up_bps)}</span>
          </span>
        }
      >
        <SystemSpark values={snap.history.net_down} under={snap.history.net_up} height={34} />
        <Foot left={snap.interface || t("system.net.none")} right={lastMinute()} />
      </Card>
      <SystemAlerts index={6} open={alertsOpen} onOpen={onAlertsOpen} />
    </div>
  );
}
