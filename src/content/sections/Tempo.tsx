import { AccordionSection } from "@/components/AccordionSection";
import { CheckList, type CheckItem } from "@/content/CheckList";
import { getSubgenreById } from "@/lib/allGenres";
import { useStore } from "@/store";

export const GROOVES: CheckItem[] = [
  { id: "four-on-the-floor", label: "Four-on-the-floor", hint: "Kick jede Zählzeit" },
  { id: "swung", label: "Swung", hint: "shuffle, triplet feel" },
  { id: "straight", label: "Straight", hint: "gerade, rigide" },
  { id: "half-time", label: "Half-time", hint: "gefühltes halbes Tempo" },
  { id: "double-time", label: "Double-time", hint: "doppelt so schnell" },
  { id: "syncopated", label: "Syncopated", hint: "versetzte Betonungen" },
  { id: "laid-back", label: "Laid-back", hint: "hinter dem Beat" },
  { id: "pushed", label: "Pushed", hint: "vor dem Beat" },
  { id: "polyrhythm", label: "Polyrhythm", hint: "mehrere Rhythmen parallel" },
  { id: "broken-beat", label: "Broken Beat", hint: "unregelmäßig zerhackt" },
  { id: "groove-boom-bap", label: "Boom Bap Swing", hint: "Hip-Hop, MPC-Swing 16tel" },
  { id: "groove-amapiano", label: "Amapiano Shuffle", hint: "South African, log drum laidback" },
  { id: "groove-dembow", label: "Reggaeton Dembow", hint: "3+3+2 Kick-Snare-Pattern" },
  { id: "groove-afrobeat", label: "Afrobeat Groove", hint: "Fela Kuti, interlocking percussion" },
  { id: "groove-neo-soul", label: "Neo-Soul Pocket", hint: "tief im Groove, menschlich" },
  { id: "groove-trance-rolling", label: "Trance Rolling", hint: "straight, hypnotische Bassline" },
  { id: "groove-dnb-breakbeat", label: "DnB Breakbeat", hint: "Amen/Think-Break, 170 BPM" },
  { id: "groove-drum-funk", label: "Drum Funk Feel", hint: "live-drummer feel, staccato" },
  { id: "groove-shuffle-hard", label: "Hard Shuffle", hint: "stark swingend, Jazz-feel" },
  { id: "groove-shuffle-light", label: "Light Shuffle", hint: "dezenter Swing, modern" },
  { id: "groove-reggae", label: "Reggae One Drop", hint: "Kick auf 3, offen und luftig" },
  { id: "groove-ska-offbeat", label: "Ska Offbeat", hint: "upstroke auf 2+4, staccato" },
  { id: "groove-soca", label: "Soca Groove", hint: "karibisch, snare auf jeder Zeit" },
  { id: "groove-bossa", label: "Bossa Nova", hint: "brasilianisch, clave-basiert" },
  { id: "groove-samba", label: "Samba", hint: "brasilianisch, 16tel-Subdivisions" },
  { id: "groove-cumbia", label: "Cumbia", hint: "kolumbianisch, Guiro-Clave" },
  { id: "groove-baile-funk", label: "Baile Funk / Funk Carioca", hint: "brasilianisch, 150 BPM, elektronisch" },
  { id: "groove-trap-hi-hat", label: "Trap Hi-Hat Rolls", hint: "32tel Hi-Hats, rhythmisch variiert" },
  { id: "groove-jersey-club", label: "Jersey Club", hint: "3+3+2 bounce, club stutter" },
  { id: "groove-footwork", label: "Footwork / Juke", hint: "Chicago, 160 BPM, flattened kicks" },
  { id: "groove-two-step", label: "UK 2-Step", hint: "Garage, Kick auf 1+3.5" },
  { id: "groove-krautrock", label: "Motorik / Krautrock", hint: "maschineller 4/4, hypnotisch" },
];

export const TIME_SIGNATURES: CheckItem[] = [
  { id: "ts-4-4", label: "4/4 — Standard", hint: "vier Viertel, universell" },
  { id: "ts-3-4", label: "3/4 — Walzer", hint: "Dreier, Walzer, Balladen" },
  { id: "ts-6-8", label: "6/8 — Compound", hint: "zwei Dreier-Gruppen, Swing-feel" },
  { id: "ts-12-8", label: "12/8 — Blues/Shuffle", hint: "vier Dreier, Blues, Soul-Balladen" },
  { id: "ts-5-4", label: "5/4 — Ungerade", hint: "Take Five, progressive, asymmetrisch" },
  { id: "ts-7-4", label: "7/4 — Prog", hint: "sieben Viertel, Prog Rock/Jazz" },
  { id: "ts-7-8", label: "7/8 — Asymmetrisch", hint: "balkanisch, Prog, kurzes siebtes" },
  { id: "ts-5-8", label: "5/8 — Kompakt", hint: "Balkan, Flamenco, eng gepackt" },
  { id: "ts-9-8", label: "9/8 — Brubeck", hint: "Blue Rondo, türkisch-basiert" },
  { id: "ts-11-8", label: "11/8 — Komplex", hint: "Krzysztof Komeda, Jazz-Avantgarde" },
  { id: "ts-2-4", label: "2/4 — March", hint: "Marsch, Polka, direkt" },
  { id: "ts-cut-time", label: "Cut Time (2/2)", hint: "alla breve, doppelt so schnell" },
  { id: "ts-polymeter", label: "Polymeter", hint: "zwei Taktarten parallel" },
  { id: "ts-mixed-meter", label: "Mixed Meter", hint: "wechselnde Taktarten im Track" },
  { id: "ts-free-time", label: "Free Time", hint: "kein festes Metrum, rubato" },
];

export const TEMPO_CHARACTER: CheckItem[] = [
  { id: "tc-rushing", label: "Rushing", hint: "vor dem Beat, vorwärtsdrängend" },
  { id: "tc-laid-back-feel", label: "Laid-Back Feel", hint: "hinter dem Beat, entspannt" },
  { id: "tc-on-the-grid", label: "On the Grid", hint: "exakt quantisiert, präzise" },
  { id: "tc-human", label: "Human Feel", hint: "leichte Ungenauigkeiten, organisch" },
  { id: "tc-quantized", label: "Quantized", hint: "MIDI-quantisiert, maschinenartig" },
  { id: "tc-elastic", label: "Elastisch", hint: "dehnt und strafft sich frei" },
  { id: "tc-rubato", label: "Rubato", hint: "freies Tempo, expressiv" },
  { id: "tc-metronomic", label: "Metronomisch", hint: "kein Abweichen, click-track exakt" },
  { id: "tc-drunk", label: "Drunk / Wobbly", hint: "bewusst unsicher, Lo-Fi-Charakter" },
  { id: "tc-accelerando", label: "Accelerando", hint: "wird graduell schneller" },
  { id: "tc-ritardando", label: "Ritardando", hint: "wird graduell langsamer" },
  { id: "tc-micro-timing", label: "Micro-Timing", hint: "subtile Timing-Verschiebungen" },
];

export const Tempo = () => {
  const { state, dispatch } = useStore();
  const sub = getSubgenreById(state.prompt.subgenre);
  const bpm = state.prompt.bpm ?? 120;

  const sel = (pool: CheckItem[]) =>
    state.prompt.production.filter((p) => pool.some((i) => i.id === p));

  return (
    <div className="flex flex-col gap-3">
      <AccordionSection title="BPM" defaultOpen selectionCount={state.prompt.bpm ? 1 : 0}>
        <div className="flex flex-col gap-3">
          {sub && (
            <div className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-xs">
              <span className="text-[var(--color-text-dim)]">Empfohlen für </span>
              <span className="text-[var(--color-amber)]">{sub.name}</span>
              <span className="text-[var(--color-text-dim)]">: </span>
              <span className="text-[var(--color-text)]">{sub.bpm_min}–{sub.bpm_max} BPM</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={20}
              max={400}
              value={bpm}
              onChange={(e) => dispatch({ type: "SET_BPM", bpm: Number(e.target.value) })}
              className="flex-1 accent-[var(--color-amber)]"
            />
            <input
              type="number"
              min={20}
              max={400}
              value={state.prompt.bpm ?? ""}
              onChange={(e) => dispatch({ type: "SET_BPM", bpm: Number(e.target.value) })}
              className="w-20 rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-sm tabular-nums text-[var(--color-text)] focus:border-[var(--color-amber-dim)] focus:outline-none"
            />
            <span className="text-xs text-[var(--color-text-dim)]">BPM</span>
          </div>
        </div>
      </AccordionSection>

      <AccordionSection
        title="Groove"
        optional
        selectionCount={sel(GROOVES).length}
        onClear={() => sel(GROOVES).forEach((id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id }))}
      >
        <CheckList
          items={GROOVES}
          selected={sel(GROOVES)}
          onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })}
         
        />
      </AccordionSection>

      <AccordionSection
        title="Taktart"
        optional
        selectionCount={sel(TIME_SIGNATURES).length}
        onClear={() => sel(TIME_SIGNATURES).forEach((id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id }))}
      >
        <CheckList
          items={TIME_SIGNATURES}
          selected={sel(TIME_SIGNATURES)}
          onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })}
         
        />
      </AccordionSection>

      <AccordionSection
        title="Tempo-Charakter"
        optional
        selectionCount={sel(TEMPO_CHARACTER).length}
        onClear={() => sel(TEMPO_CHARACTER).forEach((id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id }))}
      >
        <CheckList
          items={TEMPO_CHARACTER}
          selected={sel(TEMPO_CHARACTER)}
          onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })}
         
        />
      </AccordionSection>
    </div>
  );
};
