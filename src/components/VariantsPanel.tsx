import { useMemo, useState } from "react";
import { Shield, FlaskConical, Minus, Zap, Copy, Check, Loader2, Trophy, Disc, Sparkles, Film, Radio } from "lucide-react";
import { useStore, type VariantId } from "@/store";
import { runLlmVariants } from "@/lib/llm";
import { scorePrompt } from "@/lib/validator";
import { computeVariantMetrics, labelVariants } from "@/lib/variantMetrics";
import {
  loadStats,
  recordWinner,
  computePreferences,
  topVariant,
  totalVotes,
} from "@/lib/variantStats";

// Variant-Konfiguration: kurzer Code (fuer Verteilungs-Anzeige), Label,
// Tooltip mit Charakter-Beschreibung, Icon und Akzentfarbe.
const VARIANTS: {
  id: VariantId;
  short: string;
  label: string;
  description: string;
  icon: typeof Shield;
  color: string;
}[] = [
  { id: "safe", short: "Sa", label: "Safe", description: "Radio-freundlich, klassische Tags, sicher", icon: Shield, color: "text-sky-400" },
  { id: "experimental", short: "Ex", label: "Experimental", description: "Pusht Grenzen, ungewoehnliche Kombinationen", icon: FlaskConical, color: "text-fuchsia-400" },
  { id: "minimal", short: "Mi", label: "Minimal", description: "3-5 essentielle Descriptoren, nichts optionales", icon: Minus, color: "text-emerald-400" },
  { id: "intense", short: "In", label: "Intense", description: "Maximale Energie, voll aufgedreht", icon: Zap, color: "text-orange-400" },
  { id: "vintage", short: "Vi", label: "Vintage", description: "Analog warmth, tape, vinyl, pre-1990 Aesthetik", icon: Disc, color: "text-amber-500" },
  { id: "modern", short: "Mo", label: "Modern", description: "2025 Pop-Production, streaming-LUFS, hyper-cleaned", icon: Sparkles, color: "text-cyan-400" },
  { id: "cinematic", short: "Ci", label: "Cinematic", description: "Score-artig, orchestral, trailer-tauglich", icon: Film, color: "text-violet-400" },
  { id: "lofi", short: "Lo", label: "Lo-Fi", description: "Bedroom, cassette warmth, organische Imperfektion", icon: Radio, color: "text-rose-400" },
];

const scoreColor = (n: number): string => {
  if (n >= 70) return "text-[var(--color-success)]";
  if (n >= 40) return "text-[var(--color-warn)]";
  return "text-[var(--color-danger)]";
};

const deltaColor = (delta: number): string => {
  if (delta > 0) return "text-[var(--color-success)]";
  if (delta < 0) return "text-[var(--color-danger)]";
  return "text-[var(--color-text-faint)]";
};

const formatDelta = (delta: number): string => {
  if (delta > 0) return `+${delta}`;
  if (delta < 0) return `${delta}`;
  return "±0";
};

export const VariantsPanel = () => {
  const { state, dispatch } = useStore();
  const hasAny = Object.values(state.llmVariants).some(Boolean);
  // Stats werden lokal in State gehalten und bei jedem Winner-Vote aus dem
  // localStorage neu geladen — so updated das UI sofort ohne Reload.
  const [stats, setStats] = useState(() => loadStats());
  const prefs = computePreferences(stats);
  const top = topVariant(stats);

  const voteWinner = (id: VariantId) => {
    setStats(recordWinner(id));
  };

  // Score auf Haupt-Output (wenn vorhanden) als Vergleichsbasis fuer Delta.
  const mainScore = useMemo(
    () => (state.llmOutput.trim() ? scorePrompt(state.prompt, state.llmOutput) : null),
    [state.llmOutput, state.prompt],
  );

  // Pro Variante Metriken berechnen + Extremum-Labels ueber alle 4 ableiten.
  const variantData = useMemo(() => {
    return VARIANTS.map((v) => {
      const text = state.llmVariants[v.id];
      const metrics = computeVariantMetrics(state.prompt, text || "");
      return { id: v.id, text, metrics, hasOutput: !!text?.trim() };
    });
  }, [state.llmVariants, state.prompt]);

  const labels = useMemo(() => labelVariants(variantData), [variantData]);

  const run = () => runLlmVariants(state, dispatch);
  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };
  const apply = (text: string) => {
    dispatch({ type: "LLM_DONE", output: text });
  };

  const totalVotesCount = totalVotes(stats);

  return (
    <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
      <header className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text)]">
          <FlaskConical size={11} className="text-[var(--color-amber)]" />
          Style-Varianten
          <span className="rounded-full bg-[var(--color-panel-hover)] px-1.5 text-[10px] font-medium text-[var(--color-text-dim)]">
            {VARIANTS.length}
          </span>
          {mainScore && hasAny && (
            <span
              className="ml-1 rounded-full bg-[var(--color-panel-hover)] px-1.5 text-[10px] font-medium text-[var(--color-text-dim)]"
              title="Score des aktuellen Haupt-Outputs als Vergleichsbasis"
            >
              Δ vs. {mainScore.total}
            </span>
          )}
        </span>
        <button
          onClick={run}
          disabled={state.llmVariantsLoading}
          title={`Generiert ${VARIANTS.length} parallele Style-Varianten via Ollama`}
          className="flex shrink-0 items-center gap-1 rounded-full border border-[var(--color-amber-dim)] bg-[var(--color-amber)]/10 px-3 py-1 text-[11px] text-[var(--color-amber)] transition hover:bg-[var(--color-amber)]/20 disabled:opacity-40"
        >
          {state.llmVariantsLoading ? (
            <Loader2 size={10} className="animate-spin" />
          ) : (
            <FlaskConical size={10} />
          )}
          {state.llmVariantsLoading ? "laeuft..." : `${VARIANTS.length}x generieren`}
        </button>
      </header>

      {/* Favoriten-Anzeige: erscheint erst ab 3 Votes, sonst wenig aussagekraeftig.
          Verteilung wird in einer 2. Zeile dargestellt — bei 8 Varianten passt
          die Inline-Liste sonst nicht mehr zuverlaessig. */}
      {prefs && top && totalVotesCount >= 3 && (
        <div className="mb-2 flex flex-col gap-1 rounded border border-[var(--color-amber-dim)]/30 bg-[var(--color-amber)]/5 px-2 py-1 text-[10px]">
          <div className="flex items-center gap-1.5">
            <Trophy size={10} className="text-[var(--color-amber)]" />
            <span className="text-[var(--color-text-dim)]">Dein Favorit:</span>
            <span className="font-semibold text-[var(--color-amber)]">
              {VARIANTS.find((v) => v.id === top)?.label ?? top}
            </span>
            <span className="text-[var(--color-text-faint)]">({prefs[top]}%)</span>
            <span className="ml-auto text-[var(--color-text-faint)]">
              {totalVotesCount} Votes
            </span>
          </div>
          <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[var(--color-text-faint)]">
            {VARIANTS.filter((v) => prefs[v.id] > 0).map((v) => (
              <span key={v.id} title={v.label}>
                {v.short} {prefs[v.id]}%
              </span>
            ))}
          </div>
        </div>
      )}

      {!hasAny && !state.llmVariantsLoading && (
        <p className="py-2 text-center text-[11px] leading-relaxed text-[var(--color-text-faint)]">
          Erzeugt {VARIANTS.length} Style-Varianten parallel:{" "}
          <span className="text-[var(--color-text-dim)]">
            {VARIANTS.map((v) => v.label).join(" · ")}
          </span>
        </p>
      )}

      {(hasAny || state.llmVariantsLoading) && (
        <div className="grid grid-cols-2 gap-2">
          {VARIANTS.map((v) => {
            const Icon = v.icon;
            const data = variantData.find((d) => d.id === v.id)!;
            const text = data.text;
            const loading = state.llmVariantsLoading && !text;
            const label = labels[v.id];
            const delta = mainScore && data.hasOutput ? data.metrics.score.total - mainScore.total : null;

            return (
              <div
                key={v.id}
                className="flex flex-col gap-1 rounded border border-[var(--color-border)] bg-[var(--color-panel)] p-2"
              >
                {/* Header: Variant-Label + Action-Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span
                    className={`flex shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-wider ${v.color}`}
                    title={v.description}
                  >
                    <Icon size={10} />
                    {v.label}
                  </span>
                  {text && (
                    <div className="flex shrink-0 gap-0.5">
                      <button
                        onClick={() => voteWinner(v.id)}
                        title="Als Favorit markieren — hilft dem System deine Vorlieben zu lernen"
                        className="rounded-full p-1 text-[var(--color-amber-dim)] transition hover:bg-[var(--color-amber)]/10 hover:text-[var(--color-amber)]"
                      >
                        <Trophy size={10} />
                      </button>
                      <button
                        onClick={() => apply(text)}
                        title="Als Haupt-Output übernehmen"
                        className="rounded-full p-1 text-[var(--color-amber)] hover:bg-[var(--color-amber)]/10"
                      >
                        <Check size={10} strokeWidth={3} />
                      </button>
                      <button
                        onClick={() => copy(text)}
                        title="Kopieren"
                        className="rounded-full p-1 text-[var(--color-text-dim)] hover:bg-[var(--color-panel-hover)] hover:text-[var(--color-text)]"
                      >
                        <Copy size={10} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Score + Delta + Word-Count */}
                {data.hasOutput && (
                  <div className="flex items-center justify-between text-[10px]">
                    <span className={`font-bold tabular-nums ${scoreColor(data.metrics.score.total)}`}>
                      {data.metrics.score.total}
                      <span className="text-[9px] font-normal text-[var(--color-text-faint)]">/100</span>
                    </span>
                    <div className="flex items-center gap-1.5 tabular-nums">
                      {delta !== null && (
                        <span
                          className={deltaColor(delta)}
                          title="Delta zum Haupt-Output-Score"
                        >
                          Δ {formatDelta(delta)}
                        </span>
                      )}
                      <span className="text-[var(--color-text-faint)]" title="Wortanzahl">
                        {data.metrics.wordCount}w
                      </span>
                    </div>
                  </div>
                )}

                {/* Extremum-Label */}
                {label && (
                  <span className={`self-start rounded-full border border-[var(--color-amber-dim)]/40 bg-[var(--color-amber)]/10 px-1.5 py-0 text-[9px] font-medium uppercase tracking-wider text-[var(--color-amber)]`}>
                    {label}
                  </span>
                )}

                {/* Output-Text */}
                <pre className="max-h-28 overflow-auto whitespace-pre-wrap break-words text-[10px] leading-snug text-[var(--color-text-dim)]">
                  {loading ? (
                    <span className="flex items-center gap-1 text-[var(--color-text-faint)]">
                      <Loader2 size={10} className="animate-spin" />
                      schreibt...
                    </span>
                  ) : (
                    text || <span className="text-[var(--color-text-faint)]">—</span>
                  )}
                </pre>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
