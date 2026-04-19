import { AccordionSection } from "@/components/AccordionSection";
import { CheckList, type CheckItem } from "@/content/CheckList";
import { useStore } from "@/store";

const FLOW: CheckItem[] = [
  { id: "flow-static", label: "Statisch", hint: "gleichbleibende Intensität" },
  { id: "flow-building", label: "Aufbauend", hint: "stetig steigende Energie" },
  { id: "flow-explosive", label: "Explosiv", hint: "plötzliche Höhepunkte" },
  { id: "flow-wave", label: "Wellenartig", hint: "Auf und Ab" },
  { id: "flow-fading", label: "Ausklingend", hint: "Intensität lässt nach" },
  { id: "flow-peak-middle", label: "Peak in der Mitte", hint: "Höhepunkt zentral" },
  { id: "flow-slow-burn", label: "Slow Burn", hint: "langer, subtiler Aufbau" },
  { id: "flow-call-response", label: "Call & Response", hint: "Frage-Antwort-Struktur" },
  { id: "flow-terraced", label: "Terraced Dynamics", hint: "stufenweise Pegelsprünge" },
  { id: "flow-micro-dynamics", label: "Micro-Dynamics", hint: "subtile Schwankungen im Detail" },
  { id: "flow-rubber-band", label: "Rubber Band", hint: "dehnt und komprimiert elastisch" },
  { id: "flow-tension-hold", label: "Tension Hold", hint: "lange Spannung, späte Auflösung" },
  { id: "flow-delayed-peak", label: "Delayed Peak", hint: "Höhepunkt erst am Ende" },
  { id: "flow-early-peak", label: "Early Peak", hint: "Höhepunkt früh, dann Abbau" },
  { id: "flow-cyclic", label: "Zyklisch", hint: "wiederkehrendes Muster ohne Steigerung" },
  { id: "flow-spiral", label: "Spiralförmig", hint: "jeder Zyklus intensiver als vorher" },
  { id: "flow-fragmented", label: "Fragmentiert", hint: "unregelmäßige Energie-Inseln" },
  { id: "flow-inverse-build", label: "Inverse Build", hint: "start laut, wird leiser und dichter" },
  { id: "flow-plateau", label: "Plateau", hint: "schneller Aufbau, lang gleichbleibend" },
  { id: "flow-sudden-drop", label: "Sudden Drop", hint: "unvermittelter Energie-Abbruch" },
  { id: "flow-cinematic-swell", label: "Cinematic Swell", hint: "orchestral anschwellend" },
];

const DROPS: CheckItem[] = [
  { id: "drop-massive", label: "Massive Drop", hint: "alles gleichzeitig, voller Einsatz" },
  { id: "drop-minimal", label: "Minimal Drop", hint: "reduziert, hypnotisch" },
  { id: "drop-tension-release", label: "Tension → Release", hint: "Spannung und Auflösung" },
  { id: "drop-false-drop", label: "False Drop", hint: "Fake, dann echter Drop" },
  { id: "build-riser", label: "Riser Build", hint: "ansteigender Noise-Sweep" },
  { id: "build-snare-roll", label: "Snare Roll", hint: "Snare-Wirbel zum Drop" },
  { id: "build-silence", label: "Silence Break", hint: "völlige Stille vor Drop" },
  { id: "no-drop", label: "Kein Drop", hint: "durchgängig ohne klassischen Drop" },
  { id: "drop-festival", label: "Festival Drop", hint: "maximale Crowd-Energie, Stadion" },
  { id: "drop-half", label: "Half-Drop", hint: "teilweise Energie, Beat bleibt dünner" },
  { id: "drop-melodic", label: "Melodic Release", hint: "Lead-Melodie dominiert den Drop" },
  { id: "drop-bass-wub", label: "Wubbed Drop", hint: "Dubstep-Wobble-Bass dominiert" },
  { id: "drop-808-heavy", label: "808 Heavy Drop", hint: "Trap-808-Sub, Kick-dominant" },
  { id: "drop-hypnotic-loop", label: "Hypnotic Loop", hint: "minimaler Drop, trance-induzierend" },
  { id: "drop-reese-bass", label: "Reese Bass Drop", hint: "DnB-Bassline, modulierender Sub" },
  { id: "drop-amen-break", label: "Amen Break Drop", hint: "Jungle/DnB, klassischer Break" },
  { id: "drop-trance-climax", label: "Trance Climax", hint: "Trance: Melodie + synk. Bassline" },
  { id: "drop-scream", label: "Scream Drop", hint: "Distortion-Anstieg, aggressiver Einschlag" },
  { id: "drop-orchestra-stab", label: "Orchestra Stab Drop", hint: "Orchester-Hit als Drop-Trigger" },
  { id: "drop-chord-stab", label: "Chord Stab Drop", hint: "Synth-Chord-Stabs leiten Drop ein" },
  { id: "drop-filter-open", label: "Filter Open Drop", hint: "LP-Filter öffnet zum Drop" },
  { id: "drop-reverse-cymbal", label: "Reverse Cymbal Build", hint: "rückwärts Becken zum Einsatz" },
  { id: "drop-vocal-chop", label: "Vocal Chop Build", hint: "Gesangs-Chops bauen auf" },
  { id: "drop-pitch-riser", label: "Pitch Riser", hint: "aufsteigender Ton bis zum Drop" },
  { id: "drop-subtle-bass", label: "Subtle Bass Drop", hint: "dezenter Sub-Bass-Einsatz" },
  { id: "drop-double", label: "Double Drop", hint: "zwei Tracks gleichzeitig im Drop" },
];

const DYNAMIC_RANGE: CheckItem[] = [
  { id: "dyn-crushed", label: "Crushed", hint: "brutal komprimiert, laut" },
  { id: "dyn-compressed", label: "Compressed", hint: "modern, laut" },
  { id: "dyn-balanced", label: "Balanced", hint: "ausgewogen" },
  { id: "dyn-open", label: "Open", hint: "viel Luft, atmend" },
  { id: "dyn-orchestral", label: "Orchestral", hint: "große Dynamik, pp bis fff" },
  { id: "dyn-punchy", label: "Punchy", hint: "kurze Attack, schneller Release" },
  { id: "dyn-smooth", label: "Smooth", hint: "weicher Kompressor, kein Pumpen" },
  { id: "dyn-pumping", label: "Pumping", hint: "Sidechain-Effekt hörbar gewollt" },
  { id: "dyn-natural", label: "Natural", hint: "kaum Kompression, organisch" },
  { id: "dyn-limiter-slammed", label: "Limiter-Slammed", hint: "Loudness War, 2000er-Stil" },
  { id: "dyn-lufs-streaming", label: "Streaming-LUFS", hint: "-14 LUFS, für Spotify optimiert" },
  { id: "dyn-wide-range", label: "Wide Range", hint: "leise Passagen kontrastieren stark" },
];

const ENERGY_PROFILE: CheckItem[] = [
  { id: "ep-steady-climb", label: "Steady Climb", hint: "gleichmäßiger Anstieg bis zum Ende" },
  { id: "ep-peaks-valleys", label: "Peaks & Valleys", hint: "Hochs und Tiefs wechseln sich ab" },
  { id: "ep-climax-mid", label: "Climax Mid", hint: "Höhepunkt in der Mitte des Tracks" },
  { id: "ep-late-bloomer", label: "Late Bloomer", hint: "Energie entfaltet sich spät" },
  { id: "ep-fast-start", label: "Fast Start", hint: "sofort volle Energie, dann halten" },
  { id: "ep-two-peaks", label: "Two Peaks", hint: "zwei deutliche Energie-Hochpunkte" },
  { id: "ep-tidal", label: "Tidal", hint: "gleichmäßig ein- und ausatmend" },
  { id: "ep-flat-line", label: "Flat Line", hint: "konstante Energie, kein Auf/Ab" },
  { id: "ep-staircase", label: "Staircase", hint: "abrupte Stufen nach oben" },
  { id: "ep-downward-arc", label: "Downward Arc", hint: "beginnt stark, baut langsam ab" },
  { id: "ep-pulse", label: "Pulsierend", hint: "rhythmische Energie-Schübe" },
];

export const Dynamik = () => {
  const { state, dispatch } = useStore();
  const sel = (pool: CheckItem[]) =>
    state.prompt.production.filter((p) => pool.some((i) => i.id === p));

  return (
    <div className="flex flex-col gap-3">
      <AccordionSection
        title="Energie-Verlauf"
        defaultOpen
        selectionCount={sel(FLOW).length}
        onClear={() => sel(FLOW).forEach((id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id }))}
      >
        <CheckList items={FLOW} selected={sel(FLOW)} onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })} />
      </AccordionSection>

      <AccordionSection title="Build & Drop" selectionCount={sel(DROPS).length} onClear={() => sel(DROPS).forEach((id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id }))}>
        <CheckList items={DROPS} selected={sel(DROPS)} onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })} />
      </AccordionSection>

      <AccordionSection title="Dynamikumfang" optional selectionCount={sel(DYNAMIC_RANGE).length} onClear={() => sel(DYNAMIC_RANGE).forEach((id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id }))}>
        <CheckList items={DYNAMIC_RANGE} selected={sel(DYNAMIC_RANGE)} onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })} />
      </AccordionSection>

      <AccordionSection title="Energie-Profil" optional selectionCount={sel(ENERGY_PROFILE).length} onClear={() => sel(ENERGY_PROFILE).forEach((id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id }))}>
        <CheckList items={ENERGY_PROFILE} selected={sel(ENERGY_PROFILE)} onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })} />
      </AccordionSection>
    </div>
  );
};
