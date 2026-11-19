import { useMemo, useState, type ReactNode } from "react";

export type Column<T> = {
  key: string;
  label: string;
  align?: "right";
  render: (row: T) => ReactNode;
  /** Present means the header sorts by it; the sort compares what this returns. */
  sort?: (row: T) => string | number;
};

type Props<T> = { label: string; columns: readonly Column<T>[]; rows: readonly T[]; rowKey: (row: T) => string; onRow?: (row: T) => void };

/** A compact table for the tab's rows: sticky header, click a header to sort, click it again to reverse. */
export default function DataTable<T>({ label, columns, rows, rowKey, onRow }: Props<T>) {
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const sorted = useMemo(() => {
    const col = sort && columns.find((c) => c.key === sort.key);
    if (!sort || !col?.sort) return rows;
    const by = col.sort;
    return [...rows].sort((a, b) => {
      const x = by(a);
      const y = by(b);
      const cmp = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), undefined, { numeric: true });
      return cmp * sort.dir;
    });
  }, [rows, columns, sort]);

  return (
    <div className="max-h-full overflow-auto rounded-xl border border-edge bg-ink/60">
      <table aria-label={label} className="w-full border-collapse text-xs">
        <thead>
          <tr>
            {columns.map((c) => {
              const active = sort?.key === c.key;
              return (
                <th
                  key={c.key}
                  scope="col"
                  aria-sort={active ? (sort.dir === 1 ? "ascending" : "descending") : c.sort ? "none" : undefined}
                  className={`sticky top-0 whitespace-nowrap border-b border-edge bg-raised p-0 font-semibold text-muted ${c.align === "right" ? "text-right" : "text-left"}`}
                >
                  {c.sort ? (
                    <button
                      type="button"
                      onClick={() => setSort(active && sort.dir === -1 ? null : { key: c.key, dir: active ? -1 : 1 })}
                      className={`canto-hit w-full px-2 py-2 hover:text-fg ${c.align === "right" ? "text-right" : "text-left"} ${active ? "text-accent-text" : ""}`}
                    >
                      {c.label}
                      {active ? (sort.dir === 1 ? " ▲" : " ▼") : ""}
                    </button>
                  ) : (
                    <span className="block px-2 py-2">{c.label}</span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={rowKey(row)} onClick={onRow ? () => onRow(row) : undefined} className={`border-b border-edge last:border-0 hover:bg-hover ${onRow ? "cursor-pointer" : ""}`}>
              {columns.map((c) => (
                <td key={c.key} className={`max-w-[11rem] truncate px-2 py-1.5 ${c.align === "right" ? "text-right tabular-nums" : ""}`}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
