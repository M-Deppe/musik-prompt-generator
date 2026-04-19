import { Loader2, Wand2 } from "lucide-react";
import { AccordionSection } from "@/components/AccordionSection";
import { getSubgenreById } from "@/lib/allGenres";
import { useStore } from "@/store";
import { runLlmBuilder } from "@/lib/llm";

const Part = ({ label, content, color }: { label: string; content?: string; color: string }) => (
  <div className="grid grid-cols-[110px_1fr] items-baseline gap-3 border-b border-[var(--color-border)] py-2 last:border-0">
    <span className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${color}`}>{label}</span>
    <span className="text-sm text-[var(--color-text)]">
      {content || <span className="text-[var(--color-text-faint)]">— nicht gesetzt —</span>}
    </span>
  </div>
);

export const Blueprint = () => {
  const { state, dispatch } = useStore();
  const p = state.prompt;
  const sub = getSubgenreById(p.subgenre);
  const runLlm = () => runLlmBuilder(state, dispatch);

  const genrePart = sub?.name;
  const moodPart = p.moods.length > 0 ? p.moods.join(", ") : undefined;
  const vocalPart = [p.vocalCharacter, p.vocalDelivery, p.vocalEffects].filter(Boolean).join(", ") || undefined;
  const instrumentPart = p.instruments.length > 0 ? p.instruments.slice(0, 3).join(", ") : undefined;
  const productionPart = p.production.length > 0 ? p.production.join(", ") : undefined;

  return (
    <div className="flex flex-col gap-3">
      <AccordionSection title="5-Part-Formel" defaultOpen>
        <div className="flex flex-col">
          <Part label="Genre" content={genrePart} color="text-emerald-400" />
          <Part label="Mood" content={moodPart} color="text-orange-400" />
          <Part label="Vocals" content={vocalPart} color="text-pink-400" />
          <Part label="Instrumente" content={instrumentPart} color="text-sky-400" />
          <Part label="Production" content={productionPart} color="text-[var(--color-amber)]" />
          {p.bpm && <Part label="BPM" content={`${p.bpm}`} color="text-fuchsia-400" />}
        </div>
      </AccordionSection>

      <AccordionSection title="Struktur-Vorschlag" optional>
        <pre className="whitespace-pre-wrap rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-3 font-mono text-[11px] text-[var(--color-text-dim)]">
{`[Intro: Soft Build, 15s]
[Verse 1]
[Pre-Chorus]
[Chorus: Anthemic, Full Band]
[Verse 2]
[Chorus]
[Bridge: Stripped Back]
[Chorus]
[Outro: Fade Out]`}
        </pre>
      </AccordionSection>

      <AccordionSection title="KI-Blueprint aus Auswahl generieren" optional>
        <div className="flex flex-col gap-2">
          <p className="text-xs text-[var(--color-text-dim)]">
            Ollama formuliert aus deiner aktuellen Auswahl einen ausgearbeiteten Style-Prompt für
            die oben gewählte Ziel-Plattform (Suno = Prosa, Udio = Tag-Liste). Ergebnis erscheint
            im rechten Preview-Panel unter „KI-Ausformulierung".
          </p>
          <button
            onClick={runLlm}
            disabled={state.llmLoading}
            className="flex items-center justify-center gap-2 rounded-full border border-[var(--color-amber-dim)] bg-[var(--color-amber)]/10 px-4 py-2 text-sm text-[var(--color-amber)] transition hover:bg-[var(--color-amber)]/20 disabled:opacity-40"
          >
            {state.llmLoading ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
            {state.llmLoading ? "KI schreibt..." : "Blueprint generieren"}
          </button>
          {state.llmError && (
            <p className="rounded border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-2 text-[11px] text-[var(--color-danger)]">
              {state.llmError}
            </p>
          )}
        </div>
      </AccordionSection>
    </div>
  );
};
