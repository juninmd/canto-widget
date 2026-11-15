import { t } from "../../i18n";
import type { RepoView } from "./repos";

const ICONS: Record<RepoView, React.ReactNode> = {
  tree: <path d="M4 5h6M8 12h6M8 19h6M6 5v14M6 12h2M6 19h2" />,
  flat: <path d="M9 6h12M9 12h12M9 18h12M3 6h2M3 12h2M3 18h2" />,
};

/** Tree (groups, subgroups) or a flat list: the two ways the repositories are laid out. */
export default function RepoViewSwitch({ value, onChange }: { value: RepoView; onChange: (v: RepoView) => void }) {
  return (
    <div role="group" aria-label={t("forge.repos.view")} className="flex gap-0.5 rounded-lg border border-edge bg-ink p-0.5">
      {(["tree", "flat"] as const).map((v) => (
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
