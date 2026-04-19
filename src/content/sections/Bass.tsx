import { AccordionSection } from "@/components/AccordionSection";
import { CheckList, type CheckItem } from "@/content/CheckList";
import { useStore } from "@/store";

const BASS_TYPE: CheckItem[] = [
  // Synth-Klassiker
  { id: "bass-808", label: "tuned 808", hint: "Hip-Hop/Trap" },
  { id: "bass-sub", label: "Sub Bass", hint: "sehr tief, weich" },
  { id: "bass-reese", label: "Reese Bass", hint: "D&B, breit detuned" },
  { id: "bass-wobble", label: "Wobble Bass", hint: "Dubstep LFO-Filter" },
  { id: "bass-acid", label: "Acid 303 Bass", hint: "TB-303, squelchy" },
  { id: "bass-moog-synth", label: "Minimoog Bass", hint: "Ladder-Filter, satt" },
  { id: "bass-taurus", label: "Moog Taurus", hint: "Pedalsynth, tief" },
  { id: "bass-sh101", label: "SH-101 Bass", hint: "Sub-Osc, monophon" },
  { id: "bass-juno", label: "Juno-106 Bass", hint: "Chorus, warm analog" },
  { id: "bass-virus", label: "Virus TI Bass", hint: "virtuell-analog, flexibel" },
  { id: "bass-serum", label: "Serum Bass", hint: "Wavetable, modern" },
  { id: "bass-massive", label: "Massive Bass", hint: "NI Massive, aggro" },
  { id: "bass-diva", label: "Diva Bass", hint: "u-he, highend analog" },
  { id: "bass-pro-one", label: "Pro-One Bass", hint: "Sequential, klassisch" },
  { id: "bass-synth", label: "Generic Synth Bass", hint: "digital, variabel" },
  { id: "bass-sidechain", label: "Side-chained Bass", hint: "House, pumpt" },
  // Bass-Gitarren
  { id: "bass-electric", label: "Precision Bass", hint: "Fender P-Bass, voll" },
  { id: "bass-jazz", label: "Jazz Bass", hint: "Fender J-Bass, brillant" },
  { id: "bass-stingray", label: "Stingray Bass", hint: "Music Man, activ" },
  { id: "bass-rickenbacker", label: "Rickenbacker 4001", hint: "Rock, schneidend" },
  { id: "bass-hofner", label: "Hofner Violin Bass", hint: "Beatles, warm hollow" },
  { id: "bass-fretless", label: "Fretless Bass", hint: "fließend, mwah" },
  { id: "bass-5string", label: "5-String Bass", hint: "Extended Range Low-B" },
  { id: "bass-6string", label: "6-String Bass", hint: "Extended Range melodisch" },
  { id: "bass-slap", label: "Slap Bass", hint: "Funk, perkussiv" },
  { id: "bass-upright", label: "Upright Bass", hint: "Jazz, akustisch" },
  // Spezial-Typen
  { id: "bass-organ", label: "Organ Bass", hint: "Hammond Pedalwerk" },
  { id: "bass-tuba", label: "Tuba Bass", hint: "Blechbläser-Tiefe" },
  { id: "bass-contrabass", label: "Contrabass", hint: "Orchester, tief" },
  { id: "bass-bass-flute", label: "Bass Flute", hint: "tief, luftig" },
  { id: "bass-keytar", label: "Keytar Bass", hint: "80s-Performance" },
  { id: "bass-sub-drone", label: "Sub-bass Drone", hint: "anhaltend, tonal" },
  { id: "bass-808-portamento", label: "808 Portamento", hint: "gleitend, melodisch" },
  { id: "bass-electric-generic", label: "Electric Bass", hint: "allgemein E-Bass" },
];

const BASS_CHARACTER: CheckItem[] = [
  { id: "bass-deep", label: "Deep & Rolling", hint: "voller Sub-Bereich" },
  { id: "bass-punchy", label: "Punchy", hint: "starker Attack" },
  { id: "bass-warm", label: "Warm & Rounded", hint: "analog, mittenbetont" },
  { id: "bass-detuned", label: "Detuned Wide", hint: "Chorus, breit" },
  { id: "bass-distorted", label: "Distorted", hint: "Overdrive, aggressiv" },
  { id: "bass-dry", label: "Dry & Tight", hint: "kein Raum, präzise" },
  { id: "bass-boomy", label: "Boomy", hint: "zu viel Sub, hallig" },
  { id: "bass-sidechain-pump", label: "Pumping Sidechain", hint: "durch Kick getriggert" },
  { id: "bass-growly", label: "Growly", hint: "FM-Anteile, knurrig" },
  { id: "bass-buzzy", label: "Buzzy", hint: "Oberton-reich, sägenförmig" },
  { id: "bass-wobbly", label: "Wobbly", hint: "LFO auf Filter" },
  { id: "bass-plucky", label: "Plucky", hint: "kurze Attack, perkussiv" },
  { id: "bass-dubby", label: "Dubby", hint: "sine-wave Sub, minimal" },
  { id: "bass-muddy", label: "Muddy", hint: "viel 200-400 Hz" },
  { id: "bass-clicky", label: "Clicky", hint: "Attack-Klick betont" },
  { id: "bass-thumpy", label: "Thumpy", hint: "gedämpft, thumb-style" },
  { id: "bass-rubbery", label: "Rubbery", hint: "elastisch, Fretless-artig" },
  { id: "bass-sub-heavy", label: "Sub-heavy", hint: "unter 60 Hz dominant" },
  { id: "bass-mid-scooped", label: "Mid-scooped", hint: "Mitten reduziert" },
  { id: "bass-fuzzy", label: "Fuzzy", hint: "Fuzz-Effekt, wollig" },
  { id: "bass-aggressive", label: "Aggressive", hint: "laut, komprimiert" },
  { id: "bass-warm-analog", label: "Warm Analog", hint: "Röhren-Sättigung" },
  { id: "bass-bright-digital", label: "Bright Digital", hint: "clean, präsent" },
  { id: "bass-vintage", label: "Vintage", hint: "Tape, warm, rund" },
  { id: "bass-compressed", label: "Heavily Compressed", hint: "sustain, gleichmäßig" },
  { id: "bass-monophonic", label: "Monophonic", hint: "eine Stimme, Portamento" },
  { id: "bass-layered", label: "Layered Bass", hint: "Sub+Mid kombiniert" },
];

const BASS_PATTERN: CheckItem[] = [
  { id: "bp-walking", label: "Walking Bass", hint: "Jazz, chromatisch" },
  { id: "bp-octave", label: "Octave Jumps", hint: "Disco, funk" },
  { id: "bp-root-fifth", label: "Root-Fifth", hint: "Country, Rock" },
  { id: "bp-syncopated", label: "Syncopated", hint: "zwischen Beats" },
  { id: "bp-melodic", label: "Melodic Lines", hint: "eigenständige Melodie" },
  { id: "bp-drone", label: "Drone / Pedal Note", hint: "anhaltend, statisch" },
  { id: "bp-staccato", label: "Staccato", hint: "kurze, abgehackte Noten" },
  { id: "bp-legato", label: "Legato / Flowing", hint: "verbunden, fließend" },
  { id: "bp-reggae-offbeat", label: "Reggae Offbeat", hint: "auf den Zählzeiten 2+4" },
  { id: "bp-funk-slap", label: "Funk Slap", hint: "Thumb/Pop-Technik" },
  { id: "bp-disco-octaves", label: "Disco Octaves", hint: "16tel-Oktavwechsel" },
  { id: "bp-dnb-rolling", label: "D&B Rolling", hint: "schnelle 16tel, versufen" },
  { id: "bp-house-pump", label: "House Tech Pump", hint: "Viertel + Sidechain" },
  { id: "bp-dub-drops", label: "Dub Sub Drops", hint: "lange Pausen, Sub-Einwurf" },
  { id: "bp-ostinato", label: "Ostinato", hint: "wiederholendes Motiv" },
  { id: "bp-staccato-legato-mix", label: "Staccato-Legato Mix", hint: "abwechselnd kurz/lang" },
  { id: "bp-ghost-notes", label: "Ghost Notes", hint: "leise Zwischennoten" },
  { id: "bp-chromatic-run", label: "Chromatic Run", hint: "Halbtonschritte aufwärts" },
  { id: "bp-call-response", label: "Call & Response", hint: "Frage-Antwort-Muster" },
  { id: "bp-boom-bap-bass", label: "Boom Bap Bass", hint: "Hip-Hop, auf 1+3" },
  { id: "bp-trap-sliding", label: "Trap Slide", hint: "portamento 808 Glide" },
];

export const Bass = () => {
  const { state, dispatch } = useStore();
  const sel = (pool: CheckItem[]) => state.prompt.instruments.filter((p) => pool.some((i) => i.id === p));

  return (
    <div className="flex flex-col gap-3">
      <AccordionSection title="Bass-Typ" defaultOpen selectionCount={sel(BASS_TYPE).length} onClear={() => sel(BASS_TYPE).forEach((id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id }))}>
        <CheckList items={BASS_TYPE} selected={sel(BASS_TYPE)} onToggle={(id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id })} placeholder="Bass-Typ suchen..." />
      </AccordionSection>
      <AccordionSection title="Bass-Charakter" selectionCount={sel(BASS_CHARACTER).length} onClear={() => sel(BASS_CHARACTER).forEach((id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id }))}>
        <CheckList items={BASS_CHARACTER} selected={sel(BASS_CHARACTER)} onToggle={(id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id })} />
      </AccordionSection>
      <AccordionSection title="Bass-Pattern" optional selectionCount={sel(BASS_PATTERN).length} onClear={() => sel(BASS_PATTERN).forEach((id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id }))}>
        <CheckList items={BASS_PATTERN} selected={sel(BASS_PATTERN)} onToggle={(id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id })} />
      </AccordionSection>
    </div>
  );
};
