import { useRef } from "react";

export type Tab = "tasks" | "notes" | "clipboard" | "meetings" | "agenda" | "github" | "gitlab" | "settings";

export const TABS: { id: Tab; label: string }[] = [
  { id: "tasks", label: "Tarefas" },
  { id: "notes", label: "Notas" },
  { id: "clipboard", label: "Clipboard" },
  { id: "meetings", label: "Reuniões" },
  { id: "agenda", label: "Agenda" },
  { id: "github", label: "GitHub" },
  { id: "gitlab", label: "GitLab" },
  { id: "settings", label: "Ajustes" },
];

export const panelId = (t: Tab) => `panel-${t}`;
const tabId = (t: Tab) => `aba-${t}`;

/** WAI-ARIA APG tabs pattern: one Tab stop, arrows/Home/End switch tabs. */
type Props = { current: Tab; onChange: (t: Tab) => void; tabs?: typeof TABS };

export default function TabBar({ current, onChange, tabs = TABS }: Props) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  function onKeyDown(e: React.KeyboardEvent) {
    const i = tabs.findIndex((t) => t.id === current);
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
      aria-label="seções do widget"
      onKeyDown={onKeyDown}
      className="flex shrink-0 gap-0.5 overflow-x-auto px-3 pt-2 text-xs"
    >
      {tabs.map((t, i) => (
        <button
          key={t.id}
          ref={(el) => {
            refs.current[t.id] = el;
          }}
          id={tabId(t.id)}
          type="button"
          role="tab"
          aria-selected={current === t.id}
          // Only the active panel exists in the DOM; pointing at the others would be a broken reference.
          aria-controls={current === t.id ? panelId(t.id) : undefined}
          tabIndex={current === t.id ? 0 : -1}
          onClick={() => onChange(t.id)}
          title={`Alt+${i + 1}`}
          className={`min-h-7 shrink-0 rounded-lg px-1.5 ${
            current === t.id ? "bg-edge font-semibold text-fg" : "text-muted hover:text-fg"
          }`}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
