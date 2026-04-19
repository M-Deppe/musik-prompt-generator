import { AccordionSection } from "@/components/AccordionSection";
import { CheckList, type CheckItem } from "@/content/CheckList";
import { moods, MOOD_DESCRIPTIONS } from "@/lib/knowledge";
import { useStore } from "@/store";

const ENERGY_LEVELS: CheckItem[] = [
  { id: "drone-static", label: "Drone / Static", hint: "ein Ton, keine Bewegung" },
  { id: "ultra-minimal", label: "Ultra minimal", hint: "kaum wahrnehmbar" },
  { id: "whisper-quiet", label: "Whisper quiet", hint: "hauchzart, fast unhörbar" },
  { id: "breath-soft", label: "Breath soft", hint: "weich wie Atemzug" },
  { id: "very-low", label: "Sehr niedrig", hint: "ruhig, fließend" },
  { id: "low", label: "Niedrig", hint: "chill, smooth" },
  { id: "chill-wave", label: "Chill wave", hint: "entspannt, wellenartig" },
  { id: "mid-low", label: "Mittel-niedrig", hint: "entspannt aber lebendig" },
  { id: "mid", label: "Mittel", hint: "ausgewogen, bewegend" },
  { id: "medium-groove", label: "Medium groove", hint: "groovend, fließend" },
  { id: "mid-high", label: "Mittel-hoch", hint: "treibend, dynamisch" },
  { id: "head-nod", label: "Head-nod", hint: "nickt mit, fokussiert" },
  { id: "high", label: "Hoch", hint: "energetisch, mitreißend" },
  { id: "dance-energy", label: "Dance energy", hint: "Dancefloor-tauglich" },
  { id: "anthemic", label: "Anthemic", hint: "mitzusingen, Stadion" },
  { id: "very-high", label: "Sehr hoch", hint: "explosiv, rave" },
  { id: "epic-climax", label: "Epic climax", hint: "großer Moment, Gipfel" },
  { id: "overdrive-explosive", label: "Overdrive / Explosive", hint: "übersteuert, berauschend" },
  { id: "maximum-intensity", label: "Maximum intensity", hint: "non-stop, überwältigend" },
  { id: "maximal", label: "Maximal", hint: "absolutes Maximum" },
];

export const CINEMATIC_TAGS: CheckItem[] = [
  { id: "epic-build", label: "Epic Build", hint: "Aufbau zu Höhepunkt" },
  { id: "tension", label: "Tension", hint: "spannungsgeladen" },
  { id: "release", label: "Release", hint: "erlösender Moment" },
  { id: "triumphant", label: "Triumphant", hint: "siegreich, hymnisch" },
  { id: "melancholic-strings", label: "Melancholic Strings", hint: "emotional, traurig" },
  { id: "heroic", label: "Heroic", hint: "heldenhaft, groß" },
  { id: "sinister", label: "Sinister", hint: "bedrohlich, düster" },
  { id: "mystery", label: "Mystery", hint: "geheimnisvoll" },
  { id: "rising-action", label: "Rising Action", hint: "Handlung nimmt Fahrt auf" },
  { id: "falling-action", label: "Falling Action", hint: "Spannung löst sich" },
  { id: "massive-hit", label: "Massive Hit", hint: "Orchestral-Schlag, Impact" },
  { id: "whisper-intro", label: "Whisper Intro", hint: "stille, leise Eröffnung" },
  { id: "villain-motif", label: "Villain Motif", hint: "Antagonist, Bedrohung" },
  { id: "love-theme", label: "Love Theme", hint: "romantische Leitmotivik" },
  { id: "action-cue", label: "Action Cue", hint: "Kampf, Chase, Tempo" },
  { id: "chase-scene", label: "Chase Scene", hint: "Verfolgung, Eile" },
  { id: "horror-tension", label: "Horror Tension", hint: "Grauen, Unheimlichkeit" },
  { id: "revelation", label: "Revelation", hint: "Enthüllung, Wendepunkt" },
  { id: "denouement", label: "Denouement", hint: "Auflösung, Ende" },
  { id: "final-battle", label: "Final Battle", hint: "letzter Kampf" },
  { id: "victory", label: "Victory", hint: "Sieg, Triumph" },
  { id: "defeat", label: "Defeat", hint: "Niederlage, Scheitern" },
  { id: "melancholy-flashback", label: "Melancholy Flashback", hint: "Rückblende, Erinnerung" },
  { id: "nostalgic-memory", label: "Nostalgic Memory", hint: "weiche Vergangenheit" },
  { id: "hope-restored", label: "Hope Restored", hint: "Hoffnung kehrt zurück" },
  { id: "dark-descent", label: "Dark Descent", hint: "Abstieg ins Dunkel" },
  { id: "awakening", label: "Awakening", hint: "Erwachen, Neuanfang" },
  { id: "transformation", label: "Transformation", hint: "Wandel, Metamorphose" },
  { id: "betrayal", label: "Betrayal", hint: "Verrat, Schock" },
  { id: "redemption", label: "Redemption", hint: "Erlösung, Wiedergutmachung" },
  { id: "sacrifice", label: "Sacrifice", hint: "Opfer, Hingabe" },
  { id: "journey-begins", label: "Journey Begins", hint: "Aufbruch, erster Schritt" },
  { id: "homecoming", label: "Homecoming", hint: "Heimkehr, Ankunft" },
  { id: "loss-grief", label: "Loss & Grief", hint: "Trauer, Abschied" },
  { id: "wonder-awe", label: "Wonder & Awe", hint: "Staunen, Ehrfurcht" },
  { id: "cold-open", label: "Cold Open", hint: "abrupter Einstieg" },
  { id: "interlude-calm", label: "Interlude Calm", hint: "ruhige Atempause" },
  { id: "stinger", label: "Stinger", hint: "kurzer Schock-Akzent" },
  { id: "source-music", label: "Source Music", hint: "Musik aus der Filmwelt" },
  { id: "underscoring", label: "Underscoring", hint: "diskrete Hintergrundunterstützung" },
  { id: "leitmotif", label: "Leitmotif", hint: "wiederkehrendes Motiv" },
  { id: "end-credits", label: "End Credits", hint: "Abspannmusik" },
  { id: "overture", label: "Overture", hint: "Ouvertüre, Eröffnung" },
];

export const EMOTIONAL_ARCS: CheckItem[] = [
  { id: "ea-steady", label: "Steady", hint: "gleichbleibend, konstant" },
  { id: "ea-rising", label: "Rising", hint: "kontinuierlicher Aufstieg" },
  { id: "ea-falling", label: "Falling", hint: "kontinuierlicher Abstieg" },
  { id: "ea-peaks-valleys", label: "Peaks & Valleys", hint: "Hoch und Tief im Wechsel" },
  { id: "ea-rollercoaster", label: "Rollercoaster", hint: "wilde Dynamik-Kurven" },
  { id: "ea-slow-build-big-release", label: "Slow Build → Big Release", hint: "langer Aufbau, großer Ausbruch" },
  { id: "ea-quiet-loud-quiet", label: "Quiet → Loud → Quiet", hint: "Dynamik-Sandwich" },
  { id: "ea-crescendo", label: "Crescendo", hint: "stetige Steigerung bis Ende" },
  { id: "ea-decrescendo", label: "Decrescendo", hint: "stetige Abnahme bis Ende" },
  { id: "ea-wave", label: "Wave", hint: "sanfte Wellen, regelmäßig" },
  { id: "ea-spiral", label: "Spiral", hint: "zunehmend enger werdende Intensität" },
  { id: "ea-plateau", label: "Plateau", hint: "lang gleichmäßig, dann Abfall" },
  { id: "ea-explosion-decay", label: "Explosion → Decay", hint: "starker Beginn, langsames Ausklingen" },
  { id: "ea-intro-drop", label: "Intro → Drop", hint: "Aufbau zum zentralen Drop" },
  { id: "ea-arch", label: "Arch", hint: "Aufstieg zur Mitte, dann Abstieg" },
  { id: "ea-fragmented", label: "Fragmented", hint: "unregelmäßig, nervös" },
  { id: "ea-circular", label: "Circular", hint: "kehrt zum Ausgangspunkt zurück" },
];

export const Emotionen = () => {
  const { state, dispatch } = useStore();
  const allMoods = Object.values(moods.groups).flat();
  const moodItems: CheckItem[] = allMoods.map((m) => ({
    id: m,
    label: m,
    hint: MOOD_DESCRIPTIONS[m],
  }));

  return (
    <div className="flex flex-col gap-3">
      <AccordionSection
        title="Stimmung"
        defaultOpen
        selectionCount={state.prompt.moods.length}
        onClear={() => state.prompt.moods.forEach((m) => dispatch({ type: "TOGGLE_MOOD", mood: m }))}
      >
        <CheckList
          items={moodItems}
          selected={state.prompt.moods}
          onToggle={(id) => dispatch({ type: "TOGGLE_MOOD", mood: id })}
          placeholder={`${moodItems.length} Stimmungen durchsuchen...`}
        />
      </AccordionSection>

      <AccordionSection title="Energie & Tanzbarkeit">
        <CheckList
          items={ENERGY_LEVELS}
          selected={state.prompt.production.filter((p) =>
            ENERGY_LEVELS.some((e) => e.id === p),
          )}
          onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })}
         
        />
      </AccordionSection>

      <AccordionSection title="Cinematic-Tag" optional>
        <CheckList
          items={CINEMATIC_TAGS}
          selected={state.prompt.production.filter((p) =>
            CINEMATIC_TAGS.some((c) => c.id === p),
          )}
          onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })}
         
        />
      </AccordionSection>

      <AccordionSection title="Emotionaler Bogen" optional>
        <CheckList
          items={EMOTIONAL_ARCS}
          selected={state.prompt.production.filter((p) =>
            EMOTIONAL_ARCS.some((a) => a.id === p),
          )}
          onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })}
         
        />
      </AccordionSection>
    </div>
  );
};
