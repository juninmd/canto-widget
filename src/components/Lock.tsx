import { useEffect, useState } from "react";
import { api, errText, type StatusBiometria } from "../lib/api";

export default function Lock({ exists, onOpen }: { exists: boolean; onOpen: () => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [mostrar, setMostrar] = useState(false);
  const [bio, setBio] = useState<StatusBiometria | null>(null);

  useEffect(() => {
    if (!exists) return;
    void api
      .biometriaStatus()
      .then((s) => setBio(s?.disponivel && s.ativa ? s : null))
      .catch(() => setBio(null));
  }, [exists]);

  async function comBiometria() {
    setError("");
    setBusy(true);
    try {
      await api.biometriaDesbloquear();
      onOpen();
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!exists && password !== confirm) {
      setError("as senhas não conferem — digite a mesma senha nos dois campos");
      return;
    }
    setBusy(true);
    try {
      await (exists ? api.unlock(password) : api.create(password));
      setPassword("");
      setConfirm("");
      onOpen();
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="flex h-full flex-col justify-center gap-3 px-6 motion-safe:animate-surgir motion-reduce:animate-fade"
    >
      <div>
        <h2 className="text-sm font-semibold text-fg">
          {exists ? "Cofre trancado" : "Criar cofre"}
        </h2>
        <p className="mt-1 text-xs text-muted">
          {exists
            ? "Digite a senha mestra para abrir suas tarefas e notas."
            : "A senha mestra cifra tudo localmente. Sem ela, nada é recuperável — nem por você."}
        </p>
      </div>
      <input
        autoFocus
        type={mostrar ? "text" : "password"}
        aria-label="senha mestra"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="senha mestra"
        className="rounded-lg border border-line bg-ink px-3 py-2 text-sm text-fg outline-none focus:border-accent"
      />
      {!exists && (
        <input
          type={mostrar ? "text" : "password"}
          aria-label="repita a senha"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="repita a senha"
          className="rounded-lg border border-line bg-ink px-3 py-2 text-sm text-fg outline-none focus:border-accent"
        />
      )}
      <label className="flex min-h-6 items-center gap-2 text-xs text-muted">
        <input
          type="checkbox"
          checked={mostrar}
          onChange={(e) => setMostrar(e.target.checked)}
          className="size-4 accent-[var(--color-accent)]"
        />
        mostrar senha
        {!exists && <span className="ml-auto text-faint">mínimo de 4 caracteres</span>}
      </label>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
      {bio && (
        <button
          type="button"
          onClick={() => void comBiometria()}
          disabled={busy}
          className="rounded-lg border border-accent px-3 py-2 text-sm font-semibold text-fg disabled:opacity-40"
        >
          Destrancar com {bio.nome}
        </button>
      )}
      <button
        type="submit"
        disabled={busy || password.length === 0}
        className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-on-accent disabled:opacity-40"
      >
        {busy ? (exists ? "abrindo..." : "criando...") : exists ? "Destrancar" : "Criar cofre"}
      </button>
    </form>
  );
}
