import { useState } from "react";
import { X, Sparkles, Loader2 } from "lucide-react";
import { useStore } from "@/store";
import { runLlmFromIdea } from "@/lib/llm";

export const IdeaModal = () => {
  const { state, dispatch } = useStore();
  const [idea, setIdea] = useState("");

  if (!state.ideaOpen) return null;

  const run = async () => {
    if (!idea.trim()) return;
    await runLlmFromIdea(state, idea, dispatch);
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={() => !state.ideaLoading && dispatch({ type: "TOGGLE_IDEA" })}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)]/85 shadow-2xl backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between p-5 pb-0">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[var(--color-amber)]" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-text)]">
              Aus Idee bauen (KI)
            </h2>
          </div>
          <button
            onClick={() => dispatch({ type: "TOGGLE_IDEA" })}
            disabled={state.ideaLoading}
            className="rounded-full p-1.5 text-[var(--color-text-dim)] hover:bg-[var(--color-panel-hover)] hover:text-[var(--color-text)] disabled:opacity-40"
          >
            <X size={16} />
          </button>
        </header>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5 pt-4">
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          rows={4}
          placeholder="z.B. melancholischer Synthwave-Track, dunkle Atmosphäre, weibliche Stimme, mittleres Tempo..."
          disabled={state.ideaLoading}
          className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] focus:border-[var(--color-amber-dim)] focus:outline-none disabled:opacity-60"
        />

        {state.ideaOutput && (
          <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded border border-[var(--color-amber-dim)] bg-[var(--color-bg)] p-3 font-mono text-xs text-[var(--color-text)]">
            {state.ideaOutput}
          </pre>
        )}

        {state.ideaError && (
          <p className="rounded border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-3 text-xs text-[var(--color-danger)]">
            {state.ideaError}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              dispatch({ type: "IDEA_RESET" });
              // Idea-Seed im Roh-Style-Prompt ebenfalls entfernen.
              dispatch({ type: "SET_CUSTOM_STYLE_PROMPT", value: "" });
            }}
            disabled={!state.ideaOutput || state.ideaLoading}
            className="rounded border border-[var(--color-border)] px-4 py-2 text-xs text-[var(--color-text-dim)] hover:text-[var(--color-text)] disabled:opacity-40"
          >
            Zurücksetzen
          </button>
          <button
            onClick={run}
            disabled={!idea.trim() || state.ideaLoading}
            className="flex items-center gap-2 rounded bg-[var(--color-amber)] px-4 py-2 text-sm font-medium text-neutral-950 transition hover:bg-[var(--color-amber-strong)] disabled:opacity-40"
          >
            {state.ideaLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {state.ideaLoading ? "KI schreibt..." : "Generieren"}
          </button>
        </div>

        <p className="text-[11px] text-[var(--color-text-faint)]">
          Modell:{" "}
          <span className="text-[var(--color-amber)]">{state.settings.ollamaModel}</span> @{" "}
          <span className="text-[var(--color-text-dim)]">{state.settings.ollamaUrl}</span>
        </p>
        </div>
      </div>
    </div>
  );
};
