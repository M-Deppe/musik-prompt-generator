import { AccordionSection } from "@/components/AccordionSection";
import { CheckList, type CheckItem } from "@/content/CheckList";
import { useStore } from "@/store";

const FORM_TYPE: CheckItem[] = [
  { id: "ft-song", label: "Song", hint: "3-4 min, Verse/Chorus" },
  { id: "ft-instrumental", label: "Instrumental", hint: "kein Gesang" },
  { id: "ft-interlude", label: "Interlude", hint: "kurz, Zwischenstück" },
  { id: "ft-jam", label: "Jam", hint: "improvisiert, lang" },
  { id: "ft-suite", label: "Suite", hint: "mehrteilig" },
  { id: "ft-remix", label: "Remix", hint: "Neuinterpretation" },
  { id: "ft-edit", label: "Club-Edit", hint: "DJ-freundlich" },
  { id: "ft-radio-edit", label: "Radio-Edit", hint: "~3 min" },
  { id: "ft-extended-mix", label: "Extended Mix", hint: "längere DJ-Version" },
  { id: "ft-dub-version", label: "Dub Version", hint: "stripped, Rhythmus-fokus" },
  { id: "ft-demo", label: "Demo", hint: "skizzenhaft" },
  { id: "ft-live", label: "Live-Aufnahme", hint: "Konzert-Charakter" },
  { id: "ft-acoustic", label: "Akustik-Version", hint: "unplugged" },
  { id: "ft-ballad", label: "Ballade", hint: "ruhig, emotional" },
  { id: "ft-acapella", label: "A-cappella", hint: "nur Stimmen, kein Instrument" },
  { id: "ft-karaoke", label: "Karaoke-Version", hint: "ohne Lead-Gesang" },
  { id: "ft-alt-take", label: "Alternative Take", hint: "andere Interpretation" },
  { id: "ft-deconstructed", label: "Deconstructed", hint: "zerlegt, skelettiert" },
  { id: "ft-ambient-mix", label: "Ambient Mix", hint: "atmosphärisch aufgelöst" },
  { id: "ft-bootleg", label: "Bootleg / Mashup", hint: "inoffiziell, collagiert" },
  { id: "ft-live-jam", label: "Live Jam", hint: "spontan vor Publikum" },
  { id: "ft-studio-jam", label: "Studio Jam", hint: "unstrukturiert aufgenommen" },
  { id: "ft-improvisation", label: "Improvisation", hint: "frei, ohne Plan" },
  { id: "ft-etude", label: "Étude", hint: "Übungsstück, technisch" },
  { id: "ft-prelude", label: "Prélude", hint: "Eröffnung, kurz" },
  { id: "ft-fantasie", label: "Fantasie", hint: "frei, träumerisch" },
  { id: "ft-nocturne", label: "Nocturne", hint: "nächtlich, intim" },
  { id: "ft-rhapsody", label: "Rhapsody", hint: "dramatisch, frei" },
  { id: "ft-overture", label: "Ouvertüre", hint: "Eröffnungsstück" },
  { id: "ft-finale", label: "Finale", hint: "Abschluss, krönendes Ende" },
  { id: "ft-medley", label: "Medley", hint: "mehrere Songs verbunden" },
  { id: "ft-loop", label: "Loop / Pattern", hint: "repetitiv, zirkulär" },
];

const ENSEMBLE: CheckItem[] = [
  { id: "en-solo", label: "Solo", hint: "eine Stimme/Instrument" },
  { id: "en-singer-guitarist", label: "Singer-Guitarist", hint: "Gesang + Gitarre" },
  { id: "en-singer-piano", label: "Singer-Piano", hint: "Gesang + Klavier" },
  { id: "en-duo", label: "Duo", hint: "zwei Musiker" },
  { id: "en-folk-duo", label: "Folk-Duo", hint: "akustisch, intim" },
  { id: "en-trio", label: "Trio", hint: "drei Musiker" },
  { id: "en-power-trio", label: "Power Trio", hint: "Gitarre, Bass, Schlagzeug" },
  { id: "en-jazz-trio", label: "Jazz Trio", hint: "Piano, Bass, Drums" },
  { id: "en-quartet", label: "Quartett", hint: "vier Musiker" },
  { id: "en-string-quartet", label: "Streichquartett", hint: "klassisch, intim" },
  { id: "en-jazz-quartet", label: "Jazz Quartet", hint: "kleines Jazz-Ensemble" },
  { id: "en-band", label: "Band", hint: "4-6 Musiker" },
  { id: "en-rock-4piece", label: "Rock Band 4-piece", hint: "Gitarre, Bass, Keys, Drums" },
  { id: "en-rock-5piece", label: "Rock Band 5-piece with keys", hint: "klassische Rockband + Keys" },
  { id: "en-big-band", label: "Big Band", hint: "Jazz, 15-20 Musiker" },
  { id: "en-brass-section", label: "Brass Section", hint: "Blechbläser-Gruppe" },
  { id: "en-wind-ensemble", label: "Wind Ensemble", hint: "Holz- und Blechbläser" },
  { id: "en-rhythm-section", label: "Rhythm Section only", hint: "Bass, Drums, Percussion" },
  { id: "en-orchestra", label: "Orchester", hint: "voll besetzt" },
  { id: "en-chamber", label: "Kammer-Ensemble", hint: "15-30 Musiker" },
  { id: "en-string-orchestra", label: "Streichorchester", hint: "nur Streicher" },
  { id: "en-one-person", label: "One-Man-Band", hint: "alles allein" },
  { id: "en-looper-solo", label: "Looper Solo", hint: "Live-Looping, eine Person" },
  { id: "en-choir", label: "Chor", hint: "Vokalensemble" },
  { id: "en-choir-acapella", label: "Chor A-cappella", hint: "Chor ohne Begleitung" },
  { id: "en-barbershop", label: "Barbershop Quartet", hint: "4-stimmig, eng harmonisch" },
  { id: "en-doo-wop", label: "Doo-Wop Group", hint: "Vocal-Harmonien, Retro" },
  { id: "en-dj-set", label: "DJ/Producer-Setup", hint: "elektronisch, allein" },
  { id: "en-laptop-solo", label: "Laptop Solo", hint: "rein digital, Producer" },
  { id: "en-modular-setup", label: "Modular Setup", hint: "Synthesizer-Patches" },
  { id: "en-live-electronics", label: "Live Electronics", hint: "Echtzeit-Elektronik" },
  { id: "en-rapper-producer", label: "Rapper + Producer", hint: "Hip-Hop Duo" },
  { id: "en-hip-hop-crew", label: "Hip-Hop Crew", hint: "mehrere MC/Producer" },
];

const SIZE: CheckItem[] = [
  { id: "sz-intimate-solo", label: "Intimate Solo", hint: "eine Stimme, Stille" },
  { id: "sz-minimal", label: "Minimal", hint: "1-2 Elemente" },
  { id: "sz-sparse", label: "Sparse", hint: "wenige Ebenen" },
  { id: "sz-duet-focused", label: "Duet-focused", hint: "zwei Elemente im Dialog" },
  { id: "sz-trio-balance", label: "Trio Balance", hint: "drei Stimmen ausgewogen" },
  { id: "sz-medium", label: "Medium", hint: "5-8 Ebenen" },
  { id: "sz-quartet-dynamics", label: "Quartet Dynamics", hint: "vier Stimmen, beweglich" },
  { id: "sz-section-based", label: "Section-based", hint: "Gruppen-Abschnitte" },
  { id: "sz-dense", label: "Dense", hint: "voll, vielschichtig" },
  { id: "sz-chamber-scale", label: "Chamber Scale", hint: "Kammermusik-Fülle" },
  { id: "sz-layered-rich", label: "Layered Rich", hint: "viele durchdachte Ebenen" },
  { id: "sz-orchestral-full", label: "Orchestral Full", hint: "voller Orchesterklang" },
  { id: "sz-wall-of-sound", label: "Wall of Sound", hint: "Phil-Spector-mäßig" },
  { id: "sz-layered", label: "Heavily Layered", hint: "übereinandergeschichtet" },
  { id: "sz-ambient-cloud", label: "Ambient Cloud", hint: "diffus, wolkenhaft" },
];

const DURATION: CheckItem[] = [
  { id: "dur-sketch", label: "Sketch (~0–30s)", hint: "Ideen-Skizze, Fragment" },
  { id: "dur-vignette", label: "Vignette (30–60s)", hint: "kurze Stimmungsszene" },
  { id: "dur-short", label: "Short (1–2 min)", hint: "kompakt, fokussiert" },
  { id: "dur-pop-radio", label: "Pop-Radio (2–3 min)", hint: "klassische Single-Länge" },
  { id: "dur-standard", label: "Standard (3–4 min)", hint: "normale Song-Länge" },
  { id: "dur-extended", label: "Extended (4–5 min)", hint: "etwas mehr Raum" },
  { id: "dur-epic", label: "Epic (5–7 min)", hint: "breiter, ausladender Song" },
  { id: "dur-post-rock", label: "Post-Rock (7–10 min)", hint: "langsam entfaltend" },
  { id: "dur-symphony", label: "Symphonie (10–15 min)", hint: "klassische Großform" },
  { id: "dur-drone", label: "Drone (15+ min)", hint: "endlos, zeitlos" },
];

export const Stuecktyp = () => {
  const { state, dispatch } = useStore();
  const sel = (pool: CheckItem[]) => state.prompt.production.filter((p) => pool.some((i) => i.id === p));

  return (
    <div className="flex flex-col gap-3">
      <AccordionSection title="Formtyp" defaultOpen selectionCount={sel(FORM_TYPE).length} onClear={() => sel(FORM_TYPE).forEach((id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id }))}>
        <CheckList items={FORM_TYPE} selected={sel(FORM_TYPE)} onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })} />
      </AccordionSection>
      <AccordionSection title="Besetzung" selectionCount={sel(ENSEMBLE).length} onClear={() => sel(ENSEMBLE).forEach((id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id }))}>
        <CheckList items={ENSEMBLE} selected={sel(ENSEMBLE)} onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })} />
      </AccordionSection>
      <AccordionSection title="Ensemble-Größe" optional selectionCount={sel(SIZE).length} onClear={() => sel(SIZE).forEach((id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id }))}>
        <CheckList items={SIZE} selected={sel(SIZE)} onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })} />
      </AccordionSection>
      <AccordionSection title="Song-Länge" optional selectionCount={sel(DURATION).length} onClear={() => sel(DURATION).forEach((id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id }))}>
        <CheckList items={DURATION} selected={sel(DURATION)} onToggle={(id) => dispatch({ type: "TOGGLE_PRODUCTION", tag: id })} />
      </AccordionSection>
    </div>
  );
};
