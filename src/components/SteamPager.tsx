import { t } from "../i18n";

/** The page numbers a pager shows: the first, the last and the neighbours of the current one. */
export function pageList(page: number, pages: number): (number | "gap")[] {
  const out: (number | "gap")[] = [];
  for (let p = 0; p < pages; p++) {
    if (p === 0 || p === pages - 1 || Math.abs(p - page) <= 1) out.push(p);
    else if (out[out.length - 1] !== "gap") out.push("gap");
  }
  return out;
}

/** Numbered pages, 0-based inside and 1-based on screen; hidden when everything fits in one. */
export default function SteamPager({ page, pages, onPage }: { page: number; pages: number; onPage: (page: number) => void }) {
  if (pages <= 1) return null;
  const button = "canto-hit grid min-h-7 min-w-7 place-items-center rounded-lg px-1.5 font-mono text-[11px] tabular-nums transition";
  return (
    <nav aria-label={t("steam.pager.label")} className="flex shrink-0 items-center justify-center gap-0.5">
      <button
        type="button"
        disabled={page === 0}
        onClick={() => onPage(page - 1)}
        aria-label={t("steam.pager.prev")}
        className={`${button} text-muted hover:bg-hover hover:text-fg disabled:opacity-30`}
      >
        ‹
      </button>
      {pageList(page, pages).map((p, i) =>
        p === "gap" ? (
          <span key={`gap${i}`} className="px-0.5 text-[11px] text-faint">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPage(p)}
            aria-label={t("steam.pager.page", { n: p + 1 })}
            aria-current={p === page ? "page" : undefined}
            className={`${button} ${p === page ? "scale-105 bg-accent font-bold text-on-accent" : "text-muted hover:bg-hover hover:text-fg"}`}
          >
            {p + 1}
          </button>
        ),
      )}
      <button
        type="button"
        disabled={page >= pages - 1}
        onClick={() => onPage(page + 1)}
        aria-label={t("steam.pager.next")}
        className={`${button} text-muted hover:bg-hover hover:text-fg disabled:opacity-30`}
      >
        ›
      </button>
    </nav>
  );
}
