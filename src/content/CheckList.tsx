import { useMemo, useState } from "react";
import { Search, Check } from "lucide-react";

export type CheckItem = {
  id: string;
  label: string;
  hint?: string;
};

type Props = {
  items: CheckItem[];
  selected: string[];
  onToggle: (id: string) => void;
  placeholder?: string;
  maxHeight?: string;
  searchable?: boolean;
};

export const CheckList = ({
  items,
  selected,
  onToggle,
  placeholder = "Suchen...",
  maxHeight = "max-h-72",
  searchable = true,
}: Props) => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.label.toLowerCase().includes(q) ||
        i.hint?.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q),
    );
  }, [items, query]);

  return (
    <div className="flex flex-col gap-2">
      {searchable && (
        <div className="relative">
          <Search
            size={12}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] py-1.5 pl-7 pr-3 text-xs text-[var(--color-text)] focus:border-[var(--color-amber-dim)] focus:outline-none"
          />
        </div>
      )}
      <ul className={`flex flex-col gap-0.5 overflow-y-auto ${maxHeight}`}>
        {filtered.map((item) => {
          const active = selected.includes(item.id);
          return (
            <li key={item.id}>
              <button
                onClick={() => onToggle(item.id)}
                className={`flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-left text-[13px] transition ${
                  active
                    ? "bg-[var(--color-amber)]/10 text-[var(--color-text)]"
                    : "text-[var(--color-text-dim)] hover:bg-[var(--color-panel-hover)] hover:text-[var(--color-text)]"
                }`}
              >
                <span
                  className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
                    active
                      ? "border-[var(--color-amber)] bg-[var(--color-amber)] text-neutral-950"
                      : "border-[var(--color-border-strong)]"
                  }`}
                >
                  {active && <Check size={10} strokeWidth={3} />}
                </span>
                <span className="flex-1 truncate">{item.label}</span>
                {item.hint && (
                  <span className="truncate text-[11px] text-[var(--color-text-faint)]">
                    {item.hint}
                  </span>
                )}
              </button>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="px-2 py-3 text-center text-xs text-[var(--color-text-faint)]">
            Keine Treffer
          </li>
        )}
      </ul>
    </div>
  );
};
