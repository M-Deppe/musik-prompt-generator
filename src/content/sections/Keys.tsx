import { AccordionSection } from "@/components/AccordionSection";
import { CheckList, type CheckItem } from "@/content/CheckList";
import { useStore } from "@/store";

const KEYS: CheckItem[] = [
  { id: "k-grand", label: "Grand Piano", hint: "Konzertfluegel — voll, breit, Pop/Ballade/Klassik" },
  { id: "k-upright", label: "Upright Piano", hint: "Klavier — intim, leicht ranzig, Indie/Singer-Songwriter" },
  { id: "k-rhodes", label: "Rhodes", hint: "warm elektrisch — Soul, Jazz, Lo-Fi-Beats" },
  { id: "k-wurlitzer", label: "Wurlitzer", hint: "nasal-rotzig elektrisch — 60s/70s R&B, Indie" },
  { id: "k-hammond", label: "Hammond Organ", hint: "rotary-Leslie — Funk, Soul, Gospel, Rock" },
  { id: "k-celesta", label: "Celesta", hint: "glockig — Filmmusik, maerchenhaft" },
  { id: "k-harpsichord", label: "Harpsichord", hint: "Cembalo — Barock, historisch" },
  { id: "k-toy-piano", label: "Toy Piano", hint: "Spielzeugklavier — verspielt, kindlich, Indie" },
  { id: "k-clavinet", label: "Clavinet", hint: "percussive Funk-Klaviatur — Stevie-Wonder-Stil" },
  { id: "k-mellotron", label: "Mellotron", hint: "Tape-Sample-Keyboard — Beatles/Prog, Strings-Sound" },
];

const SYNTHS: CheckItem[] = [
  { id: "s-moog", label: "Moog", hint: "analog, fett — Bass, Lead, kultig" },
  { id: "s-jupiter", label: "Roland Jupiter-8", hint: "warm polyphon — 80s Synthpop-Ikone" },
  { id: "s-juno", label: "Roland Juno", hint: "Chorus-Pads — 80s Synthwave-Standard" },
  { id: "s-prophet", label: "Sequential Prophet-5", hint: "cremig analog — 80s Prog/Pop" },
  { id: "s-dx7", label: "Yamaha DX7", hint: "FM-Synthese — glasig, 80s-E-Piano-Sound" },
  { id: "s-tb303", label: "Roland TB-303", hint: "Acid-Bass — quakend, Techno/Acid-House" },
  { id: "s-supersaw", label: "Supersaw", hint: "Trance-Lead — breit, euphorisch" },
  { id: "s-arp", label: "ARP Odyssey", hint: "monophon analog — Prog-Lead, 70s" },
  { id: "s-vocoder", label: "Vocoder", hint: "robotische Stimmen — Daft Punk, Kraftwerk" },
  { id: "s-wavetable", label: "Wavetable", hint: "modern digital — Serum/Massive, EDM" },
  { id: "s-granular", label: "Granular", hint: "Micro-Samples — atmospheric, experimentell" },
  { id: "s-modular", label: "Modular Synth", hint: "Eurorack-Patches — experimentell, Ambient" },
];

const PADS: CheckItem[] = [
  { id: "p-warm-analog", label: "Warm Analog Pads", hint: "runde, organische Flaechen — Retro/Synthwave" },
  { id: "p-atmospheric", label: "Atmospheric Pads", hint: "raumfuellend, bewegt — Ambient/Score" },
  { id: "p-ethereal", label: "Ethereal Pads", hint: "schwebend, ueberirdisch — Dream-Pop" },
  { id: "p-choir", label: "Choir Pads", hint: "Chor-Sample-Pad — filmisch, sakral" },
  { id: "p-string", label: "String Pads", hint: "Streicher-Flaechen — Pop-Ballade, Score" },
  { id: "p-glassy", label: "Glassy Pads", hint: "glasig-kristallin — FM-Stil, kalt" },
  { id: "p-evolving", label: "Evolving Texture", hint: "morphing ueber Zeit — Ambient" },
  { id: "p-dark-ambient", label: "Dark Ambient", hint: "duester, brummend — Horror/Sci-Fi" },
];

const LEADS: CheckItem[] = [
  { id: "l-sparkly", label: "Sparkly Plucks", hint: "kurze glitzernde Noten — Future-Pop" },
  { id: "l-bright", label: "Bright Lead", hint: "prominent, durchsetzungsstark — EDM" },
  { id: "l-arp", label: "Arpeggiated Lead", hint: "rhythmisch arpeggierte Melodie" },
  { id: "l-supersaw-lead", label: "Supersaw Lead", hint: "7 detuned Saegen — Trance-Hymne" },
  { id: "l-pluck", label: "Pluck", hint: "kurzer Zupf — Deep-House, Melodic-Techno" },
  { id: "l-stab", label: "Stab", hint: "harter Akzent-Akkord" },
  { id: "l-squelchy", label: "Squelchy Acid Lead", hint: "303-artig resonant — Acid" },
  { id: "l-screamer", label: "Screamer Lead", hint: "schneidend hoch — Rave-Style" },
];

export const Keys = () => {
  const { state, dispatch } = useStore();
  const sel = (pool: CheckItem[]) => state.prompt.instruments.filter((p) => pool.some((i) => i.id === p));

  return (
    <div className="flex flex-col gap-3">
      <AccordionSection title="Tasten-Instrumente" defaultOpen selectionCount={sel(KEYS).length} onClear={() => sel(KEYS).forEach((id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id }))}>
        <CheckList items={KEYS} selected={sel(KEYS)} onToggle={(id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id })} placeholder="Tasten suchen..." />
      </AccordionSection>
      <AccordionSection title="Synths" selectionCount={sel(SYNTHS).length} onClear={() => sel(SYNTHS).forEach((id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id }))}>
        <CheckList items={SYNTHS} selected={sel(SYNTHS)} onToggle={(id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id })} placeholder="Synth suchen..." />
      </AccordionSection>
      <AccordionSection title="Pads" selectionCount={sel(PADS).length} onClear={() => sel(PADS).forEach((id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id }))}>
        <CheckList items={PADS} selected={sel(PADS)} onToggle={(id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id })} />
      </AccordionSection>
      <AccordionSection title="Leads" optional selectionCount={sel(LEADS).length} onClear={() => sel(LEADS).forEach((id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id }))}>
        <CheckList items={LEADS} selected={sel(LEADS)} onToggle={(id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id })} />
      </AccordionSection>
    </div>
  );
};
