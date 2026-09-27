import { useCallback, useEffect, useRef, useState } from "react";
import { api, errText, type GithubStatus } from "../lib/api";
import { NO_FILTER } from "../lib/forge";
import { applyChecks, prsToCheck, type CiMap } from "../lib/forgeChecks";
import { t } from "../i18n";
import { useForgeLists } from "../lib/useForgeLists";
import ForgeBoard from "./ForgeBoard";
import GithubConnect from "./GithubConnect";
import Skeleton from "./Skeleton";

const SOURCE = { lists: api.githubLists, section: api.githubSection };

export default function GithubTab({ onError }: { onError: (m: string) => void }) {
  const [status, setStatus] = useState<GithubStatus | null>(null);
  const [statusError, setStatusError] = useState("");
  const gh = useForgeLists(SOURCE);
  const { load, clear } = gh;
  const [ci, setCi] = useState<CiMap>({});
  const known = useRef(ci);
  known.current = ci;

  const refresh = useCallback(async () => {
    setStatusError("");
    try {
      const s = await api.githubStatus();
      setStatus(s);
      if (s.connected) await load(NO_FILTER, false);
      else {
        clear();
        setCi({});
      }
    } catch (e) {
      setStatusError(errText(e));
    }
  }, [load, clear]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

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
    return statusError ? <p className="text-xs text-danger">{statusError}</p> : <Skeleton label={t("github.loading")} />;
  }
  if (!status.connected) return <GithubConnect device={status.device_flow} onConnected={() => void refresh()} />;
  return <ForgeBoard forge="github" login={status.login} lists={gh} ci={ci} onDisconnect={() => void disconnect()} />;
}
