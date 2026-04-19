import { useState } from "react";
import { Plus, X } from "lucide-react";
import { AccordionSection } from "@/components/AccordionSection";
import { useStore } from "@/store";

const COMMON_TAGS = [
  // --- Synths & Elektronik ---
  "shimmering synths",
  "analog synth warmth",
  "moog bass",
  "DX7 bell tones",
  "oberheim pads",
  "juno chorus",
  "prophet-5 strings",
  "CS-80 swells",
  "TB-303 acid line",
  "modular synth texture",
  "granular synthesis",
  "wavetable sweeps",
  "FM bell pads",
  "supersaw lead",
  "reese bass",
  "808 sub rumble",
  "909 kicks",
  "303 bassline",
  "LinnDrum claps",
  "TR-707 hats",
  // --- Gitarre & Saiten ---
  "fingerpicked acoustic guitar",
  "palm-muted rhythm guitar",
  "twangy Telecaster",
  "overdriven Les Paul",
  "clean Stratocaster",
  "lap steel guitar",
  "slide guitar",
  "fingerstyle nylon guitar",
  "baritone guitar",
  "12-string guitar shimmer",
  "jangly arpeggios",
  "whammy bar dive bomb",
  "fretless bass",
  "upright double bass",
  "slap bass",
  "funk rhythm guitar",
  // --- Drums & Percussion ---
  "tight snare",
  "gated reverb snare",
  "gated drums",
  "room-mic drums",
  "brushed snare",
  "rim shot",
  "live drum feel",
  "drum machine straight",
  "rolling Amen break",
  "boom bap drums",
  "hand percussion",
  "djembe pattern",
  "congas groove",
  "bongo fills",
  "shaker groove",
  "tambourine on 2+4",
  "tribal tom rolls",
  "brushed jazz kit",
  "electronic kick punch",
  "808 trap hi-hats",
  // --- Bass ---
  "pumping bass",
  "rolling bassline",
  "side-chained bass",
  "sub-bass rumble",
  "walking jazz bass",
  "syncopated bass fills",
  "disco octave bass",
  "dub bass",
  "overdriven bass",
  // --- Tasten & Akkorde ---
  "rhodes electric piano",
  "wurlitzer tines",
  "hammond organ",
  "retro organ",
  "church organ swell",
  "honky-tonk piano",
  "prepared piano",
  "clavinet funk",
  "vibraphone",
  "marimba pattern",
  "harpsichord",
  "celesta shimmer",
  // --- Blas & Streicher ---
  "brass section stabs",
  "trumpet fanfare",
  "trombone glide",
  "saxophone wail",
  "flute melody",
  "string quartet",
  "lush string arrangement",
  "pizzicato strings",
  "cello lead",
  "orchestral swells",
  "choir pads",
  "horn ensemble",
  // --- Gesang & Vocals ---
  "layered vocal harmonies",
  "tight vocal harmonies",
  "breathy vocals",
  "falsetto runs",
  "vocal chops",
  "vocoder effect",
  "auto-tune shimmer",
  "spoken word",
  "rap flow",
  "gospel choir",
  "call and response",
  "doo-wop harmonies",
  // --- Produktions-Techniken ---
  "analog warmth",
  "tape saturation",
  "analog tape saturation",
  "vinyl crackle",
  "lofi filter",
  "dusty sample",
  "spring reverb",
  "plate reverb",
  "room reverb",
  "hall reverb",
  "heavy reverb",
  "slapback echo",
  "tape echo",
  "dub delay",
  "ping-pong delay",
  "reverse reverb",
  "chorus effect",
  "flanger sweep",
  "phaser modulation",
  "tremolo pulsing",
  "bit crusher",
  "glitchy fx",
  "glitchy percussion",
  "stutter edit",
  "chop and screw",
  "pitched-down vocal",
  "sidechain pump",
  "multiband compression",
  "parallel compression",
  "saturation crunch",
  "tube warmth",
  "transistor grit",
  // --- Atmosphäre & Textur ---
  "ethereal pads",
  "ambient texture",
  "field recordings",
  "rain texture",
  "crowd noise",
  "ocean waves",
  "dark atmosphere",
  "cinematic build",
  "cinematic tension",
  "eerie silence",
  "warm nostalgia",
  "dystopian feel",
  "euphoric lead",
  "dreamy haze",
  "hypnotic loop",
  "meditative drone",
  "epic swell",
  "anthemic chorus",
  "intimate close-mic",
  "wide stereo field",
  "mono punchy mix",
  // --- Produktions-Stil / Sound-Design ---
  "Wall of Sound",
  "four-on-the-floor",
  "808 bass",
  "massive drop",
  "broken beat",
  "shimmering arpeggios",
  "rolling bassline",
  "lofi cassette hiss",
  "wax cylinder warmth",
  "binaural headphone mix",
  "lo-mid heavy",
  "air frequency sparkle",
  "deep sub bass",
  "punchy mid bass",
  "lo-fi hip hop beat",
  "club-ready master",
  "festival sound system",
  "headphone mix intimate",
];

export const StyleTags = () => {
  const { state, dispatch } = useStore();
  const [input, setInput] = useState("");

  const tags = state.prompt.customTags ?? [];

  const add = (t: string) => {
    const v = t.trim();
    if (!v) return;
    if (!tags.includes(v)) {
      dispatch({ type: "TOGGLE_CUSTOM_TAG", tag: v });
    }
    setInput("");
  };

  return (
    <div className="flex flex-col gap-3">
      <AccordionSection title="Eigene Style-Tags" defaultOpen selectionCount={tags.length}>
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add(input)}
              placeholder="Eigenes Tag eintippen und Enter drücken..."
              className="flex-1 rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-amber-dim)] focus:outline-none"
            />
            <button
              onClick={() => add(input)}
              disabled={!input.trim()}
              className="flex items-center gap-1 rounded border border-[var(--color-amber-dim)] bg-[var(--color-amber)]/10 px-3 py-2 text-xs text-[var(--color-amber)] transition hover:bg-[var(--color-amber)]/20 disabled:opacity-40"
            >
              <Plus size={12} />
              Hinzufügen
            </button>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1 rounded-full border border-[var(--color-amber-dim)] bg-[var(--color-amber)]/10 px-2.5 py-1 text-xs text-[var(--color-amber)]"
                >
                  {t}
                  <button
                    onClick={() => dispatch({ type: "TOGGLE_CUSTOM_TAG", tag: t })}
                    className="rounded-full p-0.5 transition hover:bg-[var(--color-amber)]/20"
                  >
                    <X size={10} strokeWidth={3} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </AccordionSection>

      <AccordionSection title="Häufige Style-Tags" optional>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_TAGS.map((t) => {
            const active = tags.includes(t);
            return (
              <button
                key={t}
                onClick={() => dispatch({ type: "TOGGLE_CUSTOM_TAG", tag: t })}
                className={`rounded-full border px-2.5 py-1 text-xs transition ${
                  active
                    ? "border-[var(--color-amber)] bg-[var(--color-amber)]/15 text-[var(--color-amber)]"
                    : "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-dim)] hover:border-[var(--color-amber-dim)] hover:text-[var(--color-text)]"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </AccordionSection>
    </div>
  );
};
