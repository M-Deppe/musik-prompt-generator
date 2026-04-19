import { AccordionSection } from "@/components/AccordionSection";
import { CheckList, type CheckItem } from "@/content/CheckList";
import { useStore } from "@/store";

const KICK_SNARE: CheckItem[] = [
  // TR-Maschinen Kicks
  { id: "kick-808", label: "808 Kick", hint: "tuned sub-bass kick" },
  { id: "kick-909", label: "909 Kick", hint: "punchy, House/Techno" },
  { id: "kick-707", label: "707 Kick", hint: "knackig, digital" },
  { id: "kick-linndrum", label: "LinnDrum Kick", hint: "gesampelt, natürlich" },
  { id: "kick-sp1200", label: "SP-1200 Kick", hint: "12-bit, gritty" },
  { id: "kick-mpc", label: "MPC Kick", hint: "Akai Swing-Charakter" },
  // Kick-Charaktere
  { id: "kick-punchy", label: "Punchy Kick", hint: "tight, trocken" },
  { id: "kick-boomy", label: "Boomy Kick", hint: "tief, hallig" },
  { id: "kick-clicky", label: "Clicky Kick", hint: "betonter Attack" },
  { id: "kick-four-floor", label: "Four-on-the-floor Kick", hint: "Dance, auf jeder Zählzeit" },
  { id: "kick-sub-boomy", label: "Sub-boom Kick", hint: "tiefer Sub-Schwanz" },
  { id: "kick-distorted", label: "Distorted Kick", hint: "übersteuert, aggressiv" },
  { id: "kick-layered", label: "Layered Kick", hint: "Sub + Click kombiniert" },
  { id: "kick-lofi", label: "Lo-Fi Kick", hint: "gedämpft, Tape-komprimiert" },
  { id: "kick-jazz", label: "Jazz Kick", hint: "runder Anschlag, offen" },
  { id: "kick-acoustic-ludwig", label: "Ludwig Kick", hint: "Vintage Rock, trocken" },
  { id: "kick-acoustic-gretsch", label: "Gretsch Kick", hint: "jazzig, warm" },
  { id: "kick-acoustic-yamaha", label: "Yamaha Kick", hint: "klar, ausgewogen" },
  // Snare-Typen
  { id: "snare-tight", label: "Tight Snare", hint: "knapp, präzise" },
  { id: "snare-clap", label: "Clap Snare", hint: "elektronisch, scharf" },
  { id: "snare-gated", label: "Gated Snare", hint: "80s, gewuchtet" },
  { id: "snare-rimshot", label: "Rimshot", hint: "Rand + Fell, krachend" },
  { id: "snare-trap", label: "Trap Snare", hint: "scharf, verwaschen" },
  { id: "snare-acoustic", label: "Acoustic Snare", hint: "natürlich, Obertöne" },
  { id: "snare-brushed", label: "Brushed Snare", hint: "Jazz, weich" },
  { id: "snare-fat-rock", label: "Fat Rock Snare", hint: "voll, tief gestimmt" },
  { id: "snare-ringy", label: "Ringy Pop Snare", hint: "hohes Sustain, Pop" },
  { id: "snare-buzzy-jazz", label: "Buzzy Jazz Snare", hint: "Schnarrsaite betont" },
  { id: "snare-crispy", label: "Crispy Electronic Snare", hint: "digital clean" },
  { id: "snare-reversed", label: "Reversed Snare", hint: "rückwärts, swelling" },
  { id: "snare-vinyl", label: "Vinyl Snare", hint: "gesampelt, knisternd" },
  { id: "snare-808-clap", label: "808 Clap", hint: "elektronisch, synthetisch" },
  { id: "snare-tr8s", label: "TR-8S Snare", hint: "moderner Roland, flexibel" },
  { id: "snare-limp", label: "Ghost Snare", hint: "sehr leise, textural" },
];

const HIHATS: CheckItem[] = [
  { id: "hihat-trap", label: "Trap Hi-Hats", hint: "Triplet-Rolls" },
  { id: "hihat-tight", label: "Tight Closed Hats", hint: "kurz, präzise" },
  { id: "hihat-loose", label: "Loose Open Hats", hint: "lang, offen" },
  { id: "hihat-shuffled", label: "Shuffled Hats", hint: "swung, Groove" },
  { id: "hihat-machine", label: "Machine Hi-Hats", hint: "TR-808/909" },
  { id: "hihat-acoustic", label: "Acoustic Hi-Hats", hint: "natürlich, lebendig" },
  { id: "hihat-rolling", label: "Rolling Hats", hint: "schnelle Folge" },
  { id: "hihat-side", label: "Side-stick Pattern", hint: "Rimshot-Variation" },
  { id: "hihat-16th", label: "Straight 16th Hats", hint: "gleichmäßig, mechanisch" },
  { id: "hihat-32nd", label: "32nd-Note Hats", hint: "extrem schnell, drill" },
  { id: "hihat-triplet", label: "Triplet Hats", hint: "Dreiertakt-Feeling" },
  { id: "hihat-ghost", label: "Ghost Hats", hint: "sehr leise Zwischennoten" },
  { id: "hihat-distorted", label: "Distorted Hats", hint: "übersteuert, aggressiv" },
  { id: "hihat-lofi", label: "Lo-Fi Hats", hint: "bandbegrenzt, stumpf" },
  { id: "hihat-vinyl", label: "Vinyl-sampled Hats", hint: "Knistern, warm" },
  { id: "hihat-2step", label: "2-Step Hats", hint: "UK Garage, synkopiert" },
  { id: "hihat-footwork", label: "Footwork Hats", hint: "Chicago, sehr schnell" },
  { id: "hihat-amen-style", label: "Amen-style Hats", hint: "Jungle, unregelmäßig" },
  { id: "hihat-velocity-swing", label: "Velocity-swung Hats", hint: "laut/leise wechseln" },
  { id: "hihat-open-close", label: "Open-Close Pattern", hint: "alternierend auf/zu" },
];

const DRUM_CHAR: CheckItem[] = [
  { id: "drums-thunderous", label: "Thunderous", hint: "massiv, groß" },
  { id: "drums-crisp", label: "Crisp", hint: "sauber, präsent" },
  { id: "drums-lofi", label: "Lo-Fi Drums", hint: "gedämpft, Tape-aufgenommen" },
  { id: "drums-acoustic-live", label: "Acoustic Live", hint: "Raum, lebendig" },
  { id: "drums-programmed", label: "Programmed", hint: "rigide, elektronisch" },
  { id: "drums-chopped", label: "Chopped Samples", hint: "Breakbeat-Style" },
  { id: "drums-swung", label: "Swung", hint: "Shuffle, laid-back" },
  { id: "drums-punchy", label: "Punchy", hint: "Attack betont, kurz" },
  { id: "drums-airy", label: "Airy", hint: "offen, viel Raum" },
  { id: "drums-dusty", label: "Dusty", hint: "lo-fi, vinyl-staubig" },
  { id: "drums-roomy", label: "Roomy", hint: "Raumklang dominant" },
  { id: "drums-tight-dry", label: "Tight Dry", hint: "kein Hall, präzise" },
  { id: "drums-stadium", label: "Huge Stadium", hint: "episch, langer Nachhall" },
  { id: "drums-gated-80s", label: "Gated 80s", hint: "Phil Collins, abschneidend" },
  { id: "drums-dry-studio", label: "Dry Studio", hint: "neutral, kein Raum" },
  { id: "drums-vintage-tape", label: "Vintage Tape", hint: "gesättigt, warm" },
  { id: "drums-distorted", label: "Distorted", hint: "übersteuert, Fuzz" },
  { id: "drums-compressed", label: "Pumping Compressed", hint: "Sidechain-Effekt" },
  { id: "drums-ambient", label: "Ambient Drums", hint: "Hall überwältigend" },
  { id: "drums-brush-jazz", label: "Jazz Brush", hint: "Besen, sanft" },
  { id: "drums-machine-straight", label: "Machine-Straight", hint: "kein Swing, exakt" },
  { id: "drums-humanized", label: "Programmed Humanized", hint: "kleine Timing-Abweichungen" },
];

const DRUM_PATTERNS: CheckItem[] = [
  { id: "pat-boom-bap", label: "Boom Bap", hint: "90s Hip-Hop, geswingt" },
  { id: "pat-trap", label: "Trap Half-Time", hint: "Snare auf 3, 16tel Hats" },
  { id: "pat-dnb-amen", label: "Amen Break", hint: "Jungle/DnB, gesampelt" },
  { id: "pat-breakbeat", label: "Breakbeat Funky", hint: "synkopiert, organisch" },
  { id: "pat-breakbeat-rave", label: "Breakbeat Rave", hint: "90s Rave, schnell" },
  { id: "pat-motorik", label: "Motorik", hint: "Krautrock, 4/4 hypnotisch" },
  { id: "pat-blast", label: "Blast Beat", hint: "Grindcore/Metal" },
  { id: "pat-d-beat", label: "D-Beat", hint: "Discharge, Punk/Hardcore" },
  { id: "pat-shuffle", label: "Shuffle Blues", hint: "Swing, Blues" },
  { id: "pat-dembow", label: "Dembow", hint: "Reggaeton, Offbeat-Snare" },
  { id: "pat-clave-son", label: "Clave Son", hint: "3-2 lateinamerikanisch" },
  { id: "pat-clave-rumba", label: "Clave Rumba", hint: "2-3 Variante" },
  { id: "pat-afro-six", label: "Afro 6/8", hint: "polyrythmisch, westafrikanisch" },
  { id: "pat-tresillo", label: "Tresillo", hint: "3+3+2-Rhythmus, Latin" },
  { id: "pat-gallop", label: "Gallop Pattern", hint: "Metal, doppelte Bassdrum" },
  { id: "pat-polka", label: "Polka Backbeat", hint: "2+4 Backbeat, lebhaft" },
  { id: "pat-bossa", label: "Bossa Nova", hint: "Brasilianisch, leicht" },
  { id: "pat-samba", label: "Samba", hint: "Brasilianisch, schnell" },
  { id: "pat-funk-groove", label: "Funk Groove", hint: "16tel-Feeling, synkopiert" },
  { id: "pat-disco-four", label: "Disco 4-on-floor", hint: "Kick auf jedem Beat" },
  { id: "pat-house-groove", label: "House Groove", hint: "4/4, Offbeat-Hats" },
  { id: "pat-techno-steady", label: "Techno Steady", hint: "minimalistisch, repetitiv" },
  { id: "pat-jungle-amen", label: "Jungle Amen", hint: "170 BPM, zerteilt" },
  { id: "pat-dnb-rolling", label: "DnB Rolling", hint: "Zwei-Step Variante" },
  { id: "pat-footwork", label: "Footwork/Juke", hint: "Chicago, 160 BPM" },
  { id: "pat-drum-chopped-dnb", label: "DnB Chopped Breaks", hint: "Breakbeats re-edited" },
  { id: "pat-neo-soul-halftime", label: "Neo-Soul Half-Time", hint: "laid-back, breites Feeling" },
  { id: "pat-swung-backbeat", label: "Swung Backbeat", hint: "Jazz-Swing, Snare 2+4" },
  { id: "pat-hyperpop-blast", label: "Hyperpop Blast", hint: "chaotisch, überladen" },
  { id: "pat-hiphop-headnod", label: "Hip-Hop Head-Nod", hint: "schwerer Swing, groovend" },
  { id: "pat-clave", label: "Clave", hint: "Latin, allgemein" },
  { id: "pat-drill-uk", label: "UK Drill", hint: "sehr langsam, schwer" },
];

export const Drums = () => {
  const { state, dispatch } = useStore();
  const sel = (pool: CheckItem[]) => state.prompt.instruments.filter((p) => pool.some((i) => i.id === p));

  return (
    <div className="flex flex-col gap-3">
      <AccordionSection title="Kick & Snare" defaultOpen selectionCount={sel(KICK_SNARE).length} onClear={() => sel(KICK_SNARE).forEach((id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id }))}>
        <CheckList items={KICK_SNARE} selected={sel(KICK_SNARE)} onToggle={(id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id })} placeholder="Kick/Snare suchen..." />
      </AccordionSection>
      <AccordionSection title="Hi-Hats" selectionCount={sel(HIHATS).length} onClear={() => sel(HIHATS).forEach((id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id }))}>
        <CheckList items={HIHATS} selected={sel(HIHATS)} onToggle={(id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id })} />
      </AccordionSection>
      <AccordionSection title="Drum-Charakter" selectionCount={sel(DRUM_CHAR).length} onClear={() => sel(DRUM_CHAR).forEach((id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id }))}>
        <CheckList items={DRUM_CHAR} selected={sel(DRUM_CHAR)} onToggle={(id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id })} />
      </AccordionSection>
      <AccordionSection title="Drum-Pattern" optional selectionCount={sel(DRUM_PATTERNS).length} onClear={() => sel(DRUM_PATTERNS).forEach((id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id }))}>
        <CheckList items={DRUM_PATTERNS} selected={sel(DRUM_PATTERNS)} onToggle={(id) => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: id })} placeholder="Pattern suchen..." />
      </AccordionSection>
    </div>
  );
};
