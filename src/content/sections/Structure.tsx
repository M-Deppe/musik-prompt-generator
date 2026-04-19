import { useState } from "react";
import { Wand2, Loader2 } from "lucide-react";
import { AccordionSection } from "@/components/AccordionSection";
import { CheckList, type CheckItem } from "@/content/CheckList";
import { useStore } from "@/store";
import { generate } from "@/lib/ollama";
import { getSubgenreById } from "@/lib/allGenres";

const SONG_FORMS: CheckItem[] = [
  { id: "form-pop-classical", label: "Pop Classical", hint: "Verse–Chorus–Verse–Chorus–Bridge–Chorus" },
  { id: "form-pop-modern", label: "Pop Modern", hint: "Intro–Verse–Pre–Chorus–Verse–Pre–Chorus–Bridge–Chorus" },
  { id: "form-edm", label: "EDM", hint: "Intro–Build–Drop–Break–Build–Drop–Outro" },
  { id: "form-rock-classic", label: "Rock Classic", hint: "Verse–Chorus–Verse–Chorus–Solo–Chorus" },
  { id: "form-rap-trap", label: "Rap/Trap", hint: "Intro–Hook–Verse–Hook–Verse–Hook–Outro" },
  { id: "form-short", label: "Short", hint: "Intro–Verse–Chorus–Outro (<2min)" },
  { id: "form-ambient", label: "Ambient/Drone", hint: "keine klassische Form" },
  { id: "form-jazz-standard", label: "Jazz Standard", hint: "AABA 32-Takt" },
  { id: "form-blues-12", label: "12-Bar Blues", hint: "klassisches Blues-Schema, I-IV-V" },
  { id: "form-through-composed", label: "Through-composed", hint: "keine Wiederholung" },
];

const SECTION_LENGTH: CheckItem[] = [
  { id: "sl-intro-short", label: "Kurzes Intro (~8s)", hint: "schneller Einstieg, Pop/Streaming-freundlich" },
  { id: "sl-intro-long", label: "Langes Intro (~20s)", hint: "Aufbau, Atmosphaere, klassisch" },
  { id: "sl-verse-4bars", label: "Kurze Verses (4 Takte)", hint: "knapp, Pop-Radio" },
  { id: "sl-verse-8bars", label: "Normale Verses (8 Takte)", hint: "Standard-Pop/Rock" },
  { id: "sl-verse-16bars", label: "Lange Verses (16 Takte)", hint: "Hip-Hop-Standard, storytelling" },
  { id: "sl-chorus-8bars", label: "Kompakter Chorus (8 Takte)", hint: "knackig, einpraegsam" },
  { id: "sl-chorus-16bars", label: "Langer Chorus (16 Takte)", hint: "breiter, hymnisch" },
  { id: "sl-outro-fade", label: "Outro: Fade Out", hint: "langsames Ausblenden — klassische Popform" },
  { id: "sl-outro-hard", label: "Outro: Hard Cut", hint: "abrupter Schluss — modern, Indie" },
  { id: "sl-outro-extended", label: "Outro: Extended (20s+)", hint: "Jam/Improvisations-Ausklang" },
];

const TRANSITIONS: CheckItem[] = [
  { id: "trans-smooth", label: "Smooth", hint: "fliessender Uebergang — Pop/Jazz" },
  { id: "trans-abrupt", label: "Abrupt", hint: "harter Schnitt — Indie, Experimental" },
  { id: "trans-build-up", label: "Build-Up", hint: "Spannungsaufbau — EDM, Trailer" },
  { id: "trans-breakdown", label: "Breakdown", hint: "Ruhe-Moment mit reduzierter Instrumentation" },
  { id: "trans-key-change", label: "Key Change", hint: "Tonart-Wechsel — letzter Chorus, Pop-Anthem" },
  { id: "trans-tempo-change", label: "Tempo Change", hint: "BPM-Wechsel — dramatische Wende" },
  { id: "trans-half-time-switch", label: "Half-Time Switch", hint: "Drums halbieren Tempo — Trap, Rock" },
  { id: "trans-beat-switch", label: "Beat Switch", hint: "kompletter Rhythmus-Wechsel — Hip-Hop" },
  { id: "trans-drop", label: "Drop-Transition", hint: "EDM-Bass-Drop — maximale Energie" },
  { id: "trans-silence", label: "Silence Break", hint: "kurze Stille vor Einstieg — Impact" },
];

export const Structure = () => {
  const { state, dispatch } = useStore();
  const sel = (pool: CheckItem[]) => state.prompt.production.filter((p) => pool.some((i) => i.id === p));

  return (
    <div className="flex flex-col gap-3">
      <AccordionSection title="Songform" defaultOpen selectionCount={sel(SONG_FORMS).length} onClear={() => sel(SONG_FORMS).forEach((id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id }))}>
        <CheckList items={SONG_FORMS} selected={sel(SONG_FORMS)} onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })} placeholder="Songform..." />
      </AccordionSection>
      <AccordionSection title="Sektions-Längen" selectionCount={sel(SECTION_LENGTH).length} onClear={() => sel(SECTION_LENGTH).forEach((id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id }))}>
        <CheckList items={SECTION_LENGTH} selected={sel(SECTION_LENGTH)} onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })} />
      </AccordionSection>
      <AccordionSection title="Übergänge" optional selectionCount={sel(TRANSITIONS).length} onClear={() => sel(TRANSITIONS).forEach((id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id }))}>
        <CheckList items={TRANSITIONS} selected={sel(TRANSITIONS)} onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })} />
      </AccordionSection>

      <ArrangementGenerator />
    </div>
  );
};

const ArrangementGenerator = () => {
  const { state, dispatch } = useStore();
  const sub = getSubgenreById(state.prompt.subgenre);
  const [durationSec, setDurationSec] = useState(180);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    setOutput("");
    try {
      const systemPrompt = `Du bist Song-Arranger. Erzeuge eine präzise Zeitstempel-Struktur fuer einen Track.

REGELN:
- Nutze [Section: Beschreibung, Dauer] Format.
- Jede Zeile eine Sektion mit Zeitstempel [mm:ss-mm:ss].
- Beschreibung knapp: 2-4 Keywords (Energie, Instrumente, Dynamik).
- Gesamtdauer exakt einhalten.
- Keine Erklärung — nur die Struktur.`;

      const userPrompt = `Erzeuge ein Arrangement:
Subgenre: ${sub?.name ?? "Pop"}
BPM: ${state.prompt.bpm ?? 120}
Gesamtdauer: ${durationSec} Sekunden (${Math.floor(durationSec / 60)}:${(durationSec % 60).toString().padStart(2, "0")})
Moods: ${state.prompt.moods.join(", ") || "offen"}

Format: Eine Zeile pro Sektion, z.B.:
[Intro: 0:00-0:15, ambient pad build, soft]
[Verse 1: 0:15-0:45, minimal drums, whispered vocals]
[Chorus: 0:45-1:15, full band explosion, anthemic]`;

      const out = await generate({
        baseUrl: state.settings.ollamaUrl,
        model: state.settings.ollamaModel,
        system: systemPrompt,
        prompt: userPrompt,
        temperature: state.settings.temperature,
        onChunk: (_chunk, full) => setOutput(full),
        cloudFallback: state.settings,
      });
      setOutput(out.trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => navigator.clipboard.writeText(output);
  const apply = () => {
    if (!output) return;
    const lines = output.split("\n").filter((l) => l.trim().startsWith("["));
    const next = (state.prompt.lyrics ? state.prompt.lyrics + "\n\n" : "") + lines.join("\n");
    dispatch({ type: "SET_LYRICS", lyrics: next });
  };

  return (
    <AccordionSection title="KI-Arrangement-Generator" optional>
      <div className="flex flex-col gap-3">
        <p className="text-xs text-[var(--color-text-dim)]">
          Nutzt Subgenre + BPM + Moods und erzeugt ein Zeitstempel-Arrangement mit Sektions-Längen.
        </p>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-[var(--color-text-dim)]">
            Gesamtdauer:
            <input
              type="range"
              min={60}
              max={360}
              step={10}
              value={durationSec}
              onChange={(e) => setDurationSec(Number(e.target.value))}
              className="accent-[var(--color-amber)]"
            />
            <span className="w-16 tabular-nums text-[var(--color-text)]">
              {Math.floor(durationSec / 60)}:{(durationSec % 60).toString().padStart(2, "0")}
            </span>
          </label>
        </div>
        <button
          onClick={run}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-full border border-[var(--color-amber-dim)] bg-[var(--color-amber)]/10 px-4 py-2 text-sm text-[var(--color-amber)] transition hover:bg-[var(--color-amber)]/20 disabled:opacity-40"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
          {loading ? "KI arrangiert..." : "Arrangement generieren"}
        </button>
        {output && (
          <>
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-3 font-mono text-[11px] text-[var(--color-text)]">
              {output}
            </pre>
            <div className="flex gap-2">
              <button
                onClick={copy}
                className="flex-1 rounded border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-text)] hover:bg-[var(--color-panel-hover)]"
              >
                Kopieren
              </button>
              <button
                onClick={apply}
                className="flex-1 rounded border border-[var(--color-amber-dim)] bg-[var(--color-amber)]/10 px-3 py-1.5 text-xs text-[var(--color-amber)] hover:bg-[var(--color-amber)]/20"
              >
                In Lyrics einfuegen
              </button>
            </div>
          </>
        )}
        {error && (
          <p className="rounded border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-2 text-[11px] text-[var(--color-danger)]">
            {error}
          </p>
        )}
      </div>
    </AccordionSection>
  );
};
