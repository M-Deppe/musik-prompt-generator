import { AccordionSection } from "@/components/AccordionSection";
import { CheckList, type CheckItem } from "@/content/CheckList";
import { useStore } from "@/store";

const FX_IDEAS: CheckItem[] = [
  { id: "ec-vinyl", label: "Vinyl Crackle", hint: "Knistern alter Schallplatten" },
  { id: "ec-tape-saturation", label: "Tape Saturation", hint: "warme Band-Sättigung" },
  { id: "ec-bit-crush", label: "Bit Crush", hint: "digitale Auflösung reduziert" },
  { id: "ec-tape-stop", label: "Tape Stop", hint: "Band bremst kurz ab" },
  { id: "ec-glitch", label: "Glitch FX", hint: "digitale Störungen/Stutter" },
  { id: "ec-field-recording", label: "Field Recording", hint: "Atmos, Natur" },
  { id: "ec-foley", label: "Foley Sounds", hint: "Alltagsgeräusche als Akzent" },
  { id: "ec-radio-static", label: "Radio Static", hint: "Radio-Rauschen zwischen Sendern" },
  { id: "ec-cassette-hiss", label: "Cassette Hiss", hint: "leises Tape-Grundrauschen" },
  { id: "ec-autotune-artifact", label: "Autotune Artifacts", hint: "bewusste Autotune-Zacken" },
  { id: "ec-reverse", label: "Reverse Sounds", hint: "rückwärts gespielte Elemente" },
  { id: "ec-hum-60hz", label: "60Hz Hum", hint: "Strombrummen, Vintage" },
  { id: "ec-power-up", label: "Power-Up Chime", hint: "Einschalt-Sound" },
  { id: "ec-digital-error", label: "Digital Error", hint: "Datenfehler-Klick" },
  { id: "ec-modem", label: "Modem Handshake", hint: "90er Internet-Sound" },
  { id: "ec-retro-blip", label: "Retro Videogame Blip", hint: "8-Bit-FX" },
  { id: "ec-asmr-whisper", label: "ASMR Whisper", hint: "nah, prickelnd" },
  { id: "ec-synthetic-voice", label: "Synthetic Voice", hint: "Text-to-Speech-Artefakt" },
  { id: "ec-vocoder-bit", label: "Vocoder Bit", hint: "kurzes Roboter-Wort" },
  { id: "ec-rain-ambiance", label: "Rain Ambiance", hint: "Regen im Hintergrund" },
  { id: "ec-forest-atmo", label: "Forest Atmosphere", hint: "Vögel, Wind" },
  { id: "ec-crowd-murmur", label: "Crowd Murmur", hint: "Menschenmenge" },
  { id: "ec-applause", label: "Applause", hint: "Klatschen" },
  { id: "ec-distant-traffic", label: "Distant Traffic", hint: "Stadt-Atmo" },
  { id: "ec-bell-notification", label: "Bell Notification", hint: "kurzer Glockenruf" },
  { id: "ec-ice-cream-truck", label: "Ice Cream Truck Jingle", hint: "kitschig, surreal" },
];

const TRANSITIONS: CheckItem[] = [
  { id: "tr-whoosh", label: "Whoosh", hint: "rauschender Sweep" },
  { id: "tr-riser-high", label: "High Riser", hint: "aufsteigender Noise bis Spitze" },
  { id: "tr-downlifter", label: "Downlifter", hint: "abfallender Effekt vor Ruhe" },
  { id: "tr-noise-sweep", label: "Noise Sweep", hint: "breiter gefilterter Noise" },
  { id: "tr-reverse-cymbal", label: "Reverse Cymbal", hint: "rückwärts Becken leitet ein" },
  { id: "tr-drum-fill", label: "Drum Fill", hint: "Schlagzeug-Wirbel als Übergang" },
  { id: "tr-silence", label: "Sudden Silence", hint: "abrupte Stille vor Drop" },
  { id: "tr-stutter", label: "Stutter Edit", hint: "wiederholtes Stottern eines Samples" },
  { id: "tr-filter-up", label: "Filter Sweep Up", hint: "Hochpass öffnet sich" },
  { id: "tr-filter-down", label: "Filter Sweep Down", hint: "Tiefpass schließt sich" },
  { id: "tr-pitch-bend", label: "Pitch Bend", hint: "Tonhöhenrutsch" },
  { id: "tr-half-time-drop", label: "Tempo Drop Half-Time", hint: "gefühlte Verlangsamung" },
  { id: "tr-double-time", label: "Tempo Pick-up Double", hint: "doppelt so schnell fühlen" },
  { id: "tr-sidechain-fade", label: "Sidechain Fade", hint: "pumpendes Ausblenden" },
  { id: "tr-mute-all", label: "Mute All Instruments", hint: "totales Schweigen" },
  { id: "tr-isolate-vocal", label: "Isolate Vocal", hint: "nur Stimme übrig" },
  { id: "tr-isolate-bass", label: "Isolate Bass", hint: "nur Bass übrig" },
  { id: "tr-break-roll", label: "Break Beat Roll", hint: "rhythmischer Bruch" },
  { id: "tr-snare-buildup", label: "Snare Buildup", hint: "immer dichter werdend" },
  { id: "tr-frozen-reverb", label: "Frozen Reverb", hint: "eingefrorener Hall" },
  { id: "tr-glitch-chop", label: "Glitch Chop", hint: "zerhackt, digital" },
  { id: "tr-tape-cut", label: "Tape Cut", hint: "hartes Abschneiden" },
  { id: "tr-dj-rewind", label: "DJ Rewind", hint: "rückwärts spulen" },
  { id: "tr-vinyl-scratch", label: "Vinyl Scratch", hint: "DJ-Scratch" },
  { id: "tr-risers-stack", label: "Stacked Risers", hint: "mehrere aufbauend" },
];

const IMPACTS: CheckItem[] = [
  { id: "im-cinematic-hit", label: "Cinematic Hit", hint: "großer Einschlag, Film-Szenenwechsel" },
  { id: "im-sub-impact", label: "Sub Impact", hint: "tiefer, physisch spürbarer Einschlag" },
  { id: "im-braam", label: "Braam", hint: "tiefer Trailer-Brass-Ton" },
  { id: "im-taiko-hit", label: "Taiko Hit", hint: "japanische Großtrommel" },
  { id: "im-orchestral-hit", label: "Orchestral Hit", hint: "kurzer voller Orchester-Stich" },
  { id: "im-gun-shot", label: "Distant Gunshot", hint: "entfernter Schuss-Knall" },
  { id: "im-boom", label: "Boom", hint: "dumpfer, voller Schlag" },
  { id: "im-thunder", label: "Thunder", hint: "Donnergrollen" },
  { id: "im-whoosh-impact", label: "Whoosh Impact", hint: "Sweep + Aufprall" },
  { id: "im-hybrid-hit", label: "Hybrid Hit", hint: "synthetisch + organisch" },
  { id: "im-dueling-braam", label: "Dueling Braam", hint: "zwei Bräm-Schichten" },
  { id: "im-ensemble-stab", label: "Ensemble Stab", hint: "Orchesterakzent" },
  { id: "im-bass-drop", label: "Bass Drop Impact", hint: "Sub-Einbruch" },
  { id: "im-rising-hit", label: "Rising Hit", hint: "aufsteigend endend" },
  { id: "im-slam-door", label: "Slam / Door Bang", hint: "physischer Aufprall" },
  { id: "im-metal-clang", label: "Metal Clang", hint: "Metall-Aufprall" },
  { id: "im-explosion", label: "Explosion", hint: "Detonation" },
  { id: "im-crash-glass", label: "Crash Glass", hint: "zerbrechend" },
  { id: "im-electric-discharge", label: "Electric Discharge", hint: "Strom, Blitz" },
  { id: "im-laser-impact", label: "Laser Impact", hint: "Sci-Fi" },
  { id: "im-warp-jump", label: "Warp Jump", hint: "Sprung in den Hyperraum" },
  { id: "im-clockwork-tick", label: "Clockwork Tick", hint: "präziser Impuls" },
  { id: "im-firework", label: "Firework Boom", hint: "Knall + Glitzern" },
  { id: "im-shatter-mirror", label: "Shattered Mirror", hint: "viele Glas-Splitter" },
  { id: "im-crumble-rock", label: "Crumbling Rock", hint: "Steinschlag, tief" },
];

const TEXTURAL_LAYERS: CheckItem[] = [
  { id: "tex-ambient-pads", label: "Ambient Pads", hint: "schwebende Flächen" },
  { id: "tex-granular", label: "Granular Textures", hint: "körnig zersetzt" },
  { id: "tex-drone", label: "Drones", hint: "Bordun, anhaltend" },
  { id: "tex-swell", label: "Swells", hint: "anschwellend" },
  { id: "tex-harmonic-series", label: "Harmonic Series", hint: "Oberton-Fläche" },
  { id: "tex-bells-sustained", label: "Bells Sustained", hint: "nachklingende Glocken" },
  { id: "tex-choir-distant", label: "Choir Distant", hint: "entfernter Chor" },
  { id: "tex-wind-ambient", label: "Wind Ambient", hint: "Wind-Atmo" },
  { id: "tex-water-ambient", label: "Water Ambient", hint: "Wasser, Meer" },
  { id: "tex-rain-ambient", label: "Rain Ambient", hint: "Regengeräusch" },
  { id: "tex-white-noise", label: "White Noise Carpet", hint: "gleichmäßig, hell" },
  { id: "tex-pink-noise", label: "Pink Noise Warm", hint: "ausgewogen, warm" },
  { id: "tex-brown-noise", label: "Brown Noise Deep", hint: "tief, beruhigend" },
  { id: "tex-filtered-static", label: "Filtered Static", hint: "gefiltertes Rauschen" },
  { id: "tex-frozen-harmonies", label: "Frozen Harmonies", hint: "eingefrorene Akkorde" },
  { id: "tex-reverse-pads", label: "Reverse Pads", hint: "rückwärts atmend" },
  { id: "tex-evolving-soundscape", label: "Evolving Soundscape", hint: "sich verändernde Klangwelt" },
  { id: "tex-sub-rumble", label: "Sub Rumble", hint: "tiefes Beben" },
  { id: "tex-shimmer-reverb", label: "Shimmer Reverb", hint: "oktavierter Hall" },
  { id: "tex-string-texture", label: "String Texture", hint: "Streicher als Fläche" },
  { id: "tex-brass-swell", label: "Brass Swell", hint: "Blechbläser anschwellend" },
];

export const Earcandy = () => {
  const { state, dispatch } = useStore();
  const sel = (pool: CheckItem[]) => state.prompt.instruments.filter((p) => pool.some((i) => i.id === p));

  return (
    <div className="flex flex-col gap-3">
      <AccordionSection title="FX-Ideen" defaultOpen selectionCount={sel(FX_IDEAS).length} onClear={() => sel(FX_IDEAS).forEach((id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id }))}>
        <CheckList items={FX_IDEAS} selected={sel(FX_IDEAS)} onToggle={(id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id })} placeholder="FX suchen..." />
      </AccordionSection>
      <AccordionSection title="Transitions" selectionCount={sel(TRANSITIONS).length} onClear={() => sel(TRANSITIONS).forEach((id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id }))}>
        <CheckList items={TRANSITIONS} selected={sel(TRANSITIONS)} onToggle={(id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id })} placeholder="Transition suchen..." />
      </AccordionSection>
      <AccordionSection title="Risers & Impacts" optional selectionCount={sel(IMPACTS).length} onClear={() => sel(IMPACTS).forEach((id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id }))}>
        <CheckList items={IMPACTS} selected={sel(IMPACTS)} onToggle={(id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id })} placeholder="Impact suchen..." />
      </AccordionSection>
      <AccordionSection title="Textur-Layers" optional selectionCount={sel(TEXTURAL_LAYERS).length} onClear={() => sel(TEXTURAL_LAYERS).forEach((id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id }))}>
        <CheckList items={TEXTURAL_LAYERS} selected={sel(TEXTURAL_LAYERS)} onToggle={(id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id })} placeholder="Textur suchen..." />
      </AccordionSection>
    </div>
  );
};
