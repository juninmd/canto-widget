import type { ReactNode } from "react";
import { Tabs } from "@juninmd/sonido";

type Tab<K extends string> = { key: K; label: string; badge?: number; tone?: "hot" | "info"; icon?: ReactNode };
type Props<K extends string> = {
  label: string;
  tabs: Tab<K>[];
  value: K;
  onChange: (key: K) => void;
  /** Tighter padding, for a switch with many short labels (Sistema has seven). */
  dense?: boolean;
  /** Tabs with an icon show only it until selected; the label stays the tab's name for readers and tooltips. */
  iconsOnly?: boolean;
};

/**
 * The small segmented switch under a tab's header (Status API, GitHub, GitLab, Steam).
 * Keyboard, ARIA and the pill look come from Sonido's Tabs; `dense`/`iconsOnly` only adjust layout.
 */
export default function SubTabs<K extends string>({ label, tabs, value, onChange, dense = false, iconsOnly = false }: Props<K>) {
  return (
    <Tabs
      label={label}
      variant="pill"
      value={value}
      onChange={onChange}
      items={tabs.map((s) => ({
        key: s.key,
        label: s.label,
        icon: s.icon,
        badge: s.badge
          ? s.tone === "hot"
            ? <span aria-hidden="true" className="steam-hot-badge">{s.badge}</span>
            : <span aria-hidden="true">{s.badge}</span>
          : undefined,
      }))}
      className={`${dense ? "canto-subtabs--dense" : ""} ${iconsOnly ? "canto-subtabs--icons" : ""}`.trim() || undefined}
    />
  );
}
