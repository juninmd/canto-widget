import { t } from "../i18n";

type GroupProps = { title: string; more?: number; onOpen: () => void; children: React.ReactNode };

/** One source of results: the title opens its tab, every row does the same and is reachable with the arrows. */
export function Group({ title, more, onOpen, children }: GroupProps) {
  return (
    <section className="mb-3 last:mb-0">
      <button
        type="button"
        data-row
        onClick={onOpen}
        className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-faint hover:text-accent-text"
      >
        {title} →
      </button>
      <ul className="divide-y divide-edge rounded-lg border border-edge bg-ink/40">{children}</ul>
      {!!more && <p className="mt-1 px-1 text-[11px] text-faint">{t("search.more", { n: more })}</p>}
    </section>
  );
}

export function Row({ text, mask, onOpen }: { text: string; mask: string; onOpen: () => void }) {
  return (
    <li>
      <button
        type="button"
        data-row
        onClick={onOpen}
        className={`block w-full truncate px-2.5 py-1.5 text-left text-xs text-fg hover:bg-hover focus-visible:bg-hover ${mask}`}
      >
        {text}
      </button>
    </li>
  );
}
