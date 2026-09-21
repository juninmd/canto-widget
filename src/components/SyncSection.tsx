import { useEffect, useState } from "react";
import { api, errText } from "../lib/api";

export default function SyncSection({ onError }: { onError: (m: string) => void }) {
  const [folder, setFolder] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState("");

  async function reload() {
    try {
      setFolder(await api.syncGet());
    } catch (e) {
      onError(errText(e));
    }
  }

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function choose() {
    setBusy(true);
    setInfo("");
    try {
      const chosen = await api.syncSetFolder();
      if (chosen) setFolder(chosen);
    } catch (e) {
      onError(errText(e));
    } finally {
      setBusy(false);
    }
  }

  async function clear() {
    setBusy(true);
    try {
      await api.syncClear();
      setFolder(null);
      setInfo("");
    } catch (e) {
      onError(errText(e));
    } finally {
      setBusy(false);
    }
  }

  async function syncNow() {
    setBusy(true);
    setInfo("");
    try {
      const r = await api.syncNow();
      setInfo(r ? `mesclado: o cofre tem ${r.tasks} tarefas e ${r.notes} notas` : "nada novo para mesclar");
    } catch (e) {
      onError(errText(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-semibold text-fg">Pasta sincronizada</h2>
      <p className="text-xs text-muted">
        Aponte para uma pasta do Dropbox, OneDrive ou Syncthing: cada alteração é copiada para lá, e o que
        chegar de outra máquina é mesclado sozinho, ao destrancar e a cada poucos minutos.
      </p>
      {folder ? (
        <p className="break-all rounded-lg border border-edge bg-ink/40 px-2.5 py-1.5 text-[11px] text-fg">
          {folder}
        </p>
      ) : (
        <p className="text-[11px] text-faint">nenhuma pasta escolhida</p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void choose()}
          className="flex-1 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-on-accent disabled:opacity-40"
        >
          {folder ? "trocar pasta" : "escolher pasta"}
        </button>
        {folder && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => void syncNow()}
              className="flex-1 rounded-lg bg-edge px-3 py-1.5 text-xs text-fg disabled:opacity-40"
            >
              sincronizar agora
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void clear()}
              className="rounded-lg bg-edge px-3 py-1.5 text-xs text-fg disabled:opacity-40"
            >
              parar
            </button>
          </>
        )}
      </div>
      {info && <p className="text-[11px] text-accent">{info}</p>}
    </section>
  );
}
