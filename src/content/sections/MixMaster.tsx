import { AccordionSection } from "@/components/AccordionSection";
import { CheckList, type CheckItem } from "@/content/CheckList";
import { useStore } from "@/store";

const EQ_CHAR: CheckItem[] = [
  { id: "eq-bright", label: "Bright", hint: "betonte Höhen" },
  { id: "eq-dark", label: "Dark", hint: "reduzierte Höhen" },
  { id: "eq-warm", label: "Warm", hint: "sanfte Mitten, Tiefmid" },
  { id: "eq-scooped", label: "Scooped Mids", hint: "Metal-Sound, V-Kurve" },
  { id: "eq-midrangy", label: "Midrange-forward", hint: "präsent, boxig" },
  { id: "eq-thin", label: "Thin", hint: "ausgedünnt, Lo-Fi" },
  { id: "eq-fat", label: "Fat", hint: "voll, bassig" },
  { id: "eq-crisp-highs", label: "Crisp High-End", hint: "Luft und Transparenz" },
  { id: "eq-warm-bass", label: "Warm Bass", hint: "Tiefmid betont" },
  { id: "eq-smiley", label: "Smiley Curve", hint: "Bass+Höhen boost, Mid cut" },
  { id: "eq-telephone", label: "Telephone EQ", hint: "Bandpass, 300-3kHz" },
  { id: "eq-radio-compressed", label: "Radio Compressed", hint: "stark begrenzt, mittenbetont" },
  { id: "eq-hipass", label: "Hi-Pass Filtered", hint: "Sub entfernt, schlank" },
  { id: "eq-lowpass", label: "Low-Pass Muffled", hint: "Höhen gekappt, dumpf" },
  { id: "eq-boom-heavy", label: "Boom-Heavy", hint: "100-200 Hz übertrieben" },
  { id: "eq-analog-roll", label: "Analog Roll-Off", hint: "natürlicher HF-Abfall" },
  { id: "eq-digital-clean", label: "Digital Clean Top", hint: "linearphasig, steril" },
  { id: "eq-presence", label: "Presence Boost", hint: "2-5 kHz Schneidigkeit" },
  { id: "eq-air-boost", label: "Air Boost", hint: "über 12 kHz, offen" },
  { id: "eq-flat", label: "Flat / Neutral", hint: "unbearbeitet, transparent" },
];

const DYN: CheckItem[] = [
  { id: "d-loud", label: "Loud & Compressed", hint: "modern, laut" },
  { id: "d-punchy", label: "Punchy", hint: "Transient-betont" },
  { id: "d-open", label: "Open & Breathing", hint: "audiophil, lebendig" },
  { id: "d-sidechained", label: "Side-chain Pumping", hint: "House/EDM-Pulsieren" },
  { id: "d-brick-walled", label: "Brick-walled", hint: "hard limited, maximiert" },
  { id: "d-natural", label: "Natural Dynamics", hint: "wenig Kompression" },
  { id: "d-over-compressed", label: "Over-compressed", hint: "kein Atem, flat" },
  { id: "d-breathing", label: "Breathing", hint: "Kompressor-Atmen hörbar" },
  { id: "d-wide-dynamic", label: "Wide Dynamic Range", hint: "leise/laut, filmisch" },
  { id: "d-narrow", label: "Narrow Dynamic", hint: "gleichmäßig, klein" },
  { id: "d-transient-snap", label: "Punchy Transients", hint: "Kicks und Snares knallen" },
  { id: "d-smooth-sustains", label: "Smooth Sustains", hint: "Transienten zurück" },
  { id: "d-natural-decay", label: "Natural Decay", hint: "Release unbearbeitet" },
  { id: "d-electronic-tight", label: "Electronic Tight", hint: "fast kein Sustain" },
  { id: "d-parallel", label: "Parallel Compressed", hint: "NY Compression, Dichte" },
];

const STEREO: CheckItem[] = [
  { id: "st-wide", label: "Wide Stereo Field", hint: "breit, immersiv" },
  { id: "st-mono-punch", label: "Mono-focused", hint: "Club-tauglich, Mitte" },
  { id: "st-centered", label: "Centered Mix", hint: "alles in der Mitte" },
  { id: "st-m-s", label: "M/S-Enhanced", hint: "Mid-Side EQ/Comp" },
  { id: "st-panning-active", label: "Active Panning", hint: "Elemente wandern" },
  { id: "st-ping-pong-delay", label: "Ping-Pong Delays", hint: "alternierend L/R" },
  { id: "st-haas", label: "Haas Effect", hint: "Slap-Delay L/R, breit" },
  { id: "st-auto-pan", label: "Auto-Pan", hint: "LFO-gesteuertes Panning" },
  { id: "st-imager", label: "Stereo Imager", hint: "Breite per Plugin" },
  { id: "st-spread", label: "Stereo Spread", hint: "gleichmäßig verteilt" },
  { id: "st-classic-mono", label: "Classic Mono", hint: "Mono-Summe, vintage" },
  { id: "st-dual-mono", label: "Dual Mono", hint: "L und R identisch" },
  { id: "st-binaural", label: "Binaural", hint: "Kopfhörer-Raum, HRTF" },
  { id: "st-ms-wide", label: "M/S Wide Sides", hint: "Seiten boosten" },
  { id: "st-atmos", label: "Dolby Atmos feel", hint: "räumlich, immersiv" },
];

const LOUDNESS: CheckItem[] = [
  { id: "loud-9-7", label: "-9 bis -7 LUFS", hint: "Pop/EDM loud" },
  { id: "loud-12-11", label: "-12 bis -11 LUFS", hint: "Lo-Fi" },
  { id: "loud-14", label: "-14 LUFS", hint: "Spotify/YouTube/Tidal" },
  { id: "loud-16", label: "-16 LUFS", hint: "Apple Music / Podcast" },
  { id: "loud-20", label: "-20 LUFS+", hint: "Klassik/Jazz, audiophil" },
  { id: "loud-club", label: "-8 LUFS", hint: "Club-Master, hart" },
  { id: "loud-cinema", label: "-27 LUFS", hint: "Kinostandard, dynamisch" },
  { id: "loud-radio", label: "-10 LUFS", hint: "Rundfunk-Standard" },
  { id: "loud-edm", label: "-7 LUFS", hint: "EDM maximiert" },
  { id: "loud-lofi", label: "-12 LUFS Lo-Fi", hint: "Lo-Fi Streaming" },
  { id: "loud-pop", label: "-9 LUFS Pop", hint: "moderner Pop-Target" },
  { id: "loud-deezer", label: "-15 LUFS", hint: "Deezer-Normalisierung" },
];

const HARMONIC: CheckItem[] = [
  { id: "harm-tape-sat", label: "Tape Saturation", hint: "Bandsättigung, warm" },
  { id: "harm-tube", label: "Tube Warmth", hint: "Röhren-Obertöne, gerade" },
  { id: "harm-transformer", label: "Transformer Color", hint: "Eingangsübertrager, Charakter" },
  { id: "harm-console", label: "Console Emulation", hint: "Neve/SSL/API-Klang" },
  { id: "harm-preamp", label: "Pre-Amp Distortion", hint: "Vorverstärker-Clip" },
  { id: "harm-exciter", label: "Harmonic Exciter", hint: "Höhen-Obertöne hinzufügen" },
  { id: "harm-psychoacoustic", label: "Psycho-Acoustic Enhance", hint: "Loudness-Enhancement" },
  { id: "harm-enhancer", label: "Harmonic Enhancer", hint: "Oberton-Anreicherung" },
  { id: "harm-analog-warmth", label: "Analog Warmth", hint: "allgemein analog-gefärbt" },
  { id: "harm-vintage-char", label: "Vintage Character", hint: "alte Geräte imitiert" },
  { id: "harm-odd-order", label: "Odd-Order Harmonics", hint: "Transistor, aggressiv" },
  { id: "harm-even-order", label: "Even-Order Harmonics", hint: "Röhre, musikalisch" },
  { id: "harm-parallel-sat", label: "Parallel Saturation", hint: "Wet/Dry gemischt" },
  { id: "harm-tape-slow", label: "Slow-Speed Tape Warble", hint: "Wow/Flutter, vintage" },
  { id: "harm-vinyl-sim", label: "Vinyl Simulation", hint: "Knistern, RIAA-Charakter" },
];

export const MixMaster = () => {
  const { state, dispatch } = useStore();
  const sel = (pool: CheckItem[]) => state.prompt.production.filter((p) => pool.some((i) => i.id === p));

  return (
    <div className="flex flex-col gap-3">
      <AccordionSection title="EQ-Charakter" defaultOpen selectionCount={sel(EQ_CHAR).length} onClear={() => sel(EQ_CHAR).forEach((id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id }))}>
        <CheckList items={EQ_CHAR} selected={sel(EQ_CHAR)} onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })} />
      </AccordionSection>
      <AccordionSection title="Dynamik" selectionCount={sel(DYN).length} onClear={() => sel(DYN).forEach((id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id }))}>
        <CheckList items={DYN} selected={sel(DYN)} onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })} />
      </AccordionSection>
      <AccordionSection title="Stereo-Bild" selectionCount={sel(STEREO).length} onClear={() => sel(STEREO).forEach((id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id }))}>
        <CheckList items={STEREO} selected={sel(STEREO)} onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })} />
      </AccordionSection>
      <AccordionSection title="Loudness (LUFS)" optional selectionCount={sel(LOUDNESS).length} onClear={() => sel(LOUDNESS).forEach((id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id }))}>
        <CheckList items={LOUDNESS} selected={sel(LOUDNESS)} onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })} />
      </AccordionSection>
      <AccordionSection title="Harmonische Sättigung" optional selectionCount={sel(HARMONIC).length} onClear={() => sel(HARMONIC).forEach((id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id }))}>
        <CheckList items={HARMONIC} selected={sel(HARMONIC)} onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })} />
      </AccordionSection>
    </div>
  );
};
