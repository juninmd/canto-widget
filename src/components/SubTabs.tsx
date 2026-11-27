import type { ReactNode } from "react";
import { SubTabs as SonidoSubTabs } from "@juninmd/sonido";

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
 * The original look now lives in Sonido's SubTabs; the app only renames `tabs` to `items`.
 */
export default function SubTabs<K extends string>({ label, tabs, value, onChange, dense = false, iconsOnly = false }: Props<K>) {
  return <SonidoSubTabs label={label} items={tabs} value={value} onChange={onChange} dense={dense} iconsOnly={iconsOnly} />;
}
