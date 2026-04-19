import { AccordionSection } from "@/components/AccordionSection";
import { CheckList, type CheckItem } from "@/content/CheckList";
import { useStore } from "@/store";

const KEYS_MAJOR: CheckItem[] = [
  { id: "key-c-major", label: "C-Dur", hint: "hell, neutral, haeufig in Pop/Folk" },
  { id: "key-g-major", label: "G-Dur", hint: "warm, gitarrenfreundlich, Country/Folk" },
  { id: "key-d-major", label: "D-Dur", hint: "strahlend, hymnisch, Rock-Anthem" },
  { id: "key-a-major", label: "A-Dur", hint: "offen, optimistisch, Rock" },
  { id: "key-e-major", label: "E-Dur", hint: "kraftvoll, Rock/Blues-Grundlage" },
  { id: "key-f-major", label: "F-Dur", hint: "weich, pastoral, Ballade" },
  { id: "key-bb-major", label: "B-Dur", hint: "warm, Bläser/Jazz-typisch" },
  { id: "key-eb-major", label: "Es-Dur", hint: "majestaetisch, klassisch-filmisch" },
];

const KEYS_MINOR: CheckItem[] = [
  { id: "key-a-minor", label: "A-Moll", hint: "melancholisch-neutral, Pop-Standard" },
  { id: "key-e-minor", label: "E-Moll", hint: "dunkel-rockig, gitarrenfreundlich" },
  { id: "key-b-minor", label: "H-Moll", hint: "sehnsuchtsvoll, klagend" },
  { id: "key-d-minor", label: "D-Moll", hint: "episch-traurig, 'saddest of all keys'" },
  { id: "key-g-minor", label: "G-Moll", hint: "dramatisch, barock" },
  { id: "key-c-minor", label: "C-Moll", hint: "ernst, existenziell" },
  { id: "key-f-minor", label: "F-Moll", hint: "duester, grabestief" },
];

const PROGRESSIONS: CheckItem[] = [
  { id: "pr-i-v-vi-iv", label: "I–V–vi–IV", hint: "Pop-Punk-Klassiker — 'Let It Be', tausende Hits" },
  { id: "pr-vi-iv-i-v", label: "vi–IV–I–V", hint: "Sad Pop — 'Someone Like You', emotional" },
  { id: "pr-ii-v-i", label: "ii–V–I", hint: "Jazz-Standard — spannt und loest auf" },
  { id: "pr-12-bar-blues", label: "12-Bar Blues", hint: "klassisches Blues-Schema I-IV-V" },
  { id: "pr-circle-fifths", label: "Circle of Fifths", hint: "Quintenzirkel — Klassik, Jazz-Turnarounds" },
  { id: "pr-andalusian", label: "Andalusian Cadence", hint: "i-VII-VI-V — Flamenco, dunkel" },
  { id: "pr-modal-interchange", label: "Modal Interchange", hint: "Akkord aus Parallelmodus borgen — farbig" },
  { id: "pr-pedal-point", label: "Pedal Point", hint: "Basston bleibt, Harmonien wechseln — Spannung" },
  { id: "pr-tritone-sub", label: "Tritone Substitution", hint: "Jazz-Reharm, chromatische Auflösung" },
  { id: "pr-plagal", label: "Plagale Kadenz IV–I", hint: "'Amen'-Kadenz — sakral, weich" },
];

const MODES: CheckItem[] = [
  { id: "m-ionian", label: "Ionisch (Dur)", hint: "Standard-Dur-Skala, hell" },
  { id: "m-dorian", label: "Dorisch", hint: "Moll mit hoher 6 — jazzig, neutral-traurig" },
  { id: "m-phrygian", label: "Phrygisch", hint: "Moll mit tiefer 2 — spanisch, duester, metal" },
  { id: "m-lydian", label: "Lydisch", hint: "Dur mit hoher 4 — traeumerisch, filmisch" },
  { id: "m-mixolydian", label: "Mixolydisch", hint: "Dur mit tiefer 7 — rock, blues, folk" },
  { id: "m-aeolian", label: "Äolisch (Moll)", hint: "natuerliches Moll — melancholisch" },
  { id: "m-locrian", label: "Lokrisch", hint: "instabil, dissonant — selten melodisch genutzt" },
  { id: "m-harmonic-minor", label: "Harmonic Minor", hint: "Moll mit hoher 7 — orientalisch, barock" },
  { id: "m-melodic-minor", label: "Melodic Minor", hint: "Jazz-Moll — moderne Ballade, Fusion" },
  { id: "m-pentatonic", label: "Pentatonic", hint: "5 Toene — universell, blues, rock, world" },
  { id: "m-blues-scale", label: "Blues Scale", hint: "Pentatonic + Blue Note — klagend" },
  { id: "m-chromatic", label: "Chromatic", hint: "alle 12 Halbtoene — avantgarde, dissonant" },
];

export const Harmony = () => {
  const { state, dispatch } = useStore();
  const sel = (pool: CheckItem[]) => state.prompt.production.filter((p) => pool.some((i) => i.id === p));

  return (
    <div className="flex flex-col gap-3">
      <AccordionSection title="Tonart – Dur" defaultOpen selectionCount={sel(KEYS_MAJOR).length} onClear={() => sel(KEYS_MAJOR).forEach((id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id }))}>
        <CheckList items={KEYS_MAJOR} selected={sel(KEYS_MAJOR)} onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })} />
      </AccordionSection>
      <AccordionSection title="Tonart – Moll" selectionCount={sel(KEYS_MINOR).length} onClear={() => sel(KEYS_MINOR).forEach((id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id }))}>
        <CheckList items={KEYS_MINOR} selected={sel(KEYS_MINOR)} onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })} />
      </AccordionSection>
      <AccordionSection title="Akkordfolgen" selectionCount={sel(PROGRESSIONS).length} onClear={() => sel(PROGRESSIONS).forEach((id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id }))}>
        <CheckList items={PROGRESSIONS} selected={sel(PROGRESSIONS)} onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })} placeholder="Progressions..." />
      </AccordionSection>
      <AccordionSection title="Modalität / Skalen" optional selectionCount={sel(MODES).length} onClear={() => sel(MODES).forEach((id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id }))}>
        <CheckList items={MODES} selected={sel(MODES)} onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })} />
      </AccordionSection>
    </div>
  );
};
