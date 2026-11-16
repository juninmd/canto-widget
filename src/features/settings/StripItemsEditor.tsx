import { STRIP_ITEMS, type StripItem } from "../../lib/api";
import { t } from "../../i18n";
import { ICONS } from "../strip/stripIcons";
import { TINT } from "../strip/stripModel";
import { Switch } from "./controls";

/** Switched-on items first, in the pill's order, then the rest in the catalog's. */
export function editorRows(items: StripItem[]): StripItem[] {
  return [...items, ...STRIP_ITEMS.filter((i) => !items.includes(i))];
}

/** Moves an item one place; the ends stay put. */
export function move(items: StripItem[], item: StripItem, by: -1 | 1): StripItem[] {
  const at = items.indexOf(item);
  const to = at + by;
  if (at < 0 || to < 0 || to >= items.length) return items;
  const next = [...items];
  [next[at], next[to]] = [next[to], next[at]];
  return next;
}

type Props = { items: StripItem[]; onChange: (items: StripItem[]) => void };

const ARROW = "canto-hit grid h-6 w-6 place-items-center rounded-md text-muted hover:bg-hover hover:text-fg disabled:opacity-30";

export default function StripItemsEditor({ items, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[11px] text-faint">{t("settings.strip.itemsHint")}</p>
      <ul className="flex flex-col divide-y divide-edge overflow-hidden rounded-xl border border-edge bg-ink/40">
        {editorRows(items).map((item) => {
          const on = items.includes(item);
          const at = items.indexOf(item);
          const name = t(`strip.item.${item}`);
          return (
            <li key={item} className={`flex min-h-[40px] items-center gap-2 px-3 transition-colors ${on ? "bg-accent/[0.06]" : ""}`}>
              <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 py-1 text-xs">
                <span
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-lg transition-opacity"
                  style={{ color: TINT[item], background: `color-mix(in srgb, ${TINT[item]} 16%, transparent)`, opacity: on ? 1 : 0.45 }}
                >
                  {ICONS[item]}
                </span>
                <span className={`min-w-0 flex-1 truncate ${on ? "font-medium text-fg" : "text-muted"}`}>{name}</span>
                <Switch checked={on} label={name} onChange={(next) => onChange(next ? [...items, item] : items.filter((i) => i !== item))} />
              </label>
              <span className="flex w-[52px] shrink-0 justify-end gap-0.5">
                {on && (
                  <>
                    <button type="button" aria-label={t("settings.strip.up", { item: name })} disabled={at === 0} onClick={() => onChange(move(items, item, -1))} className={ARROW}>
                      ↑
                    </button>
                    <button type="button" aria-label={t("settings.strip.down", { item: name })} disabled={at === items.length - 1} onClick={() => onChange(move(items, item, 1))} className={ARROW}>
                      ↓
                    </button>
                  </>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
