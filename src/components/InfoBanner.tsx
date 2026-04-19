import { useState } from "react";
import { Lightbulb, AlertTriangle, ChevronUp, ChevronDown } from "lucide-react";

export const OptimalOrderBanner = () => {
  const [open, setOpen] = useState(true);

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-gradient-to-b from-[var(--color-panel)] to-[oklch(0.16_0.018_60)]">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-sm transition hover:bg-[var(--color-panel-hover)]"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-amber)]/15 ring-1 ring-[var(--color-amber-dim)]/40">
            <Lightbulb size={13} className="text-[var(--color-amber)]" />
          </span>
          <span className="text-[var(--color-text)]">Optimale Reihenfolge</span>
          <span className="text-[var(--color-amber)]">Genre</span>
          <span className="text-[var(--color-text-faint)]">→</span>
          <span className="text-[var(--color-amber)]">Mood</span>
          <span className="text-[var(--color-text-faint)]">→</span>
          <span className="text-[var(--color-amber)]">Instrumente</span>
          <span className="text-[var(--color-text-faint)]">→</span>
          <span className="text-[var(--color-amber)]">Vocals</span>
          <span className="text-[var(--color-text-faint)]">→</span>
          <span className="text-[var(--color-amber)]">Production</span>
        </span>
        {open ? (
          <ChevronUp size={14} className="text-[var(--color-amber)]" />
        ) : (
          <ChevronDown size={14} className="text-[var(--color-text-dim)]" />
        )}
      </button>
      {open && (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-bg)]/40 px-5 py-3">
          <dl className="grid grid-cols-[110px_1fr] gap-x-6 gap-y-1.5 text-xs">
            <dt className="font-medium text-[var(--color-amber)]">Genre</dt>
            <dd className="text-[var(--color-text-dim)]">
              Immer zuerst — Suno und Udio gewichten den Anfang stärker
            </dd>
            <dt className="font-medium text-[var(--color-amber)]">Mood</dt>
            <dd className="text-[var(--color-text-dim)]">Emotionale Richtung direkt nach Genre</dd>
            <dt className="font-medium text-[var(--color-amber)]">Instrumente</dt>
            <dd className="text-[var(--color-text-dim)]">
              Max. 2–3 nennen — mehr verwässert Prioritäten
            </dd>
            <dt className="font-medium text-[var(--color-amber)]">Vocals</dt>
            <dd className="text-[var(--color-text-dim)]">
              Geschlecht + Stil angeben, sonst zufällige Wahl
            </dd>
            <dt className="font-medium text-[var(--color-amber)]">Production</dt>
            <dd className="text-[var(--color-text-dim)]">Am Ende: Lo-fi, Polished, Warm, etc.</dd>
          </dl>
        </div>
      )}
    </div>
  );
};

export const AvoidBanner = () => (
  <div className="flex items-center gap-3 rounded-lg border border-[var(--color-warn)]/25 bg-[var(--color-warn)]/[0.04] px-4 py-2.5 text-xs">
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-warn)]/15">
      <AlertTriangle size={13} className="text-[var(--color-warn)]" />
    </span>
    <span className="text-[var(--color-text-dim)]">
      <span className="font-semibold text-[var(--color-warn)]">Fehler vermeiden:</span>{" "}
      Sätze statt Tags · widersprüchliche Tags · Künstlernamen · 3+ Genres mischen
    </span>
  </div>
);
