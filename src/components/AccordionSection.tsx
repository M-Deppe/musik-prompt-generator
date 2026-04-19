import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, Check, X } from "lucide-react";

type Props = {
  title: string;
  optional?: boolean;
  selectionCount?: number;
  matchCount?: number;
  onClear?: () => void;
  defaultOpen?: boolean;
  children: ReactNode;
};

export const AccordionSection = ({
  title,
  optional,
  selectionCount,
  matchCount,
  onClear,
  children,
}: Props) => {
  const [open, setOpen] = useState(false);
  const hasSelection = (selectionCount ?? 0) > 0;

  return (
    <div
      className={`overflow-hidden rounded-lg border bg-gradient-to-b from-[var(--color-panel)]/80 to-[oklch(0.16_0.018_60)]/80 backdrop-blur-sm transition-all ${
        open
          ? "amber-glow border-[var(--color-amber-dim)]"
          : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
      }`}
    >
      {/* Outer als div mit role=button — sonst bricht das nested Clear-Button
          das HTML-Schema (button-in-button). A11y via tabIndex + onKeyDown. */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(!open);
          }
        }}
        className="flex w-full cursor-pointer flex-wrap items-center justify-between gap-2 px-4 py-3 text-left transition hover:bg-[var(--color-panel-hover)]"
      >
        <span className="flex min-w-0 flex-1 items-center gap-2 truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text)]">
          {title}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {optional && !hasSelection && (
            <span className="rounded-full border border-[var(--color-border-strong)] bg-[var(--color-bg)]/60 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-[var(--color-text-faint)]">
              optional
            </span>
          )}
          {matchCount !== undefined && matchCount > 0 && !hasSelection && (
            <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg)]/60 px-2.5 py-0.5 text-[10px] text-[var(--color-text-dim)]">
              {matchCount} passend
            </span>
          )}
          {hasSelection && (
            <span className="flex items-center gap-1 rounded-full bg-[var(--color-amber)]/15 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-amber)] ring-1 ring-[var(--color-amber-dim)]/40">
              {selectionCount}
              <Check size={10} strokeWidth={3} />
            </span>
          )}
          {hasSelection && onClear && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="rounded-full border border-[var(--color-danger)]/30 p-0.5 text-[var(--color-danger)] transition hover:bg-[var(--color-danger)]/10"
              title="Auswahl loeschen"
            >
              <X size={12} strokeWidth={3} />
            </button>
          )}
          {open ? (
            <ChevronUp size={14} className="text-[var(--color-amber)]" />
          ) : (
            <ChevronDown size={14} className="text-[var(--color-text-dim)]" />
          )}
        </span>
      </div>
      {open && (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-bg)]/40 px-4 py-3">
          {children}
        </div>
      )}
    </div>
  );
};
