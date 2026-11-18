import { useRef } from "react";
import { t } from "../i18n";
import { CrossIcon, SearchIcon } from "./Icons";

type Props = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
  /** Marks the field for the global "/" shortcut; only one per tab. */
  shortcut?: boolean;
  className?: string;
  /** Down arrow from the field: the tab moves focus into its list. */
  onArrowDown?: () => void;
};

/** The search box every list tab shares: magnifier, clear button, Esc clears, Down enters the list. */
export default function SearchField({ value, onChange, label, placeholder, shortcut = true, className = "", onArrowDown }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className={`relative min-w-0 ${className}`}>
      <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint">
        <SearchIcon />
      </span>
      <input
        ref={ref}
        type="search"
        value={value}
        data-shortcut={shortcut ? "search" : undefined}
        aria-label={label}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && value) {
            e.preventDefault();
            e.stopPropagation();
            onChange("");
          } else if (e.key === "ArrowDown" && onArrowDown) {
            e.preventDefault();
            onArrowDown();
          }
        }}
        className="canto-field w-full py-2 pl-9 pr-8 text-sm [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          aria-label={t("browse.search.clear")}
          title={t("browse.search.clear")}
          onClick={() => {
            onChange("");
            ref.current?.focus();
          }}
          className="canto-hit absolute right-1.5 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-hover hover:text-fg"
        >
          <CrossIcon />
        </button>
      )}
    </div>
  );
}
