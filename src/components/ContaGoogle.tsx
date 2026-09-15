import type { DriveStatus } from "../lib/api";

type Props = { status: DriveStatus; ocupado: boolean; saindo: boolean; onSair: () => void };

/** Cartão da conta conectada: quem é, e a saída sempre à vista. */
export default function ContaGoogle({ status, ocupado, saindo, onSair }: Props) {
  const nome = status.nome?.trim() || status.email || "conta conectada";
  // Só data: de imagem entra no <img>; a CSP bloqueia o resto, e a inicial cobre a falta.
  const foto = status.avatar?.startsWith("data:image/") ? status.avatar : "";

  return (
    <div className="mt-1 flex items-center gap-3 rounded-lg border border-edge bg-ink/60 p-2">
      {foto ? (
        <img src={foto} alt="" referrerPolicy="no-referrer" className="size-9 shrink-0 rounded-full object-cover" />
      ) : (
        <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-sm font-semibold text-on-accent">
          {nome.charAt(0).toUpperCase()}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-fg" title={nome}>
          {nome}
        </p>
        {status.nome?.trim() && status.email && (
          <p className="truncate text-[11px] text-muted" title={status.email}>
            {status.email}
          </p>
        )}
      </div>
      <button
        type="button"
        disabled={ocupado}
        onClick={onSair}
        aria-label={`sair da conta ${status.email || nome}`}
        className="shrink-0 rounded-lg border border-line px-2.5 py-1 text-xs text-fg hover:border-danger hover:text-danger disabled:opacity-40"
      >
        {saindo ? "saindo..." : "sair"}
      </button>
    </div>
  );
}
