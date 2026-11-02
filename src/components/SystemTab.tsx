import { useCallback, useEffect, useRef, useState } from "react";
import { api, errText, type SystemSnapshot } from "../lib/api";
import { uptimeLabel, type AppSort } from "../lib/system";
import { useWindowVisible } from "../lib/useWindowVisible";
import { t } from "../i18n";
import ErrorBanner from "./ErrorBanner";
import Skeleton from "./Skeleton";
import SubTabs from "./SubTabs";
import SystemOverview from "./SystemOverview";
import SystemCpu from "./SystemCpu";
import SystemGpu from "./SystemGpu";
import SystemMemory from "./SystemMemory";
import SystemDisk from "./SystemDisk";
import SystemNetwork from "./SystemNetwork";
import SystemPower from "./SystemPower";

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

/** One tab for the whole machine, split in sub-tabs like a task manager; it reads every 2 s only while it is on screen. */
export default function SystemTab() {
  const [snap, setSnap] = useState<SystemSnapshot | null>(null);
  const [error, setError] = useState("");
  const [sub, setSub] = useState<SystemSub>(savedSub);
  const [cpuSort, setCpuSort] = useState<AppSort>("cpu");
  const [memSort, setMemSort] = useState<AppSort>("memory");
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
    if (!visible) return;
    void load();
    const id = setInterval(() => void load(), POLL_MS);
    return () => {
      live.current = false;
      clearInterval(id);
    };
  }, [visible, load]);

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
  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto pr-0.5" data-system-tab={shown}>
      <SubTabs dense label={t("system.subs")} tabs={subs.map((key) => ({ key, label: t(`system.sub.${key}`) }))} value={shown} onChange={pick} />
      {error && <ErrorBanner message={error} onRetry={() => void load()} />}
      <div key={shown} className="flex flex-col gap-2">
        {shown === "overview" && <SystemOverview snap={snap} onOpen={pick} />}
        {shown === "cpu" && <SystemCpu snap={snap} sort={cpuSort} onSort={setCpuSort} />}
        {shown === "gpu" && <SystemGpu snap={snap} />}
        {shown === "memory" && <SystemMemory snap={snap} sort={memSort} onSort={setMemSort} />}
        {shown === "disk" && <SystemDisk snap={snap} />}
        {shown === "network" && <SystemNetwork snap={snap} />}
        {shown === "power" && <SystemPower snap={snap} />}
      </div>
      <p className="mt-auto pb-1 text-center text-[10px] text-faint">{t("system.uptime", { time: uptimeLabel(snap.uptime_secs) })}</p>
    </div>
  );
}
