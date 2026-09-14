import { useState } from "react";
import { api, errText } from "../lib/api";

export default function BackupSection({ onError }: { onError: (m: string) => void }) {
  const [busy, setBusy] = useState("");
  const [info, setInfo] = useState("");

  // `fn` devolve "" quando o usuario cancela o dialogo: cancelar nao e erro nem sucesso.
  async function run(label: string, fn: () => Promise<string>) {
    setBusy(label);
    setInfo("");
    try {
      setInfo(await fn());
    } catch (e) {
      onError(errText(e));
    } finally {
      setBusy("");
    }
  }

  const exportar = async () => {
    const onde = await api.backupExportar();
    return onde ? `backup salvo em ${onde}` : "";
  };

  const importar = async () => {
    const r = await api.backupImportar();
    return r ? `backup mesclado: o cofre tem ${r.tarefas} tarefas e ${r.notas} notas` : "";
  };

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-semibold text-fg">Backup</h2>
      <p className="text-xs text-muted">
        Arquivo <code>.canto</code> já cifrado com a senha mestra. Para levar a outra máquina, crie lá o
        cofre com a <span className="text-fg">mesma senha</span> e importe. Importar mescla, não apaga.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy !== ""}
          onClick={() => run("exp", exportar)}
          className="flex-1 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-on-accent disabled:opacity-40"
        >
          {busy === "exp" ? "exportando..." : "exportar"}
        </button>
        <button
          type="button"
          disabled={busy !== ""}
          onClick={() => run("imp", importar)}
          className="flex-1 rounded-lg bg-edge px-3 py-1.5 text-xs text-fg disabled:opacity-40"
        >
          {busy === "imp" ? "importando..." : "importar"}
        </button>
      </div>
      <p className="text-[11px] text-faint">Cópia automática diária na pasta do app (últimas 10).</p>
      {info && <p className="break-all text-[11px] text-accent">{info}</p>}
    </section>
  );
}
