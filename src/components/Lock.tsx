import { useState } from "react";
import { api, errText } from "../lib/api";

export default function Lock({ exists, onOpen }: { exists: boolean; onOpen: () => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!exists && password !== confirm) {
      setError("as senhas nao conferem");
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
    <form onSubmit={submit} className="flex h-full flex-col justify-center gap-3 px-6">
      <div>
        <h2 className="text-sm font-semibold text-fg">
          {exists ? "Cofre trancado" : "Criar cofre"}
        </h2>
        <p className="mt-1 text-xs text-muted">
          {exists
            ? "Digite a senha mestra para abrir suas tarefas e notas."
            : "A senha mestra cifra tudo localmente. Sem ela, nada e recuperavel — nem por voce."}
        </p>
      </div>
      <input
        autoFocus
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="senha mestra"
        className="rounded-lg border border-edge bg-ink px-3 py-2 text-sm text-fg outline-none focus:border-accent"
      />
      {!exists && (
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="repita a senha"
          className="rounded-lg border border-edge bg-ink px-3 py-2 text-sm text-fg outline-none focus:border-accent"
        />
      )}
      {error && <p className="text-xs text-danger">{error}</p>}
      <button
        type="submit"
        disabled={busy || password.length === 0}
        className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-on-accent disabled:opacity-40"
      >
        {busy ? "..." : exists ? "Destrancar" : "Criar cofre"}
      </button>
    </form>
  );
}
