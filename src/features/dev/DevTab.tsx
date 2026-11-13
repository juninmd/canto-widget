import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../../lib/api";
import { useWindowVisible } from "../../lib/useWindowVisible";
import { t } from "../../i18n";
import SubTabs from "../../components/SubTabs";
import type { DockerState } from "./devTypes";
import DevCron from "./DevCron";
import DevDocker from "./DevDocker";
import DevGit from "./DevGit";
import DevPorts from "./DevPorts";
import DevTools from "./DevTools";

export type DevSub = "ports" | "docker" | "git" | "tools" | "cron";
const SUBS: DevSub[] = ["ports", "docker", "git", "tools", "cron"];
const SUB_KEY = "canto.devSub";
const POLL_MS = 8000;

function savedSub(): DevSub {
  try {
    const raw = localStorage.getItem(SUB_KEY);
    return SUBS.includes(raw as DevSub) ? (raw as DevSub) : "ports";
  } catch {
    return "ports";
  }
}

/** Ports, Docker, Git, small tools and the schedule: what a developer asks of the machine. Docker shows up only while its engine runs. */
export default function DevTab() {
  const [sub, setSub] = useState<DevSub>(savedSub);
  const [docker, setDocker] = useState<DockerState | null>(null);
  const visible = useWindowVisible();
  const live = useRef(true);

  const loadDocker = useCallback(() => api.devDockerGet().then((d) => void (live.current && setDocker(d)), () => void (live.current && setDocker(null))), []);

  useEffect(() => {
    live.current = true;
    if (!visible) return;
    void loadDocker();
    const id = setInterval(() => void loadDocker(), POLL_MS);
    return () => {
      live.current = false;
      clearInterval(id);
    };
  }, [visible, loadDocker]);

  const hasDocker = docker?.running === true;
  const shown = SUBS.filter((s) => s !== "docker" || hasDocker);
  const current: DevSub = shown.includes(sub) ? sub : "ports";

  function pick(next: DevSub) {
    setSub(next);
    try {
      localStorage.setItem(SUB_KEY, next);
    } catch {
      // Private mode: the sub-tab lasts until the window closes.
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-2.5 overflow-y-auto pr-0.5 [&>*]:shrink-0">
      <SubTabs label={t("dev.subs")} value={current} onChange={pick} tabs={shown.map((s) => ({ key: s, label: t(`dev.sub.${s}`) }))} />
      {current === "ports" && <DevPorts />}
      {current === "docker" && docker && hasDocker && <DevDocker state={docker} reload={loadDocker} />}
      {current === "git" && <DevGit />}
      {current === "tools" && <DevTools />}
      {current === "cron" && <DevCron />}
    </div>
  );
}
