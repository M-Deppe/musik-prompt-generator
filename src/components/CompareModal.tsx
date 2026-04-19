import { useMemo } from "react";
import { X, ArrowRight } from "lucide-react";
import type { HistoryEntry } from "@/lib/persistence";
import { scorePrompt } from "@/lib/validator";
import { buildStylePrompt } from "@/lib/promptBuilder";

// Side-by-side-Vergleich zweier History-Entries. Zeigt Genre, BPM, Moods,
// Instruments, Score + Differenz + Style-Output. User kann einen der beiden
// als aktuellen Prompt uebernehmen.

type Props = {
  a: HistoryEntry;
  b: HistoryEntry;
  onClose: () => void;
  onApply: (entry: HistoryEntry) => void;
};

const EntryColumn = ({
  entry,
  label,
  otherScore,
  onApply,
}: {
  entry: HistoryEntry;
  label: string;
  otherScore: number;
  onApply: () => void;
}) => {
  const score = useMemo(() => {
    const text = entry.llmOutput?.trim() || entry.stylePrompt || buildStylePrompt(entry.prompt);
    return scorePrompt(entry.prompt, text).total;
  }, [entry]);
  const delta = score - otherScore;
  const deltaLabel = delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : "±0";
  const deltaColor =
    delta > 0
      ? "text-[var(--color-success)]"
      : delta < 0
        ? "text-[var(--color-danger)]"
        : "text-[var(--color-text-faint)]";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto rounded border border-[var(--color-border)] bg-[var(--color-bg)]/60 p-3">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
        <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-faint)]">{label}</span>
        <span className="flex items-center gap-2 text-[11px]">
          <span className="font-bold tabular-nums text-[var(--color-text)]">{score}/100</span>
          <span className={`tabular-nums ${deltaColor}`}>Δ {deltaLabel}</span>
        </span>
      </div>

      <div className="flex flex-col gap-0.5 text-[11px]">
        <div className="font-semibold text-[var(--color-text)]">
          {entry.title || entry.prompt.mainGenre || "Untitled"}
        </div>
        <div className="text-[10px] text-[var(--color-text-faint)]">
          {new Date(entry.createdAt).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })}
        </div>
      </div>

      <div className="grid grid-cols-[80px_1fr] gap-x-3 gap-y-1 text-[11px]">
        {entry.prompt.mainGenre && (
          <>
            <span className="text-[var(--color-text-faint)]">Genre</span>
            <span className="text-[var(--color-text)]">
              {entry.prompt.mainGenre}
              {entry.prompt.subgenre ? ` · ${entry.prompt.subgenre}` : ""}
            </span>
          </>
        )}
        {entry.prompt.bpm && (
          <>
            <span className="text-[var(--color-text-faint)]">BPM</span>
            <span className="text-[var(--color-text)] tabular-nums">{entry.prompt.bpm}</span>
          </>
        )}
        {entry.prompt.moods.length > 0 && (
          <>
            <span className="text-[var(--color-text-faint)]">Moods</span>
            <span className="text-[var(--color-text-dim)]">{entry.prompt.moods.join(", ")}</span>
          </>
        )}
        {entry.prompt.instruments.length > 0 && (
          <>
            <span className="text-[var(--color-text-faint)]">Instrumente</span>
            <span className="text-[var(--color-text-dim)]">{entry.prompt.instruments.slice(0, 5).join(", ")}</span>
          </>
        )}
        {entry.prompt.vocalCharacter && (
          <>
            <span className="text-[var(--color-text-faint)]">Vocal</span>
            <span className="text-[var(--color-text-dim)]">{entry.prompt.vocalCharacter}</span>
          </>
        )}
        {entry.rating && (
          <>
            <span className="text-[var(--color-text-faint)]">Rating</span>
            <span className="text-[var(--color-amber)]">{"★".repeat(entry.rating)}</span>
          </>
        )}
      </div>

      {(entry.llmOutput || entry.stylePrompt) && (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-[var(--color-amber-dim)]">Style</span>
          <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-words rounded bg-[var(--color-panel)] p-2 font-mono text-[10px] leading-relaxed text-[var(--color-text)]">
            {entry.llmOutput || entry.stylePrompt}
          </pre>
        </div>
      )}

      <button
        onClick={onApply}
        className="mt-auto flex items-center justify-center gap-1.5 rounded border border-[var(--color-amber-dim)] bg-[var(--color-amber)]/10 px-3 py-1.5 text-[11px] text-[var(--color-amber)] hover:bg-[var(--color-amber)]/20"
      >
        <ArrowRight size={11} />
        Diesen uebernehmen
      </button>
    </div>
  );
};

export const CompareModal = ({ a, b, onClose, onApply }: Props) => {
  const scoreA = useMemo(
    () => scorePrompt(a.prompt, a.llmOutput?.trim() || a.stylePrompt).total,
    [a],
  );
  const scoreB = useMemo(
    () => scorePrompt(b.prompt, b.llmOutput?.trim() || b.stylePrompt).total,
    [b],
  );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-[var(--color-amber-dim)] bg-[var(--color-panel)]/85 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-border)] px-4 py-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-amber)]">
            Vergleich
          </span>
          <button onClick={onClose} className="rounded-full p-1 text-[var(--color-text-dim)] hover:bg-[var(--color-panel-hover)] hover:text-[var(--color-text)]">
            <X size={14} />
          </button>
        </div>
        <div className="flex min-h-0 flex-1 gap-3 overflow-hidden p-3 md:flex-row">
          <EntryColumn entry={a} label="A" otherScore={scoreB} onApply={() => onApply(a)} />
          <EntryColumn entry={b} label="B" otherScore={scoreA} onApply={() => onApply(b)} />
        </div>
      </div>
    </div>
  );
};
