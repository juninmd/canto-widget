import { useCallback, useEffect, useRef, useState } from "react";
import { api, errText, type SystemSnapshot } from "../../lib/api";
import { bytes, fixed, percent, rate, systemDisk, uptimeLabel, type AppSort } from "./system";
import { useCopied } from "../../lib/useCopied";
import { useWindowVisible } from "../../lib/useWindowVisible";
import { t } from "../../i18n";
import ErrorBanner from "../../components/ErrorBanner";
import Skeleton from "../../components/Skeleton";
import SubTabs from "../../components/SubTabs";
import SystemOverview from "./SystemOverview";
import SystemCpu from "./SystemCpu";
import SystemGpu from "./SystemGpu";
import SystemMemory from "./SystemMemory";
import SystemDisk from "./SystemDisk";
import SystemNetwork from "./SystemNetwork";
import SystemPower from "./SystemPower";
import ForgeMenu from "../forge/ForgeMenu";
import { MoreIcon } from "../../components/Icons";
import { SubIcon } from "./SystemIcons";

export type SystemSub = "overview" | "cpu" | "gpu" | "memory" | "disk" | "network" | "power";

const SUBS: SystemSub[] = ["overview", "cpu", "gpu", "memory", "disk", "network", "power"];
/** Same pace as `HISTORY` in `sysmon.rs`: 30 readings draw the last minute. */
export const POLL_MS = 2000;
const SUB_KEY = "canto.systemSub";

function savedSub(): SystemSub {
  try {
    const raw = localStorage.getItem(SUB_KEY);
    return SUBS.includes(raw as SystemSub) ? (raw as SystemSub) : "overview";
  } catch {
    return "overview";
  }
}

/** The reading as plain text, to paste in a chat or a ticket. */
export function summaryText(s: SystemSnapshot): string {
  const disk = systemDisk(s.disks);
  const lines = [
    `${t("system.sub.cpu")}: ${fixed(s.cpu.usage)}%${s.cpu.temp_c !== null ? ` · ${fixed(s.cpu.temp_c)} °C` : ""} (${s.cpu.brand})`,
    `${t("system.sub.memory")}: ${fixed(percent(s.memory.used, s.memory.total))}% · ${t("system.memory.used", { used: bytes(s.memory.used), total: bytes(s.memory.total) })}`,
    ...(disk ? [`${t("system.sub.disk")} ${disk.mount}: ${t("system.disk.free", { free: bytes(disk.available), total: bytes(disk.total) })}`] : []),
    ...s.gpus.map((g) => `${t("system.sub.gpu")}: ${g.name}${g.usage !== null ? ` · ${fixed(g.usage)}%` : ""}`),
    `${t("system.sub.network")}: ↓ ${rate(s.network.down_bps)} · ↑ ${rate(s.network.up_bps)}`,
    ...(s.battery ? [`${t("system.sub.power")}: ${fixed(s.battery.percent)}% · ${t(`system.power.state.${s.battery.state}`)}`] : []),
    t("system.uptime", { time: uptimeLabel(s.uptime_secs) }),
  ];
  return lines.join("\n");
}

/** One tab for the whole machine, split in sub-tabs like a task manager; it reads every 2 s only while it is on screen. */
export default function SystemTab() {
  const [snap, setSnap] = useState<SystemSnapshot | null>(null);
  const [error, setError] = useState("");
  const [sub, setSub] = useState<SystemSub>(savedSub);
  const [cpuSort, setCpuSort] = useState<AppSort>("cpu");
  const [memSort, setMemSort] = useState<AppSort>("memory");
  const [paused, setPaused] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [copied, flash] = useCopied();
  const visible = useWindowVisible();
  const live = useRef(true);

  const load = useCallback(
    () =>
      api.systemGet().then(
        (s) => live.current && (setSnap(s), setError("")),
        (e) => live.current && setError(errText(e) || t("system.error")),
      ),
    [],
  );

  useEffect(() => {
    live.current = true;
    if (!visible || paused) return;
    void load();
    const id = setInterval(() => void load(), POLL_MS);
    return () => {
      live.current = false;
      clearInterval(id);
    };
  }, [visible, paused, load]);

  function pick(next: SystemSub) {
    setSub(next);
    try {
      localStorage.setItem(SUB_KEY, next);
    } catch {
      // Private mode: the sub-tab lasts until the window closes.
    }
  }

  if (!snap) return error ? <ErrorBanner message={error} onRetry={() => void load()} /> : <Skeleton label={t("system.loading")} rows={4} />;

  const subs = SUBS.filter((s) => s !== "gpu" || snap.gpus.length > 0);
  const shown = subs.includes(sub) ? sub : "overview";

  async function copy() {
    try {
      await navigator.clipboard.writeText(summaryText(snap!));
      flash("copied");
    } catch {
      flash("failed");
    }
  }
  function openAlerts() {
    pick("overview");
    setAlertsOpen(true);
    requestAnimationFrame(() => document.getElementById("system-alerts")?.scrollIntoView?.({ block: "nearest", behavior: "smooth" }));
  }

  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto pr-0.5" data-system-tab={shown}>
      <div className="flex items-center gap-2 px-0.5 text-[11px] text-muted">
        <span
          data-system-live={paused ? "paused" : "live"}
          className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-medium ${paused ? "border-edge text-muted" : "border-accent/35 bg-accent/10 text-accent-text"}`}
        >
          <i aria-hidden="true" className={`relative size-1.5 rounded-full ${paused ? "bg-faint" : "canto-ping bg-accent text-accent"}`} />
          {paused ? t("system.paused") : t("system.live")}
        </span>
        <span className="min-w-0 truncate">{t("system.uptime", { time: uptimeLabel(snap.uptime_secs) })}</span>
        {copied && (
          <span role="status" className={`canto-fade ml-auto shrink-0 ${copied === "copied" ? "text-accent-text" : "text-danger"}`}>
            {copied === "copied" ? `✓ ${t("system.copied")}` : t("system.copyFailed")}
          </span>
        )}
        <div className={copied ? "" : "ml-auto"}>
          <ForgeMenu
            label={t("system.actions")}
            icon={<MoreIcon />}
            items={[
              { key: "pause", label: paused ? t("system.resume") : t("system.pause"), onSelect: () => setPaused(!paused) },
              { key: "refresh", label: t("system.refresh"), onSelect: () => void load() },
              { key: "copy", label: t("system.copy"), onSelect: () => void copy() },
              { key: "alerts", label: t("system.alertsMenu"), onSelect: openAlerts, divider: true },
            ]}
          />
        </div>
      </div>
      <SubTabs
        dense
        iconsOnly
        label={t("system.subs")}
        tabs={subs.map((key) => ({ key, label: t(`system.sub.${key}`), icon: <SubIcon sub={key} /> }))}
        value={shown}
        onChange={pick}
      />
      {error && <ErrorBanner message={error} onRetry={() => void load()} />}
      <div key={shown} className="flex flex-col gap-2">
        {shown === "overview" && <SystemOverview snap={snap} onOpen={pick} alertsOpen={alertsOpen} onAlertsOpen={setAlertsOpen} />}
        {shown === "cpu" && <SystemCpu snap={snap} sort={cpuSort} onSort={setCpuSort} />}
        {shown === "gpu" && <SystemGpu snap={snap} />}
        {shown === "memory" && <SystemMemory snap={snap} sort={memSort} onSort={setMemSort} />}
        {shown === "disk" && <SystemDisk snap={snap} />}
        {shown === "network" && <SystemNetwork snap={snap} />}
        {shown === "power" && <SystemPower snap={snap} />}
      </div>
    </div>
  );
}
