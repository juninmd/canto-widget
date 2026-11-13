import { t } from "../../i18n";
import type { RepoView } from "./repos";

const ICONS: Record<RepoView, React.ReactNode> = {
  list: <path d="M9 6h12M9 12h12M9 18h12M3 6h2M3 12h2M3 18h2" />,
  cards: (
    <>
      <rect x="3" y="4" width="18" height="7" rx="2" />
      <rect x="3" y="14" width="18" height="7" rx="2" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="3" width="8" height="8" rx="1" />
      <rect x="3" y="13" width="8" height="8" rx="1" />
      <rect x="13" y="13" width="8" height="8" rx="1" />
    </>
  ),
};

/** List, cards or grid: the three ways the repositories are laid out. */
export default function RepoViewSwitch({ value, onChange }: { value: RepoView; onChange: (v: RepoView) => void }) {
  return (
    <div role="group" aria-label={t("forge.repos.view")} className="flex gap-0.5 rounded-lg border border-edge bg-ink p-0.5">
      {(["list", "cards", "grid"] as const).map((v) => (
        <button
          key={v}
          type="button"
          aria-pressed={value === v}
          aria-label={t(`forge.repos.view.${v}`)}
          title={t(`forge.repos.view.${v}`)}
          onClick={() => onChange(v)}
          className={`canto-hit grid h-6 w-7 place-items-center rounded-md transition ${value === v ? "bg-accent text-on-accent" : "text-faint hover:text-fg"}`}
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            {ICONS[v]}
          </svg>
        </button>
      ))}
    </div>
  );
}
