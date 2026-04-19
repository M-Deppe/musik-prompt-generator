import { AccordionSection } from "@/components/AccordionSection";
import { CheckList, type CheckItem } from "@/content/CheckList";
import { tags } from "@/lib/knowledge";
import { useStore } from "@/store";
import { Lightbulb, ExternalLink } from "lucide-react";

// Hint-Map fuer technische Suno-Tags. Deckt die gaengigen Strukturen + FX
// ab. Fehlende Tags rendern ohne Hint — das Label ist dann selbsterklaerend.
const TAG_HINTS: Record<string, string> = {
  // Structure
  "[Intro]": "Einleitung, baut Stimmung auf",
  "[Verse]": "Strophe, erzählend",
  "[Verse 1]": "erste Strophe",
  "[Verse 2]": "zweite Strophe",
  "[Pre-Chorus]": "Vorspannung zum Refrain",
  "[Chorus]": "Refrain, Höhepunkt",
  "[Post-Chorus]": "Nach-Refrain-Ausklang",
  "[Bridge]": "Kontrast-Teil, neue Perspektive",
  "[Outro]": "Schluss, Ausklang",
  "[Hook]": "eingängiger Kurzabschnitt",
  "[Refrain]": "wiederkehrender Kurzteil",
  "[Interlude]": "instrumentaler Zwischenteil",
  "[Instrumental]": "ohne Gesang",
  "[Break]": "kurze Unterbrechung",
  "[Breakdown]": "dünn, reduziert vor Drop",
  "[Solo]": "Lead-Instrument allein",
  "[Drop]": "Höhepunkt-Einbruch, voller Sound",
  "[Build]": "ansteigende Spannung",
  "[Fade Out]": "langsam leiser werdend",
  // Vocal FX
  "[Whispered]": "geflüstert, intim",
  "[Belted]": "kraftvoll herausgesungen",
  "[Screamed]": "geschrien, aggressiv",
  "[Falsetto]": "Kopfstimme, sehr hoch",
  "[Spoken]": "gesprochen, nicht gesungen",
  "[Harmonies]": "mehrstimmig übereinander",
  "[Ad-libs]": "improvisierte Einwürfe",
  "[Vocal Run]": "schnelle Melodie-Läufe",
  "[Choir]": "Chor-Stimmen",
  "[Rapped]": "gerappt, rhythmisch gesprochen",
  // Dynamic
  "[Quiet]": "leise",
  "[Loud]": "laut",
  "[Soft]": "sanft",
  "[Powerful]": "kraftvoll",
  "[Building intensity]": "zunehmende Energie",
  "[Stripped back]": "reduziert, wenig Elemente",
  "[Explosive]": "explosiv, maximale Energie",
  "[Minimal]": "minimal, wenig Bewegung",
  // Emotional
  "[Melancholic]": "traurig-schön",
  "[Euphoric]": "ausgelassen, überbordend",
  "[Tense]": "angespannt",
  "[Romantic]": "romantisch, gefühlvoll",
  "[Dark]": "finster, schwer",
  "[Uplifting]": "hebend, positiv",
  "[Nostalgic]": "sehnsüchtig rückblickend",
  "[Dreamy]": "verträumt, schwebend",
};

const toItems = (arr: string[]): CheckItem[] =>
  arr.map((t) => ({ id: t, label: t, hint: TAG_HINTS[t] }));

const PARAM_TAGS: CheckItem[] = [
  { id: "[Intro: ambient buildup, no drums]", label: "[Intro: ambient buildup, no drums]" },
  { id: "[Intro: cold open, single instrument]", label: "[Intro: cold open, single instrument]" },
  { id: "[Intro: Slow Build, Synth Pad, 15 seconds]", label: "[Intro: Slow Build, Synth Pad, 15s]" },
  { id: "[Outro: fade out, reverb tail]", label: "[Outro: fade out, reverb tail]" },
  { id: "[Outro: hard cut, abrupt end]", label: "[Outro: hard cut, abrupt end]" },
  { id: "[Drop: massive bass, EDM energy]", label: "[Drop: massive bass, EDM energy]" },
  { id: "[Build: rising tension, no vocals]", label: "[Build: rising tension, no vocals]" },
  { id: "[Breakdown: minimal, single element]", label: "[Breakdown: minimal, single element]" },
  { id: "[Solo: expressive, no backing]", label: "[Solo: expressive, no backing]" },
  { id: "[Pre-Chorus: building energy, layered vocals]", label: "[Pre-Chorus: building energy, layered vocals]" },
  { id: "[Verse: minimal bass, whispered vocals]", label: "[Verse: minimal bass, whispered vocals]" },
  { id: "[Chorus: exploding energy, full band, anthemic]", label: "[Chorus: exploding energy, full band, anthemic]" },
  { id: "[Bridge: half-time, emotional, stripped back]", label: "[Bridge: half-time, emotional, stripped back]" },
  { id: "[Guitar Solo: screaming, melodic, 20 seconds]", label: "[Guitar Solo: screaming, melodic, 20s]" },
  { id: "[Bridge: Half-Time, Trap Beat Switch, Heavy Bass]", label: "[Bridge: Half-Time, Trap Switch]" },
];

const CREATIVE: CheckItem[] = [
  { id: "[Hyper-Realistic]", label: "[Hyper-Realistic]", hint: "forciert 48kHz (V5)" },
  { id: "[Crowd Sings]", label: "[Crowd Sings]", hint: "Live-Konzert-Feel" },
  { id: "[Acapella]", label: "[Acapella]", hint: "ohne Instrumente" },
  { id: "[Break: Silence]", label: "[Break: Silence]", hint: "Sound-Stopp" },
  { id: "[Half-Time]", label: "[Half-Time]", hint: "gefühlt halbes Tempo, Trap-Switch" },
  { id: "[Double Time]", label: "[Double Time]", hint: "gefühlt doppeltes Tempo" },
  { id: "[Key Change]", label: "[Key Change]", hint: "Tonart wechselt, oft zum Schluss hin" },
];

export const SunoStudio = () => {
  const { state, dispatch } = useStore();
  const sel = (ids: string[]) => state.prompt.production.filter((p) => ids.includes(p));
  const structureIds = tags.structure.tags;
  const dynamicIds = tags.dynamic.tags;
  const vocalIds = [
    "[Whispered]",
    "[Belted]",
    "[Screamed]",
    "[Falsetto]",
    "[Spoken]",
    "[Harmonies]",
    "[Ad-libs]",
    "[Vocal Run]",
    "[Choir]",
    "[Rapped]",
  ];
  const emotionalIds = tags.emotional_modifiers.tags;

  return (
    <div className="flex flex-col gap-3">
      <AccordionSection title="Strukturelle Tags" defaultOpen selectionCount={sel(structureIds).length}>
        <CheckList items={toItems(structureIds)} selected={sel(structureIds)} onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })} />
      </AccordionSection>

      <AccordionSection title="Vokal-FX-Tags" selectionCount={sel(vocalIds).length}>
        <CheckList items={toItems(vocalIds)} selected={sel(vocalIds)} onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })} />
      </AccordionSection>

      <AccordionSection title="Dynamik-Tags" selectionCount={sel(dynamicIds).length}>
        <CheckList items={toItems(dynamicIds)} selected={sel(dynamicIds)} onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })} />
      </AccordionSection>

      <AccordionSection title="Emotional-Modifiers" optional selectionCount={sel(emotionalIds).length}>
        <CheckList items={toItems(emotionalIds)} selected={sel(emotionalIds)} onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })} />
      </AccordionSection>

      <AccordionSection title="Kreativ-Tags (Suno V4.5+)" optional selectionCount={sel(CREATIVE.map((c) => c.id)).length}>
        <CheckList items={CREATIVE} selected={sel(CREATIVE.map((c) => c.id))} onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })} />
      </AccordionSection>

      <AccordionSection title="Parametrisierte Tags (Pro)" selectionCount={sel(PARAM_TAGS.map((c) => c.id)).length}>
        <CheckList
          items={PARAM_TAGS}
          selected={sel(PARAM_TAGS.map((c) => c.id))}
          onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })}
          placeholder="Parametrisierte Tags suchen..."
        />
      </AccordionSection>

      <div className="rounded-lg border border-[var(--color-success)]/25 bg-[var(--color-success)]/5 p-3">
        <div className="flex items-start gap-2">
          <Lightbulb size={14} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
          <div className="flex flex-col gap-2 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[var(--color-success)]">
              Pro-Tipp: Metatags in Lyrics
            </span>
            <p className="text-[var(--color-text-dim)]">
              Füge Stilanweisungen direkt in die Lyrics-Struktur ein — das ist 10× mächtiger als der Style-Prompt allein:
            </p>
            <pre className="whitespace-pre-wrap rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-2 font-mono text-[11px] text-[var(--color-text)]">
{`[Verse: Whispered Vocals, Minimal Bass]
[Chorus: Full Band, Soaring Vocals]
[Bridge: Piano Only, Soft Dynamics]`}
            </pre>
            <p className="text-[var(--color-text-dim)]">
              Klammern <code className="rounded bg-[var(--color-bg)] px-1 text-[var(--color-amber)]">(oo)</code> in Lyrics werden zu Ad-Libs. Interpunktion steuert Mikro-Pausen.
            </p>
          </div>
        </div>
      </div>

      <button
        disabled
        className="flex items-center justify-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/5 px-4 py-2 text-sm text-sky-400/50"
        title="Phase 3 — Lyrics-Editor"
      >
        <ExternalLink size={14} />
        Lyrics mit Tags bearbeiten (Phase 3)
      </button>
    </div>
  );
};
