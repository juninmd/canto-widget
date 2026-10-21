import type { ForgeFilter } from "../lib/api";
import { sorts, type Forge } from "../lib/forge";
import { t } from "../i18n";
import ForgeMenu from "./ForgeMenu";
import { SortIcon } from "./ForgeIcons";

type Props = { forge: Forge; filter: ForgeFilter; onApply: (patch: Partial<ForgeFilter>) => void };

/** The sort field and its direction behind one icon button, so the filter bar keeps a single row. */
export default function ForgeSortMenu({ forge, filter, onApply }: Props) {
  const options = sorts(forge);
  const current = options.find((o) => o.sort === filter.sort)?.label ?? filter.sort;
  const desc = filter.order === "desc";
  const label = t("uiForge.sortButton", { sort: current });
  return (
    <ForgeMenu
      label={label}
      menuLabel={t("uiForge.sortMenu")}
      icon={
        <>
          <SortIcon />
          <span aria-hidden="true" className="text-[11px]">
            {desc ? "↓" : "↑"}
          </span>
        </>
      }
      items={[
        ...options.map((o) => ({ key: o.sort, label: o.label, checked: o.sort === filter.sort, onSelect: () => onApply({ sort: o.sort }) })),
        {
          key: "order",
          label: desc ? t("forge.orderDescLabel") : t("forge.orderAscLabel"),
          divider: true,
          onSelect: () => onApply({ order: desc ? "asc" : "desc" }),
        },
      ]}
    />
  );
}
