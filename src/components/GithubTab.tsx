import { useCallback, useEffect, useRef, useState } from "react";
import { api, errText, type GithubStatus } from "../lib/api";
import { applyChecks, prsToCheck, type CiMap } from "../lib/forgeChecks";
import { t } from "../i18n";
import { useForgeLists } from "../lib/useForgeLists";
import { useRefreshEvent } from "../lib/useRefreshEvent";
import { patchForgeCache, readForgeCache } from "../lib/forgeCache";
import ErrorBanner from "./ErrorBanner";
import ForgeBoard from "./ForgeBoard";
import GithubConnect from "./GithubConnect";
import Skeleton from "./Skeleton";

const SOURCE = { lists: api.githubLists, section: api.githubSection };

export default function GithubTab({ onError }: { onError: (m: string) => void }) {
  const [status, setStatus] = useState<GithubStatus | null>(() => readForgeCache("github").status as GithubStatus | null);
  const [statusError, setStatusError] = useState("");
  const gh = useForgeLists(SOURCE, "github");
  const { load, clear, seedFilter, setError } = gh;
  const [ci, setCi] = useState<CiMap>({});
  const known = useRef(ci);
  known.current = ci;

  const refresh = useCallback(async () => {
    setStatusError("");
    try {
      const s = await api.githubStatus();
      setStatus(s);
      patchForgeCache("github", { status: s });
      if (s.connected) await load(seedFilter, true);
      else {
        clear();
        setCi({});
      }
    } catch (e) {
      // With a cached board on screen the failure joins the board's banner instead of replacing it.
      if (readForgeCache("github").status) setError(errText(e));
      else setStatusError(errText(e));
    }
  }, [load, clear, seedFilter, setError]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useRefreshEvent("github", () => void (status?.connected ? gh.load(gh.filter, true, true) : refresh()));

  // Badges fill in after the list: a slow CI lookup never holds the list back.
  const shown = gh.lists;
  useEffect(() => {
    if (!shown) return;
    const prs = prsToCheck(shown, known.current);
    if (prs.length === 0) return;
    let live = true;
    api
      .githubPrsChecks(prs)
      .then((got) => {
        if (live && Array.isArray(got)) setCi((m) => applyChecks(m, got));
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [shown]);

  async function disconnect() {
    try {
      await api.githubDisconnect();
      await refresh();
    } catch (e) {
      onError(errText(e));
    }
  }

  if (!status) {
    return statusError ? <ErrorBanner message={statusError} onRetry={() => void refresh()} /> : <Skeleton label={t("github.loading")} />;
  }
  if (!status.connected) return <GithubConnect device={status.device_flow} onConnected={() => void refresh()} />;
  return <ForgeBoard forge="github" login={status.login} lists={gh} ci={ci} onDisconnect={() => void disconnect()} />;
}
