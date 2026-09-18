import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { api, errText, UPDATE_PROGRESS_EVENT, type UpdateInfo, type UpdateProgress } from "../lib/api";

const brDate = (iso: string) => iso.split("-").reverse().join("/");

function percent(p: UpdateProgress | null): string {
  if (!p) return "";
  return p.total ? ` ${Math.min(100, Math.round((p.downloaded / p.total) * 100))}%` : "";
}

export default function UpdateSection() {
  const [info, setInfo] = useState<UpdateInfo | null>(null);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [progress, setProgress] = useState<UpdateProgress | null>(null);

  async function check() {
    setChecking(true);
    setError("");
    try {
      setInfo(await api.updateCheck());
    } catch (e) {
      setError(`Não foi possível verificar: ${errText(e)}`);
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    void check();
  }, []);

  useEffect(() => {
    if (!installing) return;
    const stop = listen<UpdateProgress>(UPDATE_PROGRESS_EVENT, (e) => setProgress(e.payload));
    return () => {
      void stop.then((f) => f());
    };
  }, [installing]);

  async function install() {
    setInstalling(true);
    setError("");
    try {
      await api.updateInstall();
    } catch (e) {
      setError(`A atualização não foi instalada: ${errText(e)}`);
      setInstalling(false);
      setProgress(null);
    }
  }

  return (
    <section className="flex flex-col gap-2" aria-labelledby="updates-title">
      <h3 id="updates-title" className="text-xs font-semibold text-fg">
        Atualizações
      </h3>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
        <dt className="text-muted">versão instalada</dt>
        <dd className="font-mono text-fg">{info?.current ?? "…"}</dd>
        <dt className="text-muted">última publicada</dt>
        <dd className="font-mono text-fg">
          {info ? info.latest : checking ? "verificando…" : "—"}
          {info?.date && <span className="font-sans text-faint"> · {brDate(info.date)}</span>}
        </dd>
      </dl>
      {error && (
        <p role="alert" className="text-[11px] text-danger">
          {error}
        </p>
      )}
      {info && !info.available && !error && <p className="text-[11px] text-faint">Você está na versão mais recente.</p>}
      {info?.available && (
        <div className="flex flex-col gap-2 rounded-lg border border-accent/60 p-2">
          {info.notes && <p className="line-clamp-4 whitespace-pre-line text-[11px] text-muted">{info.notes}</p>}
          <button
            type="button"
            onClick={() => void install()}
            disabled={installing}
            className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-on-accent disabled:opacity-70"
          >
            {installing ? `baixando…${percent(progress)}` : `atualizar para ${info.latest} e reiniciar`}
          </button>
          <p role="status" className="text-[11px] text-faint">
            {installing ? "O Canto fecha, instala e abre de novo; o cofre volta trancado." : "O instalador é conferido pela assinatura antes de rodar."}
          </p>
        </div>
      )}
      <button
        type="button"
        onClick={() => void check()}
        disabled={checking || installing}
        className="self-start rounded-lg bg-edge px-3 py-1.5 text-xs text-fg disabled:opacity-60"
      >
        {checking ? "verificando…" : "verificar agora"}
      </button>
    </section>
  );
}
