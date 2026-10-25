import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useSectionError } from "../lib/useSectionError";
import { t } from "../i18n";
import ConfirmButton from "./ConfirmButton";
import { SettingsSection } from "./SettingsSection";

export default function SyncSection({ onError }: { onError: (m: string) => void }) {
  const [folder, setFolder] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState("");
  const { error, fail, clear } = useSectionError(onError);

  async function reload() {
    try {
      setFolder(await api.syncGet());
    } catch (e) {
      fail(e);
    }
  }

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function choose() {
    setBusy(true);
    setInfo("");
    clear();
    try {
      const chosen = await api.syncSetFolder();
      if (chosen) setFolder(chosen);
    } catch (e) {
      fail(e);
      await reload();
    } finally {
      setBusy(false);
    }
  }

  async function stop() {
    setBusy(true);
    clear();
    try {
      await api.syncClear();
      setFolder(null);
      setInfo("");
    } catch (e) {
      fail(e);
      await reload();
    } finally {
      setBusy(false);
    }
  }

  async function syncNow() {
    setBusy(true);
    setInfo("");
    clear();
    try {
      const r = await api.syncNow();
      setInfo(r ? t("settings.sync.merged", { tasks: r.tasks, notes: r.notes }) : t("settings.sync.nothingNew"));
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SettingsSection title={t("settings.sync.title")} error={error}>
      <p className="text-xs text-muted">
        {t("settings.sync.hint")}
      </p>
      {folder ? (
        <p className="break-all rounded-lg border border-edge bg-ink/40 px-2.5 py-1.5 text-[11px] text-fg">
          {folder}
        </p>
      ) : (
        <p className="text-[11px] text-faint">{t("settings.sync.none")}</p>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void choose()}
          className="flex-1 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-on-accent disabled:opacity-40"
        >
          {folder ? t("settings.sync.change") : t("settings.sync.choose")}
        </button>
        {folder && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => void syncNow()}
              className="flex-1 rounded-lg bg-edge px-3 py-1.5 text-xs text-fg disabled:opacity-40"
            >
              {t("settings.sync.now")}
            </button>
            <ConfirmButton
              ask={t("settings.sync.stopAsk")}
              yes={t("settings.sync.stopYes")}
              disabled={busy}
              onConfirm={() => void stop()}
              className="rounded-lg bg-edge px-3 py-1.5 text-xs text-fg disabled:opacity-40"
            >
              {t("settings.sync.stop")}
            </ConfirmButton>
          </>
        )}
      </div>
      {info && <p className="text-[11px] text-accent-text">{info}</p>}
    </SettingsSection>
  );
}
