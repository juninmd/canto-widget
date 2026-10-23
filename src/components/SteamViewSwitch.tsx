import { t } from "../i18n";
import type { PlayView } from "./SteamPlayItem";

const ICONS: Record<PlayView, React.ReactNode> = {
  list: <path d="M9 6h12M9 12h12M9 18h12M3 6h2M3 12h2M3 18h2" />,
  cards: (
    <>
      <rect x="3" y="4" width="18" height="7" rx="2" />
      <rect x="3" y="14" width="18" height="7" rx="2" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="5" height="8" rx="1" />
      <rect x="10" y="3" width="5" height="8" rx="1" />
      <rect x="17" y="3" width="4" height="8" rx="1" />
      <rect x="3" y="13" width="5" height="8" rx="1" />
      <rect x="10" y="13" width="5" height="8" rx="1" />
      <rect x="17" y="13" width="4" height="8" rx="1" />
    </>
  ),
};

/** List, cards or grid: the three ways "jogue agora" lays the games out. */
export default function SteamViewSwitch({ value, onChange }: { value: PlayView; onChange: (v: PlayView) => void }) {
  return (
    <div role="group" aria-label={t("steam.play.view")} className="ml-auto flex gap-0.5 rounded-lg border border-edge bg-ink p-0.5">
      {(["list", "cards", "grid"] as const).map((v) => (
        <button
          key={v}
          type="button"
          aria-pressed={value === v}
          aria-label={t(`steam.play.view.${v}`)}
          title={t(`steam.play.view.${v}`)}
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
