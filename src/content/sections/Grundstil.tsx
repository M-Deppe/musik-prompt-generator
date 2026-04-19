import { useMemo, useState } from "react";
import { Wand2, Sparkles, Loader2, Shuffle } from "lucide-react";
import { AccordionSection } from "@/components/AccordionSection";
import { CheckList } from "@/content/CheckList";
import { MAIN_GENRES, SUBGENRES, getSubgenresByMain, getSubgenreById, getMainGenreById } from "@/lib/allGenres";
import { getSuggestions } from "@/lib/suggestions";
import { generate } from "@/lib/ollama";
import { runCrossover, type CrossoverResult } from "@/lib/genreCrossover";
import { useStore } from "@/store";

export const Grundstil = () => {
  const { state, dispatch } = useStore();
  const { prompt } = state;

  const mainItems = useMemo(
    () => MAIN_GENRES.map((g) => ({ id: g.id, label: g.name, hint: g.description })),
    [],
  );
  const subItems = useMemo(() => {
    if (!prompt.mainGenre) return [];
    return getSubgenresByMain(prompt.mainGenre).map((s) => ({
      id: s.id,
      label: s.name,
      hint: `${s.bpm_min}–${s.bpm_max} BPM`,
    }));
  }, [prompt.mainGenre]);
  // Zweitstil-Items separat memoizen — sonst wird das 200+-Items-Array bei
  // jedem Re-Render neu erzeugt, was die CheckList-Suche traege machen kann
  // (jeder keystroke triggert einen ganzen Filter+Map-Durchlauf).
  const secondaryItems = useMemo(
    () =>
      SUBGENRES.filter((s) => s.id !== prompt.subgenre).map((s) => {
        const parentName = getMainGenreById(s.parent_main)?.name ?? s.parent_main;
        return {
          id: s.id,
          label: s.name,
          hint: `${parentName} · ${s.bpm_min}–${s.bpm_max} BPM`,
        };
      }),
    [prompt.subgenre],
  );

  const sub = getSubgenreById(prompt.subgenre);

  const pickMain = (id: string) => {
    dispatch({ type: "SET_MAIN_GENRE", mainGenre: id });
  };

  const pickSub = (id: string) => {
    const s = getSubgenreById(id);
    if (!s) return;
    const defaultBpm = Math.round((s.bpm_min + s.bpm_max) / 2);
    // User-BPM nur behalten wenn plausibel — nullish coalescing wuerde auch
    // einen ungueltigen 0-Wert durchreichen.
    const keepBpm = prompt.bpm && prompt.bpm > 0;
    dispatch({ type: "SET_SUBGENRE", subgenre: id, bpm: keepBpm ? prompt.bpm : defaultBpm });
  };

  return (
    <div className="flex flex-col gap-3">
      <AccordionSection
        title="Hauptgenre"
        defaultOpen
        selectionCount={prompt.mainGenre ? 1 : 0}
        onClear={() => dispatch({ type: "SET_MAIN_GENRE", mainGenre: "" })}
      >
        <CheckList
          items={mainItems}
          selected={prompt.mainGenre ? [prompt.mainGenre] : []}
          onToggle={pickMain}
          placeholder="Hauptgenre suchen..."
          maxHeight="max-h-80"
        />
      </AccordionSection>

      <AccordionSection
        title="Subgenre (präzise)"
        defaultOpen={!!prompt.mainGenre && !prompt.subgenre}
        selectionCount={prompt.subgenre ? 1 : 0}
        matchCount={subItems.length}
        onClear={() => dispatch({ type: "SET_SUBGENRE", subgenre: "" })}
      >
        {prompt.mainGenre ? (
          <CheckList
            items={subItems}
            selected={prompt.subgenre ? [prompt.subgenre] : []}
            onToggle={pickSub}
            placeholder={`${subItems.length} Subgenres durchsuchen...`}
          />
        ) : (
          <p className="py-4 text-center text-xs text-[var(--color-text-faint)]">
            Erst Hauptgenre wählen
          </p>
        )}
      </AccordionSection>

      <AccordionSection
        title="Zweitstil (optional)"
        optional
        selectionCount={prompt.secondaryGenre ? 1 : 0}
        onClear={() => dispatch({ type: "SET_SECONDARY_GENRE", genre: "" })}
      >
        <p className="mb-2 text-[11px] text-[var(--color-text-faint)]">
          Zweitgenre zum Mischen — ergänzt das Hauptgenre als Fusion. Wähle ein Subgenre aus allen
          Hauptgenres, unabhängig von deiner ersten Wahl.
        </p>
        <CheckList
          items={secondaryItems}
          selected={prompt.secondaryGenre ? [prompt.secondaryGenre] : []}
          onToggle={(id) =>
            dispatch({
              type: "SET_SECONDARY_GENRE",
              genre: prompt.secondaryGenre === id ? "" : id,
            })
          }
          placeholder={`${secondaryItems.length} Subgenres durchsuchen — z.B. "trap", "jazz", "ambient"`}
          maxHeight="max-h-80"
        />
      </AccordionSection>

      <SoundsLike />

      <CrossoverAssistant />

      {sub && (
        <div className="rounded-lg border border-[var(--color-amber-dim)] bg-[var(--color-amber)]/5 p-3">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-[var(--color-amber)]">{sub.name}</span>
            <span className="text-xs text-[var(--color-text-dim)]">
              {sub.bpm_min}–{sub.bpm_max} BPM
            </span>
          </div>
          <p className="mt-1 text-xs text-[var(--color-text-dim)]">{sub.origin}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {sub.keywords.map((k) => (
              <span
                key={k}
                className="rounded bg-[var(--color-bg)] px-1.5 py-0.5 text-[11px] text-[var(--color-text-dim)]"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
      )}

      {sub && <SmartSuggestions parent={sub.parent} subgenreName={sub.name} />}
    </div>
  );
};

// Strukturiertes Schema das der LLM ausspucken soll. Alle Felder optional —
// das Validate-Step verwirft Schrott und behaelt nur typsichere Werte.
type SoundsLikeData = {
  bpm?: number;
  instruments?: string[];
  production?: string[];
  moods?: string[];
  vocal_character?: string;
  tags?: string[];
};

// Defensives Parsing: erst direkt JSON, dann Regex-Extraktion eines {...}-Blocks
// (kleine Modelle wickeln gern Markdown-Fences drum), dann null. Bei null faellt
// die UI auf Plaintext-Modus zurueck — keine stille Datenzerstoerung.
const parseSoundsLikeJson = (text: string): SoundsLikeData | null => {
  if (!text.trim()) return null;
  const tryParse = (s: string): SoundsLikeData | null => {
    try {
      return validateSoundsLike(JSON.parse(s));
    } catch {
      return null;
    }
  };
  const direct = tryParse(text);
  if (direct) return direct;
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    const extracted = tryParse(match[0]);
    if (extracted) return extracted;
  }
  return null;
};

const validateSoundsLike = (raw: unknown): SoundsLikeData | null => {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const arr = (v: unknown): string[] | undefined => {
    if (!Array.isArray(v)) return undefined;
    const items = v
      .filter((x): x is string => typeof x === "string" && x.trim().length > 0 && x.length < 80)
      .map((s) => s.trim());
    return items.length > 0 ? items : undefined;
  };
  const num = (v: unknown): number | undefined =>
    typeof v === "number" && v > 20 && v < 400 ? v : undefined;
  const str = (v: unknown): string | undefined =>
    typeof v === "string" && v.trim().length > 0 && v.length < 80 ? v.trim() : undefined;

  const data: SoundsLikeData = {
    bpm: num(r.bpm),
    instruments: arr(r.instruments),
    production: arr(r.production),
    moods: arr(r.moods),
    vocal_character: str(r.vocal_character),
    tags: arr(r.tags),
  };
  // Mindestens ein Feld muss befuellt sein.
  const hasAny =
    data.bpm !== undefined ||
    !!data.instruments?.length ||
    !!data.production?.length ||
    !!data.moods?.length ||
    !!data.vocal_character ||
    !!data.tags?.length;
  return hasAny ? data : null;
};

const SOUNDS_LIKE_SYSTEM_PROMPT = `You are a music style analyzer. Given an artist, band, or producer name, output a JSON object describing their characteristic sound. NO prose, NO markdown, NO code fences — just the raw JSON object, nothing before or after.

Schema (all fields optional, omit if unsure):
{
  "bpm": <number, typical BPM, 60-200>,
  "instruments": [<2-4 SPECIFIC instruments, e.g. "Moog bass synth", "fingerpicked Telecaster">],
  "production": [<2-4 production descriptors, e.g. "warm analog", "polished radio-ready mix">],
  "moods": [<1-3 mood tags, e.g. "nostalgic", "melancholic">],
  "vocal_character": <one short string, e.g. "raspy male baritone" or null>,
  "tags": [<4-8 generic style tags as fallback, comma-style descriptors>]
}

RULES
- NO artist names in output. NO song titles. NO explanation.
- English only. Each array item under 60 chars.
- Be specific: "Moog bass" not "synth". "Telecaster" not "guitar".
- Output starts with { and ends with }. Nothing else.`;

const SoundsLike = () => {
  const { state, dispatch } = useStore();
  const { prompt, settings } = state;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = prompt.soundsLike ?? "";
  const description = prompt.soundsLikeDescription ?? "";
  const parsed = useMemo(() => parseSoundsLikeJson(description), [description]);

  const analyze = async () => {
    const name = input.trim();
    if (!name) return;
    setLoading(true);
    setError(null);
    dispatch({ type: "SET_SOUNDS_LIKE_DESCRIPTION", value: "" });
    try {
      // Bewusst KEIN onChunk: partielles JSON ist nicht parseable. Wir warten
      // auf die volle Antwort und legen sie dann ab — der Parser entscheidet
      // im Render, ob strukturierte oder Plaintext-Anzeige.
      const full = await generate({
        baseUrl: settings.ollamaUrl,
        model: settings.ollamaModel,
        temperature: 0.3,
        system: SOUNDS_LIKE_SYSTEM_PROMPT,
        prompt: `Analyze the sound of: ${name}`,
        cloudFallback: settings,
      });
      dispatch({ type: "SET_SOUNDS_LIKE_DESCRIPTION", value: full.trim() });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ollama-Fehler");
    } finally {
      setLoading(false);
    }
  };

  // Auto-Distribute: nur leere/schwache Felder befuellen, niemals existierende
  // User-Auswahl ueberschreiben. Tags wandern als Reservoir in customTags.
  const autoDistribute = (data: SoundsLikeData) => {
    if (data.bpm && !state.prompt.bpm) {
      dispatch({ type: "SET_BPM", bpm: Math.round(data.bpm) });
    }
    if (data.vocal_character && !state.prompt.vocalCharacter) {
      dispatch({ type: "SET_VOCAL_CHARACTER", value: data.vocal_character });
    }
    (data.moods ?? []).forEach((m) => {
      if (!state.prompt.moods.includes(m)) dispatch({ type: "TOGGLE_MOOD", mood: m });
    });
    (data.instruments ?? []).forEach((i) => {
      if (!state.prompt.instruments.includes(i)) {
        dispatch({ type: "TOGGLE_INSTRUMENT", instrument: i });
      }
    });
    (data.production ?? []).forEach((p) => {
      if (!state.prompt.production.includes(p)) {
        dispatch({ type: "TOGGLE_PRODUCTION", tag: p });
      }
    });
    const existing = new Set(state.prompt.customTags ?? []);
    (data.tags ?? []).forEach((t) => {
      if (!existing.has(t)) dispatch({ type: "TOGGLE_CUSTOM_TAG", tag: t });
    });
  };

  const fallbackImportTags = () => {
    // Plaintext-Pfad: kommagetrennte Tags aus description in customTags.
    const tags = description
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t && t.length < 60);
    const existing = new Set(state.prompt.customTags ?? []);
    tags.forEach((t) => {
      if (!existing.has(t)) dispatch({ type: "TOGGLE_CUSTOM_TAG", tag: t });
    });
  };

  return (
    <AccordionSection
      title="Klingt wie... (Referenz)"
      optional
      selectionCount={input.trim() ? 1 : 0}
      onClear={() => {
        dispatch({ type: "SET_SOUNDS_LIKE", value: "" });
        dispatch({ type: "SET_SOUNDS_LIKE_DESCRIPTION", value: "" });
        setError(null);
      }}
    >
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => dispatch({ type: "SET_SOUNDS_LIKE", value: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loading) analyze();
            }}
            placeholder="z.B. 'Die Ärzte', 'Daft Punk', 'Bonobo'..."
            className="flex-1 rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-amber-dim)] focus:outline-none"
          />
          <button
            onClick={analyze}
            disabled={loading || !input.trim()}
            className="flex items-center gap-1.5 rounded border border-[var(--color-amber-dim)] bg-[var(--color-amber)]/10 px-3 py-2 text-xs text-[var(--color-amber)] transition hover:bg-[var(--color-amber)]/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            Sound analysieren
          </button>
        </div>
        {error && (
          <p className="text-[11px] text-[var(--color-danger)]">Fehler: {error}</p>
        )}

        {/* Strukturierter Modus: parsed != null */}
        {description && parsed && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[var(--color-success)]">
                <Sparkles size={9} />
                Strukturierte Analyse
              </span>
              <button
                onClick={() => autoDistribute(parsed)}
                className="flex items-center gap-1 rounded border border-[var(--color-success)]/40 bg-[var(--color-success)]/10 px-2 py-0.5 text-[10px] text-[var(--color-success)] hover:bg-[var(--color-success)]/20"
                title="Befüllt nur leere Felder — überschreibt keine User-Auswahl."
              >
                Auto-distribute (nur leere Felder)
              </button>
            </div>
            <div className="grid grid-cols-[80px_1fr] gap-x-3 gap-y-1 rounded border border-[var(--color-success)]/30 bg-[var(--color-success)]/5 p-3 text-[11px]">
              {parsed.bpm !== undefined && (
                <>
                  <span className="text-[var(--color-text-dim)]">BPM</span>
                  <span className="text-[var(--color-text)]">
                    {parsed.bpm}
                    {state.prompt.bpm ? <span className="ml-2 text-[10px] text-[var(--color-text-faint)]">(deins: {state.prompt.bpm})</span> : null}
                  </span>
                </>
              )}
              {parsed.vocal_character && (
                <>
                  <span className="text-[var(--color-text-dim)]">Vocal</span>
                  <span className="text-[var(--color-text)]">{parsed.vocal_character}</span>
                </>
              )}
              {parsed.moods && parsed.moods.length > 0 && (
                <>
                  <span className="text-[var(--color-text-dim)]">Moods</span>
                  <span className="text-[var(--color-text)]">{parsed.moods.join(", ")}</span>
                </>
              )}
              {parsed.instruments && parsed.instruments.length > 0 && (
                <>
                  <span className="text-[var(--color-text-dim)]">Instruments</span>
                  <span className="text-[var(--color-text)]">{parsed.instruments.join(", ")}</span>
                </>
              )}
              {parsed.production && parsed.production.length > 0 && (
                <>
                  <span className="text-[var(--color-text-dim)]">Production</span>
                  <span className="text-[var(--color-text)]">{parsed.production.join(", ")}</span>
                </>
              )}
              {parsed.tags && parsed.tags.length > 0 && (
                <>
                  <span className="text-[var(--color-text-dim)]">Tags</span>
                  <span className="text-[var(--color-text)]">{parsed.tags.join(", ")}</span>
                </>
              )}
            </div>
            <button
              onClick={fallbackImportTags}
              className="self-start text-[10px] text-[var(--color-text-faint)] underline hover:text-[var(--color-text-dim)]"
              title="Wenn du nur die rohen Tags willst statt Auto-Distribute"
            >
              nur tags in customTags übernehmen
            </button>
          </div>
        )}

        {/* Fallback-Modus: Plaintext, parsed == null */}
        {description && !parsed && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[var(--color-warn)]">
                Plaintext-Modus
                <span title="JSON konnte nicht geparst werden — kleine Modelle liefern manchmal nur Tags. Funktioniert trotzdem.">
                  ⓘ
                </span>
              </span>
              <button
                onClick={fallbackImportTags}
                className="flex items-center gap-1 rounded border border-[var(--color-amber-dim)] bg-[var(--color-amber)]/10 px-2 py-0.5 text-[10px] text-[var(--color-amber)] hover:bg-[var(--color-amber)]/20"
              >
                Tags in Style-Tags übernehmen
              </button>
            </div>
            <div className="rounded border border-[var(--color-amber-dim)]/40 bg-[var(--color-amber)]/5 p-3 font-mono text-xs leading-relaxed text-[var(--color-text)]">
              {description}
            </div>
          </div>
        )}

        <p className="text-[11px] text-[var(--color-text-faint)]">
          Ollama analysiert den Künstler-Sound. Bei strukturierter Antwort kannst du Felder gezielt
          übernehmen — bestehende Auswahl bleibt unangetastet.
        </p>
      </div>
    </AccordionSection>
  );
};

// Crossover-Assistant — nur sichtbar wenn Haupt- UND Zweitgenre gesetzt sind.
// Fragt das LLM nach Fusion-Elementen, die beide Genres verbinden.
const CrossoverAssistant = () => {
  const { state, dispatch } = useStore();
  const { prompt, settings } = state;
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CrossoverResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const primarySub = getSubgenreById(prompt.subgenre);
  const secondarySub = getSubgenreById(prompt.secondaryGenre ?? "");
  const hasBoth = !!primarySub && !!secondarySub;

  const run = async () => {
    if (!primarySub || !secondarySub) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await runCrossover(settings, primarySub.name, secondarySub.name);
      if (!res) setError("LLM lieferte kein verwertbares JSON.");
      else setResult(res);
    } finally {
      setLoading(false);
    }
  };

  const applyInstruments = () => {
    if (!result) return;
    const existing = new Set(state.prompt.instruments);
    result.bridgeInstruments.forEach((i) => {
      if (!existing.has(i)) dispatch({ type: "TOGGLE_INSTRUMENT", instrument: i });
    });
  };
  const applyProduction = () => {
    if (!result) return;
    const existing = new Set(state.prompt.production);
    result.productionHints.forEach((p) => {
      if (!existing.has(p)) dispatch({ type: "TOGGLE_PRODUCTION", tag: p });
    });
  };
  const applyMoods = () => {
    if (!result) return;
    const existing = new Set(state.prompt.moods);
    result.moodPalette.forEach((m) => {
      if (!existing.has(m)) dispatch({ type: "TOGGLE_MOOD", mood: m });
    });
  };
  const applyPitfalls = () => {
    if (!result) return;
    const existing = new Set(state.prompt.negatives);
    result.pitfalls.forEach((p) => {
      if (!existing.has(p)) dispatch({ type: "TOGGLE_NEGATIVE", tag: p });
    });
  };

  if (!hasBoth) return null;

  return (
    <AccordionSection
      title="Crossover-Assistent"
      optional
      selectionCount={result ? 1 : 0}
      onClear={() => {
        setResult(null);
        setError(null);
      }}
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] text-[var(--color-text-dim)]">
            Fusion <span className="text-[var(--color-amber)]">{primarySub.name}</span> ×{" "}
            <span className="text-[var(--color-amber)]">{secondarySub.name}</span>
          </span>
          <button
            onClick={run}
            disabled={loading}
            className="flex items-center gap-1.5 rounded border border-[var(--color-amber-dim)] bg-[var(--color-amber)]/10 px-3 py-1.5 text-xs text-[var(--color-amber)] hover:bg-[var(--color-amber)]/20 disabled:opacity-40"
          >
            {loading ? <Loader2 size={11} className="animate-spin" /> : <Shuffle size={11} />}
            Fusion-Analyse
          </button>
        </div>
        {error && <p className="text-[11px] text-[var(--color-danger)]">{error}</p>}
        {result && (
          <div className="flex flex-col gap-2 rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-2.5 text-[11px]">
            {result.summary && (
              <p className="italic text-[var(--color-text-dim)]">{result.summary}</p>
            )}
            <CrossoverRow label="Bridge-Instruments" values={result.bridgeInstruments} onApply={applyInstruments} />
            <CrossoverRow label="Production" values={result.productionHints} onApply={applyProduction} />
            <CrossoverRow label="Mood-Palette" values={result.moodPalette} onApply={applyMoods} />
            <CrossoverRow label="Pitfalls" values={result.pitfalls} onApply={applyPitfalls} danger />
          </div>
        )}
        <p className="text-[10px] leading-snug text-[var(--color-text-faint)]">
          Schlaegt Fusion-Elemente vor. Klick auf „Uebernehmen" fuegt sie den passenden
          Feldern hinzu — bestehende Auswahl bleibt erhalten.
        </p>
      </div>
    </AccordionSection>
  );
};

const CrossoverRow = ({
  label,
  values,
  onApply,
  danger,
}: {
  label: string;
  values: string[];
  onApply: () => void;
  danger?: boolean;
}) => {
  if (values.length === 0) return null;
  const color = danger ? "text-[var(--color-danger)]" : "text-[var(--color-amber-dim)]";
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className={`text-[9px] uppercase tracking-wider ${color}`}>{label}</span>
        <button
          onClick={onApply}
          className="rounded border border-[var(--color-border)] px-1.5 py-0 text-[9px] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
        >
          Uebernehmen
        </button>
      </div>
      <div className="flex flex-wrap gap-1">
        {values.map((v) => (
          <span
            key={v}
            className="rounded bg-[var(--color-panel)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-dim)]"
          >
            {danger ? "−" : "+"} {v}
          </span>
        ))}
      </div>
    </div>
  );
};

const SmartSuggestions = ({ parent, subgenreName }: { parent: string; subgenreName: string }) => {
  const { state, dispatch } = useStore();
  const s = getSuggestions(parent);

  const rows: { label: string; color: string; values: string[]; action: (v: string) => void; active: (v: string) => boolean }[] = [
    {
      label: "Stimmung",
      color: "text-orange-400",
      values: s.moods,
      action: (v) => dispatch({ type: "TOGGLE_MOOD", mood: v }),
      active: (v) => state.prompt.moods.includes(v),
    },
    {
      label: "Drums",
      color: "text-sky-400",
      values: s.drums,
      action: (v) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: v }),
      active: (v) => state.prompt.instruments.includes(v),
    },
    {
      label: "Bass",
      color: "text-red-400",
      values: s.bass,
      action: (v) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: v }),
      active: (v) => state.prompt.instruments.includes(v),
    },
    {
      label: "Vocals",
      color: "text-pink-400",
      values: s.vocals,
      action: (v) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: v }),
      active: (v) => state.prompt.instruments.includes(v),
    },
    {
      label: "Production",
      color: "text-[var(--color-amber)]",
      values: s.production,
      action: (v) => dispatch({ type: "TOGGLE_PRODUCTION", tag: v }),
      active: (v) => state.prompt.production.includes(v),
    },
  ];

  const applyAll = () => {
    s.moods.forEach((v) => {
      if (!state.prompt.moods.includes(v)) dispatch({ type: "TOGGLE_MOOD", mood: v });
    });
    [...s.drums, ...s.bass, ...s.vocals].forEach((v) => {
      if (!state.prompt.instruments.includes(v)) dispatch({ type: "TOGGLE_INSTRUMENT", instrument: v });
    });
    s.production.forEach((v) => {
      if (!state.prompt.production.includes(v)) dispatch({ type: "TOGGLE_PRODUCTION", tag: v });
    });
  };

  return (
    <div className="rounded-lg border border-[var(--color-success)]/30 bg-[var(--color-success)]/5 p-3">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="flex items-center gap-2 text-sm">
          <Wand2 size={13} className="text-[var(--color-success)]" />
          <span className="text-[var(--color-text-dim)]">Passend zu</span>
          <span className="font-medium text-[var(--color-success)]">{subgenreName}</span>
        </span>
        <button
          onClick={applyAll}
          className="rounded-full border border-[var(--color-success)]/40 bg-[var(--color-success)]/10 px-3 py-0.5 text-[11px] text-[var(--color-success)] hover:bg-[var(--color-success)]/20"
        >
          Alle übernehmen
        </button>
      </div>
      <div className="flex flex-col gap-1.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline gap-2">
            <span className={`w-20 shrink-0 text-[11px] uppercase tracking-wider ${row.color}`}>
              {row.label}
            </span>
            <div className="flex flex-wrap gap-1">
              {row.values.map((v) => {
                const active = row.active(v);
                return (
                  <button
                    key={v}
                    onClick={() => row.action(v)}
                    className={`rounded-full border px-2 py-0.5 text-[11px] transition ${
                      active
                        ? "border-[var(--color-success)] bg-[var(--color-success)]/20 text-[var(--color-success)]"
                        : "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-dim)] hover:border-[var(--color-success)]/40 hover:text-[var(--color-text)]"
                    }`}
                  >
                    + {v}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {/* Empfohlene Negatives — vorgeschlagen, nicht automatisch gesetzt */}
        {s.negatives.length > 0 && (
          <div className="mt-1 flex items-baseline gap-2 border-t border-[var(--color-success)]/20 pt-1.5">
            <span className="w-20 shrink-0 text-[11px] uppercase tracking-wider text-[var(--color-danger)]">
              Vermeiden
            </span>
            <div className="flex flex-wrap gap-1">
              {s.negatives.map((v) => {
                const active = state.prompt.negatives.includes(v);
                return (
                  <button
                    key={v}
                    onClick={() => dispatch({ type: "TOGGLE_NEGATIVE", tag: v })}
                    className={`rounded-full border px-2 py-0.5 text-[11px] transition ${
                      active
                        ? "border-[var(--color-danger)] bg-[var(--color-danger)]/20 text-[var(--color-danger)]"
                        : "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-dim)] hover:border-[var(--color-danger)]/40 hover:text-[var(--color-danger)]"
                    }`}
                  >
                    − {v}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
