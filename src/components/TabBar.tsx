import { useRef } from "react";
import { t } from "../i18n";

export type Tab = "tasks" | "notes" | "clipboard" | "meetings" | "agenda" | "github" | "gitlab" | "status" | "settings";

export const TABS: { id: Tab; label: string }[] = [
  { id: "tasks", label: t("tabs.tasks") },
  { id: "notes", label: t("tabs.notes") },
  { id: "clipboard", label: t("tabs.clipboard") },
  { id: "meetings", label: t("tabs.meetings") },
  { id: "agenda", label: t("tabs.agenda") },
  { id: "github", label: "GitHub" },
  { id: "gitlab", label: "GitLab" },
  { id: "status", label: t("tabs.status") },
  { id: "settings", label: t("tabs.settings") },
];

export const panelId = (tab: Tab) => `panel-${tab}`;
const tabId = (tab: Tab) => `aba-${tab}`;

/** WAI-ARIA APG tabs pattern: one Tab stop, arrows/Home/End switch tabs. */
type Props = { current: Tab; onChange: (t: Tab) => void; tabs?: typeof TABS };

export default function TabBar({ current, onChange, tabs = TABS }: Props) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  function onKeyDown(e: React.KeyboardEvent) {
    const i = tabs.findIndex((tab) => tab.id === current);
    const target = {
      ArrowRight: (i + 1) % tabs.length,
      ArrowLeft: (i - 1 + tabs.length) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    }[e.key];
    if (target === undefined) return;
    e.preventDefault();
    const next = tabs[target].id;
    onChange(next);
    refs.current[next]?.focus();
  }

  return (
    <nav
      role="tablist"
      aria-label={t("tabs.label")}
      onKeyDown={onKeyDown}
      className="flex shrink-0 gap-0.5 overflow-x-auto px-3 pt-2 text-xs"
    >
      {tabs.map((tab, i) => (
        <button
          key={tab.id}
          ref={(el) => {
            refs.current[tab.id] = el;
          }}
          id={tabId(tab.id)}
          type="button"
          role="tab"
          aria-selected={current === tab.id}
          // Only the active panel exists in the DOM; pointing at the others would be a broken reference.
          aria-controls={current === tab.id ? panelId(tab.id) : undefined}
          tabIndex={current === tab.id ? 0 : -1}
          onClick={() => onChange(tab.id)}
          title={`Alt+${i + 1}`}
          className={`min-h-7 shrink-0 rounded-lg px-1.5 ${
            current === tab.id ? "bg-edge font-semibold text-fg" : "text-muted hover:text-fg"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
